import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { DatabaseService } from './database/DatabaseService';
import { AuthService } from './auth/AuthService';
import { UserModel } from './models/User';
import { upload, handleMulterError, determineContentType } from './middleware/upload';
import { StorageService } from './storage/StorageService';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { Content, ContentType, ContentModel, ILike } from './models/Content';

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

    // Добавляем функцию для нормализации пути
    function normalizeUrl(path: string): string {
      return path.replace(/\\/g, '/');
    }

    // Обновляем роут создания контента
    app.post('/api/content', 
      express.urlencoded({ extended: true }), // Парсим form-data
      upload.single('image'), // Загружаем файл
      async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('Получен запрос на создание контента:', {
          body: req.body,
          file: req.file
        });

        const { title, description, type, creator, tags } = req.body;

        // Проверяем обязательные поля
        if (!title || !type || !creator) {
          res.status(400).json({ 
            error: 'Необходимо указать title, type и creator' 
          });
          return;
        }

        // Проверяем тип контента
        if (!Object.values(ContentType).includes(type)) {
          res.status(400).json({ 
            error: 'Неверный тип контента. Допустимые значения: meme, comic' 
          });
          return;
        }

        // Проверяем наличие файла
        if (!req.file) {
          res.status(400).json({ error: 'Необходимо загрузить изображение' });
          return;
        }

        // Проверяем существование пользователя
        const user = await UserModel.findById(creator);
        if (!user) {
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        // Формируем URL изображения
        const imageUrl = `http://localhost:3000/${normalizeUrl(req.file.path)}`;

        // Создаем новый контент
        const content = new Content({
          title,
          description,
          type,
          imageUrl,
          creator,
          likes: [],
          likesCount: 0,
          tags: tags ? JSON.parse(tags) : []
        });

        await content.save();

        console.log('Контент успешно создан');

        res.json({
          message: 'Контент успешно создан',
          content: {
            title: content.title,
            description: content.description,
            type: content.type,
            imageUrl: content.imageUrl,
            creator: content.creator,
            tags: content.tags,
            likes: content.likes
          }
        });
      } catch (error: any) {
        console.error('Ошибка при создании контента:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Обновляем роут получения контента
    app.get('/api/content', async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('Получен запрос на получение контента');
        
        const { type } = req.query;
        const filter = type ? { type } : {};
        
        // Получаем записи с фильтром
        const content = await ContentModel.find(filter)
          .populate('creator', 'username email')
          .sort({ createdAt: -1 });
        
        res.json({ content });
      } catch (error: any) {
        console.error('Ошибка при получении контента:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Добавляем роут для получения конкретного контента по ID
    app.get('/api/content/:id', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        console.log('Получен запрос на получение контента по ID:', id);
        
        const content = await ContentModel.findById(id)
          .populate('creator', 'username email');
        
        if (!content) {
          res.status(404).json({ error: 'Контент не найден' });
          return;
        }
        
        res.json({ content });
      } catch (error: any) {
        console.error('Ошибка при получении контента:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Добавляем роут для исправления путей в базе данных
    app.post('/api/admin/fix-paths', async (_req: Request, res: Response): Promise<void> => {
      try {
        console.log('Начало исправления путей...');
        
        // Получаем весь контент
        const content = await ContentModel.find();
        
        // Исправляем пути
        for (const item of content) {
          // Нормализуем URL
          const normalizedUrl = normalizeUrl(item.imageUrl);
          
          // Исправляем папку (если это комикс в папке memes)
          let fixedUrl = normalizedUrl;
          if (item.type === 'comic' && normalizedUrl.includes('/uploads/memes/')) {
            fixedUrl = normalizedUrl.replace('/uploads/memes/', '/uploads/comics/');
            
            // Перемещаем файл
            const oldPath = normalizedUrl.replace('http://localhost:3000/', '');
            const newPath = fixedUrl.replace('http://localhost:3000/', '');
            
            if (fs.existsSync(oldPath)) {
              // Создаем папку comics если её нет
              if (!fs.existsSync('uploads/comics')) {
                fs.mkdirSync('uploads/comics', { recursive: true });
              }
              
              fs.renameSync(oldPath, newPath);
              console.log(`Файл перемещен: ${oldPath} -> ${newPath}`);
            }
          }
          
          // Обновляем запись в базе
          if (fixedUrl !== item.imageUrl) {
            await ContentModel.findByIdAndUpdate(item.id, { 
              $set: { imageUrl: fixedUrl } 
            });
            console.log(`Обновлен путь для ${item.id}: ${fixedUrl}`);
          }
        }
        
        res.json({ 
          message: 'Пути успешно исправлены',
          count: content.length
        });
      } catch (error: any) {
        console.error('Ошибка при исправлении путей:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Обновляем роут для лайка контента
    app.post('/api/content/:id/like', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        console.log('Добавление лайка:', { contentId: id, userId });

        if (!userId) {
          res.status(400).json({ error: 'Необходимо указать userId' });
          return;
        }

        // Проверяем существование контента
        const content = await ContentModel.findById(id);
        if (!content) {
          res.status(404).json({ error: 'Контент не найден' });
          return;
        }

        // Проверяем, не лайкнул ли уже пользователь
        const hasLike = content.likes?.some(like => like.toString() === userId);
        if (hasLike) {
          res.status(400).json({ error: 'Вы уже поставили лайк' });
          return;
        }

        // Добавляем лайк
        const updatedContent = await ContentModel.findByIdAndUpdate(
          id,
          { 
            $addToSet: { likes: userId },
            $inc: { likesCount: 1 }
          },
          { new: true }
        ).populate('creator', 'username email');

        console.log('Контент обновлен:', updatedContent);

        res.json({
          message: 'Лайк успешно добавлен',
          content: updatedContent
        });
      } catch (error: any) {
        console.error('Ошибка при добавлении лайка:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Обновляем роут для удаления лайка
    app.delete('/api/content/:id/like', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        console.log('Удаление лайка:', { contentId: id, userId });

        if (!userId) {
          res.status(400).json({ error: 'Необходимо указать userId' });
          return;
        }

        // Проверяем существование контента
        const content = await ContentModel.findById(id);
        if (!content) {
          res.status(404).json({ error: 'Контент не найден' });
          return;
        }

        // Проверяем, есть ли лайк от пользователя
        const hasLike = content.likes?.some(like => like.toString() === userId);
        if (!hasLike) {
          res.status(400).json({ error: 'Лайк не найден' });
          return;
        }

        // Удаляем лайк
        const updatedContent = await ContentModel.findByIdAndUpdate(
          id,
          { 
            $pull: { likes: userId },
            $inc: { likesCount: -1 }
          },
          { new: true }
        ).populate('creator', 'username email');

        console.log('Контент обновлен:', updatedContent);

        res.json({
          message: 'Лайк успешно удален',
          content: updatedContent
        });
      } catch (error: any) {
        console.error('Ошибка при удалении лайка:', error);
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