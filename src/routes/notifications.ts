import { Router } from 'express';
import { NotificationService } from '../notifications/NotificationService';
import { requireAuth } from '../middleware/authMiddleware';
import { AuthRequest } from '../types/AuthRequest';

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
router.post('/test', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { type, metadata } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    await notificationService.createNotification({
      userId: user.id,
      type: type,
      contentId: 'test',
      message: 'Тестовое уведомление',
      metadata: metadata
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error creating test notification:', error);
    return res.status(500).json({
      error: 'Failed to create test notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 