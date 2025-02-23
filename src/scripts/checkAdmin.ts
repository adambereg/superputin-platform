import { DatabaseService } from '../database/DatabaseService';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  try {
    await DatabaseService.getInstance().connect();
    console.log('Connected to database');

    const admin = await UserModel.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    console.log('Admin details:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      hasPasswordHash: !!admin.passwordHash
    });

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare('admin123', admin.passwordHash);
    console.log('Password check:', isValidPassword);

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin:', error);
    process.exit(1);
  }
}

checkAdmin(); 