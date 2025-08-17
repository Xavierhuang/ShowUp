import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61
import ShowUpEvents from "./ShowUpEvents.cdc"

access(all) contract ShowUpStaking {
    
    // Events
    access(all) event StakeDeposited(eventId: String, user: Address, amount: UFix64)
    access(all) event StakeWithdrawn(eventId: String, user: Address, amount: UFix64)
    access(all) event StakeForfeited(eventId: String, user: Address, amount: UFix64)
    
    // Paths
    access(all) let StakeVaultStoragePath: StoragePath
    access(all) let StakeVaultPublicPath: PublicPath
    
    // Stake Vault Resource Interface
    access(all) resource interface StakeVaultPublic {
        access(all) fun getStakedAmount(eventId: String): UFix64
        access(all) fun getStakedEvents(): [String]
    }
    
    // Individual Stake Resource
    access(all) resource Stake {
        access(all) let eventId: String
        access(all) let vault: @FlowToken.Vault
        access(all) let timestamp: UFix64
        access(all) var isReturned: Bool
        
        init(eventId: String, vault: @FlowToken.Vault) {
            self.eventId = eventId
            self.vault <- vault
            self.timestamp = getCurrentBlock().timestamp
            self.isReturned = false
        }
        
        access(all) fun getAmount(): UFix64 {
            return self.vault.balance
        }
        
        access(contract) fun markReturned() {
            self.isReturned = true
        }
    }
    
    // Stake Vault Resource - holds all stakes for a user
    access(all) resource StakeVault: StakeVaultPublic {
        access(all) var stakes: @{String: Stake}
        
        init() {
            self.stakes <- {}
        }
        
        // Deposit stake for an event
        access(all) fun depositStake(eventId: String, stake: @FlowToken.Vault) {
            pre {
                !self.stakes.containsKey(eventId): "Already staked for this event"
                stake.balance > 0.0: "Stake amount must be greater than 0"
            }
            
            let amount = stake.balance
            let stakeResource <- create Stake(eventId: eventId, vault: <-stake)
            let oldStake <- self.stakes[eventId] <- stakeResource
            destroy oldStake
            
            emit StakeDeposited(eventId: eventId, user: self.owner?.address!, amount: amount)
        }
        
        // Withdraw stake after checking in
        access(all) fun withdrawStake(eventId: String): @FlowToken.Vault {
            pre {
                self.stakes.containsKey(eventId): "No stake found for this event"
            }
            
            let stake <- self.stakes.remove(key: eventId)!
            let amount = stake.getAmount()
            let vault <- stake.vault
            
            stake.markReturned()
            destroy stake
            
            emit StakeWithdrawn(eventId: eventId, user: self.owner?.address!, amount: amount)
            return <-vault
        }
        
        // Forfeit stake (called by contract owner for no-shows)
        access(contract) fun forfeitStake(eventId: String): @FlowToken.Vault {
            pre {
                self.stakes.containsKey(eventId): "No stake found for this event"
            }
            
            let stake <- self.stakes.remove(key: eventId)!
            let amount = stake.getAmount()
            let vault <- stake.vault
            
            destroy stake
            
            emit StakeForfeited(eventId: eventId, user: self.owner?.address!, amount: amount)
            return <-vault
        }
        
        access(all) fun getStakedAmount(eventId: String): UFix64 {
            if let stake = &self.stakes[eventId] as &Stake? {
                return stake.getAmount()
            }
            return 0.0
        }
        
        access(all) fun getStakedEvents(): [String] {
            return self.stakes.keys
        }
        
        access(all) fun getTotalStaked(): UFix64 {
            var total: UFix64 = 0.0
            for eventId in self.stakes.keys {
                total = total + self.getStakedAmount(eventId: eventId)
            }
            return total
        }
    }
    
    // Create Stake Vault
    access(all) fun createStakeVault(): @StakeVault {
        return <-create StakeVault()
    }
    
    // Public function to stake for an event
    access(all) fun stakeForEvent(
        userVault: &StakeVault, 
        paymentVault: @FlowToken.Vault, 
        eventId: String,
        eventsCollection: &ShowUpEvents.EventsCollection
    ) {
        pre {
            paymentVault.balance > 0.0: "Payment amount must be greater than 0"
        }
        
        let amount = paymentVault.balance
        
        // Deposit stake in user's vault
        userVault.depositStake(eventId: eventId, stake: <-paymentVault)
        
        // Record stake in events collection
        eventsCollection.stakeForEvent(
            eventId: eventId, 
            staker: userVault.owner?.address!, 
            amount: amount
        )
    }
    
    // Public function to check in and return stake
    access(all) fun checkInAndReturnStake(
        userVault: &StakeVault,
        eventId: String,
        eventsCollection: &ShowUpEvents.EventsCollection
    ): @FlowToken.Vault {
        // Check in user
        eventsCollection.checkInUser(eventId: eventId, user: userVault.owner?.address!)
        
        // Return stake
        return <-userVault.withdrawStake(eventId: eventId)
    }
    
    init() {
        self.StakeVaultStoragePath = /storage/ShowUpStakeVault
        self.StakeVaultPublicPath = /public/ShowUpStakeVault
    }
}
