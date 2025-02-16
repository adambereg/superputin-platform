import { User } from '../models/User';
import { TonWallet } from '../blockchain/TonWallet';
import { UserModel } from '../models/User';
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
        
        // Создание пользователя
        const user = new User({
            username,
            email,
            walletAddress: tempWalletAddress, // Временный адрес
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
    const userDoc = await UserModel.findOne({ email });
    if (!userDoc) {
      throw new Error('Пользователь не найден');
    }

    // Проверка что passwordSalt существует
    if (!userDoc.passwordSalt) {
      throw new Error('Ошибка аутентификации');
    }

    // Проверка пароля
    const hash = crypto
      .pbkdf2Sync(password, userDoc.passwordSalt, 1000, 64, 'sha512')
      .toString('hex');

    if (hash !== userDoc.passwordHash) {
      throw new Error('Неверный пароль');
    }

    // Создаем объект пользователя без id в конструкторе
    const user = new User({
      username: userDoc.username,
      email: userDoc.email,
      walletAddress: userDoc.walletAddress,
      role: userDoc.role,
      points: userDoc.points,
      createdContent: userDoc.createdContent,
      ownedNFTs: userDoc.ownedNFTs,
      passwordHash: userDoc.passwordHash,
      passwordSalt: userDoc.passwordSalt
    });
    
    // Устанавливаем id после создания
    user.id = userDoc.id;

    return user;
  }

  private validateInput(username: string, email: string, password: string): boolean {
    // Базовая валидация
    return username.length >= 3 && 
           email.includes('@') && 
           password.length >= 8;
  }
} 