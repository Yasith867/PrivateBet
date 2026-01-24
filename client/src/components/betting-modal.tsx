import { useState, useCallback } from 'react';
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
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';

export function BettingModal() {
  const { 
    selectedMarket, 
    selectedOutcomeId, 
    isBettingModalOpen, 
    setBettingModalOpen,
    setSelectedOutcomeId,
    wallet 
  } = useAppStore();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<number>(10);
  const [showAmount, setShowAmount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOutcome = selectedMarket?.outcomes.find(o => o.id === selectedOutcomeId);
  const maxBalance = wallet.balance || 0;

  const handleClose = useCallback(() => {
    setBettingModalOpen(false);
    setSelectedOutcomeId(null);
    setAmount(10);
  }, [setBettingModalOpen, setSelectedOutcomeId]);

  const handlePlaceBet = useCallback(async () => {
    if (!selectedMarket || !selectedOutcomeId || !wallet.connected) return;

    setIsSubmitting(true);
    try {
      // Simulate placing bet via Aleo transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Bet Placed Successfully",
        description: (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span>Your bet is encrypted and private on Aleo</span>
          </div>
        ),
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMarket, selectedOutcomeId, wallet.connected, toast, handleClose]);

  const potentialWinnings = selectedOutcome?.probability 
    ? (amount * (100 / selectedOutcome.probability)).toFixed(2)
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
          {/* Market Info */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Market</p>
            <p className="font-medium line-clamp-2">{selectedMarket.title}</p>
          </div>

          {/* Selected Outcome */}
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

          {/* Amount Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Bet Amount (ALEO)</Label>
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
                min={1}
                max={maxBalance}
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
              min={1}
              step={1}
              className="py-2"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Min: 1 ALEO</span>
              <span>Balance: {maxBalance.toLocaleString()} ALEO</span>
            </div>
          </div>

          {/* Potential Winnings */}
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Potential Winnings</p>
                <p className="text-2xl font-bold text-accent">
                  {showAmount ? `${potentialWinnings} ALEO` : '•••••'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-accent">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Private</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Your bet amount, position, and winnings are fully encrypted. Only you can see your bet details using your Aleo wallet.
            </p>
          </div>
        </div>

        {/* Actions */}
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
            disabled={isSubmitting || amount <= 0 || amount > maxBalance}
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
