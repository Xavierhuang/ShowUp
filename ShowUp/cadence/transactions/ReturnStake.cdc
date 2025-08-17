import ShowUpMVP from 0xa19273383554e1e1
import FlowToken from 0x1654653399040a61

// Transaction to return stakes to checked-in users OR forfeit to creator
transaction(eventId: String, username: String, action: String, recipientAddress: Address?) {
    let eventManager: &ShowUpMVP.EventManager
    let recipientVault: &FlowToken.Vault?
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the event manager (only owner can manage stakes)
        self.eventManager = signer.storage.borrow<&ShowUpMVP.EventManager>(
            from: ShowUpMVP.AdminStoragePath
        ) ?? panic("No event manager found - only organizer can manage stakes")
        
        // If returning stake, get recipient's vault
        if action == "return" && recipientAddress != nil {
            self.recipientVault = getAccount(recipientAddress!).capabilities.get<&FlowToken.Vault>(
                /public/flowTokenReceiver
            ).borrow() ?? panic("Could not borrow recipient's vault")
        } else {
            self.recipientVault = nil
        }
    }
    
    execute {
        if action == "return" {
            // Return stake to user who checked in
            let returnedVault <- self.eventManager.returnStake(eventId: eventId, username: username)
            let amount = returnedVault.balance
            
            self.recipientVault!.deposit(from: <-returnedVault)
            log("Stake returned: ".concat(amount.toString()).concat(" FLOW to user: ").concat(username))
            
        } else if action == "forfeit" {
            // Forfeit stake to webapp creator
            self.eventManager.forfeitStakeToCreator(eventId: eventId, username: username)
            log("Stake forfeited to webapp creator for no-show user: ".concat(username))
        } else {
            panic("Invalid action. Use 'return' or 'forfeit'")
        }
    }
}
