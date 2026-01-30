import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { insertMarketSchema } from '../lib/schema';
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
      const markets = await sql`SELECT * FROM markets ORDER BY created_at DESC`;
      return res.json(markets.map(m => ({
        ...m,
        outcomes: typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes,
        totalVolume: Number(m.total_volume || 0),
        participantCount: Number(m.participant_count || 0),
        createdAt: m.created_at,
        resolutionDate: m.resolution_date,
        creatorAddress: m.creator_address,
        chainMarketId: m.chain_market_id,
        winningOutcomeId: m.winning_outcome_id,
        transactionId: m.transaction_id,
      })));
    }

    if (req.method === 'POST') {
      const validatedData = insertMarketSchema.parse(req.body);
      const id = `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date().toISOString();

      const result = await sql`
        INSERT INTO markets (id, title, description, category, outcomes, status, resolution_date, created_at, creator_address, total_volume, participant_count, chain_market_id, transaction_id)
        VALUES (${id}, ${validatedData.title}, ${validatedData.description || ''}, ${validatedData.category}, ${JSON.stringify(validatedData.outcomes)}, 'active', ${validatedData.resolutionDate}, ${createdAt}, ${validatedData.creatorAddress}, 0, 0, ${validatedData.chainMarketId || null}, ${validatedData.transactionId || null})
        RETURNING *
      `;

      const m = result[0];
      return res.status(201).json({
        ...m,
        outcomes: typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes,
        totalVolume: Number(m.total_volume || 0),
        participantCount: Number(m.participant_count || 0),
        createdAt: m.created_at,
        resolutionDate: m.resolution_date,
        creatorAddress: m.creator_address,
        chainMarketId: m.chain_market_id,
        winningOutcomeId: m.winning_outcome_id,
        transactionId: m.transaction_id,
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
