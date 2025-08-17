import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe

access(all) contract ShowUpSimple {
    
    // Events
    access(all) event EventCreated(eventId: String, creator: Address, title: String, stakeAmount: UFix64)
    access(all) event UserRegistered(eventId: String, user: Address, username: String, amount: UFix64)
    access(all) event UserCheckedIn(eventId: String, user: Address, username: String)
    access(all) event StakeReturned(eventId: String, user: Address, username: String, amount: UFix64)
    access(all) event StakeForfeited(eventId: String, user: Address, username: String, amount: UFix64)
    
    // Paths
    access(all) let AdminStoragePath: StoragePath
    access(all) let AdminPublicPath: PublicPath
    
    // User Registration Data
    access(all) struct UserRegistration {
        access(all) let userAddress: Address
        access(all) let username: String
        access(all) let stakeAmount: UFix64
        access(all) let registrationTime: UFix64
        access(all) var isCheckedIn: Bool
        access(all) var stakeReturned: Bool
        
        init(userAddress: Address, username: String, stakeAmount: UFix64) {
            self.userAddress = userAddress
            self.username = username
            self.stakeAmount = stakeAmount
            self.registrationTime = getCurrentBlock().timestamp
            self.isCheckedIn = false
            self.stakeReturned = false
        }
        
        access(contract) fun checkIn() {
            self.isCheckedIn = true
        }
        
        access(contract) fun markStakeReturned() {
            self.stakeReturned = true
        }
    }
    
    // Event Data
    access(all) struct EventData {
        access(all) let id: String
        access(all) let title: String
        access(all) let description: String
        access(all) let date: String
        access(all) let location: String
        access(all) let stakeAmount: UFix64
        access(all) let maxAttendees: UInt32
        access(all) let creator: Address
        access(all) var isActive: Bool
        access(all) let creationTime: UFix64
        
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
            self.creator = creator
            self.isActive = true
            self.creationTime = getCurrentBlock().timestamp
        }
        
        access(contract) fun deactivate() {
            self.isActive = false
        }
    }
    
    // Public Interface
    access(all) resource interface EventManagerPublic {
        access(all) fun getEvent(eventId: String): EventData?
        access(all) fun getAllEvents(): [EventData]
        access(all) fun getEventRegistrations(eventId: String): [UserRegistration]
        access(all) fun getUserRegistration(eventId: String, username: String): UserRegistration?
        access(all) fun isUserRegistered(eventId: String, userAddress: Address): Bool
        access(all) fun getTotalStakePool(eventId: String): UFix64
    }
    
    // Main Event Manager Resource
    access(all) resource EventManager: EventManagerPublic {
        access(all) var events: {String: EventData}
        access(all) var eventRegistrations: {String: {String: UserRegistration}}
        access(all) var totalStakes: {String: UFix64} // eventId -> total stakes collected
        access(all) var usernameToAddress: {String: Address}
        access(all) let vault: @FlowToken.Vault
        
        init() {
            self.events = {}
            self.eventRegistrations = {}
            self.totalStakes = {}
            self.usernameToAddress = {}
            self.vault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as! @FlowToken.Vault
        }
        
        // Create an event
        access(all) fun createEvent(
            eventId: String,
            title: String,
            description: String,
            date: String,
            location: String,
            stakeAmount: UFix64,
            maxAttendees: UInt32,
            creator: Address
        ) {
            pre {
                !self.events.containsKey(eventId): "Event already exists"
                stakeAmount > 0.0: "Stake amount must be greater than 0"
            }
            
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
            self.eventRegistrations[eventId] = {}
            self.totalStakes[eventId] = 0.0
            
            emit EventCreated(eventId: eventId, creator: creator, title: title, stakeAmount: stakeAmount)
        }
        
        // Register and stake for an event
        access(all) fun registerAndStake(
            eventId: String,
            username: String,
            userAddress: Address,
            stakeVault: @FlowToken.Vault
        ) {
            pre {
                self.events.containsKey(eventId): "Event does not exist"
                self.events[eventId]!.isActive: "Event is not active"
                stakeVault.balance == self.events[eventId]!.stakeAmount: "Incorrect stake amount"
                !self.eventRegistrations[eventId]!.containsKey(username): "Username already registered for this event"
                UInt32(self.eventRegistrations[eventId]!.keys.length) < self.events[eventId]!.maxAttendees: "Event is full"
            }
            
            // Check if username is already taken globally
            if self.usernameToAddress.containsKey(username) {
                assert(self.usernameToAddress[username]! == userAddress, message: "Username already taken by another user")
            } else {
                self.usernameToAddress[username] = userAddress
            }
            
            let stakeAmount = stakeVault.balance
            
            let registration = UserRegistration(
                userAddress: userAddress,
                username: username,
                stakeAmount: stakeAmount
            )
            
            // Store the stake in main vault
            self.vault.deposit(from: <-stakeVault)
            self.totalStakes[eventId] = self.totalStakes[eventId]! + stakeAmount
            
            // Register the user
            self.eventRegistrations[eventId]![username] = registration
            
            emit UserRegistered(eventId: eventId, user: userAddress, username: username, amount: stakeAmount)
        }
        
        // Check in a user (called by organizer)
        access(all) fun checkInUser(eventId: String, username: String) {
            pre {
                self.events.containsKey(eventId): "Event does not exist"
                self.eventRegistrations[eventId]!.containsKey(username): "User not registered for this event"
                !self.eventRegistrations[eventId]![username]!.isCheckedIn: "User already checked in"
            }
            
            let registration = &self.eventRegistrations[eventId]![username] as &UserRegistration?
            registration!.checkIn()
            
            emit UserCheckedIn(eventId: eventId, user: registration!.userAddress, username: username)
        }
        
        // Return stake to checked-in user
        access(all) fun returnStake(eventId: String, username: String): @FlowToken.Vault {
            pre {
                self.events.containsKey(eventId): "Event does not exist"
                self.eventRegistrations[eventId]!.containsKey(username): "User not registered"
                self.eventRegistrations[eventId]![username]!.isCheckedIn: "User has not checked in"
                !self.eventRegistrations[eventId]![username]!.stakeReturned: "Stake already returned"
            }
            
            let registration = &self.eventRegistrations[eventId]![username] as &UserRegistration?
            let stakeAmount = registration!.stakeAmount
            
            registration!.markStakeReturned()
            
            let returnVault <- self.vault.withdraw(amount: stakeAmount)
            
            emit StakeReturned(eventId: eventId, user: registration!.userAddress, username: username, amount: stakeAmount)
            
            return <-(returnVault as! @FlowToken.Vault)
        }
        
        // Forfeit stake for no-show and send to webapp creator
        access(all) fun forfeitStakeToCreator(eventId: String, username: String) {
            pre {
                self.events.containsKey(eventId): "Event does not exist"
                self.eventRegistrations[eventId]!.containsKey(username): "User not registered"
                !self.eventRegistrations[eventId]![username]!.isCheckedIn: "User has checked in"
                !self.eventRegistrations[eventId]![username]!.stakeReturned: "Stake already processed"
            }
            
            let registration = &self.eventRegistrations[eventId]![username] as &UserRegistration?
            let stakeAmount = registration!.stakeAmount
            
            registration!.markStakeReturned()
            
            // Note: Forfeited stake stays in contract (belongs to creator)
            // No need to withdraw - it's already in our vault
            
            emit StakeForfeited(eventId: eventId, user: registration!.userAddress, username: username, amount: stakeAmount)
        }
        
        // Creator can withdraw forfeited stakes
        access(all) fun withdrawForfeitedStakes(amount: UFix64): @FlowToken.Vault {
            let withdrawVault <- self.vault.withdraw(amount: amount)
            return <-(withdrawVault as! @FlowToken.Vault)
        }
        
        // View functions
        access(all) fun getEvent(eventId: String): EventData? {
            return self.events[eventId]
        }
        
        access(all) fun getAllEvents(): [EventData] {
            return self.events.values
        }
        
        access(all) fun getEventRegistrations(eventId: String): [UserRegistration] {
            if let registrations = self.eventRegistrations[eventId] {
                return registrations.values
            }
            return []
        }
        
        access(all) fun getUserRegistration(eventId: String, username: String): UserRegistration? {
            return self.eventRegistrations[eventId]?[username]
        }
        
        access(all) fun isUserRegistered(eventId: String, userAddress: Address): Bool {
            if let registrations = self.eventRegistrations[eventId] {
                for registration in registrations.values {
                    if registration.userAddress == userAddress {
                        return true
                    }
                }
            }
            return false
        }
        
        access(all) fun getTotalStakePool(eventId: String): UFix64 {
            return self.totalStakes[eventId] ?? 0.0
        }
        
        access(all) fun getVaultBalance(): UFix64 {
            return self.vault.balance
        }
        
        // Get event statistics
        access(all) fun getEventStats(eventId: String): {String: UInt32} {
            let stats: {String: UInt32} = {}
            
            if let registrations = self.eventRegistrations[eventId] {
                var checkedIn: UInt32 = 0
                var total: UInt32 = 0
                
                for registration in registrations.values {
                    total = total + 1
                    if registration.isCheckedIn {
                        checkedIn = checkedIn + 1
                    }
                }
                
                stats["total"] = total
                stats["checkedIn"] = checkedIn
                stats["noShows"] = total - checkedIn
            }
            
            return stats
        }
    }
    
    // Create Event Manager
    access(all) fun createEventManager(): @EventManager {
        return <-create EventManager()
    }
    
    init() {
        self.AdminStoragePath = /storage/ShowUpSimpleAdmin
        self.AdminPublicPath = /public/ShowUpSimpleAdmin
        
        // Create and store the main event manager
        let eventManager <- create EventManager()
        self.account.storage.save(<-eventManager, to: self.AdminStoragePath)
        
        // Create public capability
        let capability = self.account.capabilities.storage.issue<&EventManager>(self.AdminStoragePath)
        self.account.capabilities.publish(capability, at: self.AdminPublicPath)
    }
}
