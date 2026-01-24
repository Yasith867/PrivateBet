# PrivateBet - Private Prediction Market on Aleo

## Overview

PrivateBet is a privacy-focused prediction market platform built on Aleo's zero-knowledge blockchain. Users can create markets, place bets, and claim winnings - all with their positions, bet amounts, and strategies fully encrypted.

## Key Features

- **Private Bets**: All bet amounts and positions are encrypted using Aleo's ZK proofs
- **Hidden Positions**: Only aggregated market statistics (volume, participants) are public
- **Private Settlement**: Winners claim rewards without revealing their original bets
- **Wallet Integration**: Connect via Aleo Wallet Adapter (Leo Wallet supported)

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
│   │       └── store.ts   # Zustand store
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

### Aleo Integration
- Network: Testnet Beta
- Program: `prediction_market.aleo`
- Wallet: Leo Wallet via @demox-labs/aleo-wallet-adapter

### Leo Contract Limitations (Demo)
The smart contract in `leo/prediction_market.leo` is a demonstration structure:
- Market existence validation is minimal
- Resolution logic is simplified (2x winnings)
- Real deployment would need oracle integration for outcome verification
- Production version should add more robust checks and access controls

### Current Demo Mode
- Wallet connection is simulated (demo address generated)
- Frontend uses backend API for data with demo fallback
- All API inputs are validated with Zod schemas

## User Preferences

- Dark mode preferred
- Privacy-first design
- Clean, minimal UI with subtle animations
- Mobile-responsive layout
