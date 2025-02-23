import nodemailer from 'nodemailer';
import { config } from '../config/config';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Создаем тестовый SMTP-транспорт
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // Порт для Mailhog
      secure: false,
      ignoreTLS: true // Игнорируем TLS для локальной разработки
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${config.app.apiUrl}/auth/verify-email/${token}`;

      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Verify your email address',
        html: `
          <h1>Email Verification</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `
      });

      console.log('Verification email sent to:', email);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // В режиме разработки просто логируем ошибку
      if (process.env.NODE_ENV === 'development') {
        console.log('Verification URL:', `${config.app.apiUrl}/auth/verify-email/${token}`);
      }
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.app.url}/reset-password?token=${token}`;
    
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Reset your password',
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        `
      });

      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      if (process.env.NODE_ENV === 'development') {
        console.log('Reset URL:', resetUrl);
      }
    }
  }

  async send2FACode(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Your Two-Factor Authentication Code',
        html: `
          <h1>Two-Factor Authentication Code</h1>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      });

      console.log('2FA code sent to:', email);
    } catch (error) {
      console.error('Failed to send 2FA code:', error);
      if (process.env.NODE_ENV === 'development') {
        console.log('2FA code:', code);
      }
    }
  }
} 