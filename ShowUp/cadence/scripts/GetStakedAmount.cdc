import ShowUpStaking from 0xa19273383554e1e1

// Script to get the amount staked for a specific event
access(all) fun main(userAddress: Address, eventId: String): UFix64 {
    let account = getAccount(userAddress)
    
    // Get reference to the user's stake vault
    let vaultRef = account.capabilities.get<&ShowUpStaking.StakeVault>(
        ShowUpStaking.StakeVaultPublicPath
    ).borrow()
    
    if vaultRef == nil {
        return 0.0
    }
    
    return vaultRef!.getStakedAmount(eventId: eventId)
}
