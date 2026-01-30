import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { z } from 'zod';

const updateMarketSchema = z.object({
  status: z.enum(["pending", "active", "resolved", "cancelled"]).optional(),
  winningOutcomeId: z.string().optional(),
  totalVolume: z.number().optional(),
  participantCount: z.number().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM markets WHERE id = ${id as string}`;
      if (result.length === 0) {
        return res.status(404).json({ error: 'Market not found' });
      }
      const m = result[0];
      return res.json({
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

    if (req.method === 'PATCH') {
      const validatedData = updateMarketSchema.parse(req.body);
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (validatedData.status) {
        const result = await sql`UPDATE markets SET status = ${validatedData.status} WHERE id = ${id as string} RETURNING *`;
        const m = result[0];
        return res.json({
          ...m,
          outcomes: typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes,
          totalVolume: Number(m.total_volume || 0),
          participantCount: Number(m.participant_count || 0),
          createdAt: m.created_at,
          resolutionDate: m.resolution_date,
          creatorAddress: m.creator_address,
        });
      }

      return res.status(400).json({ error: 'No valid updates provided' });
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
