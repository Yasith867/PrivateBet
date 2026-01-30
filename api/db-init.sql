-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  outcomes JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  resolution_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  total_volume NUMERIC DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  chain_market_id TEXT,
  winning_outcome_id TEXT,
  transaction_id TEXT,
  image_url TEXT
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL REFERENCES markets(id),
  outcome_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  owner_address TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_settled BOOLEAN DEFAULT FALSE,
  winnings NUMERIC,
  record_nonce TEXT,
  transaction_id TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
CREATE INDEX IF NOT EXISTS idx_bets_owner ON bets(owner_address);
CREATE INDEX IF NOT EXISTS idx_bets_market ON bets(market_id);
