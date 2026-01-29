import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const markets = pgTable('markets', {
  id: text('id').primaryKey(),
  chainMarketId: text('chain_market_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  outcomes: jsonb('outcomes').notNull(),
  resolutionDate: text('resolution_date').notNull(),
  creatorAddress: text('creator_address').notNull(),
  transactionId: text('transaction_id'),
  status: text('status').notNull().default('active'),
  totalVolume: integer('total_volume').notNull().default(0),
  participantCount: integer('participant_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      const allMarkets = await db.select().from(markets);
      return res.status(200).json(allMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      return res.status(500).json({ error: 'Failed to fetch markets' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const newMarket = {
        id: randomUUID(),
        chainMarketId: body.chainMarketId,
        title: body.title,
        description: body.description || '',
        category: body.category,
        outcomes: body.outcomes,
        resolutionDate: body.resolutionDate,
        creatorAddress: body.creatorAddress,
        transactionId: body.transactionId || null,
        status: 'active',
        totalVolume: 0,
        participantCount: 0,
      };
      
      const [inserted] = await db.insert(markets).values(newMarket).returning();
      return res.status(201).json(inserted);
    } catch (error) {
      console.error('Error creating market:', error);
      return res.status(500).json({ error: 'Failed to create market' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
