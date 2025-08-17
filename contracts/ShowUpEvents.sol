// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ShowUpEvents
 * @dev Flare mainnet version of ShowUp event management
 * Ported from Flow Cadence to Solidity for EVM compatibility
 */
contract ShowUpEvents is Ownable, ReentrancyGuard {
    
    struct EventData {
        string title;
        string description;
        string location;
        uint256 date;
        uint256 stakeAmount;
        address creator;
        bool isActive;
        uint256 attendeeCount;
    }
    
    struct Attendee {
        bool isRegistered;
        bool hasStaked;
        bool isCheckedIn;
        uint256 stakedAmount;
    }
    
    // State variables
    mapping(string => EventData) public events;
    mapping(string => mapping(address => Attendee)) public eventAttendees;
    mapping(address => string[]) public userEvents;
    
    string[] public allEventIds;
    
    // Events
    event EventCreated(string indexed eventId, address indexed creator, string title);
    event UserRegistered(string indexed eventId, address indexed user);
    event UserStaked(string indexed eventId, address indexed user, uint256 amount);
    event UserCheckedIn(string indexed eventId, address indexed user);
    event StakeReturned(string indexed eventId, address indexed user, uint256 amount);
    event StakeForfeited(string indexed eventId, address indexed user, uint256 amount);
    
    constructor() {}
    
    /**
     * @dev Create a new event (similar to Flow Cadence version)
     */
    function createEvent(
        string memory title,
        string memory description,
        string memory location,
        uint256 date,
        uint256 stakeAmount
    ) external returns (string memory) {
        // Generate event ID using block data and sender
        bytes32 hash = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao, // Use prevrandao instead of deprecated difficulty
            msg.sender,
            title
        ));
        string memory eventId = _toHexString(hash);
        
        events[eventId] = EventData({
            title: title,
            description: description,
            location: location,
            date: date,
            stakeAmount: stakeAmount,
            creator: msg.sender,
            isActive: true,
            attendeeCount: 0
        });
        
        allEventIds.push(eventId);
        
        emit EventCreated(eventId, msg.sender, title);
        return eventId;
    }
    
    /**
     * @dev Register and stake for an event
     */
    function registerAndStake(string memory eventId) external payable nonReentrant {
        EventData storage eventData = events[eventId];
        require(eventData.isActive, "Event does not exist or is inactive");
        require(msg.value >= eventData.stakeAmount, "Insufficient stake amount");
        
        Attendee storage attendee = eventAttendees[eventId][msg.sender];
        require(!attendee.hasStaked, "Already staked for this event");
        
        attendee.isRegistered = true;
        attendee.hasStaked = true;
        attendee.stakedAmount = msg.value;
        
        userEvents[msg.sender].push(eventId);
        eventData.attendeeCount++;
        
        emit UserRegistered(eventId, msg.sender);
        emit UserStaked(eventId, msg.sender, msg.value);
    }
    
    /**
     * @dev Check in a user (only event creator)
     */
    function checkInUser(string memory eventId, address user) external {
        EventData storage eventData = events[eventId];
        require(msg.sender == eventData.creator, "Only event creator can check in users");
        
        Attendee storage attendee = eventAttendees[eventId][user];
        require(attendee.isRegistered, "User not registered for this event");
        require(!attendee.isCheckedIn, "User already checked in");
        
        attendee.isCheckedIn = true;
        
        emit UserCheckedIn(eventId, user);
    }
    
    /**
     * @dev Return stake to checked-in user
     */
    function returnStake(string memory eventId) external nonReentrant {
        Attendee storage attendee = eventAttendees[eventId][msg.sender];
        require(attendee.hasStaked, "No stake to return");
        require(attendee.isCheckedIn, "Must be checked in to get stake back");
        
        uint256 stakeAmount = attendee.stakedAmount;
        attendee.stakedAmount = 0;
        attendee.hasStaked = false;
        
        (bool success, ) = payable(msg.sender).call{value: stakeAmount}("");
        require(success, "Failed to return stake");
        
        emit StakeReturned(eventId, msg.sender, stakeAmount);
    }
    
    /**
     * @dev Forfeit stake from no-show user (only event creator)
     */
    function forfeitStake(string memory eventId, address user) external nonReentrant {
        EventData storage eventData = events[eventId];
        require(msg.sender == eventData.creator, "Only event creator can forfeit stakes");
        
        Attendee storage attendee = eventAttendees[eventId][user];
        require(attendee.hasStaked, "User has no stake to forfeit");
        require(!attendee.isCheckedIn, "Cannot forfeit stake from checked-in user");
        
        uint256 stakeAmount = attendee.stakedAmount;
        attendee.stakedAmount = 0;
        attendee.hasStaked = false;
        
        // Send forfeited stake to event creator (revenue model)
        (bool success, ) = payable(eventData.creator).call{value: stakeAmount}("");
        require(success, "Failed to transfer forfeited stake");
        
        emit StakeForfeited(eventId, user, stakeAmount);
    }
    
    /**
     * @dev Get event data
     */
    function getEvent(string memory eventId) external view returns (EventData memory) {
        return events[eventId];
    }
    
    /**
     * @dev Get all event IDs
     */
    function getAllEventIds() external view returns (string[] memory) {
        return allEventIds;
    }
    
    /**
     * @dev Get user's events
     */
    function getUserEvents(address user) external view returns (string[] memory) {
        return userEvents[user];
    }
    
    /**
     * @dev Get attendee info
     */
    function getAttendee(string memory eventId, address user) external view returns (Attendee memory) {
        return eventAttendees[eventId][user];
    }
    
    /**
     * @dev Convert bytes32 to hex string
     */
    function _toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(data[i] >> 4)];
            str[1+i*2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
