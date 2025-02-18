import dotenv from 'dotenv';
import { ConnectOptions } from 'mongoose';

// Загружаем переменные окружения из .env файла
dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },
  database: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/superputin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    } as ConnectOptions
  },
  storage: {
    type: 'aws',
    bucket: process.env.AWS_BUCKET || 'superputin-storage',
    region: process.env.AWS_REGION || 'us-east-1'
  },
  ton: {
    network: process.env.TON_NETWORK || 'testnet',
    endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC'
  }
} 