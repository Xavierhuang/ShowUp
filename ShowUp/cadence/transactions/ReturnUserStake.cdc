import ShowUpStaking from 0xa19273383554e1e1
import ShowUpEvents from 0xa19273383554e1e1
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Transaction to return stake to a checked-in user
transaction(eventId: String, userAddress: Address) {
    let organizerStakeVault: &ShowUpStaking.StakeVault
    let userVault: &FlowToken.Vault
    let eventsCollection: &ShowUpEvents.EventsCollection
    
    prepare(signer: auth(Storage) &Account) {
        // Verify the signer is the event organizer by checking events collection
        self.eventsCollection = signer.storage.borrow<&ShowUpEvents.EventsCollection>(
            from: ShowUpEvents.EventsStoragePath
        ) ?? panic("Only event organizers can return stakes")
        
        // Get reference to organizer's stake vault (where user stakes are held)
        self.organizerStakeVault = signer.storage.borrow<&ShowUpStaking.StakeVault>(
            from: ShowUpStaking.StakeVaultStoragePath
        ) ?? panic("Organizer must have a stake vault")
        
        // Get reference to user's Flow token vault for receiving the returned stake
        let userAccount = getAccount(userAddress)
        self.userVault = userAccount.capabilities.get<&FlowToken.Vault>(/public/flowTokenReceiver)
            .borrow() ?? panic("Could not borrow user's Flow token vault")
    }
    
    pre {
        self.eventsCollection.getEvent(eventId: eventId) != nil: "Event does not exist"
    }
    
    execute {
        // Verify the user is checked in for this event
        let event = self.eventsCollection.getEvent(eventId: eventId)!
        assert(event.attendees.containsKey(userAddress), message: "User not registered for this event")
        assert(event.attendees[userAddress]!, message: "User has not checked in yet")
        
        // Withdraw the user's stake from organizer's vault
        let returnedVault <- self.organizerStakeVault.withdrawStake(eventId: eventId.concat("-").concat(userAddress.toString()))
        let amount = returnedVault.balance
        
        // Return the stake to the user
        self.userVault.deposit(from: <-returnedVault)
        
        log("💰 Returned ".concat(amount.toString()).concat(" FLOW stake to user: ").concat(userAddress.toString()))
    }
}
