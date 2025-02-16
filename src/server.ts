import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { DatabaseService } from './database/DatabaseService';
import { AuthService } from './auth/AuthService';
import { UserModel } from './models/User';
import { upload, handleMulterError } from './middleware/upload';
import { StorageService } from './storage/StorageService';
import * as crypto from 'crypto';
import * as fs from 'fs';

async function startServer() {
  try {
    // Инициализация базы данных
    await DatabaseService.getInstance().connect();
    
    const app = express();
    
    // 1. Базовые middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    const corsOptions = {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 204
    };
    app.use(cors(corsOptions));
    app.options('*', cors());

    // 2. Статические файлы
    app.use('/uploads', express.static('uploads'));

    // 3. Логирование
    app.use((req: Request, _res: Response, next) => {
      console.log(`${req.method} ${req.url}`, {
        headers: req.headers,
        body: req.body
      });
      next();
    });

    // 4. Обработка ошибок multer
    app.use(handleMulterError);

    // Роуты
    app.post('/api/register', async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('Получен запрос на регистрацию:', req.body);
        
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
          console.log('Отсутствуют обязательные поля');
          res.status(400).json({ 
            error: 'Необходимо указать username, email и password' 
          });
          return;
        }

        const authService = AuthService.getInstance();
        const user = await authService.register(username, email, password);
        
        console.log('Пользователь успешно зарегистрирован:', {
          id: user.id,
          username: user.username,
          email: user.email
        });

        res.json({ 
          message: 'Пользователь успешно зарегистрирован',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            points: user.points
          }
        });
      } catch (error: any) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(400).json({ error: error.message });
      }
    });

    app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password } = req.body;
        const authService = AuthService.getInstance();
        const user = await authService.login(email, password);
        res.json({ 
          message: 'Успешная авторизация', 
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            points: user.points
          }
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    app.get('/api/user/:id', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        console.log('Получен запрос на получение пользователя с id:', id);
        
        const user = await UserModel.findById(id);
        console.log('Результат поиска пользователя:', user);
        
        if (!user) {
          console.log('Пользователь не найден');
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        console.log('Отправка данных пользователя');
        res.json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            points: user.points,
            avatarUrl: user.avatarUrl
          }
        });
      } catch (error: any) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(400).json({ error: error.message });
      }
    });

    app.put('/api/user/:id', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { username, email } = req.body;
        
        console.log('PUT /api/user/:id', {
          id,
          body: req.body,
          headers: req.headers
        });

        // Проверяем существование пользователя
        const user = await UserModel.findById(id);
        if (!user) {
          console.log('Пользователь не найден');
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        // Проверяем, не занят ли username или email другим пользователем
        if (username) {
          const existingUser = await UserModel.findOne({ 
            username, 
            _id: { $ne: id } 
          });
          if (existingUser) {
            res.status(400).json({ error: 'Это имя пользователя уже занято' });
            return;
          }
        }

        if (email) {
          const existingUser = await UserModel.findOne({ 
            email, 
            _id: { $ne: id } 
          });
          if (existingUser) {
            res.status(400).json({ error: 'Этот email уже используется' });
            return;
          }
        }

        // Обновляем данные
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          { $set: { username, email } },
          { new: true }
        );

        console.log('Пользователь успешно обновлен:', updatedUser);

        res.json({
          message: 'Профиль успешно обновлен',
          user: {
            id: updatedUser?.id,
            username: updatedUser?.username,
            email: updatedUser?.email,
            role: updatedUser?.role,
            points: updatedUser?.points
          }
        });
      } catch (error: any) {
        console.error('Ошибка при обновлении пользователя:', error);
        res.status(400).json({ error: error.message });
      }
    });

    // Добавляем роут для изменения пароля
    app.put('/api/user/:id/password', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        console.log('Получен запрос на изменение пароля:', {
          userId: id,
          headers: req.headers,
          body: req.body
        });

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
          res.status(400).json({ 
            error: 'Необходимо указать текущий и новый пароль' 
          });
          return;
        }

        // Проверяем существование пользователя
        const user = await UserModel.findById(id);
        if (!user) {
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        // Проверяем текущий пароль
        const currentHash = crypto
          .pbkdf2Sync(currentPassword, user.passwordSalt!, 1000, 64, 'sha512')
          .toString('hex');

        if (currentHash !== user.passwordHash) {
          res.status(400).json({ error: 'Неверный текущий пароль' });
          return;
        }

        // Генерируем новый salt и hash
        const newSalt = crypto.randomBytes(16).toString('hex');
        const newHash = crypto
          .pbkdf2Sync(newPassword, newSalt, 1000, 64, 'sha512')
          .toString('hex');

        // Обновляем пароль
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          { 
            $set: { 
              passwordHash: newHash,
              passwordSalt: newSalt
            } 
          },
          { new: true }
        );

        console.log('Пароль успешно изменен');

        res.json({
          message: 'Пароль успешно изменен',
          user: {
            id: updatedUser?.id,
            username: updatedUser?.username,
            email: updatedUser?.email,
            role: updatedUser?.role,
            points: updatedUser?.points,
            avatarUrl: updatedUser?.avatarUrl
          }
        });
      } catch (error: any) {
        console.error('Ошибка при изменении пароля:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Создаем экземпляр StorageService
    const storageService = new StorageService();

    // 5. Роуты
    // Обновляем роут загрузки аватара
    app.post('/api/user/:id/avatar', upload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('Начало обработки загрузки аватара');
        
        const { id } = req.params;
        const file = req.file;
        
        console.log('Данные запроса:', {
          userId: id,
          file: file ? {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
          } : 'нет файла'
        });

        if (!file) {
          res.status(400).json({ error: 'Файл не загружен' });
          return;
        }

        const user = await UserModel.findById(id);
        if (!user) {
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
        
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          { $set: { avatarUrl: fileUrl } },
          { new: true }
        );

        console.log('Аватар успешно загружен:', fileUrl);

        res.json({
          message: 'Аватар успешно загружен',
          user: {
            id: updatedUser?.id,
            username: updatedUser?.username,
            email: updatedUser?.email,
            role: updatedUser?.role,
            points: updatedUser?.points,
            avatarUrl: updatedUser?.avatarUrl
          }
        });
      } catch (error: any) {
        console.error('Ошибка при загрузке аватара:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Добавляем роут для удаления аватара
    app.delete('/api/user/:id/avatar', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        console.log('DELETE /api/user/:id/avatar', {
          method: req.method,
          url: req.url,
          params: req.params,
          headers: req.headers,
          body: req.body
        });
        console.log('Получен запрос на удаление аватара:', { userId: id });

        // Проверяем существование пользователя
        const user = await UserModel.findById(id);
        if (!user) {
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        // Проверяем наличие аватара
        if (!user.avatarUrl) {
          res.status(400).json({ error: 'У пользователя нет аватара' });
          return;
        }

        // Получаем имя файла из URL
        const filename = user.avatarUrl.split('/').pop();
        const filePath = `uploads/${filename}`;

        // Удаляем файл
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Файл аватара удален:', filePath);
        }

        // Обновляем пользователя
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          { $set: { avatarUrl: null } },
          { new: true }
        );

        console.log('Аватар успешно удален');

        res.json({
          message: 'Аватар успешно удален',
          user: {
            id: updatedUser?.id,
            username: updatedUser?.username,
            email: updatedUser?.email,
            role: updatedUser?.role,
            points: updatedUser?.points,
            avatarUrl: updatedUser?.avatarUrl
          }
        });
      } catch (error: any) {
        console.error('Ошибка при удалении аватара:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Тестовый роут
    app.get('/api/test', (_req: Request, res: Response) => {
      res.json({ message: 'API работает' });
    });
    
    app.listen(config.server.port, () => {
      console.log(`Сервер запущен на порту ${config.server.port}`);
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Необработанная ошибка:', error);
});

startServer(); 