import React from 'react';
import { useMemes } from '../hooks';
import { MemeCard } from '../components/MemeCard';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { Error } from '../components/ui/Error';

export const Memes = () => {
  const { memes, likeMeme, unlikeMeme } = useMemes();

  if (memes.isLoading) {
    return <Loading message="Loading memes..." />;
  }

  if (memes.isError) {
    return (
      <Error
        title="Failed to load memes"
        message="Unable to load memes. Please try again."
        onRetry={() => memes.refetch()}
      />
    );
  }

  const handleLike = async (id: string, isLiked: boolean) => {
    if (isLiked) {
      await unlikeMeme.mutateAsync(id);
    } else {
      await likeMeme.mutateAsync(id);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Memes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memes.data?.data.map((meme) => (
          <MemeCard
            key={meme.id}
            imageUrl={meme.imageUrl}
            title={meme.title}
            author={meme.author}
            likes={meme.likes}
          />
        ))}
      </div>
    </div>
  );
};