import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ShowUp contracts to Flare mainnet...");
  
  // Get the contract factory
  const ShowUpEvents = await ethers.getContractFactory("ShowUpEvents");
  
  // Deploy the contract
  console.log("📄 Deploying ShowUpEvents contract...");
  const showUpEvents = await ShowUpEvents.deploy();
  
  // Wait for deployment
  await showUpEvents.waitForDeployment();
  
  const contractAddress = await showUpEvents.getAddress();
  
  console.log("✅ ShowUpEvents deployed to:", contractAddress);
  console.log("🔗 View on Flare Explorer:", `https://flare-explorer.flare.network/address/${contractAddress}`);
  
  // Update FlareService with the deployed address
  console.log("\n📝 Update your FlareService with this address:");
  console.log(`SHOW_UP_EVENTS: '${contractAddress}',`);
  
  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((address) => {
    console.log(`\n🎉 Deployment successful! Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
