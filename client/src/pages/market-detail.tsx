import { useMemo } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import type { Market } from '@shared/schema';
import {
  ArrowLeft,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Lock,
  ExternalLink,
  Share2,
  Calendar,
  Bitcoin,
  Vote,
  Trophy,
  Cpu,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo markets (same as home page)
const demoMarkets: Market[] = [
  {
    id: '1',
    title: 'Will Bitcoin exceed $150,000 by December 2026?',
    description: 'This market resolves YES if Bitcoin reaches $150,000 or higher on any major exchange (Coinbase, Binance, Kraken) for at least 24 hours. The resolution will be based on CoinGecko price data.',
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
    creatorAddress: 'aleo1demo456...',
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

const categoryIcons: Record<string, typeof Bitcoin> = {
  crypto: Bitcoin,
  politics: Vote,
  sports: Trophy,
  technology: Cpu,
  finance: DollarSign,
  other: MoreHorizontal,
};

const categoryColors: Record<string, string> = {
  crypto: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  politics: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  sports: 'bg-green-500/10 text-green-500 border-green-500/20',
  technology: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  finance: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function MarketDetailPage() {
  const [, params] = useRoute('/market/:id');
  const { wallet, setBettingModalOpen, setSelectedMarket, setSelectedOutcomeId } = useAppStore();
  const { toast } = useToast();

  const { data: market, isLoading } = useQuery<Market>({
    queryKey: ['/api/markets', params?.id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const found = demoMarkets.find(m => m.id === params?.id);
      if (!found) throw new Error('Market not found');
      return found;
    },
    enabled: !!params?.id,
  });

  const resolutionDate = market ? new Date(market.resolutionDate) : new Date();
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((resolutionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const CategoryIcon = market ? categoryIcons[market.category] || MoreHorizontal : MoreHorizontal;

  const handlePlaceBet = (outcomeId: string) => {
    if (!wallet.connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to place a bet.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!market) return;
    setSelectedMarket(market);
    setSelectedOutcomeId(outcomeId);
    setBettingModalOpen(true);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Market link copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy link.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Market Not Found</h2>
        <p className="text-muted-foreground mb-6">This market doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">Back to Markets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="link-back"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Markets
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className={`${categoryColors[market.category]} border`}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {market.category}
              </Badge>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                {market.status}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                Private Bets
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4">{market.title}</h1>
            
            {market.description && (
              <p className="text-muted-foreground mb-6">{market.description}</p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{market.totalVolume.toLocaleString()} ALEO</span>
                <span className="text-muted-foreground">volume</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{market.participantCount.toLocaleString()}</span>
                <span className="text-muted-foreground">traders</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${daysLeft <= 3 ? 'text-destructive' : 'text-muted-foreground'}`} />
                <span className={`font-semibold ${daysLeft <= 3 ? 'text-destructive' : ''}`}>
                  {daysLeft === 0 ? 'Ending today' : `${daysLeft} days left`}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://explorer.aleo.org/program/prediction_market.aleo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-explorer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </a>
              </Button>
            </div>
          </Card>

          {/* Outcomes Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Outcomes
            </h2>

            <div className="space-y-4">
              {market.outcomes.map((outcome, index) => {
                const probability = outcome.probability || 50;
                const isFirst = index === 0;
                return (
                  <div 
                    key={outcome.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-lg">{outcome.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold ${isFirst ? 'text-accent' : ''}`}>
                          {probability}%
                        </span>
                        <Button
                          onClick={() => handlePlaceBet(outcome.id)}
                          disabled={market.status !== 'active'}
                          data-testid={`button-bet-${outcome.id}`}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Bet
                        </Button>
                      </div>
                    </div>
                    <Progress 
                      value={probability} 
                      className={`h-2 ${isFirst ? '[&>div]:bg-accent' : '[&>div]:bg-muted-foreground/30'}`}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Privacy Info Card */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Privacy Protected</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Your bet amount is encrypted</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Your position is hidden from others</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Settlement is private via ZK proofs</span>
              </li>
            </ul>
          </Card>

          {/* Market Info Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Details</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground mb-1">Resolution Date</dt>
                <dd className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {resolutionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-muted-foreground mb-1">Created</dt>
                <dd className="font-medium">
                  {new Date(market.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-muted-foreground mb-1">Creator</dt>
                <dd className="font-mono text-xs break-all">
                  {market.creatorAddress}
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-muted-foreground mb-1">Network</dt>
                <dd className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Aleo Testnet Beta
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>

          {/* How It Works Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">How It Works</h3>
            <ol className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                <span>Choose an outcome and enter your bet amount</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                <span>Sign the transaction with your Aleo wallet</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                <span>Your bet is encrypted and stored on-chain</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
                <span>Claim winnings privately after resolution</span>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
