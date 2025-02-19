import { Router } from 'express';
import { NotificationService } from '../notifications/NotificationService';

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

export default router; 