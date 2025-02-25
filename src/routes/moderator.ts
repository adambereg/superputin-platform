import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { ContentModel } from '../models/Content';
import { AuthRequest } from '../types/AuthRequest';

const router = Router();

// Получение статистики модератора
router.get('/stats', requireAuth, requireRole('moderator'), async (req: AuthRequest, res) => {
  try {
    const pendingCount = await ContentModel.countDocuments({ moderationStatus: 'pending' });
    const approvedCount = await ContentModel.countDocuments({ 
      moderationStatus: 'approved',
      moderatedBy: req.user?.id
    });
    const rejectedCount = await ContentModel.countDocuments({ 
      moderationStatus: 'rejected',
      moderatedBy: req.user?.id
    });
    
    const totalModerated = approvedCount + rejectedCount;
    
    return res.json({
      success: true,
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalModerated
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch moderator stats'
    });
  }
});

// Получение истории модерации
router.get('/history', requireAuth, requireRole('moderator'), async (req: AuthRequest, res) => {
  try {
    const history = await ContentModel.find({
      moderatedBy: req.user?.id,
      moderationStatus: { $in: ['approved', 'rejected'] }
    })
    .populate('authorId', 'username')
    .sort({ moderatedAt: -1 })
    .limit(20);
    
    return res.json({
      success: true,
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation history'
    });
  }
});

export default router; 