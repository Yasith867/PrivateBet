import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMarketSchema, insertBetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ MARKETS ============
  
  // Get all markets
  app.get("/api/markets", async (req, res) => {
    try {
      const markets = await storage.getMarkets();
      res.json(markets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      res.status(500).json({ error: "Failed to fetch markets" });
    }
  });

  // Get single market
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const market = await storage.getMarket(req.params.id);
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      res.json(market);
    } catch (error) {
      console.error("Error fetching market:", error);
      res.status(500).json({ error: "Failed to fetch market" });
    }
  });

  // Create market
  app.post("/api/markets", async (req, res) => {
    try {
      const validatedData = insertMarketSchema.parse(req.body);
      const market = await storage.createMarket(validatedData);
      res.status(201).json(market);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid market data", details: error.errors });
      }
      console.error("Error creating market:", error);
      res.status(500).json({ error: "Failed to create market" });
    }
  });

  // Update market schema (for resolution)
  const updateMarketSchema = z.object({
    status: z.enum(["pending", "active", "resolved", "cancelled"]).optional(),
    winningOutcomeId: z.string().optional(),
    totalVolume: z.number().optional(),
    participantCount: z.number().optional(),
  });

  // Update market (for resolution)
  app.patch("/api/markets/:id", async (req, res) => {
    try {
      const validatedData = updateMarketSchema.parse(req.body);
      const market = await storage.updateMarket(req.params.id, validatedData);
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      res.json(market);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      console.error("Error updating market:", error);
      res.status(500).json({ error: "Failed to update market" });
    }
  });

  // ============ BETS ============

  // Get bets by owner address
  app.get("/api/bets", async (req, res) => {
    try {
      const ownerAddress = req.query.owner as string;
      if (!ownerAddress) {
        return res.status(400).json({ error: "Owner address required" });
      }
      const bets = await storage.getBetsByOwner(ownerAddress);
      
      // Enrich bets with market data
      const enrichedBets = await Promise.all(
        bets.map(async (bet) => {
          const market = await storage.getMarket(bet.marketId);
          return { ...bet, market };
        })
      );
      
      res.json(enrichedBets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      res.status(500).json({ error: "Failed to fetch bets" });
    }
  });

  // Create bet (place a private bet)
  app.post("/api/bets", async (req, res) => {
    try {
      const validatedData = insertBetSchema.parse(req.body);
      
      // Verify market exists and is active
      const market = await storage.getMarket(validatedData.marketId);
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      if (market.status !== 'active') {
        return res.status(400).json({ error: "Market is not active" });
      }
      
      // Verify outcome exists
      const outcomeExists = market.outcomes.some(o => o.id === validatedData.outcomeId);
      if (!outcomeExists) {
        return res.status(400).json({ error: "Invalid outcome" });
      }
      
      const bet = await storage.createBet(validatedData);
      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid bet data", details: error.errors });
      }
      console.error("Error creating bet:", error);
      res.status(500).json({ error: "Failed to create bet" });
    }
  });

  // Settle bet schema
  const settleBetSchema = z.object({
    winnings: z.number().min(0),
  });

  // Settle bet (after market resolution)
  app.patch("/api/bets/:id/settle", async (req, res) => {
    try {
      const validatedData = settleBetSchema.parse(req.body);
      const bet = await storage.updateBet(req.params.id, {
        isSettled: true,
        winnings: validatedData.winnings,
      });
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      res.json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid settlement data", details: error.errors });
      }
      console.error("Error settling bet:", error);
      res.status(500).json({ error: "Failed to settle bet" });
    }
  });

  // ============ PORTFOLIO ============

  // Get portfolio stats
  app.get("/api/portfolio/stats", async (req, res) => {
    try {
      const ownerAddress = req.query.owner as string;
      if (!ownerAddress) {
        return res.status(400).json({ error: "Owner address required" });
      }
      const stats = await storage.getPortfolioStats(ownerAddress);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching portfolio stats:", error);
      res.status(500).json({ error: "Failed to fetch portfolio stats" });
    }
  });

  // ============ ALEO INTEGRATION ENDPOINTS ============
  
  // Simulate transaction verification (in production, this would verify ZK proofs)
  app.post("/api/verify-transaction", async (req, res) => {
    try {
      const { transactionId, programId } = req.body;
      
      // In production, this would:
      // 1. Query Aleo network for transaction
      // 2. Verify the ZK proof
      // 3. Extract public outputs
      
      // For demo, we simulate successful verification
      res.json({
        verified: true,
        transactionId,
        programId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error verifying transaction:", error);
      res.status(500).json({ error: "Failed to verify transaction" });
    }
  });

  // Get network status
  app.get("/api/network-status", async (req, res) => {
    try {
      // In production, this would query Aleo network status
      res.json({
        network: "testnet",
        status: "healthy",
        latestBlock: 1234567,
        programId: "prediction_market.aleo",
      });
    } catch (error) {
      console.error("Error fetching network status:", error);
      res.status(500).json({ error: "Failed to fetch network status" });
    }
  });

  return httpServer;
}
