import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { insertBetSchema } from '../lib/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const owner = req.query.owner as string;
      if (!owner) {
        return res.status(400).json({ error: 'Owner address required' });
      }

      const bets = await sql`
        SELECT b.*, m.title as market_title, m.status as market_status, m.outcomes as market_outcomes
        FROM bets b
        LEFT JOIN markets m ON b.market_id = m.id
        WHERE b.owner_address = ${owner}
        ORDER BY b.created_at DESC
      `;

      return res.json(bets.map(b => ({
        id: b.id,
        marketId: b.market_id,
        outcomeId: b.outcome_id,
        amount: Number(b.amount),
        ownerAddress: b.owner_address,
        createdAt: b.created_at,
        isSettled: b.is_settled,
        winnings: b.winnings ? Number(b.winnings) : undefined,
        transactionId: b.transaction_id,
        market: {
          id: b.market_id,
          title: b.market_title,
          status: b.market_status,
          outcomes: typeof b.market_outcomes === 'string' ? JSON.parse(b.market_outcomes) : b.market_outcomes,
        }
      })));
    }

    if (req.method === 'POST') {
      const validatedData = insertBetSchema.parse(req.body);
      const id = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date().toISOString();

      await sql`
        INSERT INTO bets (id, market_id, outcome_id, amount, owner_address, created_at, is_settled, transaction_id)
        VALUES (${id}, ${validatedData.marketId}, ${validatedData.outcomeId}, ${validatedData.amount}, ${validatedData.ownerAddress}, ${createdAt}, false, ${validatedData.transactionId || null})
      `;

      await sql`
        UPDATE markets 
        SET total_volume = total_volume + ${validatedData.amount},
            participant_count = participant_count + 1
        WHERE id = ${validatedData.marketId}
      `;

      return res.status(201).json({
        id,
        ...validatedData,
        createdAt,
        isSettled: false,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
