import { create } from 'zustand';
import type { Market, Bet, MarketFilters, PortfolioStats } from '@shared/schema';

interface AppState {
  // Markets
  markets: Market[];
  setMarkets: (markets: Market[]) => void;
  selectedMarket: Market | null;
  setSelectedMarket: (market: Market | null) => void;
  
  // Bets
  userBets: Bet[];
  setUserBets: (bets: Bet[]) => void;
  
  // Filters
  filters: MarketFilters;
  setFilters: (filters: Partial<MarketFilters>) => void;
  
  // Portfolio stats
  portfolioStats: PortfolioStats;
  setPortfolioStats: (stats: PortfolioStats) => void;
  
  // UI state
  isBettingModalOpen: boolean;
  setBettingModalOpen: (open: boolean) => void;
  isCreateMarketModalOpen: boolean;
  setCreateMarketModalOpen: (open: boolean) => void;
  selectedOutcomeId: string | null;
  setSelectedOutcomeId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Markets
  markets: [],
  setMarkets: (markets) => set({ markets }),
  selectedMarket: null,
  setSelectedMarket: (market) => set({ selectedMarket: market }),
  
  // Bets
  userBets: [],
  setUserBets: (bets) => set({ userBets: bets }),
  
  // Filters
  filters: {
    category: 'all',
    status: 'all',
    sortBy: 'volume',
    searchQuery: '',
  },
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  
  // Portfolio stats
  portfolioStats: {
    totalBets: 0,
    activeBets: 0,
    totalWagered: 0,
    totalWinnings: 0,
    winRate: 0,
  },
  setPortfolioStats: (stats) => set({ portfolioStats: stats }),
  
  // UI state
  isBettingModalOpen: false,
  setBettingModalOpen: (open) => set({ isBettingModalOpen: open }),
  isCreateMarketModalOpen: false,
  setCreateMarketModalOpen: (open) => set({ isCreateMarketModalOpen: open }),
  selectedOutcomeId: null,
  setSelectedOutcomeId: (id) => set({ selectedOutcomeId: id }),
}));
