# PrivateBet - Private Prediction Market on Aleo

## Overview

PrivateBet is a privacy-focused prediction market platform built on Aleo's zero-knowledge blockchain. Users can create markets, place bets, and claim winnings - all with their positions, bet amounts, and strategies fully encrypted.

## Key Features

- **Private Bets**: All bet amounts and positions are encrypted using Aleo's ZK proofs
- **Hidden Positions**: Only aggregated market statistics (volume, participants) are public
- **Private Settlement**: Winners claim rewards without revealing their original bets
- **Wallet Integration**: Connect via Aleo Wallet Adapter (Leo Wallet supported)
- **Real Blockchain Integration**: All transactions execute on Aleo Testnet Beta

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS with custom dark theme
- Shadcn UI components
- React Query for data fetching
- Zustand for state management
- Wouter for routing

### Backend
- Express.js with TypeScript
- In-memory storage (MemStorage)
- RESTful API endpoints

### Blockchain (Aleo)
- Leo programming language smart contracts
- Aleo Testnet Beta deployment
- Zero-knowledge proof verification
- Provable API for on-chain queries

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── header.tsx
│   │   │   ├── market-card.tsx
│   │   │   ├── betting-modal.tsx
│   │   │   ├── create-market-modal.tsx
│   │   │   └── wallet-provider.tsx
│   │   ├── pages/         # Route pages
│   │   │   ├── home.tsx
│   │   │   ├── market-detail.tsx
│   │   │   └── portfolio.tsx
│   │   └── lib/           # Utilities
│   │       ├── store.ts   # Zustand store
│   │       └── aleo-service.ts  # Aleo blockchain service
├── server/                # Express backend
│   ├── routes.ts         # API endpoints
│   └── storage.ts        # Data storage
├── shared/               # Shared types
│   └── schema.ts        # Zod schemas & types
└── leo/                  # Aleo smart contracts
    └── prediction_market.leo
```

## API Endpoints

### Markets
- `GET /api/markets` - List all markets
- `GET /api/markets/:id` - Get single market
- `POST /api/markets` - Create new market
- `PATCH /api/markets/:id` - Update/resolve market

### Bets
- `GET /api/bets?owner=ADDRESS` - Get user's bets
- `POST /api/bets` - Place a private bet
- `PATCH /api/bets/:id/settle` - Settle bet after resolution

### Portfolio
- `GET /api/portfolio/stats?owner=ADDRESS` - Get portfolio statistics

## Running the Application

The application runs on port 5000:

```bash
npm run dev
```

## Development Notes

### Design System
- Primary color: Purple (#8B5CF6) for brand/actions
- Accent color: Teal (#14B8A6) for success/positive
- Dark theme by default for crypto aesthetic
- Space Grotesk font for modern feel

### Privacy Architecture
1. **Record Model**: Bets are stored as encrypted records on Aleo
2. **ZK Proofs**: Settlement verifies winning bets without revealing amounts
3. **View Keys**: Optional disclosure for compliance/auditing

### Aleo Wallet Integration
- Network: Aleo Testnet Beta
- Wallet: Real Leo Wallet integration via @demox-labs/aleo-wallet-adapter packages
- Packages used:
  - @demox-labs/aleo-wallet-adapter-base
  - @demox-labs/aleo-wallet-adapter-react
  - @demox-labs/aleo-wallet-adapter-reactui
  - @demox-labs/aleo-wallet-adapter-leo
- All components use `useWallet` hook from `@demox-labs/aleo-wallet-adapter-react`
- Wallet state managed by WalletProvider (not Zustand store)
- Custom CSS styling for wallet adapter to match dark theme

### Deployed Contract
- **Program Name:** `prediction_marketv01.aleo`
- **Network:** Aleo Testnet Beta
- **Transaction ID:** `at1p27dwk0fj8ev4pjjr560enn7swmhz349j5dsswurwwzv0ejsrqysrtvel0`
- **Explorer:** https://testnet.explorer.provable.com/transaction/at1p27dwk0fj8ev4pjjr560enn7swmhz349j5dsswurwwzv0ejsrqysrtvel0

### Leo Contract Notes
The smart contract in `leo/prediction_market.leo`:
- Market existence validation is minimal
- Resolution logic is simplified (2x winnings)
- Real deployment would need oracle integration for outcome verification
- Production version should add more robust checks and access controls

### Aleo Service (client/src/lib/aleo-service.ts)
The AleoService class provides:
- `getMappingValue()` - Query on-chain mappings via Provable API
- `getMarketVolume()` - Get market trading volume
- `getMarketParticipants()` - Get participant count
- `isMarketResolved()` - Check if market is resolved
- `getWinningOutcome()` - Get winning outcome ID
- `getTransactionStatus()` - Check transaction status
- `createPlaceBetTransaction()` - Create place_bet transaction
- `createMarketTransaction()` - Create create_market transaction
- `createResolveMarketTransaction()` - Create resolve_market transaction

### Current Mode
- Real wallet connection via Leo Wallet browser extension
- Real blockchain transactions via Leo Wallet adapter
- All API inputs are validated with Zod schemas
- No demo/hardcoded data - all data comes from API

## User Preferences

- Dark mode preferred
- Privacy-first design
- Clean, minimal UI with subtle animations
- Mobile-responsive layout
