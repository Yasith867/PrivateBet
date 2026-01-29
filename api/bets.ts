import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const bets = pgTable('bets', {
  id: text('id').primaryKey(),
  marketId: text('market_id').notNull(),
  oderId: text('order_id'),
  betterAddress: text('better_address').notNull(),
  outcomeId: text('outcome_id').notNull(),
  amount: integer('amount').notNull(),
  transactionId: text('transaction_id'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    const { address } = req.query;
    try {
      if (address && typeof address === 'string') {
        const userBets = await db.select().from(bets).where(eq(bets.betterAddress, address));
        return res.status(200).json(userBets);
      }
      const allBets = await db.select().from(bets);
      return res.status(200).json(allBets);
    } catch (error) {
      console.error('Error fetching bets:', error);
      return res.status(500).json({ error: 'Failed to fetch bets' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const newBet = {
        id: randomUUID(),
        marketId: body.marketId,
        oderId: body.orderId || null,
        betterAddress: body.betterAddress,
        outcomeId: body.outcomeId,
        amount: body.amount,
        transactionId: body.transactionId || null,
        status: 'pending',
      };
      
      const [inserted] = await db.insert(bets).values(newBet).returning();
      return res.status(201).json(inserted);
    } catch (error) {
      console.error('Error creating bet:', error);
      return res.status(500).json({ error: 'Failed to create bet' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
