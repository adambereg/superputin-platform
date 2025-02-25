import { User } from '../models/User';
import { Content, ContentModel, ContentType } from '../models/Content';
import { GameificationService } from '../gamification/GameificationService';
import { CONTENT_TAGS } from '../models/Content';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export class ContentService {
  private gameificationService: GameificationService;

  constructor() {
    this.gameificationService = new GameificationService();
  }

  async uploadContent(
    user: User, 
    file: UploadedFile,
    type: ContentType, 
    metadata: { 
      title: string; 
      fileUrl: string;
      tags: string[];
    }
  ): Promise<Content> {
    if (!user.id) {
      throw new Error('Пользователь должен быть авторизован');
    }

    // Валидация тегов
    if (!metadata.tags || metadata.tags.length === 0) {
      throw new Error('Необходимо указать хотя бы один тег');
    }

    // Проверяем, что все теги допустимы для данного типа контента
    const invalidTags = metadata.tags.filter(tag => !CONTENT_TAGS[type].includes(tag));
    if (invalidTags.length > 0) {
      throw new Error(`Недопустимые теги для типа ${type}: ${invalidTags.join(', ')}`);
    }

    // Валидация файла
    if (!file.buffer || file.buffer.length === 0) {
      throw new Error('Файл пуст');
    }

    // Проверяем допустимые типы файлов
    const allowedMimeTypes = {
      meme: ['image/jpeg', 'image/png', 'image/gif'],
      comic: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      nft: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    };

    if (!allowedMimeTypes[type].includes(file.mimetype)) {
      throw new Error(`Недопустимый тип файла для ${type}. Разрешены: ${allowedMimeTypes[type].join(', ')}`);
    }

    // Проверяем размер файла (например, максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.buffer.length > maxSize) {
      throw new Error('Размер файла превышает 5MB');
    }

    const content = new ContentModel({
      authorId: user.id,
      type,
      title: metadata.title,
      fileUrl: metadata.fileUrl,
      tags: metadata.tags,
      metadata,
      likes: [],
      likesCount: 0
    });

    await content.save();
    
    if (!user.createdContent) {
      user.createdContent = [];
    }
    user.createdContent.push(content.id);
    await user.save();

    await this.gameificationService.awardPoints(user, 'content_upload');
    return content;
  }
} 