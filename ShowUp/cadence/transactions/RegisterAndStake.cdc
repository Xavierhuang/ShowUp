import ShowUpMVP from 0xa19273383554e1e1
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Transaction for users to register and stake for an event
transaction(eventId: String, username: String) {
    let eventManager: &ShowUpMVP.EventManager
    let userVault: @FlowToken.Vault
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the event manager
        self.eventManager = getAccount(0xa19273383554e1e1).capabilities.get<&ShowUpMVP.EventManager>(
            ShowUpMVP.AdminPublicPath
        ).borrow() ?? panic("Could not borrow event manager")
        
        // Get the event to know the stake amount
        let event = self.eventManager.getEvent(eventId: eventId) ?? panic("Event not found")
        let stakeAmount = event.stakeAmount
        
        // Get user's Flow token vault
        let flowVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("No Flow token vault found")
        
        // Withdraw the required stake
        let withdrawnVault <- flowVault.withdraw(amount: stakeAmount)
        self.userVault <- (withdrawnVault as! @FlowToken.Vault)
    }
    
    execute {
        self.eventManager.registerAndStake(
            eventId: eventId,
            username: username,
            userAddress: self.userVault.owner?.address ?? panic("No owner"),
            stakeVault: <-self.userVault
        )
        
        log("Successfully registered and staked for event: ".concat(eventId).concat(" with username: ").concat(username))
    }
}
