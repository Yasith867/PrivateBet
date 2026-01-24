import type { Market, Bet, InsertMarket, InsertBet, PortfolioStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Markets
  getMarkets(): Promise<Market[]>;
  getMarket(id: string): Promise<Market | undefined>;
  getMarketByChainId(chainId: string): Promise<Market | undefined>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarket(id: string, updates: Partial<Market>): Promise<Market | undefined>;
  
  // Bets
  getBetsByOwner(ownerAddress: string): Promise<Bet[]>;
  getBetsByMarket(marketId: string): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBet(id: string, updates: Partial<Bet>): Promise<Bet | undefined>;
  
  // Portfolio
  getPortfolioStats(ownerAddress: string): Promise<PortfolioStats>;
}

export class MemStorage implements IStorage {
  private markets: Map<string, Market>;
  private bets: Map<string, Bet>;

  constructor() {
    this.markets = new Map();
    this.bets = new Map();
  }

  // Markets
  async getMarkets(): Promise<Market[]> {
    return Array.from(this.markets.values());
  }

  async getMarket(id: string): Promise<Market | undefined> {
    return this.markets.get(id);
  }

  async getMarketByChainId(chainId: string): Promise<Market | undefined> {
    return Array.from(this.markets.values()).find(m => m.chainMarketId === chainId);
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const id = randomUUID();
    const market: Market = {
      ...insertMarket,
      id,
      createdAt: new Date().toISOString(),
      status: 'active',
      totalVolume: 0,
      participantCount: 0,
    };
    this.markets.set(id, market);
    return market;
  }

  async updateMarket(id: string, updates: Partial<Market>): Promise<Market | undefined> {
    const market = this.markets.get(id);
    if (!market) return undefined;
    
    const updated = { ...market, ...updates };
    this.markets.set(id, updated);
    return updated;
  }

  // Bets
  async getBetsByOwner(ownerAddress: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.ownerAddress === ownerAddress);
  }

  async getBetsByMarket(marketId: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.marketId === marketId);
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = randomUUID();
    const bet: Bet = {
      ...insertBet,
      id,
      createdAt: new Date().toISOString(),
      isSettled: false,
    };
    this.bets.set(id, bet);
    
    // Update market stats
    const market = this.markets.get(insertBet.marketId);
    if (market) {
      const existingBets = await this.getBetsByMarket(insertBet.marketId);
      const uniqueOwners = new Set(existingBets.map(b => b.ownerAddress));
      uniqueOwners.add(insertBet.ownerAddress);
      
      await this.updateMarket(insertBet.marketId, {
        totalVolume: market.totalVolume + insertBet.amount,
        participantCount: uniqueOwners.size,
      });
    }
    
    return bet;
  }

  async updateBet(id: string, updates: Partial<Bet>): Promise<Bet | undefined> {
    const bet = this.bets.get(id);
    if (!bet) return undefined;
    
    const updated = { ...bet, ...updates };
    this.bets.set(id, updated);
    return updated;
  }

  // Portfolio
  async getPortfolioStats(ownerAddress: string): Promise<PortfolioStats> {
    const userBets = await this.getBetsByOwner(ownerAddress);
    
    const activeBets = userBets.filter(b => !b.isSettled).length;
    const totalWagered = userBets.reduce((sum, b) => sum + b.amount, 0);
    const settledBets = userBets.filter(b => b.isSettled);
    const wins = settledBets.filter(b => (b.winnings || 0) > 0);
    const totalWinnings = settledBets.reduce((sum, b) => sum + (b.winnings || 0), 0);
    const winRate = settledBets.length > 0 ? (wins.length / settledBets.length) * 100 : 0;
    
    return {
      totalBets: userBets.length,
      activeBets,
      totalWagered,
      totalWinnings,
      winRate: Math.round(winRate),
    };
  }
}

export const storage = new MemStorage();
