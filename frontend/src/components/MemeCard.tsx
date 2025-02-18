import React from 'react';
import { Card } from './ui/Card';

interface MemeCardProps {
  imageUrl: string;
  title: string;
  author: string;
  likes: number;
}

export const MemeCard: React.FC<MemeCardProps> = ({
  imageUrl,
  title,
  author,
  likes,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="flex justify-between items-center text-sm text-text/70">
          <span>by {author}</span>
          <span>{likes} likes</span>
        </div>
      </div>
    </Card>
  );
}; 