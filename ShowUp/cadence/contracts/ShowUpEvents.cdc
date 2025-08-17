access(all) contract ShowUpEvents {
    
    // Events
    access(all) event ContractInitialized()
    access(all) event EventCreated(eventId: String, creator: Address, title: String, stakeAmount: UFix64)
    access(all) event UserStaked(eventId: String, user: Address, amount: UFix64)
    access(all) event UserCheckedIn(eventId: String, user: Address)
    access(all) event StakeReturned(eventId: String, user: Address, amount: UFix64)
    
    // Paths
    access(all) let EventsStoragePath: StoragePath
    access(all) let EventsPublicPath: PublicPath
    
    // Event Data Structure
    access(all) struct EventData {
        access(all) let id: String
        access(all) let title: String
        access(all) let description: String
        access(all) let date: String
        access(all) let location: String
        access(all) let stakeAmount: UFix64
        access(all) let maxAttendees: UInt32
        access(all) var currentAttendees: UInt32
        access(all) let creator: Address
        access(all) var isActive: Bool
        access(all) let attendees: {Address: Bool} // Address -> isCheckedIn
        
        init(
            id: String, 
            title: String, 
            description: String, 
            date: String, 
            location: String, 
            stakeAmount: UFix64, 
            maxAttendees: UInt32, 
            creator: Address
        ) {
            self.id = id
            self.title = title
            self.description = description
            self.date = date
            self.location = location
            self.stakeAmount = stakeAmount
            self.maxAttendees = maxAttendees
            self.currentAttendees = 0
            self.creator = creator
            self.isActive = true
            self.attendees = {}
        }
        
        access(contract) fun addAttendee(user: Address) {
            self.attendees[user] = false
            self.currentAttendees = self.currentAttendees + 1
        }
        
        access(contract) fun checkInUser(user: Address) {
            self.attendees[user] = true
        }
    }
    
    // Stake Data Structure
    access(all) struct StakeData {
        access(all) let eventId: String
        access(all) let user: Address
        access(all) let amount: UFix64
        access(all) let timestamp: UFix64
        access(all) var isCheckedIn: Bool
        
        init(eventId: String, user: Address, amount: UFix64) {
            self.eventId = eventId
            self.user = user
            self.amount = amount
            self.timestamp = getCurrentBlock().timestamp
            self.isCheckedIn = false
        }
        
        access(contract) fun checkIn() {
            self.isCheckedIn = true
        }
    }
    
    // Public Interface for Events Collection
    access(all) resource interface EventsCollectionPublic {
        access(all) fun getEvent(eventId: String): EventData?
        access(all) fun getAllEvents(): [EventData]
        access(all) fun getUserStakes(user: Address): [StakeData]
    }
    
    // Events Collection Resource
    access(all) resource EventsCollection: EventsCollectionPublic {
        access(all) var events: {String: EventData}
        access(all) var stakes: {Address: [StakeData]}
        
        init() {
            self.events = {}
            self.stakes = {}
        }
        
        access(all) fun createEvent(
            title: String, 
            description: String, 
            date: String, 
            location: String, 
            stakeAmount: UFix64, 
            maxAttendees: UInt32
        ): String {
            let creator = self.owner?.address ?? panic("No owner address")
            let eventId = title.concat("-").concat(getCurrentBlock().timestamp.toString())
            
            let eventData = EventData(
                id: eventId,
                title: title,
                description: description,
                date: date,
                location: location,
                stakeAmount: stakeAmount,
                maxAttendees: maxAttendees,
                creator: creator
            )
            
            self.events[eventId] = eventData
            
            emit EventCreated(
                eventId: eventId, 
                creator: creator, 
                title: title, 
                stakeAmount: stakeAmount
            )
            
            return eventId
        }
        
        access(all) fun stakeForEvent(eventId: String, staker: Address, amount: UFix64) {
            pre {
                self.events[eventId] != nil: "Event does not exist"
                self.events[eventId]!.isActive: "Event is not active"
                self.events[eventId]!.currentAttendees < self.events[eventId]!.maxAttendees: "Event is full"
            }
            
            // Check if user already staked
            let userStakes = self.stakes[staker] ?? []
            for stake in userStakes {
                if stake.eventId == eventId {
                    panic("User already staked for this event")
                }
            }
            
            let stake = StakeData(eventId: eventId, user: staker, amount: amount)
            
            if self.stakes[staker] == nil {
                self.stakes[staker] = []
            }
            self.stakes[staker]!.append(stake)
            
            // Add user to event attendees
            self.events[eventId]!.addAttendee(user: staker)
            
            emit UserStaked(eventId: eventId, user: staker, amount: amount)
        }
        
        access(all) fun checkInUser(eventId: String, user: Address) {
            pre {
                self.events[eventId] != nil: "Event does not exist"
            }
            
            // Mark user as checked in the event
            self.events[eventId]!.checkInUser(user: user)
            
            // Mark stake as checked in
            if let userStakes = self.stakes[user] {
                for i, stake in userStakes {
                    if stake.eventId == eventId {
                        userStakes[i].checkIn()
                        break
                    }
                }
            }
            
            emit UserCheckedIn(eventId: eventId, user: user)
        }
        
        access(all) fun getEvent(eventId: String): EventData? {
            return self.events[eventId]
        }
        
        access(all) fun getAllEvents(): [EventData] {
            return self.events.values
        }
        
        access(all) fun getUserStakes(user: Address): [StakeData] {
            return self.stakes[user] ?? []
        }
    }
    
    // Create Events Collection
    access(all) fun createEventsCollection(): @EventsCollection {
        return <-create EventsCollection()
    }
    
    init() {
        // Set storage paths
        self.EventsStoragePath = /storage/ShowUpEventsCollection
        self.EventsPublicPath = /public/ShowUpEventsCollection
        
        // Create and store the events collection
        let collection <- create EventsCollection()
        self.account.storage.save(<-collection, to: self.EventsStoragePath)
        
        // Create public capability
        let cap = self.account.capabilities.storage.issue<&EventsCollection>(self.EventsStoragePath)
        self.account.capabilities.publish(cap, at: self.EventsPublicPath)
        
        emit ContractInitialized()
    }
}
