import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
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
  ArrowRight,
  Plus
} from 'lucide-react';

export default function HomePage() {
  const { filters, setCreateMarketModalOpen } = useAppStore();
  const { connected } = useWallet();

  const { data: markets, isLoading } = useQuery<Market[]>({
    queryKey: ['/api/markets'],
  });

  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    
    let result = [...markets];
    
    if (filters.category !== 'all') {
      result = result.filter(m => m.category === filters.category);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(m => m.status === filters.status);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      );
    }
    
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

  const stats = useMemo(() => {
    if (!markets || markets.length === 0) {
      return { totalVolume: 0, totalMarkets: 0, totalParticipants: 0 };
    }
    return {
      totalVolume: markets.reduce((sum, m) => sum + m.totalVolume, 0),
      totalMarkets: markets.length,
      totalParticipants: markets.reduce((sum, m) => sum + m.participantCount, 0),
    };
  }, [markets]);

  return (
    <div className="min-h-screen">
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
              {!connected ? (
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

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Volume"
            value={stats.totalVolume > 0 ? `${(stats.totalVolume / 1000000).toFixed(2)}M` : '0'} 
            subtitle="microcredits wagered"
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

      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h2 className="text-2xl font-bold">Prediction Markets</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              All bets are private
            </Badge>
            {connected && (
              <Button 
                size="sm" 
                onClick={() => setCreateMarketModalOpen(true)}
                className="gap-1"
                data-testid="button-create-market"
              >
                <Plus className="h-4 w-4" />
                Create
              </Button>
            )}
          </div>
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
              <h3 className="text-lg font-semibold mb-2">
                {markets && markets.length === 0 ? 'No markets yet' : 'No markets found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filters.searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a prediction market on Aleo!'
                }
              </p>
              {connected && (
                <Button onClick={() => setCreateMarketModalOpen(true)} data-testid="button-empty-create">
                  <Plus className="h-4 w-4 mr-2" />
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
