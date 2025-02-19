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
    fromUser: User,
    content?: Content
  ): Promise<void> {
    const message = this.generateMessage(type, fromUser.username, content?.title);

    await NotificationModel.create({
      userId: user.id,
      type,
      contentId: content?.id,
      fromUserId: fromUser.id,
      message
    });
  }

  private generateMessage(type: NotificationType, username: string, contentTitle?: string): string {
    switch (type) {
      case 'like':
        return `${username} лайкнул ваш контент "${contentTitle}"`;
      case 'comment':
        return `${username} прокомментировал ваш контент "${contentTitle}"`;
      case 'mention':
        return `${username} упомянул вас в комментарии`;
      default:
        return 'Новое уведомление';
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