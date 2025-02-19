import { Router } from 'express';
import { NotificationService } from '../notifications/NotificationService';
import { UserModel } from '../models/User';
import { NotificationType } from '../models/Notification';

const router = Router();
const notificationService = NotificationService.getInstance();

// Получение непрочитанных уведомлений
router.get('/unread/:userId', async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.params.userId);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка получения уведомлений'
    });
  }
});

// Отметить уведомление как прочитанное
router.post('/:notificationId/read', async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.notificationId);
    res.json({ message: 'Уведомление отмечено как прочитанное' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка обновления уведомления'
    });
  }
});

// Тестовый маршрут для создания уведомлений
router.post('/test', async (req, res) => {
  try {
    const { userId, type, metadata } = req.body;
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await notificationService.createNotification(
      user,
      type as NotificationType,
      null, // от системы
      undefined,
      metadata
    );

    res.json({ message: 'Тестовое уведомление создано' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ошибка создания уведомления'
    });
  }
});

export default router; 