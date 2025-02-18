import mongoose, { Schema, Document } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  walletAddress: string;
  role: 'user' | 'admin';
  points: number;
  createdContent?: string[];
  ownedNFTs?: string[];
  passwordHash?: string;
  passwordSalt?: string;
  avatarUrl?: string;
}

// Удаляем id из IUser и создаем правильный интерфейс документа
export interface IUserDocument extends Document, IUser {
  id: string; // id теперь определен здесь
}

// Создаем схему
const UserSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  walletAddress: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  points: { 
    type: Number, 
    default: 0 
  },
  createdContent: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Content' 
  }],
  ownedNFTs: [{ 
    type: String 
  }],
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Создаем и экспортируем модель
export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

export class User implements IUser {
  id?: string;
  username: string;
  email: string;
  walletAddress: string;
  role: 'user' | 'admin';
  points: number;
  createdContent?: string[];
  ownedNFTs?: string[];
  passwordHash?: string;
  passwordSalt?: string;
  avatarUrl?: string;

  constructor(data: IUser) {
    this.username = data.username;
    this.email = data.email;
    this.walletAddress = data.walletAddress;
    this.role = data.role;
    this.points = data.points;
    this.createdContent = data.createdContent;
    this.ownedNFTs = data.ownedNFTs;
    this.passwordHash = data.passwordHash;
    this.passwordSalt = data.passwordSalt;
    this.avatarUrl = data.avatarUrl;
  }

  async save(): Promise<void> {
    const userData = {
      username: this.username,
      email: this.email,
      walletAddress: this.walletAddress,
      role: this.role,
      points: this.points,
      createdContent: this.createdContent,
      ownedNFTs: this.ownedNFTs,
      passwordHash: this.passwordHash,
      passwordSalt: this.passwordSalt,
      avatarUrl: this.avatarUrl
    };

    if (this.id) {
      await UserModel.findByIdAndUpdate(this.id, userData);
    } else {
      const newUser = new UserModel(userData);
      const savedUser = await newUser.save();
      this.id = savedUser.id;
    }
  }
} 