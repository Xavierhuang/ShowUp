import ShowUpStaking from 0xa19273383554e1e1
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Transaction to deposit a stake for a test event
transaction(eventId: String, amount: UFix64) {
    let userVault: &ShowUpStaking.StakeVault
    let paymentVault: @FlowToken.Vault
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the user's stake vault
        self.userVault = signer.storage.borrow<&ShowUpStaking.StakeVault>(
            from: ShowUpStaking.StakeVaultStoragePath
        ) ?? panic("No stake vault found")
        
        // Get reference to user's Flow token vault
        let flowVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("No Flow token vault found")
        
        // Withdraw the stake amount
        let withdrawnVault <- flowVault.withdraw(amount: amount)
        self.paymentVault <- (withdrawnVault as! @FlowToken.Vault)
    }
    
    execute {
        // Deposit the stake
        self.userVault.depositStake(eventId: eventId, stake: <-self.paymentVault)
        log("Successfully staked ".concat(amount.toString()).concat(" FLOW for event: ").concat(eventId))
    }
}
