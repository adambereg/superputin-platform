import { Router } from 'express';
import { AuthService } from '../auth/AuthService';
import { UserModel } from '../models/User';

const router = Router();
const authService = AuthService.getInstance();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await authService.register(username, email, password);
    res.json({ 
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Ошибка регистрации' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    res.json({ 
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      error: error instanceof Error ? error.message : 'Ошибка входа' 
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

export default router; 