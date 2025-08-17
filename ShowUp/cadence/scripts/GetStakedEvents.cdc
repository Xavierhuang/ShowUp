import ShowUpStaking from 0xa19273383554e1e1

// Script to get all events a user has staked for
access(all) fun main(userAddress: Address): [String] {
    let account = getAccount(userAddress)
    
    // Get reference to the user's stake vault
    let vaultRef = account.capabilities.get<&ShowUpStaking.StakeVault>(
        ShowUpStaking.StakeVaultPublicPath
    ).borrow()
    
    if vaultRef == nil {
        return []
    }
    
    return vaultRef!.getStakedEvents()
}
