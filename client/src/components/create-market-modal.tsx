import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
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
import { Plus, X, Loader2, Shield, Calendar } from 'lucide-react';

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
  const { connected } = useWallet();
  const { toast } = useToast();
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

  const onSubmit = useCallback(async (data: CreateMarketForm) => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a market.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate market creation via API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Market Created Successfully',
        description: (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span>Your prediction market is now live on Aleo</span>
          </div>
        ),
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create market. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [connected, toast, handleClose]);

  // Get minimum date (tomorrow)
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
            Create a new prediction market. All bets will be private and encrypted.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
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

            {/* Description */}
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

            {/* Category & Resolution Date */}
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

            {/* Outcomes */}
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

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                All bets placed on this market will be encrypted using Aleo's zero-knowledge technology. 
                Market statistics will be visible, but individual positions remain private.
              </p>
            </div>

            {/* Actions */}
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
                disabled={isSubmitting}
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
