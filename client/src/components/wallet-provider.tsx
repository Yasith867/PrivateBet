import { useMemo, useCallback, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, Copy, LogOut, ExternalLink, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simulated wallet connection for demo (will be replaced with real Aleo wallet)
export function WalletButton() {
  const { wallet, setWallet, disconnectWallet } = useAppStore();
  const { toast } = useToast();

  const connectWallet = useCallback(async () => {
    // Simulate wallet connection - in production this would use Aleo Wallet Adapter
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a demo Aleo address
      const demoAddress = `aleo1${Array.from({ length: 58 }, () => 
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join('')}`;
      
      setWallet({
        connected: true,
        address: demoAddress,
        balance: 1000.5,
        network: 'testnet',
      });
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Aleo Testnet Beta",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  }, [setWallet, toast]);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [disconnectWallet, toast]);

  const copyAddress = useCallback(() => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      });
    }
  }, [wallet.address, toast]);

  const truncatedAddress = useMemo(() => {
    if (!wallet.address) return '';
    return `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`;
  }, [wallet.address]);

  if (!wallet.connected) {
    return (
      <Button
        onClick={connectWallet}
        className="gap-2"
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-wallet-menu">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-sm">{truncatedAddress}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Balance</span>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              {wallet.network}
            </Badge>
          </div>
          <p className="text-2xl font-bold">{wallet.balance?.toLocaleString()} ALEO</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={`https://explorer.aleo.org/address/${wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-view-explorer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDisconnect}
          className="text-destructive"
          data-testid="button-disconnect-wallet"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
