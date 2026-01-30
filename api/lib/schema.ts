import { z } from "zod";

export const outcomeSchema = z.object({
  id: z.string(),
  label: z.string(),
  probability: z.number().min(0).max(100).optional(),
});

export type Outcome = z.infer<typeof outcomeSchema>;

export const insertMarketSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["crypto", "politics", "sports", "technology", "finance", "other"]),
  outcomes: z.array(outcomeSchema).min(2).max(10),
  resolutionDate: z.string(),
  creatorAddress: z.string(),
  chainMarketId: z.string().optional(),
  transactionId: z.string().optional(),
});

export type InsertMarket = z.infer<typeof insertMarketSchema>;

export const insertBetSchema = z.object({
  marketId: z.string(),
  outcomeId: z.string(),
  amount: z.number().positive(),
  ownerAddress: z.string(),
  transactionId: z.string().optional(),
});

export type InsertBet = z.infer<typeof insertBetSchema>;
