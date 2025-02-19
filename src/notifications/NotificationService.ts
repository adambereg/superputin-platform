import { NotificationModel, NotificationType } from '../models/Notification';
import { User } from '../models/User';
import { Content } from '../models/Content';

export class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async createNotification(
    user: User,
    type: NotificationType,
    fromUser: User | null,
    content?: Content,
    metadata?: any
  ): Promise<void> {
    const message = this.generateMessage(
      type, 
      fromUser?.username || 'Система', 
      content?.title,
      metadata
    );

    await NotificationModel.create({
      userId: user.id,
      type,
      contentId: content?.id,
      fromUserId: fromUser?.id,
      message,
      metadata,
      level: this.getNotificationLevel(type)
    });
  }

  private generateMessage(
    type: NotificationType, 
    username: string, 
    contentTitle?: string,
    metadata?: any
  ): string {
    switch (type) {
      case 'like':
        return `${username} лайкнул ваш контент "${contentTitle}"`;
      case 'comment':
        return `${username} оставил комментарий к "${contentTitle}"`;
      case 'mention':
        return `${username} упомянул вас в комментарии к "${contentTitle}"`;
      case 'achievement':
        return `Поздравляем! Вы получили достижение "${metadata?.achievementName}"`;
      case 'nft_purchase':
        return `${username} купил ваш NFT "${contentTitle}"`;
      case 'reply':
        return `${username} ответил на ваш комментарий в "${contentTitle}"`;
      default:
        return 'Новое уведомление';
    }
  }

  private getNotificationLevel(type: NotificationType): 'info' | 'success' | 'warning' {
    switch (type) {
      case 'achievement':
        return 'success';
      case 'nft_purchase':
        return 'success';
      case 'mention':
        return 'warning';
      default:
        return 'info';
    }
  }

  async getUnreadNotifications(userId: string) {
    return NotificationModel.find({ 
      userId,
      read: false 
    })
    .populate('fromUserId', 'username')
    .populate('contentId', 'title')
    .sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(notificationId, { read: true });
  }
} 