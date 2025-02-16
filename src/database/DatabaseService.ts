import mongoose from 'mongoose';
import { config } from '../config/config';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    try {
      mongoose.connection.on('error', (err) => {
        console.error('Ошибка MongoDB:', err);
      });

      mongoose.connection.once('open', () => {
        console.log('MongoDB успешно подключена');
      });

      // Добавляем дополнительные опции подключения
      const options = {
        ...config.database.options,
        serverSelectionTimeoutMS: 5000, // Таймаут подключения
        socketTimeoutMS: 45000, // Таймаут сокета
        family: 4 // Принудительно используем IPv4
      };

      await mongoose.connect(config.database.url, options);
    } catch (error) {
      console.error('Ошибка подключения к MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('MongoDB отключена');
    } catch (error) {
      console.error('Ошибка при отключении от MongoDB:', error);
      throw error;
    }
  }
} 