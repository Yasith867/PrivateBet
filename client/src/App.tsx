import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { BettingModal } from "@/components/betting-modal";
import { CreateMarketModal } from "@/components/create-market-modal";
import HomePage from "@/pages/home";
import MarketDetailPage from "@/pages/market-detail";
import PortfolioPage from "@/pages/portfolio";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/market/:id" component={MarketDetailPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <footer className="border-t border-border/50 py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>PrivateBet</span>
                  <span className="text-border">|</span>
                  <span>Powered by Aleo Zero-Knowledge Proofs</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <a 
                    href="https://developer.aleo.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Docs
                  </a>
                  <a 
                    href="https://github.com/AleoNet" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                  <span className="text-border">|</span>
                  <span>Testnet Beta</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <BettingModal />
        <CreateMarketModal />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
