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
import { Comment, CommentModel } from './models/Comment';

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
    app.post('/api/content', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('Получен запрос на создание контента:', {
          body: req.body,
          file: req.file
        });

        const { title, description, type, tags, userId } = req.body;

        // Проверяем обязательные поля
        if (!title || !type || !userId) {
          res.status(400).json({ 
            error: 'Необходимо указать title, type и userId' 
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
        const user = await UserModel.findById(userId);
        if (!user) {
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        // Обрабатываем теги
        const processedTags = tags ? 
          (tags as string).split(',').map(tag => tag.trim().toLowerCase()) : 
          [];

        // Создаем контент
        const content = new Content({
          title,
          description,
          type,
          imageUrl: `http://${config.server.host}:${config.server.port}/uploads/${req.file.filename}`,
          creator: userId,
          tags: processedTags,
          likes: [],
          likesCount: 0
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

    // Роут для получения контента
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

    // Роут для поиска контента по тегам (должен быть перед /api/content/:id)
    app.get('/api/content/search', async (req: Request, res: Response): Promise<void> => {
      try {
        const { tags, type } = req.query;
        console.log('Поиск контента:', { tags, type });

        // Формируем условия поиска
        const conditions: any = {};
        
        // Добавляем фильтр по тегам
        if (tags) {
          const tagArray = (tags as string).split(',').map(tag => tag.trim().toLowerCase());
          conditions.tags = { $in: tagArray };
        }
        
        // Добавляем фильтр по типу
        if (type) {
          conditions.type = type;
        }

        // Получаем контент с фильтрацией
        const content = await ContentModel.find(conditions)
          .populate('creator', 'username email')
          .sort({ createdAt: -1 });

        console.log(`Найдено ${content.length} элементов`);

        res.json({
          message: 'Поиск выполнен успешно',
          content
        });
      } catch (error: any) {
        console.error('Ошибка при поиске контента:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Остальные роуты для /api/content/:id
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

    // Роут для получения комментариев
    app.get('/api/content/:id/comments', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id: contentId } = req.params;
        console.log('Получение комментариев для контента:', contentId);

        // Проверяем существование контента
        const content = await ContentModel.findById(contentId);
        if (!content) {
          res.status(404).json({ error: 'Контент не найден' });
          return;
        }

        // Получаем комментарии с данными авторов
        const comments = await CommentModel.find({ contentId })
          .populate('author', 'username email avatarUrl')
          .sort({ createdAt: -1 });

        console.log(`Найдено ${comments.length} комментариев`);

        res.json({
          message: 'Комментарии успешно получены',
          comments
        });
      } catch (error: any) {
        console.error('Ошибка при получении комментариев:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Роут для создания комментария
    app.post('/api/content/:id/comments', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id: contentId } = req.params;
        const { content, userId } = req.body;

        console.log('Создание комментария:', { contentId, content, userId });

        // Проверяем обязательные поля
        if (!content || !userId) {
          res.status(400).json({ error: 'Необходимо указать content и userId' });
          return;
        }

        // Проверяем существование контента
        const contentExists = await ContentModel.findById(contentId);
        if (!contentExists) {
          res.status(404).json({ error: 'Контент не найден' });
          return;
        }

        // Проверяем существование пользователя
        const userExists = await UserModel.findById(userId);
        if (!userExists) {
          res.status(404).json({ error: 'Пользователь не найден' });
          return;
        }

        // Создаем комментарий
        const comment = new Comment({
          content,
          author: userId,
          contentId,
          likes: [],
          likesCount: 0
        });

        await comment.save();

        // Получаем сохраненный комментарий с данными автора
        const savedComment = await CommentModel.findById(comment.id)
          .populate('author', 'username email avatarUrl');

        console.log('Комментарий успешно создан:', savedComment);

        res.json({
          message: 'Комментарий успешно создан',
          comment: savedComment
        });
      } catch (error: any) {
        console.error('Ошибка при создании комментария:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Роут для удаления комментария
    app.delete('/api/content/:contentId/comments/:commentId', async (req: Request, res: Response): Promise<void> => {
      try {
        const { contentId, commentId } = req.params;
        const { userId } = req.body;

        console.log('Удаление комментария:', { contentId, commentId, userId });

        // Проверяем обязательные поля
        if (!userId) {
          res.status(400).json({ error: 'Необходимо указать userId' });
          return;
        }

        // Проверяем существование контента
        const content = await ContentModel.findById(contentId);
        if (!content) {
          res.status(404).json({ error: 'Контент не найден' });
          return;
        }

        // Проверяем существование комментария
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
          res.status(404).json({ error: 'Комментарий не найден' });
          return;
        }

        // Проверяем права на удаление (автор комментария или админ)
        if (comment.author.toString() !== userId) {
          const user = await UserModel.findById(userId);
          if (!user || user.role !== 'admin') {
            res.status(403).json({ error: 'Нет прав на удаление комментария' });
            return;
          }
        }

        // Удаляем комментарий
        await CommentModel.findByIdAndDelete(commentId);

        console.log('Комментарий успешно удален');

        res.json({
          message: 'Комментарий успешно удален',
          commentId
        });
      } catch (error: any) {
        console.error('Ошибка при удалении комментария:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Роут для редактирования комментария
    app.put('/api/content/:contentId/comments/:commentId', async (req: Request, res: Response): Promise<void> => {
      try {
        const { contentId, commentId } = req.params;
        const { content, userId } = req.body;

        console.log('Редактирование комментария:', { contentId, commentId, userId, content });

        // Проверяем обязательные поля
        if (!content || !userId) {
          res.status(400).json({ error: 'Необходимо указать content и userId' });
          return;
        }

        // Проверяем существование контента
        const contentExists = await ContentModel.findById(contentId);
        if (!contentExists) {
          res.status(404).json({ error: 'Контент не найден' });
          return;
        }

        // Проверяем существование комментария
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
          res.status(404).json({ error: 'Комментарий не найден' });
          return;
        }

        // Проверяем права на редактирование (только автор может редактировать)
        if (comment.author.toString() !== userId) {
          res.status(403).json({ error: 'Нет прав на редактирование комментария' });
          return;
        }

        // Обновляем комментарий
        const updatedComment = await CommentModel.findByIdAndUpdate(
          commentId,
          { $set: { content } },
          { new: true }
        ).populate('author', 'username email avatarUrl');

        console.log('Комментарий успешно обновлен:', updatedComment);

        res.json({
          message: 'Комментарий успешно обновлен',
          comment: updatedComment
        });
      } catch (error: any) {
        console.error('Ошибка при редактировании комментария:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Роут для лайка комментария
    app.post('/api/content/:contentId/comments/:commentId/like', async (req: Request, res: Response): Promise<void> => {
      try {
        const { contentId, commentId } = req.params;
        const { userId } = req.body;

        console.log('Добавление лайка к комментарию:', { contentId, commentId, userId });

        // Проверяем обязательные поля
        if (!userId) {
          res.status(400).json({ error: 'Необходимо указать userId' });
          return;
        }

        // Проверяем существование комментария
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
          res.status(404).json({ error: 'Комментарий не найден' });
          return;
        }

        // Проверяем, не лайкнул ли уже пользователь
        const hasLike = comment.likes?.includes(userId);
        if (hasLike) {
          res.status(400).json({ error: 'Вы уже поставили лайк' });
          return;
        }

        // Добавляем лайк
        const updatedComment = await CommentModel.findByIdAndUpdate(
          commentId,
          { 
            $addToSet: { likes: userId },
            $inc: { likesCount: 1 }
          },
          { new: true }
        ).populate('author', 'username email avatarUrl');

        console.log('Комментарий обновлен:', updatedComment);

        res.json({
          message: 'Лайк успешно добавлен',
          comment: updatedComment
        });
      } catch (error: any) {
        console.error('Ошибка при добавлении лайка:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Роут для удаления лайка с комментария
    app.delete('/api/content/:contentId/comments/:commentId/like', async (req: Request, res: Response): Promise<void> => {
      try {
        const { contentId, commentId } = req.params;
        const { userId } = req.body;

        console.log('Удаление лайка с комментария:', { contentId, commentId, userId });

        // Проверяем обязательные поля
        if (!userId) {
          res.status(400).json({ error: 'Необходимо указать userId' });
          return;
        }

        // Проверяем существование комментария
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
          res.status(404).json({ error: 'Комментарий не найден' });
          return;
        }

        // Проверяем, есть ли лайк от пользователя
        const hasLike = comment.likes?.includes(userId);
        if (!hasLike) {
          res.status(400).json({ error: 'Лайк не найден' });
          return;
        }

        // Удаляем лайк
        const updatedComment = await CommentModel.findByIdAndUpdate(
          commentId,
          { 
            $pull: { likes: userId },
            $inc: { likesCount: -1 }
          },
          { new: true }
        ).populate('author', 'username email avatarUrl');

        console.log('Комментарий обновлен:', updatedComment);

        res.json({
          message: 'Лайк успешно удален',
          comment: updatedComment
        });
      } catch (error: any) {
        console.error('Ошибка при удалении лайка:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Роут для получения всех уникальных тегов
    app.get('/api/tags', async (_req: Request, res: Response): Promise<void> => {
      try {
        const tags = await ContentModel.distinct('tags');
        console.log('Получено тегов:', tags.length);

        res.json({
          message: 'Теги успешно получены',
          tags
        });
      } catch (error: any) {
        console.error('Ошибка при получении тегов:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Роут для удаления контента
    app.delete('/api/content/:id', async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        console.log('Удаление контента:', { contentId: id, userId });

        // Проверяем обязательные поля
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

        // Проверяем права на удаление (создатель или админ)
        if (content.creator.toString() !== userId) {
          const user = await UserModel.findById(userId);
          if (!user || user.role !== 'admin') {
            res.status(403).json({ error: 'Нет прав на удаление контента' });
            return;
          }
        }

        // Удаляем файл изображения
        const imagePath = content.imageUrl.replace(`http://${config.server.host}:${config.server.port}/`, '');
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Файл изображения удален:', imagePath);
        }

        // Удаляем все комментарии к контенту
        await CommentModel.deleteMany({ contentId: id });
        console.log('Комментарии удалены');

        // Удаляем сам контент
        await ContentModel.findByIdAndDelete(id);
        console.log('Контент удален');

        res.json({
          message: 'Контент успешно удален',
          contentId: id
        });
      } catch (error: any) {
        console.error('Ошибка при удалении контента:', error);
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