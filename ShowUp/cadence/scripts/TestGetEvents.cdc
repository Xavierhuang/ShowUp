import ShowUpEvents from 0xa19273383554e1e1

// Get all events from the contract
access(all) fun main(): [ShowUpEvents.EventData] {
    let account = getAccount(0xa19273383554e1e1)
    
    let eventsRef = account.capabilities.get<&ShowUpEvents.EventsCollection>(
        ShowUpEvents.EventsPublicPath
    ).borrow()
    
    if eventsRef == nil {
        log("No events collection found")
        return []
    }
    
    return eventsRef!.getAllEvents()
}
