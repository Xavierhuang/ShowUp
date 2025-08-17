import ShowUpStaking from 0xa19273383554e1e1

// Script to check if a user has a stake vault
access(all) fun main(userAddress: Address): Bool {
    let account = getAccount(userAddress)
    
    // Check if the user has a stake vault in storage
    let vaultRef = account.capabilities.get<&ShowUpStaking.StakeVault>(
        ShowUpStaking.StakeVaultPublicPath
    ).borrow()
    
    return vaultRef != nil
}
