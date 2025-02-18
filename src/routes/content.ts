import { Router } from 'express';
import multer from 'multer';
import { ContentService } from '../content/ContentService';
import { StorageService } from '../storage/StorageService';
import { UserModel } from '../models/User';
import { ContentType, ContentModel } from '../models/Content';

const router = Router();
const contentService = new ContentService();
const storageService = new StorageService();

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Загрузка контента (мема или комикса)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, type, title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    // Проверяем тип контента
    if (!['meme', 'comic', 'nft'].includes(type)) {
      return res.status(400).json({ error: 'Неверный тип контента' });
    }

    // Получаем пользователя
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Загружаем файл в R2
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUrl = await storageService.uploadFile(file.buffer, fileName);

    // Создаем контент
    const content = await contentService.uploadContent(user, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype
    }, type as ContentType, {
      title,
      fileUrl
    });

    res.json({
      message: 'Контент успешно загружен',
      content: {
        id: content.id,
        title: content.title,
        type: content.type,
        fileUrl: content.fileUrl,
        authorId: content.authorId
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка загрузки контента'
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

    res.json({ content });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка получения контента'
    });
  }
});

// Удаление контента
router.delete('/:contentId', async (req, res) => {
  try {
    const content = await ContentModel.findById(req.params.contentId);
    if (!content) {
      return res.status(404).json({ error: 'Контент не найден' });
    }

    // Проверяем права (временно отключено)
    // if (content.authorId.toString() !== req.user.id) {
    //   return res.status(403).json({ error: 'Нет прав на удаление' });
    // }

    // Удаляем файл из R2
    const fileName = content.fileUrl.split('/').pop();
    if (fileName) {
      await storageService.deleteFile(fileName);
    }

    await content.deleteOne();
    res.json({ message: 'Контент успешно удален' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка удаления контента'
    });
  }
});

export default router; 