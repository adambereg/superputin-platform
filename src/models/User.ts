import mongoose, { Document, Schema } from 'mongoose';

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
}

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  createdContent: [{ type: Schema.Types.ObjectId, ref: 'Content' }],
  ownedNFTs: [{ type: String }],
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true }
}, {
  timestamps: true
});

export const UserModel = mongoose.model<User>('User', userSchema);