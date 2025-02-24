import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ContentModel, ModerationStatus } from '../models/Content';
import { NotificationService } from '../notifications/NotificationService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { User, UserModel } from '../models/User';
import { StorageService } from '../storage/StorageService';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { AuthRequest } from '../types/AuthRequest';

const router = Router();
const notificationService = NotificationService.getInstance();
const storageService = new StorageService();

// Настраиваем multer для загрузки файлов
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
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

interface ModerateRequest extends Request {
  user?: User;
  body: {
    status: ModerationStatus;
    comment: string;
  }
}

// Получение контента на модерации
router.get('/pending', requireAuth, requireRole('moderator'), async (req: AuthRequest, res) => {
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
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found pending content:', JSON.stringify(pendingContent, null, 2));

    return res.json({
      success: true,
      content: pendingContent || [],
      total: pendingContent?.length || 0
    });
  } catch (error) {
    console.error('Error in /pending route:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pending content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Загрузка контента (мема или комикса)
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    // Получаем данные из form-data напрямую
    const title = req.body.title;
    const type = req.body.type;

    if (!title || !type) {
      return res.status(400).json({ error: 'Не указаны обязательные поля' });
    }

    const fileUrl = `${process.env.API_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;

    const content = await ContentModel.create({
      title,
      type,
      fileUrl,
      authorId: (req as any).user?._id,
      moderationStatus: 'pending',
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

    await content.populate('authorId', 'username email');

    return res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Ошибка при загрузке файла',
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
router.delete('/:contentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const content = await ContentModel.findById(req.params.contentId);
    if (!content) {
      return res.status(404).json({ error: 'Контент не найден' });
    }

    // Проверяем права
    if (content.authorId.toString() !== (req as any).user?.id && (req as any).user?.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }

    // Удаляем файл
    const fileName = content.fileUrl.split('/').pop();
    if (fileName) {
      await storageService.deleteFile(fileName);
    }

    await content.deleteOne();
    return res.json({ message: 'Контент успешно удален' });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка удаления контента'
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
        await notificationService.createNotification(
          contentAuthor,
          'like',
          user,
          content
        );
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

// Модерация контента
router.post('/:contentId/moderate', 
  requireAuth, 
  requireRole('moderator'), 
  async (req: ModerateRequest, res: Response) => {
    try {
      const { contentId } = req.params;
      const { status, comment } = req.body;

      const content = await ContentModel.findById(contentId);
      
      if (!content) {
        return res.status(404).json({ error: 'Контент не найден' });
      }

      content.moderationStatus = status;
      content.moderationComment = comment;
      content.moderatedBy = req.user?.id;
      content.moderatedAt = new Date();
      
      await content.save();

      // Отправляем уведомление автору
      const author = await UserModel.findById(content.authorId);
      if (author) {
        await notificationService.createNotification(
          author,
          'moderation',
          req.user as User,
          content,
          {
            status,
            comment,
            title: content.title
          }
        );
      }

      return res.json({ 
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

export default router; 