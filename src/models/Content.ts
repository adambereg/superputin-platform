import mongoose, { Document, Schema } from 'mongoose';

export type ContentType = 'meme' | 'comic' | 'nft';

export interface Content extends Document {
  authorId: string;
  type: ContentType;
  title: string;
  fileUrl: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['meme', 'comic', 'nft'], required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export const ContentModel = mongoose.model<Content>('Content', contentSchema);