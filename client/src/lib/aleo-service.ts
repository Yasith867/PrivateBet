import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';

const PROGRAM_ID = 'prediction_marketv01.aleo';
const API_BASE_URL = 'https://api.explorer.provable.com/v2/testnet';

export interface AleoMappingValue {
  market_id: string;
  volume?: string;
  participants?: string;
  resolved?: boolean;
  winning_outcome?: string;
}

export interface TransactionResult {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export class AleoService {
  private static instance: AleoService;

  static getInstance(): AleoService {
    if (!AleoService.instance) {
      AleoService.instance = new AleoService();
    }
    return AleoService.instance;
  }

  async getMappingValue(mappingName: string, key: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/program/${PROGRAM_ID}/mapping/${mappingName}/${key}`
      );
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch mapping: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error fetching mapping ${mappingName}/${key}:`, error);
      return null;
    }
  }

  async getMarketVolume(marketId: string): Promise<number> {
    const value = await this.getMappingValue('market_volumes', `${marketId}field`);
    if (!value) return 0;
    const match = value.match(/(\d+)u64/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getMarketParticipants(marketId: string): Promise<number> {
    const value = await this.getMappingValue('market_participants', `${marketId}field`);
    if (!value) return 0;
    const match = value.match(/(\d+)u64/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async isMarketResolved(marketId: string): Promise<boolean> {
    const value = await this.getMappingValue('market_resolved', `${marketId}field`);
    return value === 'true';
  }

  async getWinningOutcome(marketId: string): Promise<string | null> {
    const value = await this.getMappingValue('winning_outcomes', `${marketId}field`);
    if (!value) return null;
    const match = value.match(/(\d+)field/);
    return match ? match[1] : null;
  }

  async getTransactionStatus(transactionId: string): Promise<'pending' | 'confirmed' | 'failed' | 'unknown'> {
    try {
      const response = await fetch(`${API_BASE_URL}/transaction/${transactionId}`);
      if (!response.ok) {
        if (response.status === 404) return 'pending';
        return 'unknown';
      }
      const data = await response.json();
      return data.status === 'accepted' ? 'confirmed' : 'pending';
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      return 'unknown';
    }
  }

  createPlaceBetTransaction(
    publicKey: string,
    marketId: string,
    outcomeId: string,
    amount: number,
    fee: number = 500000
  ): Transaction {
    const inputs = [
      `${marketId}field`,
      `${outcomeId}field`,
      `${amount}u64`
    ];

    return Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      PROGRAM_ID,
      'place_bet',
      inputs,
      fee,
      false
    );
  }

  createMarketTransaction(
    publicKey: string,
    marketId: string,
    resolutionTimestamp: number,
    numOutcomes: number,
    fee: number = 500000
  ): Transaction {
    const inputs = [
      `${marketId}field`,
      `${resolutionTimestamp}u64`,
      `${numOutcomes}u8`
    ];

    return Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      PROGRAM_ID,
      'create_market',
      inputs,
      fee,
      false
    );
  }

  createResolveMarketTransaction(
    publicKey: string,
    marketId: string,
    winningOutcomeId: string,
    fee: number = 500000
  ): Transaction {
    const inputs = [
      `${marketId}field`,
      `${winningOutcomeId}field`
    ];

    return Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      PROGRAM_ID,
      'resolve_market',
      inputs,
      fee,
      false
    );
  }

  generateMarketId(): string {
    return Math.floor(Math.random() * 1000000000).toString();
  }

  generateOutcomeId(marketId: string, index: number): string {
    return `${marketId}${index}`;
  }
}

export const aleoService = AleoService.getInstance();
