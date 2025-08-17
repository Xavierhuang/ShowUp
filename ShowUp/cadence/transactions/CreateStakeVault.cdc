import ShowUpStaking from 0xa19273383554e1e1

// Transaction to create a stake vault for the user
transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if the user already has a stake vault
        if signer.storage.borrow<&ShowUpStaking.StakeVault>(from: ShowUpStaking.StakeVaultStoragePath) == nil {
            // Create a new stake vault
            let stakeVault <- ShowUpStaking.createStakeVault()
            
            // Store it in the user's storage
            signer.storage.save(<-stakeVault, to: ShowUpStaking.StakeVaultStoragePath)
            
            // Create a public capability
            let capability = signer.capabilities.storage.issue<&ShowUpStaking.StakeVault>(ShowUpStaking.StakeVaultStoragePath)
            signer.capabilities.publish(capability, at: ShowUpStaking.StakeVaultPublicPath)
        }
    }
    
    execute {
        log("Stake vault created successfully")
    }
}
