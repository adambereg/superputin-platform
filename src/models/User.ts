import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface User extends Document {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  role: 'user' | 'moderator' | 'admin';
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
  moderationStats: {
    approvedContent: number;
    rejectedContent: number;
    lastModeratedAt: Date;
  };
  permissions: string[];
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
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
  role: { 
    type: String, 
    enum: ['user', 'moderator', 'admin'], 
    default: 'user',
    required: true
  },
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
  },
  moderationStats: {
    approvedContent: { type: Number, default: 0 },
    rejectedContent: { type: Number, default: 0 },
    lastModeratedAt: Date
  },
  permissions: [{
    type: String,
    enum: [
      'upload_content',
      'moderate_content', 
      'manage_users',
      'manage_categories',
      'view_analytics'
    ],
    required: true
  }]
}, {
  timestamps: true
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  console.log('Comparing passwords:', {
    provided: password,
    hasHash: !!this.passwordHash
  });
  const result = await bcrypt.compare(password, this.passwordHash);
  console.log('Compare result:', result);
  return result;
};

// Добавляем метод для проверки прав
userSchema.methods.hasPermission = function(permission: string): boolean {
  if (this.role === 'admin') return true;
  return this.permissions.includes(permission);
};

// Добавляем метод для проверки роли
userSchema.methods.hasRole = function(role: string): boolean {
  if (this.role === 'admin') return true;
  return this.role === role;
};

// Добавляем pre-save middleware для проверки роли админа
userSchema.pre('save', function(next) {
  if (this.role === 'admin' && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = [
      'upload_content',
      'moderate_content',
      'manage_users',
      'manage_categories',
      'view_analytics'
    ];
  }
  next();
});

export const UserModel = mongoose.model<User>('User', userSchema);