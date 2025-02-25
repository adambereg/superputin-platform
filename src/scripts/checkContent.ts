import { DatabaseService } from '../database/DatabaseService';
import { ContentModel } from '../models/Content';
import { UserModel } from '../models/User';

async function checkContent() {
  try {
    await DatabaseService.getInstance().connect();
    console.log('Connected to database');

    const admin = await UserModel.findOne({ email: 'admin@example.com' });
    if (!admin) {
      throw new Error('Admin user not found');
    }
    console.log('Found admin:', admin._id);

    const pendingContent = await ContentModel.find({ moderationStatus: 'pending' })
      .populate('authorId', 'username email')
      .lean();

    console.log('Pending content:', JSON.stringify(pendingContent, null, 2));
    
    if (pendingContent.length === 0) {
      console.log('No pending content found. Creating test content...');
      
      const testContent = await ContentModel.create({
        title: 'Test Meme',
        type: 'meme',
        fileUrl: 'https://picsum.photos/800/600',
        authorId: admin._id,
        moderationStatus: 'pending',
        metadata: {
          description: 'Test content for moderation',
          tags: ['test', 'meme']
        }
      });
      
      console.log('Created test content:', testContent);

      const createdContent = await ContentModel.findById(testContent._id)
        .populate('authorId', 'username email')
        .lean();
      
      console.log('Verified created content:', JSON.stringify(createdContent, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkContent(); 