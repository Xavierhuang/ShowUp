import ShowUpMVP from 0xa19273383554e1e1

// Script to get event statistics
access(all) fun main(eventId: String): {String: UInt32} {
    let eventManager = getAccount(0xa19273383554e1e1).capabilities.get<&ShowUpMVP.EventManager>(
        ShowUpMVP.AdminPublicPath
    ).borrow() ?? panic("Could not borrow event manager")
    
    return eventManager.getEventStats(eventId: eventId)
}
