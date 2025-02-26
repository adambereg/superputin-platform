import React from 'react';
import { X, Heart, Eye, MessageCircle, Share2, Clock } from 'lucide-react';

interface MemeModalProps {
  meme: {
    _id: string;
    title: string;
    fileUrl: string;
    authorId: {
      username: string;
    };
    createdAt: string;
    likesCount: number;
  };
  onClose: () => void;
}

export function MemeModal({ meme, onClose }: MemeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{meme.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <img
                src={meme.fileUrl}
                alt={meme.title}
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="lg:w-1/3">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${meme.authorId.username}`}
                  alt={meme.authorId.username}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium">{meme.authorId.username}</p>
                  <p className="text-sm text-gray-500">{new Date(meme.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  <Heart size={20} className="text-gray-600" />
                  <span>{meme.likesCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={20} className="text-gray-600" />
                  <span>0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={20} className="text-gray-600" />
                  <span>0</span>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <Heart size={20} />
                  Нравится
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-text/5 text-text py-3 rounded-lg font-medium hover:bg-text/10 transition-colors">
                  <Share2 size={20} />
                  Поделиться
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 