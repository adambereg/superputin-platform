import mongoose from 'mongoose';
import { config } from '../config/config';
import { ContentModel } from '../models/Content';

async function migrateLikes() {
  try {
    // Подключаемся к базе данных
    await mongoose.connect(config.database.url, config.database.options);
    console.log('Connected to MongoDB');

    // Получаем все документы
    const contents = await ContentModel.find({});
    console.log(`Found ${contents.length} documents`);

    // Обновляем каждый документ
    for (const content of contents) {
      await ContentModel.collection.updateOne(
        { _id: content._id },
        { 
          $set: { 
            likes: [], // Устанавливаем пустой массив
            likesCount: 0 // Сбрасываем счетчик
          } 
        }
      );
      console.log(`Updated document ${content._id}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateLikes();
