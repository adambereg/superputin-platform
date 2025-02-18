import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';

interface ComicCardProps {
  id: string;
  coverUrl: string;
  title: string;
  author: string;
  episode: number;
  totalEpisodes: number;
}

export const ComicCard: React.FC<ComicCardProps> = ({
  id,
  coverUrl,
  title,
  author,
  episode,
  totalEpisodes,
}) => {
  return (
    <Link to={`/comics/${id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-72 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="flex justify-between items-center text-sm text-text/70">
            <span>by {author}</span>
            <span>Episode {episode}/{totalEpisodes}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}; 