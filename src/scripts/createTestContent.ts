import { DatabaseService } from '../database/DatabaseService';
import { ContentModel } from '../models/Content';
import { UserModel } from '../models/User';

async function createTestContent() {
  try {
    await DatabaseService.getInstance().connect();
    
    const admin = await UserModel.findOne({ email: 'admin@example.com' });
    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Создаем тестовый контент
    const testContent = await ContentModel.create({
      title: 'Test Content',
      type: 'meme',
      fileUrl: 'http://localhost:3000/uploads/test.jpg',
      authorId: admin._id,
      moderationStatus: 'pending',
      metadata: {
        originalName: 'test.jpg',
        size: 1024,
        mimetype: 'image/jpeg'
      }
    });

    console.log('Created test content:', testContent);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestContent(); 