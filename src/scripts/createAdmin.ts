import { DatabaseService } from '../database/DatabaseService';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    await DatabaseService.getInstance().connect();

    // Удаляем существующего админа, если есть
    await UserModel.deleteOne({ email: 'admin@example.com' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      passwordHash,
      passwordSalt: salt,
      isEmailVerified: true,
      authProvider: 'local' as const,
      walletAddress: '',
      points: 0,
      twoFactorEnabled: false,
      permissions: [
        'upload_content',
        'moderate_content',
        'manage_users',
        'manage_categories',
        'view_analytics'
      ]
    };

    const admin = await UserModel.create(adminData);
    console.log('Админ успешно создан:', {
      email: admin.email,
      role: admin.role,
      hasPasswordHash: !!admin.passwordHash
    });

    // Проверяем пароль сразу после создания
    const isValidPassword = await bcrypt.compare('admin123', admin.passwordHash);
    console.log('Проверка пароля:', isValidPassword);

    process.exit(0);
  } catch (error) {
    console.error('Ошибка создания админа:', error);
    process.exit(1);
  }
}

createAdminUser();