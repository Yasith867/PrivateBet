import type { Market, Bet, InsertMarket, InsertBet, PortfolioStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Markets
  getMarkets(): Promise<Market[]>;
  getMarket(id: string): Promise<Market | undefined>;
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

// Demo markets for initial data
const initialMarkets: Market[] = [
  {
    id: '1',
    title: 'Will Bitcoin exceed $150,000 by December 2026?',
    description: 'This market resolves YES if Bitcoin reaches $150,000 or higher on any major exchange (Coinbase, Binance, Kraken) for at least 24 hours.',
    category: 'crypto',
    outcomes: [
      { id: '1a', label: 'Yes', probability: 65 },
      { id: '1b', label: 'No', probability: 35 },
    ],
    status: 'active',
    resolutionDate: '2026-12-31',
    createdAt: '2026-01-15',
    creatorAddress: 'aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc',
    totalVolume: 125000,
    participantCount: 847,
  },
  {
    id: '2',
    title: 'Will Ethereum 3.0 launch in Q1 2027?',
    description: 'Market resolves based on official Ethereum Foundation announcement of mainnet launch.',
    category: 'crypto',
    outcomes: [
      { id: '2a', label: 'Yes', probability: 42 },
      { id: '2b', label: 'No', probability: 58 },
    ],
    status: 'active',
    resolutionDate: '2027-03-31',
    createdAt: '2026-01-20',
    creatorAddress: 'aleo1demo456xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx',
    totalVolume: 89500,
    participantCount: 623,
  },
  {
    id: '3',
    title: 'Who will win the 2028 US Presidential Election?',
    description: 'Market resolves based on Electoral College results certified by Congress.',
    category: 'politics',
    outcomes: [
      { id: '3a', label: 'Democratic Candidate', probability: 48 },
      { id: '3b', label: 'Republican Candidate', probability: 47 },
      { id: '3c', label: 'Third Party', probability: 5 },
    ],
    status: 'active',
    resolutionDate: '2028-11-05',
    createdAt: '2026-01-10',
    creatorAddress: 'aleo1demo789xyz123abc456def789ghi012jkl345mno678pqr901stu234vwx',
    totalVolume: 450000,
    participantCount: 2150,
  },
  {
    id: '4',
    title: 'Will Apple release AR glasses in 2026?',
    description: 'Resolves YES if Apple announces consumer AR glasses this year.',
    category: 'technology',
    outcomes: [
      { id: '4a', label: 'Yes', probability: 78 },
      { id: '4b', label: 'No', probability: 22 },
    ],
    status: 'active',
    resolutionDate: '2026-12-31',
    createdAt: '2026-01-18',
    creatorAddress: 'aleo1demo321xyz456abc789def012ghi345jkl678mno901pqr234stu567vwx',
    totalVolume: 67800,
    participantCount: 412,
  },
  {
    id: '5',
    title: 'Super Bowl 2027 Champion',
    description: 'Which team will win Super Bowl LXI?',
    category: 'sports',
    outcomes: [
      { id: '5a', label: 'Kansas City Chiefs', probability: 18 },
      { id: '5b', label: 'San Francisco 49ers', probability: 15 },
      { id: '5c', label: 'Philadelphia Eagles', probability: 12 },
      { id: '5d', label: 'Other Team', probability: 55 },
    ],
    status: 'active',
    resolutionDate: '2027-02-14',
    createdAt: '2026-01-22',
    creatorAddress: 'aleo1demo654xyz789abc012def345ghi678jkl901mno234pqr567stu890vwx',
    totalVolume: 234000,
    participantCount: 1580,
  },
  {
    id: '6',
    title: 'Will the Fed cut rates below 3% by end of 2026?',
    description: 'Based on Federal Reserve official announcements.',
    category: 'finance',
    outcomes: [
      { id: '6a', label: 'Yes', probability: 55 },
      { id: '6b', label: 'No', probability: 45 },
    ],
    status: 'active',
    resolutionDate: '2026-12-31',
    createdAt: '2026-01-12',
    creatorAddress: 'aleo1demo987xyz012abc345def678ghi901jkl234mno567pqr890stu123vwx',
    totalVolume: 178000,
    participantCount: 934,
  },
];

export class MemStorage implements IStorage {
  private markets: Map<string, Market>;
  private bets: Map<string, Bet>;

  constructor() {
    this.markets = new Map();
    this.bets = new Map();
    
    // Initialize with demo markets
    initialMarkets.forEach(market => {
      this.markets.set(market.id, market);
    });
  }

  // Markets
  async getMarkets(): Promise<Market[]> {
    return Array.from(this.markets.values());
  }

  async getMarket(id: string): Promise<Market | undefined> {
    return this.markets.get(id);
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
