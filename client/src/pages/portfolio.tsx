import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/stats-card';
import { useAppStore } from '@/lib/store';
import type { Bet, Market, PortfolioStats } from '@shared/schema';
import {
  Shield,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  ArrowRight,
  Trophy,
  Activity,
} from 'lucide-react';
import { useState } from 'react';

// Demo bets data
const demoBets: (Bet & { market: Market })[] = [
  {
    id: 'bet1',
    marketId: '1',
    outcomeId: '1a',
    amount: 250,
    ownerAddress: 'aleo1demo...',
    createdAt: '2026-01-20',
    isSettled: false,
    market: {
      id: '1',
      title: 'Will Bitcoin exceed $150,000 by December 2026?',
      category: 'crypto',
      outcomes: [
        { id: '1a', label: 'Yes', probability: 65 },
        { id: '1b', label: 'No', probability: 35 },
      ],
      status: 'active',
      resolutionDate: '2026-12-31',
      createdAt: '2026-01-15',
      creatorAddress: 'aleo1demo...',
      totalVolume: 125000,
      participantCount: 847,
    },
  },
  {
    id: 'bet2',
    marketId: '3',
    outcomeId: '3a',
    amount: 500,
    ownerAddress: 'aleo1demo...',
    createdAt: '2026-01-18',
    isSettled: false,
    market: {
      id: '3',
      title: 'Who will win the 2028 US Presidential Election?',
      category: 'politics',
      outcomes: [
        { id: '3a', label: 'Democratic Candidate', probability: 48 },
        { id: '3b', label: 'Republican Candidate', probability: 47 },
        { id: '3c', label: 'Third Party', probability: 5 },
      ],
      status: 'active',
      resolutionDate: '2028-11-05',
      createdAt: '2026-01-10',
      creatorAddress: 'aleo1demo...',
      totalVolume: 450000,
      participantCount: 2150,
    },
  },
  {
    id: 'bet3',
    marketId: '4',
    outcomeId: '4a',
    amount: 100,
    ownerAddress: 'aleo1demo...',
    createdAt: '2026-01-22',
    isSettled: true,
    winnings: 128,
    market: {
      id: '4',
      title: 'Will Apple release AR glasses in 2026?',
      category: 'technology',
      outcomes: [
        { id: '4a', label: 'Yes', probability: 78 },
        { id: '4b', label: 'No', probability: 22 },
      ],
      status: 'resolved',
      resolutionDate: '2026-01-21',
      createdAt: '2026-01-18',
      creatorAddress: 'aleo1demo...',
      totalVolume: 67800,
      participantCount: 412,
      winningOutcomeId: '4a',
    },
  },
];

const demoStats: PortfolioStats = {
  totalBets: 5,
  activeBets: 2,
  totalWagered: 850,
  totalWinnings: 128,
  winRate: 60,
};

