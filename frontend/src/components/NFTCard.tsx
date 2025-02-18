import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface NFTCardProps {
  imageUrl: string;
  title: string;
  price: string;
  owner: string;
  onBuy?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  imageUrl,
  title,
  price,
  owner,
  onBuy,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-text/70">Owner: {owner}</span>
          <span className="font-medium text-primary">{price} TON</span>
        </div>
        {onBuy && (
          <Button
            variant="primary"
            className="w-full"
            onClick={onBuy}
          >
            Buy Now
          </Button>
        )}
      </div>
    </Card>
  );
}; 