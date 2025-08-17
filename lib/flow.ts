'use client';

import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Configure Flow for Mainnet (production ready!)
fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "ShowUp - Event Staking",
  "app.detail.icon": "https://placeholdit.imgix.net/~text?txtsize=64&txt=⚡&w=256&h=256",
  "flow.network": "mainnet"
});

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  stakeAmount: string;
  maxAttendees: number;
  currentAttendees: number;
  creator: string;
  isActive: boolean;
  attendees: string[];
}

export interface StakeData {
  eventId: string;
  user: string;
  amount: string;
  timestamp: string;
  isCheckedIn: boolean;
}

// Contract Addresses (YOUR DEPLOYED CONTRACTS!)
export const CONTRACT_ADDRESSES = {
  ShowUpEvents: "0xa19273383554e1e1",
  ShowUpStaking: "0xa19273383554e1e1",
  FlowToken: "0x1654653399040a61",
  FungibleToken: "0xf233dcee88fe0abe"
};

// Smart contract scripts and transactions
export const CONTRACTS = {
  // Create a new event using your deployed contract
  CREATE_EVENT: `
    import ShowUpEvents from 0xa19273383554e1e1

    transaction(title: String, description: String, date: String, location: String, stakeAmount: UFix64, maxAttendees: UInt32) {
      let eventsCollection: &ShowUpEvents.EventsCollection
      
      prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get or create events collection
        if signer.storage.borrow<&ShowUpEvents.EventsCollection>(from: ShowUpEvents.EventsStoragePath) == nil {
          let collection <- ShowUpEvents.createEventsCollection()
          signer.storage.save(<-collection, to: ShowUpEvents.EventsStoragePath)
          
          let capability = signer.capabilities.storage.issue<&ShowUpEvents.EventsCollection>(ShowUpEvents.EventsStoragePath)
          signer.capabilities.publish(capability, at: ShowUpEvents.EventsPublicPath)
        }
        
        self.eventsCollection = signer.storage.borrow<&ShowUpEvents.EventsCollection>(
          from: ShowUpEvents.EventsStoragePath
        ) ?? panic("Could not borrow events collection")
      }
      
      execute {
        let eventId = self.eventsCollection.createEvent(
          title: title,
          description: description,
          date: date,
          location: location,
          stakeAmount: stakeAmount,
          maxAttendees: maxAttendees
        )
        
        log("✅ Event created on blockchain: ".concat(title).concat(" with ID: ").concat(eventId))
      }
    }
  `,

  // Flow Actions auto-yield optimization
  AUTO_OPTIMIZE_YIELD: `
    import ShowUpStaking from 0xa19273383554e1e1
    
    transaction(eventId: String) {
      prepare(signer: auth(Storage) &Account) {
        // Future: Will integrate with Flow Actions for automated yield optimization
      }
      
      execute {
        log("🚀 Auto-yield optimization initiated for event: ".concat(eventId))
        log("📊 This transaction will be enhanced with Flow Actions")
        log("🎯 Future features:")
        log("   - Claim yields from Kitty Punch vaults")
        log("   - Claim FTSO delegation rewards") 
        log("   - Claim IncrementFi staking rewards")
        log("   - Auto-restake all yields back into ShowUp events")
      }
    }
  `,

  // Stake FLOW tokens for an event using your deployed contract
  STAKE_FOR_EVENT: `
    import ShowUpStaking from 0xa19273383554e1e1
    import FungibleToken from 0xf233dcee88fe0abe
    import FlowToken from 0x1654653399040a61

    transaction(eventId: String, stakeAmount: UFix64) {
      let userVault: &ShowUpStaking.StakeVault
      let paymentVault: @FlowToken.Vault
      
      prepare(signer: auth(Storage, Capabilities) &Account) {
        // Get or create stake vault
        if signer.storage.borrow<&ShowUpStaking.StakeVault>(from: ShowUpStaking.StakeVaultStoragePath) == nil {
          let stakeVault <- ShowUpStaking.createStakeVault()
          signer.storage.save(<-stakeVault, to: ShowUpStaking.StakeVaultStoragePath)
          
          let capability = signer.capabilities.storage.issue<&ShowUpStaking.StakeVault>(ShowUpStaking.StakeVaultStoragePath)
          signer.capabilities.publish(capability, at: ShowUpStaking.StakeVaultPublicPath)
        }
        
        // Get reference to user's stake vault
        self.userVault = signer.storage.borrow<&ShowUpStaking.StakeVault>(
          from: ShowUpStaking.StakeVaultStoragePath
        ) ?? panic("No stake vault found")
        
        // Get reference to user's Flow token vault
        let flowVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
          from: /storage/flowTokenVault
        ) ?? panic("No Flow token vault found")
        
        // Withdraw the stake amount
        let withdrawnVault <- flowVault.withdraw(amount: stakeAmount)
        self.paymentVault <- (withdrawnVault as! @FlowToken.Vault)
      }
      
      execute {
        // Deposit the stake
        self.userVault.depositStake(eventId: eventId, stake: <-self.paymentVault)
        log("✅ Successfully staked ".concat(stakeAmount.toString()).concat(" FLOW for event: ").concat(eventId))
      }
    }
  `,

  // Check in a user to an event (organizer only)
  CHECK_IN_USER: `
    import ShowUpEvents from 0xa19273383554e1e1

    transaction(eventId: String, userAddress: Address) {
      let eventsCollection: &ShowUpEvents.EventsCollection
      
      prepare(signer: auth(Storage) &Account) {
        self.eventsCollection = signer.storage.borrow<&ShowUpEvents.EventsCollection>(
          from: ShowUpEvents.EventsStoragePath
        ) ?? panic("No events collection found - only event creators can check in users")
      }
      
      execute {
        self.eventsCollection.checkInUser(eventId: eventId, user: userAddress)
        log("✅ User ".concat(userAddress.toString()).concat(" checked in for event: ").concat(eventId))
      }
    }
  `,

  // Return stake to checked-in user (simplified approach)
  RETURN_STAKE: `
    import ShowUpStaking from 0xa19273383554e1e1
    import FlowToken from 0x1654653399040a61
    import FungibleToken from 0xf233dcee88fe0abe

    transaction(eventId: String) {
      let userStakeVault: &ShowUpStaking.StakeVault
      let userFlowVault: &FlowToken.Vault
      
      prepare(signer: auth(Storage) &Account) {
        // Get the user's own stake vault (they withdraw their own stake)
        self.userStakeVault = signer.storage.borrow<&ShowUpStaking.StakeVault>(
          from: ShowUpStaking.StakeVaultStoragePath
        ) ?? panic("No stake vault found - you must have stakes to withdraw")
        
        // Get the user's Flow vault to receive the returned stake
        self.userFlowVault = signer.storage.borrow<&FlowToken.Vault>(
          from: /storage/flowTokenVault
        ) ?? panic("Could not borrow your Flow token vault")
      }
      
      execute {
        // User withdraws their own stake directly
        let returnedVault <- self.userStakeVault.withdrawStake(eventId: eventId)
        let amount = returnedVault.balance
        
        // Put the money back in their wallet
        self.userFlowVault.deposit(from: <-returnedVault)
        log("💰 Successfully returned ".concat(amount.toString()).concat(" FLOW stake for event: ").concat(eventId))
      }
    }
  `,

  // Forfeit stake from no-show user to organizer
  FORFEIT_STAKE: `
    import ShowUpStaking from 0xa19273383554e1e1
    import ShowUpEvents from 0xa19273383554e1e1
    import FlowToken from 0x1654653399040a61
    import FungibleToken from 0xf233dcee88fe0abe

    transaction(eventId: String, userAddress: Address) {
      let organizerStakeVault: &ShowUpStaking.StakeVault
      let organizerFlowVault: &FlowToken.Vault
      let eventsCollection: &ShowUpEvents.EventsCollection
      
      prepare(signer: auth(Storage) &Account) {
        self.eventsCollection = signer.storage.borrow<&ShowUpEvents.EventsCollection>(
          from: ShowUpEvents.EventsStoragePath
        ) ?? panic("Only event organizers can forfeit stakes")
        
        self.organizerStakeVault = signer.storage.borrow<&ShowUpStaking.StakeVault>(
          from: ShowUpStaking.StakeVaultStoragePath
        ) ?? panic("Organizer must have a stake vault")
        
        self.organizerFlowVault = signer.storage.borrow<&FlowToken.Vault>(
          from: /storage/flowTokenVault
        ) ?? panic("Could not borrow organizer's Flow token vault")
      }
      
      execute {
        let eventData = self.eventsCollection.getEvent(eventId: eventId)!
        assert(eventData.attendees.containsKey(userAddress), message: "User not registered for this event")
        assert(!eventData.attendees[userAddress]!, message: "Cannot forfeit stake from checked-in user")
        
        let forfeitedVault <- self.organizerStakeVault.forfeitStake(eventId: eventId.concat("-").concat(userAddress.toString()))
        let amount = forfeitedVault.balance
        
        self.organizerFlowVault.deposit(from: <-forfeitedVault)
        log("💸 Forfeited ".concat(amount.toString()).concat(" FLOW stake from no-show user: ").concat(userAddress.toString()).concat(" to organizer revenue"))
      }
    }
  `,

  // Get user's staked events from your deployed contract
  GET_USER_STAKES: `
    import ShowUpStaking from 0xa19273383554e1e1

    access(all) fun main(userAddress: Address): [String] {
      let account = getAccount(userAddress)
      
      let vaultRef = account.capabilities.get<&ShowUpStaking.StakeVault>(
        ShowUpStaking.StakeVaultPublicPath
      ).borrow()
      
      if vaultRef == nil {
        return []
      }
      
      return vaultRef!.getStakedEvents()
    }
  `,

  // Get all events from your deployed contract
  GET_ALL_EVENTS: `
    import ShowUpEvents from 0xa19273383554e1e1

    access(all) fun main(): [ShowUpEvents.EventData] {
      let account = getAccount(0xa19273383554e1e1)
      
      let eventsRef = account.capabilities.get<&ShowUpEvents.EventsCollection>(
        ShowUpEvents.EventsPublicPath
      ).borrow()
      
      if eventsRef == nil {
        return []
      }
      
      return eventsRef!.getAllEvents()
    }
  `,

  // Get specific event details
  GET_EVENT: `
    import ShowUpEvents from 0xa19273383554e1e1

    access(all) fun main(eventId: String): ShowUpEvents.EventData? {
      let account = getAccount(0xa19273383554e1e1)
      
      let eventsRef = account.capabilities.get<&ShowUpEvents.EventsCollection>(
        ShowUpEvents.EventsPublicPath
      ).borrow()
      
      if eventsRef == nil {
        return nil
      }
      
      return eventsRef!.getEvent(eventId: eventId)
    }
  `,

  // Get user's total staked amount for an event
  GET_STAKED_AMOUNT: `
    import ShowUpStaking from 0xa19273383554e1e1

    access(all) fun main(userAddress: Address, eventId: String): UFix64 {
      let account = getAccount(userAddress)
      
      let vaultRef = account.capabilities.get<&ShowUpStaking.StakeVault>(
        ShowUpStaking.StakeVaultPublicPath
      ).borrow()
      
      if vaultRef == nil {
        return 0.0
      }
      
      return vaultRef!.getStakedAmount(eventId: eventId)
    }
  `
};

