import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface User extends Document {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  role: 'user' | 'admin';
  points: number;
  createdContent?: string[];
  ownedNFTs?: string[];
  passwordHash: string;
  passwordSalt: string;
  vkId?: string;
  authProvider: 'local' | 'vk';
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  comparePassword(password: string): Promise<boolean>;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  twoFactorToken: string | null;
  twoFactorTokenExpires: Date | null;
}

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  walletAddress: { 
    type: String, 
    default: ''
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  createdContent: [{ type: Schema.Types.ObjectId, ref: 'Content' }],
  ownedNFTs: [{ type: String }],
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  vkId: { type: String, sparse: true },
  authProvider: { 
    type: String, 
    enum: ['local', 'vk'], 
    default: 'local' 
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: String,
  twoFactorToken: { 
    type: String,
    default: null
  },
  twoFactorTokenExpires: { 
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const UserModel = mongoose.model<User>('User', userSchema);