import express from 'express';
import cors from 'cors';
import { DatabaseService } from './database/DatabaseService';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import notificationRoutes from './routes/notifications';

const app = express();
app.use(express.json());
app.use(cors());

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

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/notifications', notificationRoutes);

async function startServer() {
  try {
    await DatabaseService.getInstance().connect();
    
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
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