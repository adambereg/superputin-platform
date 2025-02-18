import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useComic } from '../hooks';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { Error } from '../components/ui/Error';

export const ComicDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useComic(id!);

  if (isLoading) {
    return <Loading message="Loading comic..." />;
  }

  if (isError || !data) {
    return (
      <Error
        title="Failed to load comic"
        message="Unable to load comic details. Please try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const comic = data.data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{comic.title}</h1>
        <div className="flex items-center gap-4 text-text/70">
          <span>by {comic.author}</span>
          <span>Episode {comic.episode}/{comic.totalEpisodes}</span>
        </div>
      </div>

      <div className="aspect-video bg-gray-200 rounded-lg mb-8">
        <img
          src={comic.coverUrl}
          alt={comic.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" disabled={comic.episode === 1}>
          Previous Episode
        </Button>
        <Button disabled={comic.episode === comic.totalEpisodes}>
          Next Episode
        </Button>
      </div>
    </div>
  );
};