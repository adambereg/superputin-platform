import mongoose, { Document, Schema } from 'mongoose';

export type ContentType = 'meme' | 'comic' | 'nft';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

// Определяем допустимые теги для каждого типа контента
export const CONTENT_TAGS = {
  comic: ['Action', 'Sci-Fi', 'Fantasy'],
  meme: ['Trending', 'Latest', 'Most Liked', 'Crypto', 'NFT', 'Web3'],
  nft: ['Art', 'Collectibles', 'Photography', 'Gaming', 'Music', 'Virtual Worlds']
} as const;

export interface Content extends Document {
  authorId: string;
  type: ContentType;
  title: string;
  fileUrl: string;
  metadata: any;
  likes: string[]; // Массив ID пользователей
  likesCount: number; // Количество лайков
  createdAt: Date;
  updatedAt: Date;
  // Добавляем поля для модерации
  moderationStatus: ModerationStatus;
  moderationComment?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  tags: string[]; // Добавляем поле для тегов
  pages: string[]; // Массив URL страниц для комиксов
}

const contentSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['meme', 'comic', 'nft'], required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  // Добавляем поля для модерации
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationComment: { type: String },
  moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date },
  tags: [{ 
    type: String,
    validate: [{
      validator: function(this: mongoose.Document & { type: ContentType }, tag: string) {
        const contentType = this.type;
        return Array.isArray(CONTENT_TAGS[contentType]) && 
               CONTENT_TAGS[contentType].indexOf(tag) !== -1;
      },
      message: 'Invalid tag for content type'
    }]
  }],
  pages: [String] // Массив URL страниц для комиксов
}, {
  timestamps: true
});

// Добавляем индекс для быстрого поиска по тегам
contentSchema.index({ tags: 1 });

export const ContentModel = mongoose.model<Content>('Content', contentSchema);