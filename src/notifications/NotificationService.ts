import { NotificationModel } from '../models/Notification';

interface CreateNotificationParams {
  userId: string;
  type: string;
  contentId: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async createNotification(params: CreateNotificationParams): Promise<void> {
    const { userId, type, contentId, message, metadata } = params;
    
    await NotificationModel.create({
      userId,
      type,
      contentId,
      message,
      metadata,
      read: false
    });
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