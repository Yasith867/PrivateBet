# PrivateBet

## Privacy-First Prediction Market Platform on Aleo Blockchain

PrivateBet is a decentralized prediction market platform that leverages Aleo's zero-knowledge proof technology to provide complete privacy for users' betting activities. Unlike traditional prediction markets where all transactions are publicly visible, PrivateBet ensures that bet amounts, positions, and settlement details remain encrypted and accessible only to the bet owner.

---

## Table of Contents

1. [Overview](#overview)
2. [Why PrivateBet](#why-privatebet)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [Technology Stack](#technology-stack)
6. [Smart Contract Design](#smart-contract-design)
7. [Privacy Guarantees](#privacy-guarantees)
8. [Functional Requirements](#functional-requirements)
9. [API Reference](#api-reference)
10. [Deployment Information](#deployment-information)
11. [Getting Started](#getting-started)
12. [Security Considerations](#security-considerations)
13. [Future Roadmap](#future-roadmap)

---

## Overview

PrivateBet addresses a fundamental problem in blockchain-based prediction markets: the lack of privacy. On transparent blockchains like Ethereum, all betting activity is publicly visible, allowing competitors to front-run trades, copy strategies, or manipulate markets based on observed positions.

By building on Aleo's zero-knowledge infrastructure, PrivateBet creates a trustless prediction market where:

- Users can place bets without revealing their positions to others
- Bet amounts remain encrypted on-chain
- Winners can claim rewards using cryptographic proofs without exposing their original stakes
- Market integrity is maintained through verifiable computations

---

## Why PrivateBet

### The Problem with Transparent Prediction Markets

Traditional blockchain prediction markets suffer from several privacy-related issues:

| Issue | Impact |
|-------|--------|
| Position Visibility | Competitors can see and copy successful traders' positions |
| Front-Running | Observers can front-run large bets to profit from price movements |
| Strategy Exposure | Trading strategies become public knowledge |
| Social Pressure | Users may face scrutiny for their prediction choices |
| Market Manipulation | Whales can influence markets by signaling their positions |

### The PrivateBet Solution

PrivateBet eliminates these concerns by encrypting all sensitive betting data while maintaining the transparency needed for market integrity:

- **Individual Privacy**: Your bets are encrypted; only you can see them
- **Collective Transparency**: Aggregate market statistics (volume, participant count) remain public
- **Trustless Verification**: Zero-knowledge proofs ensure honest settlement without revealing private data
- **Censorship Resistance**: No central authority can block or modify bets

---

## Key Features

### Privacy Features

- **Encrypted Bet Amounts**: All stake amounts are stored as private records on Aleo
- **Hidden Positions**: Individual outcome selections are encrypted in user records
- **Private Settlement**: Winners claim rewards using ZK proofs without revealing original bets
- **Selective Disclosure**: Optional view key sharing for compliance or auditing purposes

### Platform Features

- **Market Creation**: Create prediction markets with custom outcomes and resolution dates
- **Real-Time Statistics**: View aggregated market volume and participant counts
- **Portfolio Management**: Track all personal bets and winnings in one dashboard
- **Wallet Integration**: Seamless connection with Leo Wallet for Aleo transactions
- **On-Chain Execution**: All transactions execute directly on Aleo Testnet Beta

---

## System Architecture

```
+------------------------------------------------------------------+
|                        CLIENT LAYER                               |
|  +------------------------------------------------------------+  |
|  |                    React Frontend                          |  |
|  |  +------------+  +---------------+  +------------------+   |  |
|  |  | Market     |  | Betting       |  | Portfolio        |   |  |
|  |  | Explorer   |  | Interface     |  | Dashboard        |   |  |
|  |  +------------+  +---------------+  +------------------+   |  |
|  |                                                            |  |
|  |  +------------+  +---------------+  +------------------+   |  |
|  |  | Wallet     |  | Aleo          |  | State            |   |  |
|  |  | Provider   |  | Service       |  | Management       |   |  |
|  |  +------------+  +---------------+  +------------------+   |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              | HTTP/REST
                              v
+------------------------------------------------------------------+
|                        SERVER LAYER                               |
|  +------------------------------------------------------------+  |
|  |                   Express.js Backend                        |  |
|  |  +------------+  +---------------+  +------------------+   |  |
|  |  | Market     |  | Bet           |  | Portfolio        |   |  |
|  |  | Routes     |  | Routes        |  | Routes           |   |  |
|  |  +------------+  +---------------+  +------------------+   |  |
|  |                         |                                  |  |
|  |              +---------------------+                       |  |
|  |              | In-Memory Storage   |                       |  |
|  |              | (Market Metadata)   |                       |  |
|  |              +---------------------+                       |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              | Provable API
                              v
+------------------------------------------------------------------+
|                     BLOCKCHAIN LAYER                              |
|  +------------------------------------------------------------+  |
|  |                  Aleo Testnet Beta                          |  |
|  |                                                             |  |
|  |  +------------------------------------------------------+  |  |
|  |  |           prediction_marketv01.aleo                   |  |  |
|  |  |                                                       |  |  |
|  |  |  PRIVATE RECORDS          PUBLIC MAPPINGS            |  |  |
|  |  |  +----------------+       +----------------------+   |  |  |
|  |  |  | Bet Record     |       | market_volumes       |   |  |  |
|  |  |  | - owner        |       | market_participants  |   |  |  |
|  |  |  | - market_id    |       | market_resolved      |   |  |  |
|  |  |  | - outcome_id   |       | winning_outcomes     |   |  |  |
|  |  |  | - amount       |       | markets (metadata)   |   |  |  |
|  |  |  +----------------+       +----------------------+   |  |  |
|  |  |                                                       |  |  |
|  |  |  TRANSITIONS                                          |  |  |
|  |  |  - create_market()                                    |  |  |
|  |  |  - place_bet()                                        |  |  |
|  |  |  - resolve_market()                                   |  |  |
|  |  |  - claim_winnings()                                   |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              | Leo Wallet Adapter
                              v
+------------------------------------------------------------------+
|                        WALLET LAYER                               |
|  +------------------------------------------------------------+  |
|  |                     Leo Wallet                              |  |
|  |  - Key Management                                          |  |
|  |  - Transaction Signing                                     |  |
|  |  - Record Decryption                                       |  |
|  |  - Balance Management (Private + Public)                   |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Data Flow

1. **Market Creation Flow**:
   ```
   User -> React UI -> Express API -> Leo Wallet -> Aleo Network
                                            |
                   Market stored in <-------+
                   backend + on-chain
   ```

2. **Betting Flow**:
   ```
   User selects outcome -> Creates transaction -> Signs with Leo Wallet
                                                         |
   Private Bet record <----------------------------------+
   stored on Aleo (encrypted)
   ```

3. **Settlement Flow**:
   ```
   Market resolved -> User submits claim -> ZK proof generated
                                                   |
   Winnings record <-------------------------------+
   (verified without revealing bet details)
   ```

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Tailwind CSS | Styling | 3.x |
| Shadcn/UI | Component Library | Latest |
| Wouter | Client-Side Routing | 3.x |
| TanStack Query | Data Fetching & Caching | 5.x |
| Zustand | Global State Management | 4.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime Environment | 20.x |
| Express.js | HTTP Server | 4.x |
| TypeScript | Type Safety | 5.x |
| Zod | Schema Validation | 3.x |
| Drizzle-Zod | ORM Schemas | Latest |

### Blockchain

| Technology | Purpose | Details |
|------------|---------|---------|
| Aleo | Privacy Blockchain | Testnet Beta |
| Leo | Smart Contract Language | v2.x |
| Provable API | On-Chain Data Queries | api.explorer.provable.com |

### Wallet Integration

| Package | Purpose |
|---------|---------|
| @demox-labs/aleo-wallet-adapter-base | Core Wallet Types |
| @demox-labs/aleo-wallet-adapter-react | React Hooks & Context |
| @demox-labs/aleo-wallet-adapter-reactui | UI Components |
| @demox-labs/aleo-wallet-adapter-leo | Leo Wallet Support |

---

## Smart Contract Design

### Program Information

- **Program Name**: `prediction_marketv01.aleo`
- **Network**: Aleo Testnet Beta
- **Deployment Transaction**: `at1p27dwk0fj8ev4pjjr560enn7swmhz349j5dsswurwwzv0ejsrqysrtvel0`

### Record Types (Private)

```leo
record Bet {
    owner: address,        // Bet owner's address
    market_id: field,      // Market identifier
    outcome_id: field,     // Selected outcome
    amount: u64,           // Bet amount in microcredits
    timestamp: u64,        // Bet placement time
}

record Winnings {
    owner: address,        // Winner's address
    market_id: field,      // Market identifier
    amount: u64,           // Winnings amount
    original_bet: u64,     // Original bet amount
}
```

### Mappings (Public)

```leo
mapping markets: field => MarketData;           // Market metadata
mapping market_volumes: field => u64;           // Total volume per market
mapping market_participants: field => u64;      // Participant count
mapping market_resolved: field => bool;         // Resolution status
mapping winning_outcomes: field => field;       // Winning outcome per market
```

### Transitions

| Transition | Purpose | Visibility |
|------------|---------|------------|
| `create_market` | Create new prediction market | Public |
| `place_bet` | Place encrypted bet on outcome | Private amount |
| `resolve_market` | Declare winning outcome | Public |
| `claim_winnings` | Claim rewards with ZK proof | Private |

---

## Privacy Guarantees

### What Remains Private

| Data | Privacy Level | Explanation |
|------|--------------|-------------|
| Bet Amount | Fully Private | Encrypted in Bet record, only owner can decrypt |
| User Identity | Pseudonymous | Address visible, but not linked to real identity |
| Individual Positions | Private | Stored in encrypted records |
| Winnings Claimed | Private | Settlement uses ZK proofs |

### What Remains Public

| Data | Purpose |
|------|---------|
| Total Market Volume | Indicates market liquidity and interest |
| Participant Count | Shows market engagement |
| Market Metadata | Required for market discovery |
| Winning Outcome | Required for settlement |

### Zero-Knowledge Proof Verification

The `claim_winnings` transition demonstrates ZK verification:

1. User submits their private Bet record
2. Contract verifies `bet.outcome_id == winning_outcome` using ZK proof
3. Verification succeeds without revealing bet amount or position to observers
4. Winnings record is created and encrypted for the winner

---

## Functional Requirements

### User Stories

#### Market Creator

| ID | Requirement | Priority |
|----|-------------|----------|
| MC-01 | Create market with custom title and description | High |
| MC-02 | Define 2 or more possible outcomes | High |
| MC-03 | Set market resolution date | High |
| MC-04 | Resolve market by selecting winning outcome | High |
| MC-05 | View statistics for created markets | Medium |

#### Bettor

| ID | Requirement | Priority |
|----|-------------|----------|
| BT-01 | Browse available prediction markets | High |
| BT-02 | View market details and statistics | High |
| BT-03 | Place private bet on selected outcome | High |
| BT-04 | View personal betting history | High |
| BT-05 | Claim winnings after market resolution | High |
| BT-06 | Track portfolio performance | Medium |

#### System

| ID | Requirement | Priority |
|----|-------------|----------|
| SY-01 | Integrate with Leo Wallet for authentication | High |
| SY-02 | Execute transactions on Aleo Testnet Beta | High |
| SY-03 | Query on-chain data via Provable API | High |
| SY-04 | Maintain consistency between off-chain and on-chain data | High |
| SY-05 | Support both private and public fee payments | Medium |

### Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Security | All sensitive data must be encrypted using Aleo's record model |
| Performance | UI must respond within 2 seconds for local operations |
| Availability | Application must handle wallet disconnection gracefully |
| Usability | Clear feedback for all blockchain transaction states |
| Scalability | Backend must support concurrent market creation |

---

## API Reference

### Markets

#### List All Markets

```
GET /api/markets
```

Response:
```json
[
  {
    "id": 1,
    "chainMarketId": "1234567890field",
    "title": "Will BTC reach $100k by 2025?",
    "description": "Market resolves YES if...",
    "outcomes": ["Yes", "No"],
    "resolutionDate": "2025-12-31T00:00:00Z",
    "totalVolume": "1000000",
    "participantCount": 45,
    "status": "active",
    "creator": "aleo1..."
  }
]
```

#### Get Single Market

```
GET /api/markets/:id
```

#### Create Market

```
POST /api/markets
Content-Type: application/json

{
  "title": "Market Title",
  "description": "Detailed description",
  "outcomes": ["Outcome A", "Outcome B"],
  "resolutionDate": "2025-12-31T00:00:00Z",
  "creator": "aleo1...",
  "chainMarketId": "1234567890field",
  "transactionId": "at1..."
}
```

#### Resolve Market

```
PATCH /api/markets/:id
Content-Type: application/json

{
  "status": "resolved",
  "winningOutcome": "Outcome A"
}
```

### Bets

#### Get User's Bets

```
GET /api/bets?owner=aleo1...
```

#### Place Bet

```
POST /api/bets
Content-Type: application/json

{
  "marketId": 1,
  "chainMarketId": "1234567890field",
  "outcome": "Yes",
  "outcomeId": "5678901234field",
  "amount": "100000",
  "owner": "aleo1...",
  "transactionId": "at1..."
}
```

#### Settle Bet

```
PATCH /api/bets/:id/settle
Content-Type: application/json

{
  "status": "won",
  "payout": "200000"
}
```

### Portfolio

#### Get Portfolio Statistics

```
GET /api/portfolio/stats?owner=aleo1...
```

Response:
```json
{
  "totalBets": 10,
  "activeBets": 3,
  "totalWagered": "500000",
  "totalWinnings": "750000",
  "winRate": 0.65
}
```

---
### API Endpoints

| Service | URL |
|---------|-----|
| Provable API | https://api.explorer.provable.com/v2/testnet |
| Transaction Broadcast | Via Leo Wallet Adapter |

---

## Getting Started

### Prerequisites

1. **Leo Wallet**: Install the Leo Wallet browser extension from the Chrome Web Store
2. **Testnet Credits**: Obtain test credits from the Aleo faucet
3. **Node.js**: Version 20.x or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd privatebet

# Install dependencies
npm install

# Start development server
npm run dev
```

### Connecting Your Wallet

1. Click "Connect Wallet" in the application header
2. Approve the connection request in Leo Wallet
3. Ensure you have sufficient testnet credits for transactions

### Placing Your First Bet

1. Browse available markets on the home page
2. Click on a market to view details
3. Select your predicted outcome
4. Enter your bet amount (in microcredits)
5. Confirm the transaction in Leo Wallet
6. Wait for blockchain confirmation

---

## Security Considerations

### Smart Contract Security

- Market creation validates against duplicate market IDs
- Only market creators can resolve their markets
- Bet claiming requires ZK proof of winning position
- All amounts use u64 to prevent overflow

### Frontend Security

- All API inputs validated with Zod schemas
- No private keys stored in browser
- Transaction signing delegated to Leo Wallet
- CORS protection on backend routes

### Privacy Considerations

- Bet records encrypted using owner's address
- Private data never exposed via API
- On-chain queries return only public mappings
- View keys available for optional disclosure

---

## Future Roadmap

### Phase 1: Core Enhancements

- [ ] Oracle integration for automated market resolution
- [ ] Support for multiple outcome markets (3+ options)
- [ ] Liquidity pool mechanism for better pricing

### Phase 2: Privacy Improvements

- [ ] Fully private outcome selection (currently public parameter)
- [ ] Private market creation option
- [ ] Encrypted market descriptions

### Phase 3: Platform Features

- [ ] Market categories and filtering
- [ ] User reputation system
- [ ] Social features (comments, sharing)
- [ ] Mobile application

### Phase 4: Production Readiness

- [ ] Mainnet deployment
- [ ] Third-party security audit
- [ ] Regulatory compliance framework
- [ ] Multi-wallet support

---

## License

This project is developed for educational and demonstration purposes on Aleo Testnet Beta.

---

## Acknowledgments

- Aleo Team for the zero-knowledge blockchain infrastructure
- Demox Labs for the Leo Wallet and adapter libraries
- Provable for the blockchain explorer and API services

---

## Contact

For questions, issues, or contributions, please open an issue in the repository.
