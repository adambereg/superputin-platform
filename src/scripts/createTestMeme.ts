import { DatabaseService } from '../database/DatabaseService';
import { ContentModel } from '../models/Content';
import { UserModel } from '../models/User';

async function createTestMeme() {
  try {
    await DatabaseService.getInstance().connect();
    
    const admin = await UserModel.findOne({ email: 'admin@example.com' });
    if (!admin) throw new Error('Admin not found');

    const meme = await ContentModel.create({
      type: 'meme',
      title: 'Test Meme',
      fileUrl: 'https://picsum.photos/800/600',
      authorId: admin._id,
      likes: 0,
      views: 0,
      moderationStatus: 'approved'
    });

    console.log('Created test meme:', meme);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestMeme(); 