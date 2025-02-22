import nodemailer from 'nodemailer';
import { config } from '../config/config';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    const account = await nodemailer.createTestAccount();
    console.log('Ethereal Email account created:', {
      user: account.user,
      pass: account.pass
    });
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const verificationUrl = `${config.app.apiUrl}/auth/verify-email/${token}`;

    const info = await this.transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    });

    console.log('Verification email sent:', {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await this.initPromise;
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const resetUrl = `${config.app.url}/reset-password?token=${token}`;
    const info = await this.transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    console.log('Password reset email sent:', {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  }

  async send2FACode(email: string, code: string): Promise<void> {
    await this.initPromise;
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const info = await this.transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Your Two-Factor Authentication Code',
      html: `
        <h1>Two-Factor Authentication Code</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `
    });

    console.log('2FA code email sent:', {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  }
} 