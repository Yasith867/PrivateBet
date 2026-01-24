import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MarketCard } from '@/components/market-card';
import { MarketFilters } from '@/components/market-filters';
import { StatsCard } from '@/components/stats-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import type { Market } from '@shared/schema';
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Activity,
  Sparkles,
  Lock,
  Eye,
  ArrowRight
} from 'lucide-react';

// Demo markets data
const demoMarkets: Market[] = [
  {
    id: '1',
    title: 'Will Bitcoin exceed $150,000 by December 2026?',
    description: 'This market resolves YES if Bitcoin reaches $150,000 or higher on any major exchange.',
    category: 'crypto',
    outcomes: [
      { id: '1a', label: 'Yes', probability: 65 },
      { id: '1b', label: 'No', probability: 35 },
    ],
    status: 'active',
    resolutionDate: '2026-12-31',
    createdAt: '2026-01-15',
    creatorAddress: 'aleo1demo123...',
    totalVolume: 125000,
    participantCount: 847,
  },
  {
    id: '2',
    title: 'Will Ethereum 3.0 launch in Q1 2027?',
    description: 'Market resolves based on official Ethereum Foundation announcement.',
    category: 'crypto',
    outcomes: [
      { id: '2a', label: 'Yes', probability: 42 },
      { id: '2b', label: 'No', probability: 58 },
    ],
    status: 'active',
    resolutionDate: '2027-03-31',
    createdAt: '2026-01-20',
    creatorAddress: 'aleo1demo456...',
    totalVolume: 89500,
    participantCount: 623,
  },
  {
    id: '3',
    title: 'Who will win the 2028 US Presidential Election?',
    description: 'Market resolves based on Electoral College results.',
    category: 'politics',
    outcomes: [
      { id: '3a', label: 'Democratic Candidate', probability: 48 },
      { id: '3b', label: 'Republican Candidate', probability: 47 },
      { id: '3c', label: 'Third Party', probability: 5 },
    ],
    status: 'active',
    resolutionDate: '2028-11-05',
    createdAt: '2026-01-10',
    creatorAddress: 'aleo1demo789...',
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
    creatorAddress: 'aleo1demo321...',
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
    creatorAddress: 'aleo1demo654...',
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
    creatorAddress: 'aleo1demo987...',
    totalVolume: 178000,
    participantCount: 934,
  },
];

export default function HomePage() {
  const { filters, wallet, setCreateMarketModalOpen } = useAppStore();

  // Fetch markets
  const { data: markets, isLoading } = useQuery<Market[]>({
    queryKey: ['/api/markets'],
    // Use demo data for now
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return demoMarkets;
    },
  });

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    
    let result = [...markets];
    
    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(m => m.category === filters.category);
    }
    
    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(m => m.status === filters.status);
    }
    
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (filters.sortBy) {
      case 'volume':
        result.sort((a, b) => b.totalVolume - a.totalVolume);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'ending_soon':
        result.sort((a, b) => new Date(a.resolutionDate).getTime() - new Date(b.resolutionDate).getTime());
        break;
    }
    
    return result;
  }, [markets, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!markets) return { totalVolume: 0, totalMarkets: 0, totalParticipants: 0 };
    return {
      totalVolume: markets.reduce((sum, m) => sum + m.totalVolume, 0),
      totalMarkets: markets.length,
      totalParticipants: markets.reduce((sum, m) => sum + m.participantCount, 0),
    };
  }, [markets]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="gap-2 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Aleo Zero-Knowledge Proofs
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Trade Predictions.
              <br />
              <span className="gradient-text">Stay Private.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              The first prediction market where your bets, positions, and strategies are 
              completely hidden using zero-knowledge cryptography.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {!wallet.connected ? (
                <Button size="lg" className="gap-2" data-testid="button-hero-connect">
                  <Shield className="h-5 w-5" />
                  Connect Wallet to Start
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={() => setCreateMarketModalOpen(true)}
                  data-testid="button-hero-create"
                >
                  <Sparkles className="h-5 w-5" />
                  Create Market
                </Button>
              )}
              <Button variant="outline" size="lg" className="gap-2" data-testid="button-hero-learn">
                Learn How It Works
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Privacy Features */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Encrypted Bets</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span>Hidden Positions</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Private Settlement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Volume"
            value={`${(stats.totalVolume / 1000).toFixed(0)}K ALEO`}
            subtitle="All-time trading volume"
            icon={TrendingUp}
          />
          <StatsCard
            title="Active Markets"
            value={stats.totalMarkets}
            subtitle="Open prediction markets"
            icon={Activity}
          />
          <StatsCard
            title="Private Traders"
            value={stats.totalParticipants.toLocaleString()}
            subtitle="Anonymous participants"
            icon={Users}
          />
        </div>
      </section>

      {/* Markets Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Prediction Markets</h2>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            All bets are private
          </Badge>
        </div>

        <MarketFilters />

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No markets found</h3>
              <p className="text-muted-foreground mb-6">
                {filters.searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a prediction market!'
                }
              </p>
              {wallet.connected && (
                <Button onClick={() => setCreateMarketModalOpen(true)} data-testid="button-empty-create">
                  Create Market
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
