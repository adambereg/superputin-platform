import { Router, Response } from 'express';
import { ContentModel } from '../models/Content';
import { NotificationService } from '../notifications/NotificationService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { StorageService } from '../storage/StorageService';
import { AuthRequest } from '../types/AuthRequest';
import { upload } from '../config/multer';

const router = Router();
const notificationService = NotificationService.getInstance();
const storageService = new StorageService();

// Получение контента пользователя
router.get('/user/content', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      console.log('No user ID found in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    console.log('User object:', {
      id: req.user.id,
      type: typeof req.user.id
    });

    const content = await ContentModel.find({ 
      authorId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .select('title type fileUrl moderationStatus createdAt moderationComment')
    .lean();

    console.log('Found user content:', {
      userId: req.user.id,
      contentCount: content.length
    });

    return res.json({
      success: true,
      content: content || []
    });
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Получение контента на модерации
router.get('/pending', requireAuth, requireRole('moderator'), async (req: AuthRequest, res: Response) => {
  try {
    console.log('GET /pending request:', {
      user: {
        id: req.user?.id,
        role: req.user?.role,
        email: req.user?.email
      },
      headers: req.headers
    });

    const pendingContent = await ContentModel.find({ moderationStatus: 'pending' })
      .populate('authorId', 'username email')
      .sort({ createdAt: -1 });

    console.log('Found pending content:', pendingContent);

    return res.json({
      success: true,
      content: pendingContent
    });
  } catch (error) {
    console.error('Error fetching pending content:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pending content'
    });
  }
});

// Загрузка контента
router.post('/upload', requireAuth, upload.array('files'), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Upload request received:', {
      body: req.body,
      files: req.files ? (Array.isArray(req.files) ? `${req.files.length} files` : 'files object') : 'no files',
      user: req.user?._id
    });
    
    const { title, description, type, tags } = req.body;
    
    if (!req.files || (!Array.isArray(req.files) && !req.files.length)) {
      console.log('No files uploaded');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];
    console.log(`Processing ${files.length} files`);
    
    // Загружаем файлы в хранилище
    const uploadedFiles = await Promise.all(
      files.map(async (file: any, index: number) => {
        console.log(`Processing file ${index + 1}/${files.length}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer
        });
        
        // Проверяем, что file.buffer существует
        if (!file.buffer) {
          throw new Error('File buffer is missing');
        }
        
        const fileUrl = await storageService.uploadFile(file.buffer, file.originalname);
        console.log(`File ${index + 1} uploaded to: ${fileUrl}`);
        return fileUrl;
      })
    );

    console.log('All files uploaded successfully:', uploadedFiles);
    
    // Обработка тегов - преобразуем строку JSON в массив
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
        console.log('Parsed tags:', parsedTags);
      } catch (e) {
        console.error('Error parsing tags:', e);
        // Если не удалось распарсить JSON, проверяем, может это строка
        if (typeof tags === 'string') {
          parsedTags = [tags];
        }
      }
    }

    const content = new ContentModel({
      authorId: req.user?._id,
      type,
      title,
      fileUrl: uploadedFiles[0], // Первый файл как основное изображение
      pages: type === 'comic' ? uploadedFiles : [], // Для комиксов сохраняем все страницы
      tags: parsedTags,
      metadata: {
        description,
        originalName: files[0].originalname,
        size: files[0].size,
        mimetype: files[0].mimetype
      },
      moderationStatus: 'pending'
    });

    await content.save();
    console.log('Content saved to database:', content._id);
    
    return res.status(201).json({ success: true, content });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Получение списка контента
router.get('/list', async (req, res) => {
  try {
    const { type, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const query = type ? { type } : {};
    const content = await ContentModel.find(query)
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('authorId', 'username')
      .sort({ createdAt: -1 });

    const total = await ContentModel.countDocuments(query);

    res.json({
      content,
      pagination: {
        total,
        page: parseInt(page as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка получения списка контента'
    });
  }
});

// Получение контента по ID
router.get('/:id', async (req, res) => {
  try {
    const content = await ContentModel.findById(req.params.id)
      .populate('authorId', 'username')
      .lean();
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    return res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Удаление контента
router.delete('/:contentId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { contentId } = req.params;
    console.log('Delete request for content:', contentId);
    console.log('User:', req.user);

    const content = await ContentModel.findById(contentId);
    console.log('Found content:', content);
    
    if (!content) {
      return res.status(404).json({ 
        success: false,
        error: 'Контент не найден' 
      });
    }

    // Проверяем права на удаление (админ или автор контента)
    const hasPermission = req.user?.role === 'admin' || content.authorId.toString() === req.user?.id;
    console.log('Permission check:', {
      userRole: req.user?.role,
      contentAuthorId: content.authorId.toString(),
      userId: req.user?.id,
      hasPermission
    });

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false,
        error: 'Недостаточно прав для удаления' 
      });
    }

    // Удаляем файл из хранилища
    if (content.fileUrl) {
      const fileName = content.fileUrl.split('/').pop();
      console.log('Deleting file:', fileName);
      if (fileName) {
        try {
          await storageService.deleteFile(fileName);
          console.log('File deleted successfully');
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Продолжаем удаление записи даже если файл не удалился
        }
      }
    }

    // Удаляем запись из БД
    const deleteResult = await ContentModel.findByIdAndDelete(contentId);
    console.log('Delete result:', deleteResult);

    return res.json({ 
      success: true,
      message: 'Контент успешно удален' 
    });
  } catch (error) {
    console.error('Delete content error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Ошибка при удалении контента',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Лайк контента
router.post('/:id/like', requireAuth, async (req: AuthRequest, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не авторизован'
      });
    }
    
    const content = await ContentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Контент не найден'
      });
    }
    
    // Проверяем, лайкнул ли пользователь уже этот контент
    const likeIndex = content.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Добавляем лайк
      content.likes.push(userId);
      content.likesCount = content.likes.length;
    } else {
      // Убираем лайк
      content.likes.splice(likeIndex, 1);
      content.likesCount = content.likes.length;
    }
    
    await content.save();
    
    return res.json({
      success: true,
      likesCount: content.likesCount,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Ошибка при лайке контента:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при лайке контента'
    });
  }
});

// Проверка статуса лайка
router.get('/:id/like-status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не авторизован'
      });
    }
    
    const content = await ContentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Контент не найден'
      });
    }
    
    const isLiked = content.likes.includes(userId);
    
    return res.json({
      success: true,
      isLiked
    });
  } catch (error) {
    console.error('Ошибка при проверке статуса лайка:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при проверке статуса лайка'
    });
  }
});

// Модерация контента
router.post('/:contentId/moderate', requireAuth, requireRole('moderator'), async (req: AuthRequest, res) => {
  try {
    const { contentId } = req.params;
    const { status, comment } = req.body;
    
    console.log('Moderation request:', {
      contentId,
      status,
      comment,
      moderator: req.user?.id
    });

    // Проверяем, что статус валидный
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный статус модерации'
      });
    }

    // Находим контент
    const content = await ContentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Контент не найден'
      });
    }

    // Обновляем статус модерации
    content.moderationStatus = status;
    content.moderationComment = comment || '';
    content.moderatedBy = req.user?.id;
    content.moderatedAt = new Date();
    await content.save();

    // Отправляем уведомление автору
    await notificationService.createNotification({
      userId: content.authorId.toString(),
      type: 'moderation',
      contentId: content.id,
      message: status === 'approved' 
        ? 'Ваш контент был одобрен модератором' 
        : 'Ваш контент был отклонен модератором',
      metadata: { 
        status,
        comment: comment || ''
      }
    });

    return res.json({
      success: true,
      content: {
        id: content.id,
        moderationStatus: content.moderationStatus,
        moderatedAt: content.moderatedAt
      }
    });
  } catch (error) {
    console.error('Moderation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при модерации контента',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { tag } = req.query;
    
    const query: any = { type };
    if (tag) {
      query.tags = tag;
    }

    const content = await ContentModel.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'username');

    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content' 
    });
  }
});

// Получение контента по типу с пагинацией
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    // Проверяем, что тип валидный
    if (!['meme', 'comic', 'nft'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный тип контента'
      });
    }
    
    // Получаем только одобренный контент с пагинацией
    const [content, total] = await Promise.all([
      ContentModel.find({ 
        type, 
        moderationStatus: 'approved' 
      })
      .populate('authorId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
      
      ContentModel.countDocuments({
        type,
        moderationStatus: 'approved'
      })
    ]);
    
    return res.json({
      success: true,
      content,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения контента по типу:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении контента'
    });
  }
});

// Обновление контента
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const content = await ContentModel.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Проверяем, является ли пользователь владельцем контента или админом
    if (content.authorId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, tags } = req.body;
    
    content.title = title;
    content.tags = tags;
    await content.save();

    return res.json({ success: true, content });
  } catch (error) {
    console.error('Error updating content:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Удаление контента
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const content = await ContentModel.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Проверяем, является ли пользователь владельцем контента или админом
    if (content.authorId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Используем deleteOne() вместо remove()
    await content.deleteOne();
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router; 