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

// Получение профиля пользователя
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).select('-passwordHash -passwordSalt');
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ 
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
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Ошибка получения профиля' 
    });
  }
});

// Обновление данных пользователя
router.put('/profile/:userId', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Проверяем существование пользователя
    const existingUser = await UserModel.findById(req.params.userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем уникальность username и email
    const duplicateUser = await UserModel.findOne({
      $and: [
        { _id: { $ne: req.params.userId } },
        { $or: [
          { username: username },
          { email: email }
        ]}
      ]
    });

    if (duplicateUser) {
      return res.status(400).json({ error: 'Username или email уже используются' });
    }

    // Обновляем данные
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.userId,
      { $set: { username, email } },
      { new: true }
    ).select('-passwordHash -passwordSalt');

    res.json({ 
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
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Ошибка обновления профиля' 
    });
  }
});

export default router; 