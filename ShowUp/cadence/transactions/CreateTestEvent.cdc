import ShowUpEvents from 0xa19273383554e1e1

// Create a test event using the existing contract
transaction(
    eventId: String,
    title: String,
    description: String,
    date: String,
    location: String,
    stakeAmount: UFix64,
    maxAttendees: UInt32
) {
    let eventsCollection: &ShowUpEvents.EventsCollection
    
    prepare(signer: auth(Storage) &Account) {
        // Get or create events collection
        if signer.storage.borrow<&ShowUpEvents.EventsCollection>(from: ShowUpEvents.EventsStoragePath) == nil {
            let collection <- ShowUpEvents.createEventsCollection()
            signer.storage.save(<-collection, to: ShowUpEvents.EventsStoragePath)
            
            let capability = signer.capabilities.storage.issue<&ShowUpEvents.EventsCollection>(ShowUpEvents.EventsStoragePath)
            signer.capabilities.publish(capability, at: ShowUpEvents.EventsPublicPath)
        }
        
        self.eventsCollection = signer.storage.borrow<&ShowUpEvents.EventsCollection>(
            from: ShowUpEvents.EventsStoragePath
        ) ?? panic("Could not borrow events collection")
    }
    
    execute {
        self.eventsCollection.createEvent(
            eventId: eventId,
            title: title,
            description: description,
            date: date,
            location: location,
            stakeAmount: stakeAmount,
            maxAttendees: maxAttendees,
            creator: self.eventsCollection.owner?.address ?? panic("No owner")
        )
        
        log("✅ Event created: ".concat(title).concat(" (").concat(eventId).concat(")"))
    }
}
