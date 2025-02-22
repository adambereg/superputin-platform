import { Router } from 'express';
import { AuthService } from '../auth/AuthService';
import { UserModel } from '../models/User';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { config } from '../config/config';

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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Если требуется 2FA
    if (result.requiresTwoFactor) {
      return res.json({
        requiresTwoFactor: true,
        user: result.user,
        message: 'Please check your email for verification code'
      });
    }

    // Если 2FA не требуется или уже пройдена
    return res.json({
      user: result.user,
      token: result.token,
      message: 'Login successful'
    });
  } catch (error) {
    return res.status(401).json({ 
      error: error instanceof Error ? error.message : 'Login failed' 
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

router.get('/test-db', async (_req, res) => {
  try {
    const count = await UserModel.countDocuments();
    res.json({ 
      message: 'База данных подключена',
      userCount: count
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка подключения к базе данных',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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

export default router; 