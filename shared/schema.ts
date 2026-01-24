import { z } from "zod";

// Market Status enum
export const MarketStatus = {
  PENDING: "pending",
  ACTIVE: "active", 
  RESOLVED: "resolved",
  CANCELLED: "cancelled",
} as const;

export type MarketStatusType = typeof MarketStatus[keyof typeof MarketStatus];

// Market Category enum
export const MarketCategory = {
  CRYPTO: "crypto",
  POLITICS: "politics",
  SPORTS: "sports",
  TECHNOLOGY: "technology",
  FINANCE: "finance",
  OTHER: "other",
} as const;

export type MarketCategoryType = typeof MarketCategory[keyof typeof MarketCategory];

// Outcome option for a market
export const outcomeSchema = z.object({
  id: z.string(),
  label: z.string(),
  probability: z.number().min(0).max(100).optional(),
});

export type Outcome = z.infer<typeof outcomeSchema>;

// Market schema
export const marketSchema = z.object({
  id: z.string(),
  title: z.string().min(5).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["crypto", "politics", "sports", "technology", "finance", "other"]),
  outcomes: z.array(outcomeSchema).min(2).max(10),
  status: z.enum(["pending", "active", "resolved", "cancelled"]),
  resolutionDate: z.string(), // ISO date string
  createdAt: z.string(),
  creatorAddress: z.string(),
  totalVolume: z.number().default(0),
  participantCount: z.number().default(0),
  winningOutcomeId: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type Market = z.infer<typeof marketSchema>;

export const insertMarketSchema = marketSchema.omit({
  id: true,
  createdAt: true,
  totalVolume: true,
  participantCount: true,
  winningOutcomeId: true,
  status: true,
});

export type InsertMarket = z.infer<typeof insertMarketSchema>;

// Bet schema (private on-chain, stored encrypted)
export const betSchema = z.object({
  id: z.string(),
  marketId: z.string(),
  outcomeId: z.string(),
  amount: z.number().positive(),
  ownerAddress: z.string(),
  createdAt: z.string(),
  isSettled: z.boolean().default(false),
  winnings: z.number().optional(),
  // On-chain record references (encrypted)
  recordNonce: z.string().optional(),
  transactionId: z.string().optional(),
});

export type Bet = z.infer<typeof betSchema>;

export const insertBetSchema = betSchema.omit({
  id: true,
  createdAt: true,
  isSettled: true,
  winnings: true,
  recordNonce: true,
  transactionId: true,
});

export type InsertBet = z.infer<typeof insertBetSchema>;

// User portfolio stats
export const portfolioStatsSchema = z.object({
  totalBets: z.number(),
  activeBets: z.number(),
  totalWagered: z.number(),
  totalWinnings: z.number(),
  winRate: z.number(),
});

export type PortfolioStats = z.infer<typeof portfolioStatsSchema>;

// Wallet connection state
export const walletStateSchema = z.object({
  connected: z.boolean(),
  address: z.string().optional(),
  balance: z.number().optional(),
  network: z.enum(["mainnet", "testnet"]).optional(),
});

export type WalletState = z.infer<typeof walletStateSchema>;

// Market filters
export const marketFiltersSchema = z.object({
  category: z.enum(["all", "crypto", "politics", "sports", "technology", "finance", "other"]).default("all"),
  status: z.enum(["all", "active", "resolved", "pending"]).default("all"),
  sortBy: z.enum(["volume", "newest", "ending_soon"]).default("volume"),
  searchQuery: z.string().optional(),
});

export type MarketFilters = z.infer<typeof marketFiltersSchema>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Legacy user schema for compatibility
export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
