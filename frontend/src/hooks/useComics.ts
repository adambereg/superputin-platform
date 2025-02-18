import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comicsService } from '../api';
import type { Comic } from '../types/api';

export const useComics = () => {
  const queryClient = useQueryClient();

  const comics = useQuery({
    queryKey: ['comics'],
    queryFn: () => comicsService.getAll(),
  });

  const createComic = useMutation({
    mutationFn: (data: FormData) => comicsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
    },
  });

  const updateComic = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => 
      comicsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
    },
  });

  const deleteComic = useMutation({
    mutationFn: (id: string) => comicsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
    },
  });

  return {
    comics,
    createComic,
    updateComic,
    deleteComic,
  };
};

export const useComic = (id: string) => {
  return useQuery({
    queryKey: ['comics', id],
    queryFn: () => comicsService.getById(id),
  });
}; 