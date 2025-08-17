import ShowUpMVP from 0xa19273383554e1e1

// Transaction to create a new event
transaction(
    eventId: String,
    title: String,
    description: String,
    date: String,
    location: String,
    stakeAmount: UFix64,
    maxAttendees: UInt32
) {
    let eventManager: &ShowUpMVP.EventManager
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the event manager
        self.eventManager = signer.storage.borrow<&ShowUpMVP.EventManager>(
            from: ShowUpMVP.AdminStoragePath
        ) ?? panic("No event manager found")
    }
    
    execute {
        self.eventManager.createEvent(
            eventId: eventId,
            title: title,
            description: description,
            date: date,
            location: location,
            stakeAmount: stakeAmount,
            maxAttendees: maxAttendees,
            creator: self.eventManager.owner?.address ?? panic("No owner")
        )
        
        log("Event created successfully: ".concat(eventId))
    }
}
