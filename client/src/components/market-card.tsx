import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Market } from '@shared/schema';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  Shield, 
  Bitcoin, 
  Vote, 
  Trophy, 
  Cpu, 
  DollarSign,
  MoreHorizontal 
} from 'lucide-react';
import { Link } from 'wouter';

interface MarketCardProps {
  market: Market;
}

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

const statusColors: Record<string, string> = {
  active: 'bg-accent/10 text-accent border-accent/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  resolved: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function MarketCard({ market }: MarketCardProps) {
  const CategoryIcon = categoryIcons[market.category] || MoreHorizontal;
  
  const resolutionDate = new Date(market.resolutionDate);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((resolutionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const topOutcomes = market.outcomes.slice(0, 2);

  return (
    <Link href={`/market/${market.id}`} data-testid={`card-market-${market.id}`}>
      <Card className="group relative overflow-visible hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 p-5">
        {/* Privacy indicator */}
        <div className="absolute -top-2 -right-2 z-10">
          <div className="relative">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-3 w-3 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 h-6 w-6 rounded-full bg-primary blur-md opacity-50 animate-pulse-privacy" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${categoryColors[market.category]} border`}>
              <CategoryIcon className="h-3 w-3 mr-1" />
              {market.category}
            </Badge>
            <Badge variant="outline" className={`${statusColors[market.status]} border`}>
              {market.status}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {market.title}
        </h3>

        {/* Outcomes */}
        <div className="space-y-3 mb-4">
          {topOutcomes.map((outcome, index) => {
            const probability = outcome.probability || 50;
            const isFirst = index === 0;
            return (
              <div key={outcome.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[70%]">{outcome.label}</span>
                  <span className={`font-medium ${isFirst ? 'text-accent' : 'text-muted-foreground'}`}>
                    {probability}%
                  </span>
                </div>
                <Progress 
                  value={probability} 
                  className={`h-1.5 ${isFirst ? '[&>div]:bg-accent' : '[&>div]:bg-muted-foreground/30'}`}
                />
              </div>
            );
          })}
          {market.outcomes.length > 2 && (
            <p className="text-xs text-muted-foreground">
              +{market.outcomes.length - 2} more outcomes
            </p>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{market.totalVolume.toLocaleString()} ALEO</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{market.participantCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={daysLeft <= 3 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {daysLeft === 0 ? 'Ending today' : `${daysLeft}d left`}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
