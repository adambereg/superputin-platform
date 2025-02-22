import { User, UserModel } from '../models/User';
import * as crypto from 'crypto';
import { EmailService } from '../services/EmailService';
import { config } from '../config/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken';
import { VKAuthProvider } from './providers/VKAuthProvider';

interface LoginResponse {
  user: User;
  token?: string;
  requiresTwoFactor?: boolean;
}

interface RegisterResponse {
  user: User;
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

  async register(data: { username: string; email: string; password: string }): Promise<RegisterResponse> {
    // Проверяем существование пользователя
    const existingUser = await UserModel.findOne({
      $or: [{ email: data.email }, { username: data.username }]
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Генерируем соль и хэш пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Генерируем токен для верификации email
    const verificationToken = this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    // Генерируем временный адрес кошелька
    const tempWalletAddress = `0x${crypto.randomBytes(20).toString('hex')}`;

    // Создаем нового пользователя
    const user = await UserModel.create({
      ...data,
      passwordHash,
      passwordSalt: salt,
      walletAddress: tempWalletAddress, // Используем временный адрес
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Отправляем письмо с верификацией
    await this.emailService.sendVerificationEmail(data.email, verificationToken);

    return {
      user,
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
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
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Проверяем верификацию email
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Если включена 2FA
    if (user.twoFactorEnabled) {
      await this.send2FACode(email);
      return { user, requiresTwoFactor: true };
    }

    const token = this.generateJWT(user);
    return { user, token };
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

    // Проверяем наличие токена и срока его действия
    if (!user.twoFactorToken || !user.twoFactorTokenExpires) {
      console.log('No token or expiration date');
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