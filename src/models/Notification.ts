import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'mention' 
  | 'achievement' 
  | 'nft_purchase' 
  | 'reply'
  | 'moderation';

export interface Notification extends Document {
  userId: string;
  type: NotificationType;
  contentId?: string;
  fromUserId: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: any;
  level?: string;
}

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'mention', 'achievement', 'nft_purchase', 'reply', 'moderation'], 
    required: true 
  },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content' },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
  level: { type: String, enum: ['info', 'success', 'warning'], default: 'info' }
}, {
  timestamps: true
});

export const NotificationModel = mongoose.model<Notification>('Notification', notificationSchema); 