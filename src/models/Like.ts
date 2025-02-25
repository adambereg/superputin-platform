import mongoose, { Document, Schema } from 'mongoose';

export interface Like extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  contentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Content', 
    required: true 
  }
}, { 
  timestamps: true 
});

// Создаем индекс для быстрого поиска
likeSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const LikeModel = mongoose.model<Like>('Like', likeSchema); 