import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nftsService } from '../api';
import type { NFT } from '../types/api';

export const useNFTs = () => {
  const queryClient = useQueryClient();

  const nfts = useQuery({
    queryKey: ['nfts'],
    queryFn: () => nftsService.getAll(),
  });

  const createNFT = useMutation({
    mutationFn: (data: FormData) => nftsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
    },
  });

  const buyNFT = useMutation({
    mutationFn: (id: string) => nftsService.buy(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['nfts'] });
      const previousNFTs = queryClient.getQueryData(['nfts']);
      
      const userAddress = 'current_user_address'; // Нужно получить из контекста или кошелька
      
      queryClient.setQueryData(['nfts'], (old: any) => ({
        ...old,
        data: old.data.map((nft: NFT) =>
          nft.id === id ? { ...nft, owner: userAddress } : nft
        ),
      }));
      
      return { previousNFTs };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['nfts'], context?.previousNFTs);
    },
  });

  return {
    nfts,
    createNFT,
    buyNFT,
  };
}; 