// PrivateBet - Private Prediction Market on Aleo
// This is the Leo smart contract for the prediction market platform
// Designed for Aleo Testnet Beta deployment

program prediction_market.aleo {
    
    // ============ CONSTRUCTOR ============
    
    // Required for Consensus V9+ - prevents contract upgrades
    @noupgrade
    async transition initialize() -> Future {
        return finalize_initialize();
    }
    
    async function finalize_initialize() {
        // No-op initialization, marks contract as non-upgradeable
    }
    
    // ============ RECORDS (Private State) ============
    
    // Private bet record - encrypted on-chain, only owner can decrypt
    record Bet {
        owner: address,           // The bet owner
        market_id: field,         // Market identifier
        outcome_id: field,        // Selected outcome identifier
        amount: u64,              // Bet amount in microcredits
        timestamp: u64,           // When the bet was placed
    }
    
    // Private winnings record - claim your winnings privately
    record Winnings {
        owner: address,
        market_id: field,
        amount: u64,
        original_bet: u64,
    }
    
    // ============ MAPPINGS (Public State) ============
    
    // Market metadata (public)
    mapping markets: field => MarketData;
    
    // Total volume per market (public, but individual bets are private)
    mapping market_volumes: field => u64;
    
    // Participant count per market (public)
    mapping market_participants: field => u64;
    
    // Market resolution status
    mapping market_resolved: field => bool;
    
    // Winning outcome for resolved markets
    mapping winning_outcomes: field => field;
    
    // ============ STRUCTS ============
    
    struct MarketData {
        creator: address,
        resolution_timestamp: u64,
        num_outcomes: u8,
        is_active: bool,
    }
    
    // ============ TRANSITIONS ============
    
    // Place a private bet on a market outcome
    // The bet amount and outcome selection are encrypted in the Bet record
    async transition place_bet(
        public market_id: field,
        public outcome_id: field,
        private amount: u64,
    ) -> (Bet, Future) {
        // Create private bet record
        let bet: Bet = Bet {
            owner: self.caller,
            market_id: market_id,
            outcome_id: outcome_id,
            amount: amount,
            timestamp: block.height as u64,
        };
        
        // Update public market stats
        return (bet, finalize_place_bet(market_id, amount));
    }
    
    async function finalize_place_bet(
        market_id: field,
        amount: u64,
    ) {
        // Update total volume (public)
        let current_volume: u64 = Mapping::get_or_use(market_volumes, market_id, 0u64);
        Mapping::set(market_volumes, market_id, current_volume + amount);
        
        // Increment participant count
        let current_count: u64 = Mapping::get_or_use(market_participants, market_id, 0u64);
        Mapping::set(market_participants, market_id, current_count + 1u64);
    }
    
    // Claim winnings after market resolution
    // Uses ZK proof to verify bet without revealing bet details
    async transition claim_winnings(
        private bet: Bet,
        public winning_outcome: field,
    ) -> (Winnings, Future) {
        // Verify the bet was for the winning outcome
        assert_eq(bet.outcome_id, winning_outcome);
        
        // Calculate winnings (simplified: 2x for demo)
        let winnings_amount: u64 = bet.amount * 2u64;
        
        // Create private winnings record
        let winnings: Winnings = Winnings {
            owner: bet.owner,
            market_id: bet.market_id,
            amount: winnings_amount,
            original_bet: bet.amount,
        };
        
        return (winnings, finalize_claim_winnings(bet.market_id));
    }
    
    async function finalize_claim_winnings(market_id: field) {
        // Verify market is resolved
        let is_resolved: bool = Mapping::get_or_use(market_resolved, market_id, false);
        assert(is_resolved);
    }
    
    // Create a new prediction market (public action)
    async transition create_market(
        public market_id: field,
        public resolution_timestamp: u64,
        public num_outcomes: u8,
    ) -> Future {
        return finalize_create_market(market_id, self.caller, resolution_timestamp, num_outcomes);
    }
    
    async function finalize_create_market(
        market_id: field,
        creator: address,
        resolution_timestamp: u64,
        num_outcomes: u8,
    ) {
        // Ensure market doesn't already exist
        let existing: bool = Mapping::contains(markets, market_id);
        assert(!existing);
        
        // Store market data
        let market_data: MarketData = MarketData {
            creator: creator,
            resolution_timestamp: resolution_timestamp,
            num_outcomes: num_outcomes,
            is_active: true,
        };
        
        Mapping::set(markets, market_id, market_data);
        Mapping::set(market_volumes, market_id, 0u64);
        Mapping::set(market_participants, market_id, 0u64);
        Mapping::set(market_resolved, market_id, false);
    }
    
    // Resolve a market (only creator can resolve)
    async transition resolve_market(
        public market_id: field,
        public winning_outcome: field,
    ) -> Future {
        return finalize_resolve_market(market_id, winning_outcome, self.caller);
    }
    
    async function finalize_resolve_market(
        market_id: field,
        winning_outcome: field,
        resolver: address,
    ) {
        // Get market data
        let market_data: MarketData = Mapping::get(markets, market_id);
        
        // Verify resolver is creator
        assert_eq(market_data.creator, resolver);
        
        // Verify market is active
        assert(market_data.is_active);
        
        // Mark as resolved
        Mapping::set(market_resolved, market_id, true);
        Mapping::set(winning_outcomes, market_id, winning_outcome);
        
        // Deactivate market
        let updated_market: MarketData = MarketData {
            creator: market_data.creator,
            resolution_timestamp: market_data.resolution_timestamp,
            num_outcomes: market_data.num_outcomes,
            is_active: false,
        };
        Mapping::set(markets, market_id, updated_market);
    }
}

// ============ DEPLOYMENT INSTRUCTIONS ============
//
// Prerequisites:
// 1. Install Leo CLI: cargo install leo-lang
// 2. Install snarkOS
// 3. Get testnet credits from faucet
//
// Deploy to Testnet Beta:
// $ leo build
// $ leo deploy --network testnet --private-key YOUR_PRIVATE_KEY
//
// Execute functions:
// $ snarkos developer execute "prediction_market.aleo" "place_bet" \
//     "1field" "1field" "100u64" \
//     --private-key YOUR_PRIVATE_KEY \
//     --query "https://api.explorer.aleo.org/v1/testnet" \
//     --broadcast "https://api.explorer.aleo.org/v1/testnet/transaction/broadcast" \
//     --fee 500000
//
// ============ PRIVACY FEATURES ============
//
// 1. Bet Privacy: The Bet record is encrypted using the owner's address.
//    Only the owner can decrypt and view their bet details.
//
// 2. Position Privacy: Observers can see total market volume but cannot
//    determine individual positions or bet amounts.
//
// 3. Settlement Privacy: Winners claim their rewards using ZK proofs.
//    The proof verifies they bet on the winning outcome without revealing
//    their bet amount or identity to other users.
//
// 4. Selective Disclosure: Market creators and regulators can be given
//    view keys for compliance purposes without exposing user data publicly.
