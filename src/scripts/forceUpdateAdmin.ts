import { DatabaseService } from '../database/DatabaseService';
import { UserModel } from '../models/User';

async function forceUpdateAdmin() {
  try {
    await DatabaseService.getInstance().connect();
    
    const result = await UserModel.collection.updateOne(
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
      }
    );

    console.log('Force update result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

forceUpdateAdmin(); 