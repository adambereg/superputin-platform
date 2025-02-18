import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memesService } from '../api';
import type { Meme } from '../types/api';

export const useMemes = () => {
  const queryClient = useQueryClient();

  const memes = useQuery({
    queryKey: ['memes'],
    queryFn: () => memesService.getAll(),
  });

  const createMeme = useMutation({
    mutationFn: (data: FormData) => memesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memes'] });
    },
  });

  const likeMeme = useMutation({
    mutationFn: (id: string) => memesService.like(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['memes'] });
      
      const previousMemes = queryClient.getQueryData(['memes']);
      
      queryClient.setQueryData(['memes'], (old: any) => ({
        ...old,
        data: old.data.map((meme: Meme) =>
          meme.id === id ? { ...meme, likes: meme.likes + 1 } : meme
        ),
      }));
      
      return { previousMemes };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['memes'], context?.previousMemes);
    },
  });

  const unlikeMeme = useMutation({
    mutationFn: (id: string) => memesService.unlike(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['memes'] });
      const previousMemes = queryClient.getQueryData(['memes']);
      
      queryClient.setQueryData(['memes'], (old: any) => ({
        ...old,
        data: old.data.map((meme: Meme) =>
          meme.id === id ? { ...meme, likes: meme.likes - 1 } : meme
        ),
      }));
      
      return { previousMemes };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['memes'], context?.previousMemes);
    },
  });

  return {
    memes,
    createMeme,
    likeMeme,
    unlikeMeme,
  };
}; 