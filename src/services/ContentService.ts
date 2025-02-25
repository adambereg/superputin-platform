import { User } from '../models/User';
import { Content, ContentModel, ContentType } from '../models/Content';
import { GameificationService } from '../gamification/GameificationService';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

interface ContentMetadata {
  title: string;
  fileUrl: string;
  tags?: string[];
  description?: string;
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
    metadata: ContentMetadata
  ): Promise<Content> {
    // Проверяем наличие тегов
    const tags = metadata.tags || [];
    
    // Создаем запись в базе данных
    const content = new ContentModel({
      authorId: user.id,
      type,
      title: metadata.title,
      fileUrl: metadata.fileUrl,
      tags: tags,
      metadata: {
        description: metadata.description || '',
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      },
      moderationStatus: 'pending',
      likes: [],
      likesCount: 0
    });

    await content.save();
    
    // Добавляем контент в список созданного пользователем
    if (!user.createdContent) {
      user.createdContent = [];
    }
    
    user.createdContent.push(content.id);
    await user.save();

    // Начисляем очки за загрузку контента
    await this.gameificationService.awardPoints(user, 'content_upload');
    
    return content;
  }
} 