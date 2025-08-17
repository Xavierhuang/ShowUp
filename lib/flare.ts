import { ethers } from 'ethers';

// Flare Mainnet Configuration
export const FLARE_MAINNET = {
  chainId: 14, // 0xE in hex
  name: 'Flare Mainnet',
  currency: 'FLR',
  rpcUrl: 'https://flare-api.flare.network/ext/bc/C/rpc',
  explorerUrl: 'https://flare-explorer.flare.network'
};

// Contract addresses (deployed on Flare mainnet)
export const FLARE_CONTRACTS = {
  SHOW_UP_EVENTS: '0x073F9866fA39E873A13F1D211b38bB42A653955e', // Your deployed address
  SHOW_UP_STAKING: '', // Will be deployed next
  FTSO_REGISTRY: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019', // Official FTSO Registry
};

// Interface for Dynamic SDK integration
export interface FlareWallet {
  address: string;
  connector: any;
  provider: any;
}

export class FlareService {
  private static provider: ethers.Provider;
  
  static async getProvider(wallet?: FlareWallet): Promise<ethers.Provider> {
    // Use wallet provider if available (from Dynamic SDK)
    if (wallet?.provider) {
      return new ethers.BrowserProvider(wallet.provider);
    }
    
    // Fallback to RPC provider
    if (!this.provider) {
      this.provider = new ethers.JsonRpcProvider(FLARE_MAINNET.rpcUrl);
    }
    return this.provider;
  }

  static async getSigner(wallet: FlareWallet): Promise<ethers.Signer> {
    if (!wallet?.provider) {
      throw new Error('Wallet not connected');
    }
    
    const provider = new ethers.BrowserProvider(wallet.provider);
    return await provider.getSigner();
  }

  static async getBalance(address: string): Promise<string> {
    try {
      const provider = await this.getProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get FLR balance:', error);
      return '0.0';
    }
  }

  // Test if the contract is actually deployed
  static async isContractDeployed(): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      const code = await provider.getCode(FLARE_CONTRACTS.SHOW_UP_EVENTS);
      console.log('Contract code length:', code.length, 'Code:', code.substring(0, 20) + '...');
      return code !== '0x';
    } catch (error) {
      console.error('Failed to check contract deployment:', error);
      return false;
    }
  }

  static async getFTSOPrice(symbol: string): Promise<number> {
    try {
      // FTSO price feed integration
      // This will use Flare's native price oracles
      const provider = await this.getProvider();
      // TODO: Implement FTSO registry contract interaction
      return 0;
    } catch (error) {
      console.error('Failed to get FTSO price:', error);
      return 0;
    }
  }

  // Contract interaction methods
  static async createEvent(
    wallet: FlareWallet,
    eventData: {
      title: string;
      description: string;
      location: string;
      date: number;
      stakeAmount: string;
    }
  ): Promise<string> {
    try {
      const signer = await this.getSigner(wallet);
      
      // Simple contract interface for ShowUpEvents
      const contract = new ethers.Contract(
        FLARE_CONTRACTS.SHOW_UP_EVENTS,
        [
          "function createEvent(string title, string description, string location, uint256 date, uint256 stakeAmount) external returns (string)",
          "function getEvent(string eventId) external view returns (tuple(string title, string description, string location, uint256 date, uint256 stakeAmount, address creator, bool isActive, uint256 attendeeCount))"
        ],
        signer
      );
      
      const stakeAmountWei = ethers.parseEther(eventData.stakeAmount);
      
      const tx = await contract.createEvent(
        eventData.title,
        eventData.description,
        eventData.location,
        eventData.date,
        stakeAmountWei
      );
      
      const receipt = await tx.wait();
      console.log('✅ Event created on Flare! Tx hash:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('Failed to create event on Flare:', error);
      throw error;
    }
  }

  static async stakeForEvent(
    wallet: FlareWallet,
    eventId: string,
    amount: string
  ): Promise<string> {
    try {
      const signer = await this.getSigner(wallet);
      
      const contract = new ethers.Contract(
        FLARE_CONTRACTS.SHOW_UP_EVENTS,
        [
          "function registerAndStake(string eventId) external payable",
          "function getAttendee(string eventId, address user) external view returns (tuple(bool isRegistered, bool hasStaked, bool isCheckedIn, uint256 stakedAmount))"
        ],
        signer
      );
      
      const stakeAmountWei = ethers.parseEther(amount);
      
      const tx = await contract.registerAndStake(eventId, {
        value: stakeAmountWei
      });
      
      const receipt = await tx.wait();
      console.log('✅ Staked on Flare! Tx hash:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('Failed to stake on Flare:', error);
      throw error;
    }
  }

  static async getAllEvents(): Promise<any[]> {
    try {
      const provider = await this.getProvider();
      
      const contract = new ethers.Contract(
        FLARE_CONTRACTS.SHOW_UP_EVENTS,
        [
          "function getAllEventIds() external view returns (string[])",
          "function getEvent(string eventId) external view returns (tuple(string title, string description, string location, uint256 date, uint256 stakeAmount, address creator, bool isActive, uint256 attendeeCount))"
        ],
        provider
      );
      
      const eventIds = await contract.getAllEventIds();
      const events = [];
      
      for (const eventId of eventIds) {
        try {
          const eventData = await contract.getEvent(eventId);
          events.push({
            id: eventId,
            title: eventData[0],
            description: eventData[1],
            location: eventData[2],
            date: new Date(Number(eventData[3]) * 1000).toISOString(),
            stakeAmount: ethers.formatEther(eventData[4]),
            creator: eventData[5],
            isActive: eventData[6],
            attendeeCount: Number(eventData[7])
          });
        } catch (error) {
          console.error(`Failed to load event ${eventId}:`, error);
        }
      }
      
      return events;
    } catch (error) {
      console.error('Failed to get events from Flare:', error);
      return [];
    }
  }
}

export default FlareService;
