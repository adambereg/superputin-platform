import { Router, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';
import { ContentModel } from '../models/Content';
import { AuthRequest } from '../types/express';

const router = Router();

// Получение статистики
router.get(
  '/stats',
  requireAuth,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const stats = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ role: 'moderator' }),
        ContentModel.countDocuments(),
        ContentModel.countDocuments({ moderationStatus: 'pending' }),
        ContentModel.countDocuments({ moderationStatus: 'approved' }),
        ContentModel.countDocuments({ moderationStatus: 'rejected' })
      ]);

      return res.json({
        totalUsers: stats[0],
        moderators: stats[1],
        totalContent: stats[2],
        pendingContent: stats[3],
        approvedContent: stats[4],
        rejectedContent: stats[5]
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка получения статистики'
      });
    }
  }
);

// Управление пользователями
router.get(
  '/users',
  requireAuth,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const query = search
        ? {
            $or: [
              { username: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        : {};

      const users = await UserModel.find(query)
        .select('-passwordHash -passwordSalt')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await UserModel.countDocuments(query);

      return res.json({
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page
        }
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка получения списка пользователей'
      });
    }
  }
);

// Изменение роли пользователя
router.patch(
  '/users/:userId/role',
  requireAuth,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { role } = req.body;
      const { userId } = req.params;

      if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Недопустимая роль' });
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-passwordHash -passwordSalt');

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      return res.json({ user });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка изменения роли'
      });
    }
  }
);

// Получение списка контента для модерации
router.get(
  '/content',
  requireAuth,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const type = req.query.type as string;

      const query: any = {};
      if (status) query.moderationStatus = status;
      if (type) query.type = type;

      const content = await ContentModel.find(query)
        .populate('authorId', 'username email')
        .populate('moderatedBy', 'username')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await ContentModel.countDocuments(query);

      return res.json({
        content,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page
        }
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка получения списка контента'
      });
    }
  }
);

// Удаление контента
router.delete(
  '/content/:contentId',
  requireAuth,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const content = await ContentModel.findByIdAndDelete(req.params.contentId);
      
      if (!content) {
        return res.status(404).json({ error: 'Контент не найден' });
      }

      return res.json({ message: 'Контент успешно удален' });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка удаления контента'
      });
    }
  }
);

export default router; 