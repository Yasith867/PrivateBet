import { useState, useCallback } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { aleoService } from '@/lib/aleo-service';
import { apiRequest } from '@/lib/queryClient';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';

export function BettingModal() {
  const { 
    selectedMarket, 
    selectedOutcomeId, 
    isBettingModalOpen, 
    setBettingModalOpen,
    setSelectedOutcomeId,
  } = useAppStore();
  const { connected, publicKey, requestTransaction } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState<number>(100000);
  const [showAmount, setShowAmount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const selectedOutcome = selectedMarket?.outcomes.find(o => o.id === selectedOutcomeId);
  const maxBalance = 10000000;

  const handleClose = useCallback(() => {
    setBettingModalOpen(false);
    setSelectedOutcomeId(null);
    setAmount(100000);
    setTransactionId(null);
  }, [setBettingModalOpen, setSelectedOutcomeId]);

  const betMutation = useMutation({
    mutationFn: async (data: { marketId: string; outcomeId: string; amount: number; ownerAddress: string; transactionId?: string }) => {
      const res = await apiRequest('POST', '/api/bets', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/stats'] });
    },
  });

  const handlePlaceBet = useCallback(async () => {
    if (!selectedMarket || !selectedOutcomeId || !connected || !publicKey) return;

    setIsSubmitting(true);
    setTransactionId(null);

    try {
      const chainMarketId = selectedMarket.chainMarketId || selectedMarket.id;
      const outcomeIndex = selectedMarket.outcomes.findIndex(o => o.id === selectedOutcomeId);
      const chainOutcomeId = aleoService.generateOutcomeId(chainMarketId, outcomeIndex);

      if (requestTransaction) {
        const transaction = aleoService.createPlaceBetTransaction(
          publicKey,
          chainMarketId,
          chainOutcomeId,
          amount,
          500000
        );

        toast({
          title: "Confirm in Wallet",
          description: "Please approve the transaction in your Leo Wallet",
        });

        const txId = await requestTransaction(transaction);
        setTransactionId(txId);

        await betMutation.mutateAsync({
          marketId: selectedMarket.id,
          outcomeId: selectedOutcomeId,
          amount: amount,
          ownerAddress: publicKey,
          transactionId: txId,
        });

        toast({
          title: "Bet Placed Successfully",
          description: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <span>Your bet is encrypted and private on Aleo</span>
              </div>
              <a
                href={`https://testnet.explorer.provable.com/transaction/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View transaction <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ),
        });

        handleClose();
      } else {
        await betMutation.mutateAsync({
          marketId: selectedMarket.id,
          outcomeId: selectedOutcomeId,
          amount: amount,
          ownerAddress: publicKey,
        });

        toast({
          title: "Bet Recorded",
          description: "Your bet has been recorded. Connect Leo Wallet for on-chain transactions.",
        });

        handleClose();
      }
    } catch (error: any) {
      console.error('Bet placement error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMarket, selectedOutcomeId, connected, publicKey, requestTransaction, amount, toast, handleClose, betMutation]);

  const potentialWinnings = selectedOutcome?.probability 
    ? (amount * (100 / selectedOutcome.probability)).toFixed(0)
    : '0';

  if (!selectedMarket || !selectedOutcome) return null;

  return (
    <Dialog open={isBettingModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Place Private Bet
          </DialogTitle>
          <DialogDescription>
            Your bet amount and position are encrypted using zero-knowledge proofs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Market</p>
            <p className="font-medium line-clamp-2">{selectedMarket.title}</p>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Prediction</p>
                <p className="font-semibold text-primary">{selectedOutcome.label}</p>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {selectedOutcome.probability || 50}%
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Bet Amount (microcredits)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAmount(!showAmount)}
                className="gap-1 text-xs"
                data-testid="button-toggle-amount-visibility"
              >
                {showAmount ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {showAmount ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            <div className="relative">
              <Input
                id="amount"
                type={showAmount ? 'number' : 'password'}
                value={amount}
                onChange={(e) => setAmount(Math.min(Number(e.target.value), maxBalance))}
                min={1000}
                max={maxBalance}
                step={1000}
                className="pr-16 text-lg font-mono"
                data-testid="input-bet-amount"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
                onClick={() => setAmount(maxBalance)}
              >
                MAX
              </Button>
            </div>

            <Slider
              value={[amount]}
              onValueChange={([val]) => setAmount(val)}
              max={maxBalance}
              min={1000}
              step={10000}
              className="py-2"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Min: 1,000</span>
              <span>Max: {maxBalance.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Potential Winnings (2x)</p>
                <p className="text-2xl font-bold text-accent">
                  {showAmount ? `${(amount * 2).toLocaleString()}` : '•••••'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-accent">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Private</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Your bet will be submitted to the Aleo blockchain. Transaction fees apply. 
              Ensure you have sufficient balance in your wallet.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            data-testid="button-cancel-bet"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePlaceBet}
            disabled={isSubmitting || amount < 1000 || amount > maxBalance || !connected}
            className="flex-1 gap-2"
            data-testid="button-confirm-bet"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Place Bet
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
