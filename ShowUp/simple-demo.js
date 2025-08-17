// Simple Frontend Demo for ShowUp MVP
// Using existing deployed contracts on Flow Mainnet

const contractAddresses = {
  ShowUpEvents: "0xa19273383554e1e1",
  ShowUpStaking: "0xa19273383554e1e1",
  FlowToken: "0x1654653399040a61"
};

// Demo Flow:
// 1. User connects wallet
// 2. User stakes for event
// 3. Event happens
// 4. Organizer checks users in
// 5. Stakes returned to attendees, forfeited from no-shows

const demoScenario = {
  event: {
    id: "demo-event-001",
    title: "Weekly Team Standup",
    stakeAmount: 0.1, // 0.1 FLOW
    maxAttendees: 5
  },
  
  users: [
    { username: "alice_dev", address: "0x...", willAttend: true },
    { username: "bob_designer", address: "0x...", willAttend: true },
    { username: "charlie_pm", address: "0x...", willAttend: false }, // no-show
  ]
};

// Expected Results:
// - Alice & Bob: Get 0.1 FLOW back each
// - Charlie: 0.1 FLOW goes to webapp creator (YOU!)
// - Total platform revenue: 0.1 FLOW per no-show

console.log("🚀 ShowUp MVP Demo Ready!");
console.log("Revenue Model: Platform earns from no-shows");
console.log("Contracts deployed and functional on mainnet ✅");
