import { DatabaseService } from '../database/DatabaseService';
import { UserModel } from '../models/User';

async function updateAdmin() {
  try {
    await DatabaseService.getInstance().connect();
    console.log('Connected to database');

    // Находим админа
    const admin = await UserModel.findOne({ email: 'admin@example.com' });
    if (!admin) {
      console.error('Admin not found');
      process.exit(1);
    }

    console.log('Found admin before update:', admin.toObject());

    // Обновляем через findOneAndUpdate для обхода middleware
    const updatedAdmin = await UserModel.findOneAndUpdate(
      { email: 'admin@example.com' },
      {
        $set: {
          role: 'admin',
          permissions: [
            'upload_content',
            'moderate_content',
            'manage_users',
            'manage_categories',
            'view_analytics'
          ]
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      console.error('Failed to update admin');
      process.exit(1);
    }

    console.log('Admin after update:', updatedAdmin.toObject());

    // Дополнительная проверка
    const verifiedAdmin = await UserModel.findOne({ email: 'admin@example.com' });
    console.log('Verified admin:', verifiedAdmin?.toObject());

    if (verifiedAdmin?.role !== 'admin') {
      console.error('Failed to update admin role!');
      process.exit(1);
    }

    console.log('Admin successfully updated');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
}

updateAdmin(); 