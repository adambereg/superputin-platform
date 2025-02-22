import { User, UserModel } from '../models/User';
import * as crypto from 'crypto';
import { EmailService } from '../services/EmailService';
import { config } from '../config/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken';
import { VKAuthProvider } from './providers/VKAuthProvider';

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    points: number;
    walletAddress: string;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
  };
  token?: string;
  requiresTwoFactor?: boolean;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

export class AuthService {
  private static instance: AuthService;
  private emailService: EmailService;
  private vkAuthProvider: VKAuthProvider;
  
  private constructor() {
    this.emailService = new EmailService();
    this.vkAuthProvider = new VKAuthProvider(
      process.env.VK_CLIENT_ID!,
      process.env.VK_CLIENT_SECRET!
    );
  }
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateJWT(user: User): string {
    const secret: Secret = config.app.jwtSecret || 'default-secret-key';
    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
    const options: SignOptions = { 
      expiresIn: parseInt(config.app.jwtExpiresIn) || '7d' // Либо число секунд, либо строка
    };
    
    return jwt.sign(payload, secret, options);
  }

  async register(email: string, password: string, username: string): Promise<RegisterResponse> {
    try {
      // Проверяем уникальность email и username
      const existingUser = await UserModel.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        throw new Error('Email or username already exists');
      }

      // Хешируем пароль
      const passwordSalt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, passwordSalt);
      
      // Генерируем токен подтверждения
      const emailVerificationToken = this.generateToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Временный адрес кошелька для тестирования
      const tempWalletAddress = '0x' + crypto.randomBytes(20).toString('hex');

      // Создаем пользователя
      await UserModel.create({
        email,
        username,
        passwordHash,
        passwordSalt,
        emailVerificationToken,
        emailVerificationExpires,
        walletAddress: tempWalletAddress, // Используем временный адрес
        points: 0,
        role: 'user',
        isEmailVerified: false,
        authProvider: 'local'
      });

      // Отправляем письмо с подтверждением
      await this.emailService.sendVerificationEmail(email, emailVerificationToken);

      return { 
        success: true, 
        message: 'Registration successful. Please check your email to verify your account.' 
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Временно отключаем проверку верификации email
      // if (!user.isEmailVerified) {
      //   throw new Error('Please verify your email before logging in');
      // }

      // Если у пользователя включена 2FA...
      if (user.twoFactorEnabled) {
        await this.send2FACode(email);
        return {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            points: user.points,
            walletAddress: user.walletAddress,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: true
          },
          requiresTwoFactor: true
        };
      }

      const token = this.generateJWT(user);
      return { 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          points: user.points,
          walletAddress: user.walletAddress,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: false
        }, 
        token 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const resetPasswordToken = this.generateToken();
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    await this.emailService.sendPasswordResetEmail(email, resetPasswordToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  }

  async loginWithVK(code: string): Promise<User> {
    try {
      const vkUser = await this.vkAuthProvider.getUserData(code);
      
      let user = await UserModel.findOne({ vkId: vkUser.id });
      
      if (!user) {
        user = await UserModel.create({
          email: vkUser.email,
          username: `${vkUser.first_name} ${vkUser.last_name}`,
          vkId: vkUser.id,
          role: 'user',
          points: 0,
          isEmailVerified: true,
          authProvider: 'vk'
        });
      }

      return user;
    } catch (error) {
      console.error('VK auth error:', error);
      throw new Error('Ошибка аутентификации через VK');
    }
  }

  async enable2FA(userId: string): Promise<{ secret: string }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Генерируем секретный токен
    const twoFactorSecret = this.generateToken();
    
    user.twoFactorEnabled = true;
    user.twoFactorSecret = twoFactorSecret;
    await user.save();

    return { secret: twoFactorSecret };
  }

  async verify2FAToken(userId: string, token: string): Promise<{ success: boolean; token?: string }> {
    console.log('Verifying 2FA token:', { userId, token });
    
    const user = await UserModel.findById(userId);
    console.log('Found user:', user?.email);
    
    if (!user || !user.twoFactorEnabled) {
      console.log('User not found or 2FA not enabled');
      return { success: false };
    }

    const isValid = user.twoFactorToken === token && 
                   user.twoFactorTokenExpires > new Date();
    console.log('Token validation:', { 
      isValid,
      storedToken: user.twoFactorToken,
      expires: user.twoFactorTokenExpires
    });
    
    if (isValid) {
      const jwtToken = this.generateJWT(user);
      console.log('Generated JWT token');
      
      await UserModel.findByIdAndUpdate(userId, {
        $set: {
          twoFactorToken: '',
          twoFactorTokenExpires: new Date(0)
        }
      });
      
      return { 
        success: true, 
        token: jwtToken 
      };
    }

    return { success: false };
  }

  async send2FACode(email: string): Promise<void> {
    const user = await UserModel.findOne({ email });
    if (!user || !user.twoFactorEnabled) {
      throw new Error('User not found or 2FA not enabled');
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    user.twoFactorToken = token;
    user.twoFactorTokenExpires = expires;
    await user.save();

    await this.emailService.send2FACode(email, token);
  }
} 