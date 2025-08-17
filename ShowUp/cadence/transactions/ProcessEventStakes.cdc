import ShowUpMVP from 0xa19273383554e1e1
import FlowToken from 0x1654653399040a61

// Transaction to process all stakes after an event (return to attendees, forfeit no-shows)
transaction(eventId: String) {
    let eventManager: &ShowUpMVP.EventManager
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the event manager (only owner can process stakes)
        self.eventManager = signer.storage.borrow<&ShowUpMVP.EventManager>(
            from: ShowUpMVP.AdminStoragePath
        ) ?? panic("No event manager found - only organizer can process stakes")
    }
    
    execute {
        let registrations = self.eventManager.getEventRegistrations(eventId: eventId)
        var returned = 0
        var forfeited = 0
        
        for registration in registrations {
            if registration.stakeReturned {
                continue // Already processed
            }
            
            if registration.isCheckedIn {
                // Return stake to checked-in user
                let returnedVault <- self.eventManager.returnStake(eventId: eventId, username: registration.username)
                let amount = returnedVault.balance
                
                // Get user's vault and deposit
                let userVault = getAccount(registration.userAddress).capabilities.get<&FlowToken.Vault>(
                    /public/flowTokenReceiver
                ).borrow() ?? panic("Could not borrow user's vault for ".concat(registration.username))
                
                userVault.deposit(from: <-returnedVault)
                returned = returned + 1
                
                log("Returned ".concat(amount.toString()).concat(" FLOW to ").concat(registration.username))
                
            } else {
                // Forfeit stake to webapp creator
                self.eventManager.forfeitStakeToCreator(eventId: eventId, username: registration.username)
                forfeited = forfeited + 1
                
                log("Forfeited stake from no-show user: ".concat(registration.username))
            }
        }
        
        log("Event processing complete - Returned: ".concat(returned.toString()).concat(", Forfeited: ").concat(forfeited.toString()))
    }
}
