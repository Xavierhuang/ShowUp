import ShowUpMVP from 0xa19273383554e1e1

// Script to get all events
access(all) fun main(): [ShowUpMVP.EventData] {
    let eventManager = getAccount(0xa19273383554e1e1).capabilities.get<&ShowUpMVP.EventManager>(
        ShowUpMVP.AdminPublicPath
    ).borrow() ?? panic("Could not borrow event manager")
    
    return eventManager.getAllEvents()
}
