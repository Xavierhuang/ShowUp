# 🚀 ShowUp - Web3 Event Platform

**The most comprehensive Web3 event platform with staking, yield farming, NFT rewards, and multi-chain support.**

ShowUp revolutionizes event attendance by combining financial incentives, yield generation, and NFT collectibles. Users stake tokens to attend events, earn yield while waiting, automatically receive POAP NFTs on check-in, and get their stakes returned - or forfeited if they don't show up.

## 🎯 Key Features

- **💎 Stake to Attend**: Users stake FLOW tokens to secure event spots
- **📈 Multi-Source Yield**: Earn from time-based rewards, pool shares, Kitty Punch DeFi, and FTSO delegation
- **🎖️ POAP NFT Integration**: Automatic commemorative NFT distribution on check-in
- **🌐 Multi-Chain Support**: Flow blockchain + Flare Network integration
- **👥 Organizer Tools**: Complete event management and revenue dashboard
- **🔥 Cyberpunk UI**: Futuristic design with neon effects and holographic styling

## 📊 Revenue Model

1. **Event Fees**: Small percentage on event creation
2. **Forfeited Stakes**: No-show attendees forfeit stakes to platform
3. **Yield Share**: Percentage of generated yield from integrated DeFi protocols

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Flow (Cadence), Flare Network (Solidity)
- **Wallet Integration**: Dynamic SDK (Flow, Ethereum wallets)
- **DeFi Integration**: Kitty Punch (Flow EVM), FTSO (Flare)
- **NFT Integration**: POAP (Proof of Attendance Protocol)
- **Styling**: Custom cyberpunk theme with neon effects

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Flow CLI
- Git
- **🌐 Chrome Browser** (Highly recommended over Safari for Web3 wallet compatibility)

### 1. Clone & Install

```bash
# Create a directory for the project
mkdir ShowUpWebApp
cd ShowUpWebApp

# Clone the repository
git clone https://github.com/Xavierhuang/ShowUp.git

# Navigate to the main application directory
cd ShowUp

# Install dependencies
npm install
```

### 2. Environment Setup ⚠️ REQUIRED

**The app will NOT run without proper environment variables!**
cd ..

Create `.env` next to `ShowUp` folder (under same directory):

```env
# ⚠️ REQUIRED: Dynamic SDK (Get from https://app.dynamic.xyz)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# Flow Configuration
NEXT_PUBLIC_FLOW_NETWORK=mainnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-mainnet.onflow.org

# POAP Integration (Optional - for production)
NEXT_PUBLIC_POAP_API_KEY=your_poap_api_key

# Contract Addresses (Already configured for mainnet)
NEXT_PUBLIC_FLOW_EVENTS_CONTRACT=0xa19273383554e1e1
NEXT_PUBLIC_FLOW_STAKING_CONTRACT=0xa19273383554e1e1
```

