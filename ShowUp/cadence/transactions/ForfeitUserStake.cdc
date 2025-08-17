import ShowUpStaking from 0xa19273383554e1e1
import ShowUpEvents from 0xa19273383554e1e1
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

// Transaction to forfeit stake from no-show user to organizer (platform revenue)
transaction(eventId: String, userAddress: Address) {
    let organizerStakeVault: &ShowUpStaking.StakeVault
    let organizerFlowVault: &FlowToken.Vault
    let eventsCollection: &ShowUpEvents.EventsCollection
    
    prepare(signer: auth(Storage) &Account) {
        // Verify the signer is the event organizer
        self.eventsCollection = signer.storage.borrow<&ShowUpEvents.EventsCollection>(
            from: ShowUpEvents.EventsStoragePath
        ) ?? panic("Only event organizers can forfeit stakes")
        
        // Get reference to organizer's stake vault (where user stakes are held)
        self.organizerStakeVault = signer.storage.borrow<&ShowUpStaking.StakeVault>(
            from: ShowUpStaking.StakeVaultStoragePath
        ) ?? panic("Organizer must have a stake vault")
        
        // Get reference to organizer's Flow token vault for receiving forfeited funds
        self.organizerFlowVault = signer.storage.borrow<&FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow organizer's Flow token vault")
    }
    
    pre {
        self.eventsCollection.getEvent(eventId: eventId) != nil: "Event does not exist"
    }
    
    execute {
        // Verify the user is registered but NOT checked in
        let event = self.eventsCollection.getEvent(eventId: eventId)!
        assert(event.attendees.containsKey(userAddress), message: "User not registered for this event")
        assert(!event.attendees[userAddress]!, message: "Cannot forfeit stake from checked-in user")
        
        // Forfeit the user's stake to organizer (platform revenue!)
        let forfeitedVault <- self.organizerStakeVault.forfeitStake(eventId: eventId.concat("-").concat(userAddress.toString()))
        let amount = forfeitedVault.balance
        
        // Add forfeited stake to organizer's revenue
        self.organizerFlowVault.deposit(from: <-forfeitedVault)
        
        log("💸 Forfeited ".concat(amount.toString()).concat(" FLOW stake from no-show user: ").concat(userAddress.toString()).concat(" to organizer revenue"))
    }
}
