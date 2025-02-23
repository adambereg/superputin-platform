import { Router } from 'express';
import { AuthService } from '../auth/AuthService';
import { UserModel } from '../models/User';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { config } from '../config/config';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { AuthRequest } from '../types/express';

const router = Router();
const authService = AuthService.getInstance();

// Регистрация
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('username').trim().isLength({ min: 3 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;
    const result = await authService.register({ email, password, username });

    return res.status(201).json({
      success: true,
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        isEmailVerified: result.user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

// Подтверждение email
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    await authService.verifyEmail(token as string);
    return res.json({ 
      success: true,
      message: 'Email verified successfully. You can now log in.' 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Email verification failed' 
    });
  }
});

// Верификация email
router.get('/verify-email/:token', async (req, res) => {
  try {
    await authService.verifyEmail(req.params.token);
    
    // После успешной верификации перенаправляем на фронтенд
    res.redirect(`${config.app.url}/login?verified=true`);
  } catch (error) {
    // В случае ошибки перенаправляем на страницу с ошибкой
    res.redirect(`${config.app.url}/login?error=verification-failed`);
  }
});

// Вход
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    // Если требуется 2FA
    if (result.requiresTwoFactor) {
      return res.json({
        requiresTwoFactor: true,
        user: {
          id: result.user.id,
          email: result.user.email
        }
      });
    }

    return res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role
      },
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      error: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
});

// Запрос сброса пароля
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    return res.json({ 
      success: true,
      message: 'Password reset email sent.' 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Password reset request failed' 
    });
  }
});

// Сброс пароля
router.post('/reset-password', [
  body('token').exists(),
  body('newPassword').isLength({ min: 8 })
], async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return res.json({ 
      success: true,
      message: 'Password reset successful.' 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed' 
    });
  }
});

// Тестовый маршрут для проверки базы данных
router.get('/test-db', async (_req, res) => {
  try {
    const userCount = await UserModel.countDocuments();
    res.json({ 
      message: 'База данных подключена',
      userCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Получение профиля пользователя
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).select('-passwordHash -passwordSalt');
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    return res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        createdContent: user.createdContent,
        ownedNFTs: user.ownedNFTs
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Ошибка получения профиля' 
    });
  }
});

// Обновление данных пользователя
router.put('/profile/:userId', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.userId,
      { $set: { username, email } },
      { new: true }
    ).select('-passwordHash -passwordSalt');

    if (!updatedUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    return res.json({ 
      message: 'Профиль обновлен',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        points: updatedUser.points
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Ошибка обновления профиля' 
    });
  }
});

// Удаляем маршрут Google авторизации полностью

router.post('/vk', async (req, res) => {
  try {
    const { code } = req.body;
    const user = await authService.loginWithVK(code);
    res.json({ 
      message: 'VK auth successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      error: error instanceof Error ? error.message : 'VK auth failed' 
    });
  }
});

// Включение 2FA
router.post('/2fa/enable', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await authService.enable2FA(userId);
    res.json({ success: true, secret: result.secret });
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to enable 2FA' 
    });
  }
});

// Отправка 2FA кода
router.post('/2fa/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    await authService.send2FACode(email);
    res.json({ 
      success: true, 
      message: 'Verification code sent to your email' 
    });
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to send 2FA code' 
    });
  }
});

// Проверка 2FA кода
router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const result = await authService.verify2FAToken(userId, token);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    // Добавляем токен в ответ
    return res.json({ 
      success: true, 
      message: 'Token verified successfully',
      token: result.token // Убедитесь, что токен передается в ответе
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify token' 
    });
  }
});

// Обновите маршрут check-admin
router.get('/check-admin', async (_req, res) => {
  try {
    const admin = await UserModel.findOne({ email: 'admin@example.com' }).lean();
    console.log('Raw admin data:', admin);
    
    if (!admin) {
      return res.json({ 
        exists: false,
        message: 'Admin not found' 
      });
    }

    // Если роль не admin, попробуем обновить
    if (admin.role !== 'admin') {
      console.log('Admin role is not set, attempting to update...');
      
      const updatedAdmin = await UserModel.findOneAndUpdate(
        { email: 'admin@example.com' },
        {
          $set: {
            role: 'admin',
            permissions: [
              'upload_content',
              'moderate_content',
              'manage_users',
              'manage_categories',
              'view_analytics'
            ]
          }
        },
        { new: true }
      );
      
      console.log('Updated admin:', updatedAdmin);
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare('admin123', admin.passwordHash);
    
    return res.json({
      exists: true,
      role: admin.role,
      passwordValid: isValidPassword,
      hasPasswordHash: !!admin.passwordHash,
      permissions: admin.permissions
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return res.status(500).json({ 
      error: 'Check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Добавьте новый маршрут для проверки всех пользователей
router.get('/check-users', async (_req, res) => {
  try {
    // Используем lean() для получения чистых объектов
    const users = await UserModel.find().lean().select('email role passwordHash username permissions');
    console.log('Raw users data:', users);
    
    // Проверяем админа отдельно с lean()
    const admin = await UserModel.findOne({ email: 'admin@example.com' }).lean();
    console.log('Raw admin data:', admin);
    
    return res.json({
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        hasPasswordHash: !!user.passwordHash,
        permissions: user.permissions
      })),
      adminDetails: admin ? {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      } : null
    });
  } catch (error) {
    console.error('Check users error:', error);
    return res.status(500).json({ 
      error: 'Check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false });
    }
    return res.json({ 
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false });
  }
});

// Добавляем защищенный маршрут для админа
router.get('/users', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const users = await UserModel.find()
      .select('-passwordHash -passwordSalt')
      .lean();
    
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 