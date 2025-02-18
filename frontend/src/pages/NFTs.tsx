import React from 'react';
import { useNFTs } from '../hooks';
import { NFTCard } from '../components/NFTCard';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { Error } from '../components/ui/Error';

export const NFTs = () => {
  const { nfts, buyNFT } = useNFTs();

  if (nfts.isLoading) {
    return <Loading message="Loading NFTs..." />;
  }

  if (nfts.isError) {
    return (
      <Error
        title="Failed to load NFTs"
        message="Unable to load NFTs. Please try again."
        onRetry={() => nfts.refetch()}
      />
    );
  }

  const handleBuy = async (id: string) => {
    try {
      await buyNFT.mutateAsync(id);
      // Показать уведомление об успешной покупке
    } catch (error) {
      // Показать уведомление об ошибке
      console.error('Failed to buy NFT:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">NFT Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.data?.data.map((nft) => (
          <NFTCard
            key={nft.id}
            imageUrl={nft.imageUrl}
            title={nft.title}
            price={nft.price}
            owner={nft.owner}
            onBuy={() => handleBuy(nft.id)}
          />
        ))}
      </div>
    </div>
  );
};