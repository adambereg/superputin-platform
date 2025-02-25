import { DatabaseService } from '../database/DatabaseService';
import { UserModel } from '../models/User';

async function updateUserRole() {
  try {
    await DatabaseService.getInstance().connect();
    
    // Обновляем роль для админа
    const result = await UserModel.updateOne(
      { email: 'admin@example.com' },
      { 
        $set: { 
          role: 'admin',
          permissions: ['moderate_content', 'manage_users', 'manage_categories']
        }
      }
    );

    console.log('Update result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUserRole(); 