**How to get Dynamic Environment ID:**
## this is what you put into the .env NEXT_PUBLIC_DYNAMIC_ENV_ID=e8e967f3-718e-4e90-99e2-f5946fcde1dd
or
1. Go to [app.dynamic.xyz](https://app.dynamic.xyz)
2. Create account and new project
3. Copy the Environment ID from your dashboard
4. Paste it in your `.env` file

**Without this file, you'll get wallet connection errors!**

### 3. Flow Blockchain Setup

#### Install Flow CLI
```bash
# macOS
brew install flow-cli

# Or download from: https://github.com/onflow/flow-cli/releases
```

#### Configure Flow Project
```bash
cd ShowUp
flow project init
```

The `flow.json` is already configured with:
- **Mainnet account**: `0xa19273383554e1e1`
- **Deployed contracts**: ShowUpEvents, ShowUpStaking
- **Network configurations**: Emulator, Testnet, Mainnet

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**⚠️ If the app shows wallet connection errors:**
1. Make sure you created `.env` file (step 2)
2. Verify your Dynamic Environment ID is correct
3. Restart the dev server after adding env variables

## 📁 Project Structure

```
rain-dynamic/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Homepage with cyberpunk hero
│   ├── events/page.tsx          # Event listings and creation
│   ├── methods/page.tsx         # Platform tools (5 tabs)
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Cyberpunk theme styles
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   ├── blockchain-demo.tsx      # Event creation & staking
│   ├── organizer-dashboard.tsx  # Event management
│   ├── yield-dashboard.tsx      # Yield farming display
│   ├── poap-integration.tsx     # NFT rewards
│   ├── multi-chain-demo.tsx     # Flow + Flare
│   ├── create-event-form.tsx    # Event creation modal
│   ├── event-card.tsx           # Event display card
│   └── showup-logo.tsx          # Custom cyberpunk logo
├── lib/                         # Core libraries
│   ├── flow.ts                  # Flow blockchain integration
│   ├── flare.ts                 # Flare network integration
│   ├── poap.ts                  # POAP NFT integration
│   ├── dynamic.ts               # Dynamic SDK config
│   └── providers.tsx            # App providers
├── ShowUp/                      # Flow blockchain project
│   ├── cadence/
│   │   ├── contracts/           # Smart contracts
│   │   ├── transactions/        # Blockchain transactions
│   │   └── scripts/             # Read-only scripts
│   ├── flow.json               # Flow project config
│   └── *.pkey                  # Account private keys
└── contracts/                   # Solidity contracts (Flare)
.env


## 🔗 Smart Contracts

### Flow Contracts (Cadence)

#### ShowUpEvents.cdc
```cadence
// Event management contract
- createEvent(title, description, location, date, stakeAmount)
- registerForEvent(eventId, username)
- checkInUser(eventId, userAddress)
- getEvent(eventId) / getAllEvents()
```

#### ShowUpStaking.cdc
```cadence
// Staking and yield management
- createStakeVault() 
- depositStake(eventId, amount)
- withdrawStake(eventId) // After check-in
- forfeitStake(eventId) // No-show penalty
```

**Deployed Addresses:**
- **Mainnet**: `0xa19273383554e1e1`
- Both contracts deployed and verified

### Flare Contracts (Solidity)

#### ShowUpEvents.sol
```solidity
// Multi-chain event management
- createEvent(...) returns eventId
- stakeForEvent(eventId) payable
- checkInUser(eventId, userAddress)
- Integration with FTSO for yield
```

**Deployed Address:**
- **Flare Mainnet**: `0x073F9866fA39E873A13F1D211b38bB42A653955e`

## 💡 Core Features Walkthrough

### 1. Event Creation
```typescript
// Create new event
const eventData = {
  title: "Web3 Developer Meetup",
  description: "Learn about blockchain development",
  location: "San Francisco, CA",
  date: "2024-12-25",
  stakeAmount: "10.0", // FLOW tokens
  maxAttendees: 100
};

const result = await FlowService.createEvent(eventData);
```

### 2. Staking for Events
```typescript
// User stakes to attend event
const txId = await FlowService.stakeForEvent(eventId, "10.0");
```

### 3. Yield Generation
Users automatically earn yield from multiple sources:
- **Time-based**: 5% APY for holding stakes
- **Pool sharing**: Portion of forfeited stakes
- **Kitty Punch**: Automated DeFi strategies on Flow EVM
- **FTSO Delegation**: Oracle rewards on Flare Network

### 4. Check-in Process
```typescript
// Organizer checks in attendee
await FlowService.checkInUser(eventId, userAddress);

// Automatically triggers:
// 1. Stake return to user
// 2. POAP NFT minting
// 3. Yield calculation finalization
```

## 🎨 Cyberpunk UI Theme

### Design System
- **Colors**: Cyan (#00d4ff), Purple (#8b5cf6), Orange (#f97316)
- **Effects**: Neon glows, holographic cards, animated gradients
- **Typography**: Orbitron, Exo 2 fonts for futuristic feel
- **Components**: All styled with cyberpunk aesthetic

### Custom CSS Classes
```css
.cyber-heading    /* Neon text effects */
.cyber-text      /* Cyberpunk styled text */
.holo-card       /* Holographic card backgrounds */
.neon-border     /* Glowing borders */
.neon-glow       /* Glow effects */
.cyber-grid      /* Matrix-style background */
.cyber-button    /* Futuristic buttons */
```

## 🌐 Multi-Chain Integration

### Flow Blockchain
- **Native staking contracts** in Cadence
- **FCL integration** for wallet connections
- **Mainnet deployment** with real transactions

### Flare Network
- **EVM compatibility** for Solidity contracts
- **FTSO integration** for oracle-based yield
- **FAssets support** for cross-chain assets

### Wallet Support
Via Dynamic SDK:
- **Flow wallets**: Blocto, Lilico, Flow Wallet
- **Ethereum wallets**: MetaMask, WalletConnect, Coinbase

## 🎖️ POAP NFT Integration

### Production Workflow
1. **Manual Submission**: Event organizers submit POAPs via [app.poap.xyz/admin/events](https://app.poap.xyz/admin/events)
2. **Curation Review**: POAP team reviews submission (1-3 days)
3. **Mint Links**: Approved mint links sent via email
4. **ShowUp Integration**: Import mint links into platform
5. **Auto-Distribution**: POAPs distributed automatically on check-in

### Demo Features
- Simulated POAP creation for demonstrations
- Mock claim process showing user experience
- Real integration workflow clearly documented

## 📈 DeFi Integrations

### Kitty Punch (Flow EVM)
```typescript
// Automated yield strategies
- Punch Vaults: Automated DeFi farming
- StableKitty: High-efficiency stablecoin yields
- Native Flow EVM integration
- Capital efficient strategies
```

**Integration URL**: [app.kittypunch.xyz](https://app.kittypunch.xyz)

### FTSO (Flare Network)
```typescript
// Oracle delegation rewards
- Delegate FLR tokens to data providers
- Earn rewards for price oracle participation
- Automatic compounding available
```

## 🛡️ Security Features

### Smart Contract Security
- **Access controls** on all admin functions
- **Re-entrancy protection** on fund transfers
- **Input validation** on all parameters
- **Event emission** for transparency

### Frontend Security
- **Wallet signature verification**
- **Transaction confirmation flows**
- **Error boundary handling**
- **Rate limiting** on API calls

## 🚀 Deployment Guide

### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel

# Or deploy to Netlify
npm run build && netlify deploy --prod --dir=.next
```

### Smart Contracts

#### Flow Deployment
```bash
cd ShowUp

# Deploy to testnet first
flow project deploy --network testnet

# Deploy to mainnet
flow project deploy --network mainnet
```

#### Flare Deployment
```bash
# Compile contracts
npx hardhat compile

# Deploy to Flare mainnet
npx hardhat run scripts/deploy.js --network flare-mainnet
```

## 🧪 Testing

### Run Frontend Tests
```bash
npm test
```

### Test Smart Contracts
```bash
# Flow contracts
cd ShowUp
flow test

# Flare contracts
npx hardhat test
```

### Manual Testing Checklist
- [ ] Wallet connection (Flow + Ethereum)
- [ ] Event creation and registration
- [ ] Staking and stake returns
- [ ] Check-in process
- [ ] Yield calculations
- [ ] Multi-chain switching
- [ ] POAP integration demo

## 📚 API Documentation

### Flow Service
```typescript
// Event management
FlowService.createEvent(eventData)
FlowService.getAllEvents()
FlowService.getEvent(eventId)

// Staking
FlowService.stakeForEvent(eventId, amount)
FlowService.getStakedAmount(eventId, userAddress)
FlowService.getUserStakes(userAddress)

// Check-in & Returns
FlowService.checkInUser(eventId, userAddress)
FlowService.returnStake(eventId)
FlowService.forfeitStake(eventId, userAddress)

// Utilities
FlowService.getBalance(address)
```

### POAP Service
```typescript
// Read POAPs (Public API)
POAPService.getEvent(eventId)
POAPService.getPOAPsByAddress(address)
POAPService.hasEventPOAP(address, eventId)

// Demo functions
POAPService.createDemoPOAP(eventTitle)
POAPService.simulatePOAPClaim(address, eventTitle)
```

## 🎯 Hackathon Demo Script

### 2-Minute Demo Flow

#### 1. Homepage (15 seconds)
- Show cyberpunk design and value proposition
- Click "🚀 LAUNCH PLATFORM"

#### 2. Stake & Earn Tab (30 seconds)
- Create unique test event
- Demonstrate staking process
- Show balance updates

#### 3. Event Manager Tab (30 seconds)
- Load real events with attendees
- Check in a user (real blockchain transaction)
- Show automatic POAP minting

#### 4. Yield Farming Tab (30 seconds)
- Display multi-source yield breakdown
- Show Kitty Punch integration
- Highlight 18%+ combined APY

#### 5. NFT Rewards Tab (15 seconds)
- Show POAP collection
- Explain production workflow

### Key Talking Points
1. **"Triple value for attendees"**: Stake return + Yield + NFT
2. **"Real blockchain transactions"**: Every demo action hits mainnet
3. **"Industry integrations"**: Kitty Punch, POAP, FTSO
4. **"Revenue generating"**: Forfeited stakes + DeFi yield share
5. **"Production ready"**: Deployed contracts, real UI

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for formatting
- Component documentation
- Test coverage for critical paths

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub Repository**: [https://github.com/Xavierhuang/ShowUp](https://github.com/Xavierhuang/ShowUp)
- **Live Demo**: [Deploy to Vercel/Netlify for live URL]
- **Flow Contracts**: [https://flowscan.org/account/0xa19273383554e1e1](https://flowscan.org/account/0xa19273383554e1e1)
- **Flare Contracts**: [https://flare-explorer.flare.network/address/0x073F9866fA39E873A13F1D211b38bB42A653955e](https://flare-explorer.flare.network/address/0x073F9866fA39E873A13F1D211b38bB42A653955e)

## 🆘 Support

### Common Issues

#### ⚠️ App Won't Start / Wallet Connection Fails
**Most common issue: Missing `.env` file**


**Symptoms of missing env file:**
- ❌ "Dynamic SDK not configured" errors
- ❌ Wallet connect button doesn't work
- ❌ Console errors about missing environment variables
- ❌ Blank wallet provider screens

#### Browser Compatibility Issues
**🌐 Use Chrome for best experience!**

**Safari Issues:**
- ❌ Wallet popup blockers
- ❌ Web3 provider detection issues  
- ❌ LocalStorage restrictions
- ❌ Inconsistent wallet connections

**Recommended browsers:**
- ✅ **Chrome** (Best Web3 support)
- ✅ **Brave** (Built-in Web3 features)
- ✅ **Edge** (Good compatibility)
- ⚠️ **Firefox** (Mostly works, some wallet issues)
- ❌ **Safari** (Not recommended for Web3)

#### Other Wallet Issues
```bash
# Clear browser cache and localStorage
# Disconnect and reconnect wallet
# Check network settings (mainnet vs testnet)
# Try a different browser (preferably Chrome)
```

#### Contract Deployment
```bash
# Verify Flow CLI installation
flow version

# Check account configuration
flow accounts get 0xa19273383554e1e1
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Get Help
- **Discord**: [Your Discord link]
- **GitHub Issues**: [Report bugs and features]
- **Email**: [Your contact email]

---

## 🎉 Acknowledgments

- **Flow Team**: For the amazing blockchain platform
- **Dynamic Labs**: For seamless wallet integration
- **POAP**: For NFT attendance protocol
- **Kitty Punch**: For DeFi yield strategies
- **Flare Network**: For oracle-based yields

Built with ❤️ for the Web3 community. **ShowUp and show out!** 🚀

---

*This README covers everything needed to replicate the ShowUp platform locally. For questions or issues, please open a GitHub issue or contact the team.*