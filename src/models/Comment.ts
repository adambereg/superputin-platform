import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  content: string;
  author: string; // ID пользователя
  contentId: string; // ID мема/комикса
  likes?: string[]; // ID пользователей
  likesCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CommentSchema = new Schema({
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  contentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Content',
    required: true 
  },
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  likesCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

export const CommentModel = mongoose.model<IComment & Document>('Comment', CommentSchema);

export class Comment implements IComment {
  id?: string;
  content: string;
  author: string;
  contentId: string;
  likes: string[] = [];
  likesCount: number = 0;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IComment) {
    this.content = data.content;
    this.author = data.author;
    this.contentId = data.contentId;
    this.likes = data.likes || [];
    this.likesCount = data.likesCount || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  async save(): Promise<void> {
    const commentData = {
      content: this.content,
      author: this.author,
      contentId: this.contentId,
      likes: this.likes,
      likesCount: this.likesCount
    };

    const comment = new CommentModel(commentData);
    const savedComment = await comment.save();
    this.id = savedComment.id;
  }
} 