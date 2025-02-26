import { Router, Response } from 'express';
import multer from 'multer';
import { ContentModel, ContentType } from '../models/Content';
import { NotificationService } from '../notifications/NotificationService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';
import { StorageService } from '../storage/StorageService';
import { AuthRequest } from '../types/AuthRequest';
import { ContentService } from '../services/ContentService';

const router = Router();
const notificationService = NotificationService.getInstance();
const storageService = new StorageService();

// Используем memoryStorage вместо diskStorage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый формат файла') as any);
    }
  }
});

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
router.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Файл не загружен'
      });
    }

    const { title, type, description } = req.body;
    let tags = req.body['tags[]'] || [];
    
    // Если tags пришел как строка (один тег), преобразуем в массив
    if (!Array.isArray(tags)) {
      tags = [tags];
    }
    
    // Проверяем, что тип контента валидный
    if (!['meme', 'comic', 'nft'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный тип контента'
      });
    }

    // Если теги пришли, проверяем их валидность
    if (tags && tags.length > 0) {
      // Здесь можно добавить проверку тегов, если нужно
      console.log('Received tags:', tags);
    }

    // Загружаем файл в хранилище
    const fileUrl = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname
    );

    // Создаем запись о контенте
    const contentService = new ContentService();
    const content = await contentService.uploadContent(
      req.user!,
      req.file,
      type as ContentType,
      {
        title,
        fileUrl,
        tags,
        description
      }
    );

    // Если пользователь модератор или админ, автоматически одобряем контент
    if (req.user?.role === 'admin' || req.user?.role === 'moderator') {
      content.moderationStatus = 'approved';
      content.moderatedBy = req.user.id;
      content.moderatedAt = new Date();
      await content.save();
    }

    return res.status(201).json({
      success: true,
      content: {
        id: content.id,
        title: content.title,
        fileUrl: content.fileUrl,
        type: content.type,
        tags: content.tags
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при загрузке контента',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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
router.get('/:contentId', async (req, res) => {
  try {
    const content = await ContentModel.findById(req.params.contentId)
      .populate('authorId', 'username');
    
    if (!content) {
      return res.status(404).json({ error: 'Контент не найден' });
    }

    return res.json({ content });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка получения контента'
    });
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

// Поставить/убрать лайк
router.post('/:contentId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const content = await ContentModel.findById(req.params.contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Контент не найден' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const hasLiked = content.likes.includes(userId);
    
    if (hasLiked) {
      // Убираем лайк
      content.likes = content.likes.filter(id => id.toString() !== userId);
      content.likesCount = Math.max(0, content.likesCount - 1);
    } else {
      // Добавляем лайк
      content.likes.push(userId);
      content.likesCount += 1;

      // Создаем уведомление только при добавлении лайка
      const contentAuthor = await UserModel.findById(content.authorId);
      if (contentAuthor && contentAuthor.id !== userId) {
        await notificationService.createNotification({
          userId: contentAuthor.id,
          type: 'like',
          contentId: content.id,
          message: `Пользователь поставил лайк вашему контенту "${content.title}"`,
          metadata: {
            likedBy: userId
          }
        });
      }
    }

    await content.save();

    return res.json({
      message: hasLiked ? 'Лайк убран' : 'Лайк добавлен',
      likesCount: content.likesCount,
      hasLiked: !hasLiked
    });

  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка обработки лайка'
    });
  }
});

// Получить список лайкнувших пользователей
router.get('/:contentId/likes', async (req, res) => {
  try {
    const content = await ContentModel.findById(req.params.contentId)
      .populate('likes', 'username');
    
    if (!content) {
      return res.status(404).json({ error: 'Контент не найден' });
    }

    return res.json({
      likesCount: content.likesCount,
      users: content.likes
    });

  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка получения списка лайков'
    });
  }
});

// Маршрут для модерации контента
router.post(
  '/moderate/:contentId',
  requireAuth,
  requireRole('moderator'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { contentId } = req.params;
      const { status, comment } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }
      
      console.log('Модерация контента:', {
        contentId,
        status,
        comment,
        moderatorId: req.user.id
      });
      
      // Проверяем существование контента
      const content = await ContentModel.findById(contentId);
      if (!content) {
        return res.status(404).json({ error: 'Контент не найден' });
      }
      
      // Обновляем статус модерации
      content.moderationStatus = status;
      content.moderationComment = comment;
      content.moderatedBy = req.user.id;
      content.moderatedAt = new Date();
      
      await content.save();
      
      // Отправляем уведомление автору
      await notificationService.createNotification({
        userId: content.authorId.toString(),
        type: 'moderation',
        contentId: content._id.toString(),
        message: status === 'approved' 
          ? 'Ваш контент был одобрен модератором' 
          : `Ваш контент был отклонен. Причина: ${comment || 'Не указана'}`,
        metadata: { status }
      });
      
      return res.json({
        success: true,
        message: 'Модерация выполнена успешно',
        content
      });
    } catch (error) {
      console.error('Moderation error:', error);
      return res.status(500).json({
        error: 'Ошибка при модерации',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

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

export default router; 