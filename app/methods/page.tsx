import BlockchainDemo from "@/components/blockchain-demo";
import OrganizerDashboard from "@/components/organizer-dashboard";
import MultiChainDemo from "@/components/multi-chain-demo";
import YieldDashboard from "@/components/yield-dashboard";
import POAPIntegration from "@/components/poap-integration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MethodsPage() {
  return (
    <div className="min-h-screen cyber-grid">
      <div className="mx-auto max-w-6xl w-full pt-24 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="space-y-6">
            <h1 className="cyber-heading text-4xl md:text-6xl font-black tracking-wider">
              CYBER TOOLS
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto neon-glow"></div>
            <p className="cyber-text text-lg opacity-90 max-w-2xl mx-auto">
              Advanced blockchain management for events, stakes, and multi-chain operations
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="staking" className="w-full">
          <TabsList className="grid w-full grid-cols-5 holo-card neon-border">
            <TabsTrigger value="staking" className="cyber-text data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400">💎 Stake & Earn</TabsTrigger>
            <TabsTrigger value="organizer" className="cyber-text data-[state=active]:bg-purple-400/20 data-[state=active]:text-purple-400">👥 Event Manager</TabsTrigger>
            <TabsTrigger value="yield" className="cyber-text data-[state=active]:bg-green-400/20 data-[state=active]:text-green-400">📈 Yield Farming</TabsTrigger>
            <TabsTrigger value="nfts" className="cyber-text data-[state=active]:bg-yellow-400/20 data-[state=active]:text-yellow-400">🎖️ NFT Rewards</TabsTrigger>
            <TabsTrigger value="multichain" className="cyber-text data-[state=active]:bg-orange-400/20 data-[state=active]:text-orange-400">🌐 Multi-Chain</TabsTrigger>
          </TabsList>
          
          <TabsContent value="staking" className="space-y-6">
            <BlockchainDemo />
          </TabsContent>
          
          <TabsContent value="organizer" className="space-y-6">
            <OrganizerDashboard />
          </TabsContent>
          
          <TabsContent value="yield" className="space-y-6">
            <YieldDashboard />
          </TabsContent>
          
          <TabsContent value="nfts" className="space-y-6">
            <POAPIntegration />
          </TabsContent>
          
          <TabsContent value="multichain" className="space-y-6">
            <MultiChainDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}