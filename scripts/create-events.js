// Script to create multiple upcoming events on Flow blockchain
import { FlowService } from '../lib/flow.js';

const upcomingEvents = [
  {
    title: "Crypto Millionaire Meetup 2024",
    description: "Network with successful crypto entrepreneurs and investors. Learn from their journeys and discover new opportunities in DeFi, NFTs, and blockchain startups.",
    location: "San Francisco, CA",
    date: new Date("2024-09-15T18:00:00Z").toISOString(),
    stakeAmount: "50.0"
  },
  {
    title: "Flow Blockchain Hackathon Finals",
    description: "Watch the most innovative Flow dApps compete for $100K in prizes. Meet developers, investors, and see cutting-edge blockchain solutions built on Flow.",
    location: "Austin, TX",
    date: new Date("2024-09-22T14:00:00Z").toISOString(),
    stakeAmount: "25.0"
  },
  {
    title: "DeFi Investment Masterclass",
    description: "Learn advanced DeFi strategies from top yield farmers and liquidity providers. Hands-on workshop covering portfolio management and risk assessment.",
    location: "New York, NY",
    date: new Date("2024-09-28T13:00:00Z").toISOString(),
    stakeAmount: "75.0"
  },
  {
    title: "NFT Art & Culture Festival",
    description: "Celebrate digital art and culture with leading NFT creators. Gallery exhibitions, artist talks, and exclusive NFT drops throughout the weekend.",
    location: "Miami, FL",
    date: new Date("2024-10-05T19:00:00Z").toISOString(),
    stakeAmount: "30.0"
  },
  {
    title: "Web3 Gaming Revolution Summit",
    description: "Discover the future of gaming with play-to-earn mechanics, NFT integration, and blockchain-based virtual worlds. Meet game developers and investors.",
    location: "Los Angeles, CA",
    date: new Date("2024-10-12T10:00:00Z").toISOString(),
    stakeAmount: "40.0"
  },
  {
    title: "Startup Pitch Night: Blockchain Edition",
    description: "Watch promising blockchain startups pitch to VCs. Network with entrepreneurs, investors, and industry leaders shaping the future of Web3.",
    location: "Seattle, WA",
    date: new Date("2024-10-19T17:30:00Z").toISOString(),
    stakeAmount: "20.0"
  },
  {
    title: "Metaverse Real Estate Expo",
    description: "Explore virtual real estate opportunities across multiple metaverse platforms. Learn about land investment, development, and monetization strategies.",
    location: "Chicago, IL",
    date: new Date("2024-10-26T15:00:00Z").toISOString(),
    stakeAmount: "35.0"
  },
  {
    title: "Crypto Trading Bootcamp",
    description: "Intensive 2-day trading workshop covering technical analysis, risk management, and profitable trading strategies for crypto markets.",
    location: "Boston, MA",
    date: new Date("2024-11-02T09:00:00Z").toISOString(),
    stakeAmount: "60.0"
  },
  {
    title: "DAO Governance & Community Building",
    description: "Learn how to build and manage successful DAOs. Topics include tokenomics, governance mechanisms, and community engagement strategies.",
    location: "Denver, CO",
    date: new Date("2024-11-09T16:00:00Z").toISOString(),
    stakeAmount: "45.0"
  },
  {
    title: "Future of Finance Conference 2024",
    description: "Leading economists, fintech innovators, and blockchain pioneers discuss the future of money, banking, and financial systems in the digital age.",
    location: "Las Vegas, NV",
    date: new Date("2024-11-16T08:00:00Z").toISOString(),
    stakeAmount: "100.0"
  }
];

async function createEvents() {
  console.log('🚀 Creating upcoming events on Flow blockchain...');
  
  for (let i = 0; i < upcomingEvents.length; i++) {
    const event = upcomingEvents[i];
    try {
      console.log(`\n📅 Creating event ${i + 1}/${upcomingEvents.length}: ${event.title}`);
      
      const result = await FlowService.createEvent(event);
      console.log(`✅ Event created successfully!`);
      console.log(`   Title: ${event.title}`);
      console.log(`   Location: ${event.location}`);
      console.log(`   Date: ${new Date(event.date).toLocaleDateString()}`);
      console.log(`   Stake: ${event.stakeAmount} FLOW`);
      
      // Wait a bit between transactions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to create event: ${event.title}`);
      console.error(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Finished creating events! Check your Events page at localhost:3000/events');
}

createEvents().catch(console.error);
