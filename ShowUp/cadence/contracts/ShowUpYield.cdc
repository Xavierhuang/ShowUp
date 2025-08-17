import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

pub contract ShowUpYield {
    
    // Events
    pub event YieldGenerated(amount: UFix64, totalStakers: Int)
    pub event YieldClaimed(user: Address, amount: UFix64)
    
    // Paths
    pub let YieldVaultStoragePath: StoragePath
    pub let YieldVaultPublicPath: PublicPath
    
    // Global yield pool
    pub var totalYieldPool: UFix64
    pub var totalActiveStakes: UFix64
    
    init() {
        self.YieldVaultStoragePath = /storage/ShowUpYieldVault
        self.YieldVaultPublicPath = /public/ShowUpYieldVault
        self.totalYieldPool = 0.0
        self.totalActiveStakes = 0.0
    }
    
    // Enhanced Stake resource with yield tracking
    pub resource Stake {
        pub let amount: UFix64
        pub let eventId: String
        pub let timestamp: UFix64
        pub var lastYieldClaim: UFix64
        pub var accruedYield: UFix64
        
        init(amount: UFix64, eventId: String) {
            self.amount = amount
            self.eventId = eventId
            self.timestamp = getCurrentBlock().timestamp
            self.lastYieldClaim = getCurrentBlock().timestamp
            self.accruedYield = 0.0
        }
        
        // Calculate time-based yield (5% APY)
        pub fun calculateTimeYield(): UFix64 {
            let currentTime = getCurrentBlock().timestamp
            let timeStaked = currentTime - self.lastYieldClaim
            let annualRate = 0.05 // 5% APY
            let secondsInYear: UFix64 = 31536000.0
            
            return self.amount * annualRate * UFix64(timeStaked) / secondsInYear
        }
        
        // Calculate pool-based yield (from forfeitures)
        pub fun calculatePoolYield(): UFix64 {
            if ShowUpYield.totalActiveStakes == 0.0 {
                return 0.0
            }
            let userShare = self.amount / ShowUpYield.totalActiveStakes
            return userShare * ShowUpYield.totalYieldPool * 0.7 // 70% to stakers
        }
        
        pub fun getTotalYield(): UFix64 {
            return self.calculateTimeYield() + self.calculatePoolYield() + self.accruedYield
        }
        
        pub fun claimYield(): UFix64 {
            let totalYield = self.getTotalYield()
            self.accruedYield = 0.0
            self.lastYieldClaim = getCurrentBlock().timestamp
            return totalYield
        }
    }
    
    // Yield vault for managing user stakes with yield
    pub resource YieldVault {
        pub var stakes: @{String: Stake}
        pub var totalStaked: UFix64
        
        init() {
            self.stakes <- {}
            self.totalStaked = 0.0
        }
        
        pub fun addStake(eventId: String, amount: UFix64) {
            let stake <- create Stake(amount: amount, eventId: eventId)
            
            self.totalStaked = self.totalStaked + amount
            ShowUpYield.totalActiveStakes = ShowUpYield.totalActiveStakes + amount
            
            self.stakes[eventId] <-! stake
        }
        
        pub fun claimYield(eventId: String): UFix64 {
            pre {
                self.stakes.containsKey(eventId): "No stake found for this event"
            }
            
            let stakeRef = &self.stakes[eventId] as &Stake
            return stakeRef.claimYield()
        }
        
        pub fun withdrawStake(eventId: String): @FlowToken.Vault {
            pre {
                self.stakes.containsKey(eventId): "No stake found for this event"
            }
            
            let stake <- self.stakes.remove(key: eventId)!
            let amount = stake.amount
            let totalYield = stake.claimYield()
            
            self.totalStaked = self.totalStaked - amount
            ShowUpYield.totalActiveStakes = ShowUpYield.totalActiveStakes - amount
            
            destroy stake
            
            // Return principal + yield
            let yieldVault <- ShowUpYield.mintYield(amount: totalYield)
            let principalVault <- FlowToken.createEmptyVault() as! @FlowToken.Vault
            principalVault.deposit(from: <- yieldVault)
            
            return <- principalVault
        }
        
        pub fun getStakeWithYield(eventId: String): {String: UFix64} {
            if let stakeRef = &self.stakes[eventId] as &Stake? {
                return {
                    "principal": stakeRef.amount,
                    "timeYield": stakeRef.calculateTimeYield(),
                    "poolYield": stakeRef.calculatePoolYield(),
                    "totalYield": stakeRef.getTotalYield(),
                    "total": stakeRef.amount + stakeRef.getTotalYield()
                }
            }
            return {}
        }
        
        destroy() {
            destroy self.stakes
        }
    }
    
    // Add yield to global pool (from forfeitures)
    pub fun addYieldToPool(amount: UFix64) {
        self.totalYieldPool = self.totalYieldPool + amount
        emit YieldGenerated(amount: amount, totalStakers: Int(self.totalActiveStakes))
    }
    
    // Mint yield tokens (simplified - in production, use proper treasury)
    access(self) fun mintYield(amount: UFix64): @FlowToken.Vault {
        // In a real implementation, this would come from:
        // 1. DeFi protocol returns
        // 2. Platform treasury
        // 3. Forfeited stakes
        return <- FlowToken.createEmptyVault() as! @FlowToken.Vault
    }
    
    // Create yield vault for user
    pub fun createYieldVault(): @YieldVault {
        return <- create YieldVault()
    }
    
    // Public interface
    pub resource interface YieldPublic {
        pub fun getStakeWithYield(eventId: String): {String: UFix64}
        pub fun getTotalStaked(): UFix64
    }
}
