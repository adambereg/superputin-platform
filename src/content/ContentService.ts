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
    if (!user.id) {
      throw new Error('Пользователь должен быть авторизован');
    }

    const content = new ContentModel({
      authorId: user.id,
      type,
      title: metadata.title,
      fileUrl: metadata.fileUrl,
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