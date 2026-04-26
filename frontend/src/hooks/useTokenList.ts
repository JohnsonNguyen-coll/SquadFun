import { useQuery } from '@tanstack/react-query';
import { MOCK_TOKENS } from '../mocks/data';
import type { Token } from '../mocks/data';

export const useTokenList = (filter: string = 'all') => {
  return useQuery({
    queryKey: ['tokens', filter],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let list = [...MOCK_TOKENS];
      if (filter === 'new') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (filter === 'graduated') {
        list = list.filter(t => t.graduated);
      }
      
      return list as Token[];
    },
  });
};
