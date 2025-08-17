import ShowUpMVP from 0xa19273383554e1e1

// Script to get all registrations for an event
access(all) fun main(eventId: String): [ShowUpMVP.UserRegistration] {
    let eventManager = getAccount(0xa19273383554e1e1).capabilities.get<&ShowUpMVP.EventManager>(
        ShowUpMVP.AdminPublicPath
    ).borrow() ?? panic("Could not borrow event manager")
    
    return eventManager.getEventRegistrations(eventId: eventId)
}
