import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';
import { ContentModel } from '../models/Content';
import { AuthRequest } from '../types/express';

const router = Router();

// Получение статистики для дашборда
router.get('/stats', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const stats = await Promise.all([
      UserModel.countDocuments(),
      ContentModel.countDocuments(),
      ContentModel.countDocuments({ moderationStatus: 'pending' }),
      UserModel.countDocuments({ role: 'moderator' })
    ]);

    return res.json({
      totalUsers: stats[0],
      totalContent: stats[1],
      pendingContent: stats[2],
      moderators: stats[3]
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Получение списка пользователей с пагинацией
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query = search 
      ? { 
          $or: [
            { username: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') }
          ]
        }
      : {};

    const users = await UserModel.find(query)
      .select('username email role createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await UserModel.countDocuments(query);

    return res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get users' });
  }
});

// Управление контентом
router.get('/content', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const query = status ? { moderationStatus: status } : {};

    const content = await ContentModel.find(query)
      .populate('authorId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ContentModel.countDocuments(query);

    return res.json({
      content,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get content' });
  }
});

// Модерация контента
router.post('/content/:id/moderate', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const { status, comment } = req.body;
    const content = await ContentModel.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: status,
        moderationComment: comment,
        moderatedBy: req.user?.id,
        moderatedAt: new Date()
      },
      { new: true }
    );

    return res.json({ content });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to moderate content' });
  }
});

export default router; 