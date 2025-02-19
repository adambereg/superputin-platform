import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'like' | 'comment' | 'mention';

export interface Notification extends Document {
  userId: string;
  type: NotificationType;
  contentId?: string;
  fromUserId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'mention'], required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content' },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const NotificationModel = mongoose.model<Notification>('Notification', notificationSchema); 