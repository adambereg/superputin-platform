import { User } from '../models/User';
import { Content, ContentType } from '../models/Content';
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
    metadata: any
  ): Promise<Content> {
    // Проверка прав пользователя
    if (!user.id) {
      throw new Error('Пользователь должен быть авторизован');
    }

    // Загрузка контента
    const content = new Content({
      authorId: user.id,
      type,
      title: metadata.title || file.originalname,
      fileUrl: '', // Будет заполнено после загрузки файла
      metadata
    });

    await content.save();

    // Начисление очков за загрузку
    await this.gameificationService.awardPoints(user, 'content_upload');

    return content;
  }
} 