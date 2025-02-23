import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';
import { ContentModel } from '../models/Content';
import { AuthRequest } from '../types/express';

const router = Router();

// Получение статистики для дашборда
router.get('/stats', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const [
      totalUsers,
      totalContent,
      pendingContent,
      approvedContent,
      rejectedContent,
      moderators
    ] = await Promise.all([
      UserModel.countDocuments(),
      ContentModel.countDocuments(),
      ContentModel.countDocuments({ moderationStatus: 'pending' }),
      ContentModel.countDocuments({ moderationStatus: 'approved' }),
      ContentModel.countDocuments({ moderationStatus: 'rejected' }),
      UserModel.countDocuments({ role: 'moderator' })
    ]);

    // Получаем последние действия (можно расширить позже)
    const recentActivity = [
      {
        type: 'content',
        message: 'Новый контент добавлен на модерацию',
        timestamp: new Date().toISOString()
      }
      // Здесь можно добавить больше действий
    ];

    return res.json({
      data: {
        totalUsers,
        totalContent,
        pendingContent,
        approvedContent,
        rejectedContent,
        moderators,
        recentActivity
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to get stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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

// Удаление пользователя
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Attempting to delete user:', userId);
    
    // Находим пользователя
    const user = await UserModel.findById(userId);
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Проверяем, не пытаемся ли удалить последнего админа
    if (user.role === 'admin') {
      const adminCount = await UserModel.countDocuments({ role: 'admin' });
      console.log('Admin count:', adminCount);
      if (adminCount === 1) {
        console.log('Attempting to delete last admin');
        return res.status(400).json({ 
          error: 'Нельзя удалить последнего администратора' 
        });
      }
    }

    await UserModel.findByIdAndDelete(userId);
    console.log('User deleted successfully');
    
    return res.json({ 
      success: true,
      message: 'Пользователь успешно удален' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ 
      error: 'Ошибка удаления пользователя',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Обновление роли пользователя
router.patch('/users/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Проверяем допустимость роли
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Проверяем, не пытаемся ли понизить роль последнего админа
    if (role !== 'admin') {
      const user = await UserModel.findById(id);
      if (user?.role === 'admin') {
        const adminCount = await UserModel.countDocuments({ role: 'admin' });
        if (adminCount === 1) {
          return res.status(400).json({ 
            error: 'Нельзя понизить роль последнего администратора' 
          });
        }
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('username email role createdAt');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ 
      error: 'Failed to update user role',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 