// Flow utility functions
export class FlowService {
  static async authenticate() {
    try {
      await fcl.authenticate();
      return await fcl.currentUser().snapshot();
    } catch (error) {
      console.error("Flow authentication failed:", error);
      throw error;
    }
  }

  static async unauthenticate() {
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error("Flow unauthentication failed:", error);
      throw error;
    }
  }

  static async createEvent(eventData: Omit<EventData, 'id' | 'currentAttendees' | 'isActive' | 'attendees'>) {
    try {
      const txId = await fcl.mutate({
        cadence: CONTRACTS.CREATE_EVENT,
        args: (arg: any, t: any) => [
          arg(eventData.title, t.String),
          arg(eventData.description, t.String),
          arg(eventData.date, t.String),
          arg(eventData.location, t.String),
          arg(eventData.stakeAmount, t.UFix64),
          arg(parseInt(eventData.maxAttendees.toString()), t.UInt32)
        ],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return { txId, eventId: `event_${Date.now()}` }; // Return a temporary ID for frontend
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  }

  static async stakeForEvent(eventId: string, stakeAmount: string) {
    try {
      const txId = await fcl.mutate({
        cadence: CONTRACTS.STAKE_FOR_EVENT,
        args: (arg: any, t: any) => [
          arg(eventId, t.String),
          arg(stakeAmount, t.UFix64)
        ],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      console.error("Failed to stake for event:", error);
      throw error;
    }
  }

  static async checkInUser(eventId: string, userAddress: string) {
    try {
      const txId = await fcl.mutate({
        cadence: CONTRACTS.CHECK_IN_USER,
        args: (arg: any, t: any) => [
          arg(eventId, t.String),
          arg(userAddress, t.Address)
        ],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      console.error("Failed to check in user:", error);
      throw error;
    }
  }

  static async returnStake(eventId: string, userAddress: string) {
    try {
      const txId = await fcl.mutate({
        cadence: CONTRACTS.RETURN_STAKE,
        args: (arg: any, t: any) => [
          arg(eventId, t.String)
          // No userAddress needed - user withdraws their own stake
        ],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      console.error("Failed to return stake:", error);
      throw error;
    }
  }

  static async forfeitStake(eventId: string, userAddress: string) {
    try {
      const txId = await fcl.mutate({
        cadence: CONTRACTS.FORFEIT_STAKE,
        args: (arg: any, t: any) => [
          arg(eventId, t.String),
          arg(userAddress, t.Address)
        ],
        limit: 1000
      });

      await fcl.tx(txId).onceSealed();
      return txId;
    } catch (error) {
      console.error("Failed to forfeit stake:", error);
      throw error;
    }
  }

  static async getUserStakes(userAddress: string): Promise<string[]> {
    try {
      const result = await fcl.query({
        cadence: CONTRACTS.GET_USER_STAKES,
        args: (arg: any, t: any) => [
          arg(userAddress, t.Address)
        ]
      });
      return result || [];
    } catch (error) {
      console.error("Failed to get user stakes:", error);
      return [];
    }
  }

  static async getEvent(eventId: string): Promise<EventData | null> {
    try {
      const result = await fcl.query({
        cadence: CONTRACTS.GET_EVENT,
        args: (arg: any, t: any) => [
          arg(eventId, t.String)
        ]
      });
      return result;
    } catch (error) {
      console.error("Failed to get event:", error);
      return null;
    }
  }

  static async getAllEvents(): Promise<EventData[]> {
    try {
      const result = await fcl.query({
        cadence: CONTRACTS.GET_ALL_EVENTS
      });
      
      // Transform the blockchain data to match our EventData interface
      if (!result || !Array.isArray(result)) {
        return [];
      }
      
      return result.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        stakeAmount: event.stakeAmount.toString(),
        maxAttendees: parseInt(event.maxAttendees),
        currentAttendees: parseInt(event.currentAttendees),
        creator: event.creator,
        isActive: event.isActive,
        attendees: Object.keys(event.attendees || {})
      }));
    } catch (error) {
      console.error("Failed to get events from blockchain:", error);
      // Return empty array as fallback - frontend will handle gracefully
      return [];
    }
  }

  static async getStakedAmount(userAddress: string, eventId: string): Promise<string> {
    try {
      const result = await fcl.query({
        cadence: CONTRACTS.GET_STAKED_AMOUNT,
        args: (arg: any, t: any) => [
          arg(userAddress, t.Address),
          arg(eventId, t.String)
        ]
      });
      return result?.toString() || "0.0";
    } catch (error) {
      console.error("Failed to get staked amount:", error);
      return "0.0";
    }
  }

  static async getBalance(address: string): Promise<string> {
    try {
      // Use simple account balance (more reliable)
      const balance = await fcl.query({
        cadence: `
          access(all) fun main(address: Address): UFix64 {
            let account = getAccount(address)
            return account.balance
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      });
      return balance?.toString() || "0.0";
    } catch (error) {
      console.error("Failed to get account balance:", error);
      return "0.0";
    }
  }

  // Auto-optimize yields using Flow Actions
  static async autoOptimizeYield(eventId: string): Promise<string> {
    try {
      const result = await fcl.mutate({
        cadence: CONTRACTS.AUTO_OPTIMIZE_YIELD,
        args: (arg: any, t: any) => [arg(eventId, t.String)],
      });
      
      console.log('🚀 Auto-yield optimization initiated:', result);
      return result;
    } catch (error) {
      console.error('❌ Auto-yield optimization failed:', error);
      throw error;
    }
  }
}

export default FlowService;
