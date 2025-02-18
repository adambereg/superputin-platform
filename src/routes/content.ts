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

export default router; 