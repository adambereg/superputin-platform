import { User, UserModel } from '../models/User';
import { TonWallet } from '../blockchain/TonWallet';
import * as crypto from 'crypto';

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    try {
        console.log('Начало регистрации пользователя:', { username, email });
        
        // Проверка данных
        if (!this.validateInput(username, email, password)) {
            console.log('Ошибка валидации данных');
            throw new Error('Неверные данные для регистрации');
        }

        // Проверка существующего пользователя
        const existingUser = await UserModel.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            console.log('Пользователь уже существует');
            throw new Error('Пользователь с таким email или username уже существует');
        }

        // Хеширование пароля
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto
            .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
            .toString('hex');

        console.log('Пароль захеширован');

        // Временный адрес кошелька
        const tempWalletAddress = '0x' + crypto.randomBytes(20).toString('hex');
        
        // Создание пользователя через модель
        const user = new UserModel({
            username,
            email,
            walletAddress: tempWalletAddress,
            role: 'user',
            points: 0,
            passwordHash: hash,
            passwordSalt: salt
        });

        console.log('Сохранение пользователя...');
        await user.save();
        console.log('Пользователь успешно сохранен');
        
        return user;
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        throw error;
    }
  }

  async login(email: string, password: string): Promise<User> {
    // Поиск пользователя
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Проверка что passwordSalt существует
    if (!user.passwordSalt) {
      throw new Error('Ошибка аутентификации');
    }

    // Проверка пароля
    const hash = crypto
      .pbkdf2Sync(password, user.passwordSalt, 1000, 64, 'sha512')
      .toString('hex');

    if (hash !== user.passwordHash) {
      throw new Error('Неверный пароль');
    }

    return user;
  }

  private validateInput(username: string, email: string, password: string): boolean {
    // Базовая валидация
    return username.length >= 3 && 
           email.includes('@') && 
           password.length >= 8;
  }
} 