export default function PortfolioPage() {
  const { wallet } = useAppStore();
  const [showAmounts, setShowAmounts] = useState(false);

  // Fetch user bets
  const { data: bets, isLoading: betsLoading } = useQuery<(Bet & { market: Market })[]>({
    queryKey: ['/api/bets', wallet.address],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return wallet.connected ? demoBets : [];
    },
    enabled: wallet.connected,
  });

  // Fetch portfolio stats
  const { data: stats, isLoading: statsLoading } = useQuery<PortfolioStats>({
    queryKey: ['/api/portfolio/stats', wallet.address],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return wallet.connected ? demoStats : {
        totalBets: 0,
        activeBets: 0,
        totalWagered: 0,
        totalWinnings: 0,
        winRate: 0,
      };
    },
    enabled: wallet.connected,
  });

  const activeBets = useMemo(() => bets?.filter(b => !b.isSettled) || [], [bets]);
  const settledBets = useMemo(() => bets?.filter(b => b.isSettled) || [], [bets]);

  if (!wallet.connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
            <Wallet className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Connect your Aleo wallet to view your private betting portfolio. 
            All your bets and positions are encrypted and only visible to you.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <Shield className="h-4 w-4 text-primary" />
            <span>End-to-end encrypted with zero-knowledge proofs</span>
          </div>
          <Button size="lg" className="gap-2" data-testid="button-connect-portfolio">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Portfolio</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            All positions are private and encrypted
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAmounts(!showAmounts)}
          className="gap-2"
          data-testid="button-toggle-amounts"
        >
          {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {showAmounts ? 'Hide Amounts' : 'Show Amounts'}
        </Button>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Wagered"
            value={showAmounts ? `${stats.totalWagered.toLocaleString()} ALEO` : '•••••'}
            icon={TrendingUp}
          />
          <StatsCard
            title="Total Winnings"
            value={showAmounts ? `${stats.totalWinnings.toLocaleString()} ALEO` : '•••••'}
            icon={Trophy}
            trend={stats.totalWinnings > 0 ? { value: 28, isPositive: true } : undefined}
          />
          <StatsCard
            title="Active Bets"
            value={stats.activeBets}
            subtitle={`${stats.totalBets} total bets`}
            icon={Activity}
          />
          <StatsCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
        </div>
      )}

      {/* Bets Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="gap-2" data-testid="tab-active-bets">
            <Clock className="h-4 w-4" />
            Active ({activeBets.length})
          </TabsTrigger>
          <TabsTrigger value="settled" className="gap-2" data-testid="tab-settled-bets">
            <Check className="h-4 w-4" />
            Settled ({settledBets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {betsLoading ? (
            [...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : activeBets.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Bets</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any active bets yet. Browse markets to place your first bet!
              </p>
              <Button asChild className="gap-2" data-testid="button-browse-markets">
                <Link href="/">
                  Browse Markets
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ) : (
            activeBets.map((bet) => (
              <BetCard 
                key={bet.id} 
                bet={bet} 
                showAmount={showAmounts} 
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="settled" className="space-y-4">
          {betsLoading ? (
            [...Array(1)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : settledBets.length === 0 ? (
            <Card className="p-8 text-center">
              <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Settled Bets</h3>
              <p className="text-muted-foreground">
                Your settled bets will appear here after markets resolve.
              </p>
            </Card>
          ) : (
            settledBets.map((bet) => (
              <BetCard 
                key={bet.id} 
                bet={bet} 
                showAmount={showAmounts}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BetCard({ bet, showAmount }: { bet: Bet & { market: Market }; showAmount: boolean }) {
  const outcome = bet.market.outcomes.find(o => o.id === bet.outcomeId);
  const isWinner = bet.market.winningOutcomeId === bet.outcomeId;
  const probability = outcome?.probability || 50;
  
  const resolutionDate = new Date(bet.market.resolutionDate);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((resolutionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="p-5" data-testid={`card-bet-${bet.id}`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Market Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="shrink-0">
              {bet.market.category}
            </Badge>
            {bet.isSettled && (
              <Badge 
                variant={isWinner ? 'default' : 'secondary'}
                className={isWinner ? 'bg-accent text-accent-foreground' : ''}
              >
                {isWinner ? 'Won' : 'Lost'}
              </Badge>
            )}
          </div>
          <Link 
            href={`/market/${bet.market.id}`}
            className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
          >
            {bet.market.title}
          </Link>
        </div>

        {/* Position */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Your Prediction</p>
            <p className="font-medium">{outcome?.label}</p>
            <Progress value={probability} className="h-1 w-24 mt-1" />
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Amount</p>
            <p className="font-bold text-lg flex items-center gap-1">
              {showAmount ? `${bet.amount} ALEO` : '•••••'}
              <Lock className="h-3 w-3 text-muted-foreground" />
            </p>
          </div>

          {bet.isSettled && bet.winnings !== undefined && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Winnings</p>
              <p className={`font-bold text-lg ${isWinner ? 'text-accent' : 'text-muted-foreground'}`}>
                {showAmount ? (isWinner ? `+${bet.winnings} ALEO` : '0 ALEO') : '•••••'}
              </p>
            </div>
          )}

          {!bet.isSettled && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Resolves</p>
              <p className={`font-medium ${daysLeft <= 3 ? 'text-destructive' : ''}`}>
                {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
              </p>
            </div>
          )}

          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href={`/market/${bet.market.id}`}>
              View
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
