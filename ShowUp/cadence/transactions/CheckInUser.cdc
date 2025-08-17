import ShowUpEvents from 0xa19273383554e1e1

// Transaction for event organizers to check in attendees
transaction(eventId: String, userAddress: Address) {
    let eventsCollection: &ShowUpEvents.EventsCollection
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the organizer's events collection
        self.eventsCollection = signer.storage.borrow<&ShowUpEvents.EventsCollection>(
            from: ShowUpEvents.EventsStoragePath
        ) ?? panic("No events collection found - only event creators can check in users")
    }
    
    execute {
        // Check in the user for the specified event
        self.eventsCollection.checkInUser(eventId: eventId, user: userAddress)
        log("✅ User ".concat(userAddress.toString()).concat(" checked in for event: ").concat(eventId))
    }
}