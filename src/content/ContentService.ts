import { User } from '../models/User';
import { Content, ContentModel, ContentType } from '../models/Content';
import { GameificationService } from '../gamification/GameificationService';

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
    metadata: { title: string; fileUrl: string }
  ): Promise<Content> {
    // Проверка прав пользователя
    if (!user.id) {
      throw new Error('Пользователь должен быть авторизован');
    }

    // Загрузка контента
    const content = new ContentModel({
      authorId: user.id,
      type,
      title: metadata.title,
      fileUrl: metadata.fileUrl,
      metadata
    });

    await content.save();

    // Начисление очков за загрузку
    await this.gameificationService.awardPoints(user, 'content_upload');

    return content;
  }
} 