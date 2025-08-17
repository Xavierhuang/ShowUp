import "FungibleToken"
import "FlowToken"
import "DeFiActions"
import "SwapConnectors"
import "IncrementFiStakingConnectors"
import "IncrementFiPoolLiquidityConnectors"
import "Staking"
import "ShowUpStaking"

// ShowUp Auto-Yield Optimization using Flow Actions
// Source → Swap → Sink pattern for automated yield farming
transaction(eventId: String) {
    
    // Flow Actions components
    let rewardsSource: IncrementFiStakingConnectors.PoolRewardsSource
    let zapper: IncrementFiPoolLiquidityConnectors.Zapper
    let lpSource: SwapConnectors.SwapSource
    let showUpSink: ShowUpStaking.StakeSink
    
    // Tracking and validation
    let startingStake: UFix64
    let expectedStakeIncrease: UFix64
    let operationID: DeFiActions.UniqueIdentifier
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        
        // Create unique identifier for tracing this operation
        self.operationID = DeFiActions.createUniqueIdentifier()
        
        // Get user's ShowUp stake vault for validation
        let showUpVault = signer.storage.borrow<&ShowUpStaking.StakeVault>(
            from: ShowUpStaking.StakeVaultStoragePath
        ) ?? panic("No ShowUp stake vault found")
        
        // Record starting stake for post-condition verification
        self.startingStake = showUpVault.getStakedAmount(eventId: eventId)
        
        // Create rewards source from IncrementFi staking pool
        // This claims available stFLOW rewards from the user's staking position
        self.rewardsSource = IncrementFiStakingConnectors.PoolRewardsSource(
            userCertificate: signer.capabilities.storage.issue<&Staking.UserCertificate>(
                Staking.UserCertificateStoragePath
            ),
            pid: 199, // FLOW-stFLOW pool ID
            uniqueID: self.operationID
        )
        
        // Create zapper to convert rewards to LP tokens
        // This swaps stFLOW → FLOW → LP tokens for the FLOW-stFLOW pool
        self.zapper = IncrementFiPoolLiquidityConnectors.Zapper(
            token0Type: Type<@FlowToken.Vault>(),  // FLOW
            token1Type: Type<@Staking.Vault>(),    // stFLOW
            stableMode: false,
            uniqueID: self.operationID
        )
        
        // Compose rewards source with zapper
        // This creates a single source that claims rewards and converts them to LP tokens
        self.lpSource = SwapConnectors.SwapSource(
            swapper: self.zapper,
            source: self.rewardsSource,
            uniqueID: self.operationID
        )
        
        // Create ShowUp sink to receive the LP tokens
        // This will automatically restake the LP tokens back into the user's ShowUp event
        self.showUpSink = ShowUpStaking.StakeSink(
            eventId: eventId,
            userVault: showUpVault,
            uniqueID: self.operationID
        )
        
        // Calculate expected stake increase for safety validation
        self.expectedStakeIncrease = self.zapper.quoteOut(
            forProvided: self.lpSource.minimumAvailable(),
            reverse: false
        ).outAmount
    }
    
    execute {
        // Execute the complete Flow Actions chain atomically:
        // 1. Claim rewards from IncrementFi staking pool
        // 2. Convert rewards to LP tokens via zapper
        // 3. Deposit LP tokens back into ShowUp event
        
        // Withdraw LP tokens from the composed source
        let lpTokens <- self.lpSource.withdrawAvailable(
            maxAmount: self.showUpSink.minimumCapacity()
        )
        
        // Deposit LP tokens into ShowUp sink
        self.showUpSink.depositCapacity(
            from: &lpTokens as auth(FungibleToken.Withdraw) &{FungibleToken.Vault}
        )
        
        // Ensure no residual tokens remain
        assert(lpTokens.balance == 0.0, message: "Residual tokens after deposit")
        destroy lpTokens
        
        log("🚀 Auto-yield optimization completed for event: ".concat(eventId))
        log("📊 LP tokens restaked: ".concat(self.expectedStakeIncrease.toString()))
        log("🆔 Operation ID: ".concat(self.operationID.toString()))
    }
    
    post {
        // Verify that the user's ShowUp stake actually increased
        let finalStake = getAccount(self.account).storage.borrow<&ShowUpStaking.StakeVault>(
            from: ShowUpStaking.StakeVaultStoragePath
        )?.getStakedAmount(eventId: eventId) ?? 0.0
        
        finalStake >= self.startingStake + self.expectedStakeIncrease:
            "Auto-yield optimization failed to increase stake as expected"
    }
}
