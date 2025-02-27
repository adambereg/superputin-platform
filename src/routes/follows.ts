import { Router } from 'express';
import { FollowModel } from '../models/Follow';
import { requireAuth } from '../middleware/authMiddleware';
import { AuthRequest } from '../types/AuthRequest';
import { NotificationService } from '../notifications/NotificationService';
import { ContentModel } from '../models/Content';

const router = Router();
const notificationService = NotificationService.getInstance();

// Подписаться на пользователя
router.post('/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const followingId = req.params.userId;
    const followerId = req.user!.id;

    if (followerId === followingId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Нельзя подписаться на самого себя' 
      });
    }

    const follow = await FollowModel.create({
      followerId,
      followingId
    });

    // Отправляем уведомление
    await notificationService.createNotification({
      userId: followingId,
      type: 'follow',
      contentId: followerId,
      message: `${req.user!.username} подписался на вас`
    });

    return res.json({ success: true, follow });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        error: 'Вы уже подписаны на этого пользователя'
      });
    }
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Отписаться от пользователя
router.delete('/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await FollowModel.deleteOne({
      followerId: req.user!.id,
      followingId: req.params.userId
    });

    return res.json({ 
      success: true, 
      unfollowed: result.deletedCount > 0 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Получить подписчиков пользователя
router.get('/:userId/followers', async (req, res) => {
  try {
    const followers = await FollowModel.find({ 
      followingId: req.params.userId 
    })
    .populate('followerId', 'username email avatar')
    .sort({ createdAt: -1 });

    return res.json({ success: true, followers });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Получить подписки пользователя
router.get('/:userId/following', async (req, res) => {
  try {
    const following = await FollowModel.find({ 
      followerId: req.params.userId 
    })
    .populate('followingId', 'username email avatar')
    .sort({ createdAt: -1 });

    return res.json({ success: true, following });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Получить ленту активности подписок
router.get('/feed', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    
    const following = await FollowModel.find({ 
      followerId: req.user!.id 
    }).select('followingId');
    
    const followingIds = following.map(f => f.followingId);

    const query: any = {
      authorId: { $in: followingIds },
      moderationStatus: 'approved'
    };

    if (type && type !== 'all') {
      query.type = type;
    }

    const [feed, total] = await Promise.all([
      ContentModel.find(query)
        .populate('authorId', 'username avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ContentModel.countDocuments(query)
    ]);

    return res.json({ 
      success: true, 
      feed,
      hasMore: total > page * limit,
      total
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router; 