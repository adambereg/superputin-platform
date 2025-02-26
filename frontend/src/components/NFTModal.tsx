import React from 'react';
import { X, Heart, Eye, Clock } from 'lucide-react';

interface NFTModalProps {
  nft: {
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

export function NFTModal({ nft, onClose }: NFTModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Детали NFT</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <img
            src={nft.fileUrl}
            alt={nft.title}
            className="w-full rounded-lg mb-6"
          />

          <h3 className="text-2xl font-bold mb-4">{nft.title}</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${nft.authorId.username}`}
                alt={nft.authorId.username}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600">{nft.authorId.username}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Eye size={16} />
              <span>1K</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Heart size={16} />
              <span>{nft.likesCount || 0}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Текущая цена</p>
              <p className="font-medium">10 TON</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Последняя ставка</p>
              <p className="font-medium">8 TON</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Аукцион заканчивается через:</p>
              <p className="font-medium">24h</p>
            </div>
          </div>

          <button className="w-full bg-primary text-white py-3 rounded-lg mt-6 font-medium hover:bg-primary/90 transition-colors">
            Сделать ставку
          </button>
        </div>
      </div>
    </div>
  );
} 