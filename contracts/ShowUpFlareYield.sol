// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IFtsoRegistry {
    function getCurrentPrice(uint256 _ftsoIndex) external view returns (uint256 _price, uint256 _timestamp);
    function getSupportedIndices() external view returns (uint256[] memory _supportedIndices);
}

interface IWNat {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function delegate(address _to, uint256 _bips) external;
    function undelegateAll() external;
}

contract ShowUpFlareYield is ReentrancyGuard {
    
    // Flare Network contracts
    IFtsoRegistry public constant FTSO_REGISTRY = IFtsoRegistry(0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019);
    IWNat public constant WNAT = IWNat(0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d);
    
    // Yield configuration
    uint256 public constant BASE_APY = 500; // 5% base APY (in basis points)
    uint256 public constant FTSO_BONUS = 200; // 2% bonus from FTSO rewards
    
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lastClaim;
        uint256 accruedYield;
        string eventId;
        bool isDelegated;
    }
    
    mapping(address => mapping(string => StakeInfo)) public stakes;
    mapping(address => string[]) public userEvents;
    
    uint256 public totalStaked;
    uint256 public totalYieldDistributed;
    
    event StakeCreated(address indexed user, string eventId, uint256 amount);
    event YieldClaimed(address indexed user, string eventId, uint256 amount);
    event FtsoRewardsClaimed(uint256 amount);
    
    // Stake FLR for an event with automatic FTSO delegation
    function stakeForEvent(string memory eventId, address ftsoProvider) external payable {
        require(msg.value > 0, "Must stake some FLR");
        require(stakes[msg.sender][eventId].amount == 0, "Already staked for this event");
        
        // Wrap FLR to WNAT for FTSO participation
        WNAT.deposit{value: msg.value}();
        
        // Delegate to FTSO provider for yield
        if (ftsoProvider != address(0)) {
            WNAT.delegate(ftsoProvider, 10000); // Delegate 100% (10000 bips)
        }
        
        stakes[msg.sender][eventId] = StakeInfo({
            amount: msg.value,
            timestamp: block.timestamp,
            lastClaim: block.timestamp,
            accruedYield: 0,
            eventId: eventId,
            isDelegated: ftsoProvider != address(0)
        });
        
        userEvents[msg.sender].push(eventId);
        totalStaked += msg.value;
        
        emit StakeCreated(msg.sender, eventId, msg.value);
    }
    
    // Calculate yield from multiple sources
    function calculateYield(address user, string memory eventId) public view returns (uint256) {
        StakeInfo memory stake = stakes[user][eventId];
        if (stake.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - stake.lastClaim;
        uint256 baseYield = (stake.amount * BASE_APY * timeStaked) / (365 days * 10000);
        
        // Add FTSO bonus if delegated
        uint256 ftsoBonus = 0;
        if (stake.isDelegated) {
            ftsoBonus = (stake.amount * FTSO_BONUS * timeStaked) / (365 days * 10000);
        }
        
        return baseYield + ftsoBonus + stake.accruedYield;
    }
    
    // Claim yield without withdrawing principal
    function claimYield(string memory eventId) external nonReentrant {
        StakeInfo storage stake = stakes[msg.sender][eventId];
        require(stake.amount > 0, "No stake found");
        
        uint256 yieldAmount = calculateYield(msg.sender, eventId);
        require(yieldAmount > 0, "No yield to claim");
        
        stake.lastClaim = block.timestamp;
        stake.accruedYield = 0;
        totalYieldDistributed += yieldAmount;
        
        // In production, yield comes from FTSO rewards + platform fees
        payable(msg.sender).transfer(yieldAmount);
        
        emit YieldClaimed(msg.sender, eventId, yieldAmount);
    }
    
    // Withdraw stake + yield after event
    function withdrawStake(string memory eventId) external nonReentrant {
        StakeInfo storage stake = stakes[msg.sender][eventId];
        require(stake.amount > 0, "No stake found");
        
        uint256 principal = stake.amount;
        uint256 yieldAmount = calculateYield(msg.sender, eventId);
        uint256 totalAmount = principal + yieldAmount;
        
        // Clean up
        delete stakes[msg.sender][eventId];
        totalStaked -= principal;
        totalYieldDistributed += yieldAmount;
        
        // Undelegate and withdraw WNAT
        if (stake.isDelegated) {
            WNAT.undelegateAll();
        }
        WNAT.withdraw(principal);
        
        payable(msg.sender).transfer(totalAmount);
        
        emit YieldClaimed(msg.sender, eventId, yieldAmount);
    }
    
    // Get current FLR price from FTSO
    function getCurrentFlrPrice() external view returns (uint256 price, uint256 timestamp) {
        return FTSO_REGISTRY.getCurrentPrice(0); // FLR is typically index 0
    }
    
    // Get user's stake info with current yield
    function getStakeInfo(address user, string memory eventId) 
        external 
        view 
        returns (uint256 amount, uint256 currentYield, uint256 totalValue, bool isDelegated) 
    {
        StakeInfo memory stake = stakes[user][eventId];
        uint256 yield = calculateYield(user, eventId);
        
        return (stake.amount, yield, stake.amount + yield, stake.isDelegated);
    }
    
    // Admin: Add yield to contract (from FTSO rewards)
    function addYieldRewards() external payable {
        emit FtsoRewardsClaimed(msg.value);
    }
}
