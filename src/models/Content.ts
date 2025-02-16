import mongoose, { Schema, Document } from 'mongoose';

export enum ContentType {
  MEME = 'meme',
  COMIC = 'comic'
}

export interface IContent {
  title: string;
  description?: string;
  type: ContentType;
  imageUrl: string;
  creator: string; // ID пользователя
  likes?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ContentSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  type: { 
    type: String, 
    enum: Object.values(ContentType),
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  creator: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  tags: [{ 
    type: String 
  }]
}, {
  timestamps: true
});

export const ContentModel = mongoose.model<IContent & Document>('Content', ContentSchema);

export class Content implements IContent {
  title: string;
  description?: string;
  type: ContentType;
  imageUrl: string;
  creator: string;
  likes?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IContent) {
    this.title = data.title;
    this.description = data.description;
    this.type = data.type;
    this.imageUrl = data.imageUrl;
    this.creator = data.creator;
    this.likes = data.likes || 0;
    this.tags = data.tags || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  async save(): Promise<void> {
    const contentData = {
      title: this.title,
      description: this.description,
      type: this.type,
      imageUrl: this.imageUrl,
      creator: this.creator,
      likes: this.likes,
      tags: this.tags
    };

    const content = new ContentModel(contentData);
    await content.save();
  }
} 