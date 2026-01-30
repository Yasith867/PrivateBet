import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { aleoService } from '@/lib/aleo-service';
import { apiRequest } from '@/lib/queryClient';
import { Plus, X, Loader2, Shield, Calendar, ExternalLink } from 'lucide-react';

const createMarketSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['crypto', 'politics', 'sports', 'technology', 'finance', 'other']),
  resolutionDate: z.string().min(1, 'Resolution date is required'),
  outcomes: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, 'Outcome label is required'),
  })).min(2, 'At least 2 outcomes required').max(10),
});

type CreateMarketForm = z.infer<typeof createMarketSchema>;

const categoryOptions = [
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

export function CreateMarketModal() {
  const { isCreateMarketModalOpen, setCreateMarketModalOpen } = useAppStore();
  const { connected, publicKey, requestTransaction } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOutcome, setNewOutcome] = useState('');

  const form = useForm<CreateMarketForm>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'crypto',
      resolutionDate: '',
      outcomes: [
        { id: '1', label: 'Yes' },
        { id: '2', label: 'No' },
      ],
    },
  });

  const outcomes = form.watch('outcomes');

  const handleClose = useCallback(() => {
    setCreateMarketModalOpen(false);
    form.reset();
    setNewOutcome('');
  }, [setCreateMarketModalOpen, form]);

  const addOutcome = useCallback(() => {
    if (!newOutcome.trim() || outcomes.length >= 10) return;
    
    form.setValue('outcomes', [
      ...outcomes,
      { id: String(Date.now()), label: newOutcome.trim() },
    ]);
    setNewOutcome('');
  }, [newOutcome, outcomes, form]);

  const removeOutcome = useCallback((id: string) => {
    if (outcomes.length <= 2) return;
    form.setValue('outcomes', outcomes.filter(o => o.id !== id));
  }, [outcomes, form]);

  const createMarketMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/markets', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
    },
  });

  const onSubmit = useCallback(async (data: CreateMarketForm) => {
    if (!connected || !publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a market.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const chainMarketId = aleoService.generateMarketId();
      const resolutionTimestamp = Math.floor(new Date(data.resolutionDate).getTime() / 1000);
      const numOutcomes = data.outcomes.length;

      let transactionId: string | undefined;

      if (requestTransaction) {
        const transaction = aleoService.createMarketTransaction(
          publicKey,
          chainMarketId,
          resolutionTimestamp,
          numOutcomes,
          500000
        );

        toast({
          title: "Confirm in Wallet",
          description: "Please approve the transaction in your Leo Wallet",
        });

        transactionId = await requestTransaction(transaction);
      }

      const outcomesWithProbability = data.outcomes.map((o, i) => ({
        id: aleoService.generateOutcomeId(chainMarketId, i),
        label: o.label,
        probability: Math.round(100 / data.outcomes.length),
      }));

      await createMarketMutation.mutateAsync({
        title: data.title,
        description: data.description || '',
        category: data.category,
        resolutionDate: data.resolutionDate,
        outcomes: outcomesWithProbability,
        creatorAddress: publicKey,
        chainMarketId: chainMarketId,
        transactionId: transactionId,
      });

      const hasValidTx = transactionId && transactionId.length >= 61;
      toast({
        title: 'Market Created Successfully',
        description: (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span>{hasValidTx ? 'Your prediction market is now live on Aleo' : 'Market saved! Connect Leo Wallet with testnet credits for blockchain transactions.'}</span>
            </div>
            {hasValidTx && (
              <a
                href={`https://testnet.explorer.provable.com/transaction/${transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ),
      });

      handleClose();
    } catch (error: any) {
      console.error('Market creation error:', error);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create market. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [connected, publicKey, requestTransaction, toast, handleClose, createMarketMutation]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={isCreateMarketModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create Prediction Market
          </DialogTitle>
          <DialogDescription>
            Create a new prediction market on Aleo. All bets will be private and encrypted.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Will Bitcoin reach $100k by end of 2026?"
                      {...field}
                      data-testid="input-market-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more context about this prediction..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-market-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolutionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          min={minDateStr}
                          className="pl-10"
                          {...field}
                          data-testid="input-resolution-date"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="outcomes"
              render={() => (
                <FormItem>
                  <FormLabel>Outcomes</FormLabel>
                  <FormDescription>
                    Add 2-10 possible outcomes for this prediction
                  </FormDescription>
                  
                  <div className="space-y-2">
                    {outcomes.map((outcome, index) => (
                      <div key={outcome.id} className="flex items-center gap-2">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center shrink-0">
                          {index + 1}
                        </Badge>
                        <Input
                          value={outcome.label}
                          onChange={(e) => {
                            const newOutcomes = [...outcomes];
                            newOutcomes[index] = { ...outcome, label: e.target.value };
                            form.setValue('outcomes', newOutcomes);
                          }}
                          placeholder={`Outcome ${index + 1}`}
                          data-testid={`input-outcome-${index}`}
                        />
                        {outcomes.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOutcome(outcome.id)}
                            data-testid={`button-remove-outcome-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {outcomes.length < 10 && (
                      <div className="flex items-center gap-2 pt-2">
                        <Input
                          value={newOutcome}
                          onChange={(e) => setNewOutcome(e.target.value)}
                          placeholder="Add another outcome..."
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                          data-testid="input-new-outcome"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addOutcome}
                          disabled={!newOutcome.trim()}
                          data-testid="button-add-outcome"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                This market will be created on the Aleo blockchain. Transaction fees apply (estimated ~0.5 credits).
                All bets will be encrypted using zero-knowledge technology.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !connected}
                className="flex-1 gap-2"
                data-testid="button-submit-market"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Market
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
