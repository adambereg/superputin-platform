import express from 'express';
import cors from 'cors';
import { DatabaseService } from './database/DatabaseService';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import path from 'path';

const app = express();

// Создаем middleware для JSON
const jsonParser = express.json({ limit: '50mb' });

// Middleware для обработки разных типов контента
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('application/json')) {
    jsonParser(req, res, next);
  } else if (contentType.includes('multipart/form-data')) {
    next();
  } else {
    express.urlencoded({ limit: '50mb', extended: true })(req, res, next);
  }
});

// Обработка ошибок парсинга
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  return next(err);
});

app.use(cors({
  origin: 'http://localhost:5173', // URL фронтенда
  credentials: true
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Тестовые маршруты
app.get('/api/test', (_req, res) => {
  res.json({ message: 'API работает' });
});

app.get('/api/env-test', (_req, res) => {
  res.json({
    mongodb: !!process.env.MONGODB_URL,
    r2: !!process.env.R2_BUCKET,
    ton: !!process.env.TON_NETWORK
  });
});

// Базовый маршрут
app.get('/', (_req, res) => {
  res.json({
    message: 'SuperPutin Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      content: '/api/content',
      notifications: '/api/notifications'
    },
    docs: 'https://github.com/yourusername/superputin-platform'
  });
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Добавляем раздачу статических файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

async function startServer() {
  try {
    await DatabaseService.getInstance().connect();
    
    const port = parseInt(process.env.PORT || '3000');
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.log(`Port ${port} is busy, trying ${nextPort}`);
        server.listen(nextPort);
      } else {
        console.error('Server error:', error);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer(); 