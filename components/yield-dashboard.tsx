'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Coins, Clock, Zap, Rocket } from 'lucide-react';
import { FlowService } from '@/lib/flow';

interface YieldInfo {
  eventId: string;
  eventTitle: string;
  principal: number;
  timeYield: number;
  poolYield: number;
  ftsoYield: number;
  kittypunchYield: number; // NEW: Kitty Punch Vaults yield
  totalYield: number;
  apy: number;
  daysSinceStake: number;
}

export default function YieldDashboard() {
  const [yields, setYields] = useState<YieldInfo[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with real blockchain calls
  useEffect(() => {
    const mockYields: YieldInfo[] = [
      {
        eventId: 'event1',
        eventTitle: 'Web3 Developer Meetup',
        principal: 10.0,
        timeYield: 0.12, // Time-based yield
        poolYield: 0.25, // From forfeitures  
        ftsoYield: 0.08, // FTSO rewards
        kittypunchYield: 0.18, // NEW: Kitty Punch Vaults yield
        totalYield: 0.63,
        apy: 18.4, // Higher combined APY with Kitty Punch
        daysSinceStake: 11
      },
      {
        eventId: 'event2', 
        eventTitle: 'Blockchain Summit',
        principal: 25.0,
        timeYield: 0.15,
        poolYield: 0.45,
        ftsoYield: 0.12,
        kittypunchYield: 0.28, // NEW: Kitty Punch integration
        totalYield: 1.00,
        apy: 16.7,
        daysSinceStake: 8
      }
    ];
    
    setYields(mockYields);
    setTotalEarnings(mockYields.reduce((sum, y) => sum + y.totalYield, 0));
  }, []);

  const handleClaimYield = async (eventId: string) => {
    setLoading(true);
    try {
      // Call smart contract to claim yield
      // await YieldService.claimYield(eventId);
      console.log(`Claiming yield for event: ${eventId}`);
      alert('Yield claimed successfully! 💰');
    } catch (error) {
      console.error('Failed to claim yield:', error);
      alert('Failed to claim yield');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAll = async () => {
    setLoading(true);
    try {
      // Claim all yields in batch
      const promises = yields.map(y => handleClaimYield(y.eventId));
      await Promise.all(promises);
      alert(`Successfully claimed ${totalEarnings.toFixed(3)} FLOW total! 🎉`);
    } catch (error) {
      console.error('Failed to claim all yields:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Flow Actions Auto-Yield Optimization
  const handleAutoOptimize = async (eventId: string) => {
    setLoading(true);
    try {
      console.log(`🚀 Initiating Flow Actions auto-yield optimization for event: ${eventId}`);
      
      // Call Flow Actions transaction
      const txId = await FlowService.autoOptimizeYield(eventId);
      
      console.log(`✅ Auto-yield optimization transaction: ${txId}`);
      alert(`🚀 Auto-yield optimization initiated!\n\nTransaction: ${txId}\n\nThis will automatically:\n• Claim yields from Kitty Punch vaults\n• Claim FTSO delegation rewards\n• Claim IncrementFi staking rewards\n• Auto-restake all yields back into ShowUp events`);
    } catch (error) {
      console.error('❌ Auto-yield optimization failed:', error);
      alert(`❌ Auto-yield optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Yield Summary */}
      <Card className="holo-card neon-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-heading">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Yield Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 neon-text">
                {yields.reduce((sum, y) => sum + y.principal, 0).toFixed(1)}
              </div>
              <div className="text-sm cyber-text">Total Staked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 neon-text">
                {totalEarnings.toFixed(3)}
              </div>
              <div className="text-sm cyber-text">Total Yield</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 neon-text">
                {yields.length > 0 ? (yields.reduce((sum, y) => sum + y.apy, 0) / yields.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm cyber-text">Avg APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 neon-text">
                {yields.reduce((sum, y) => sum + y.principal + y.totalYield, 0).toFixed(2)}
              </div>
              <div className="text-sm cyber-text">Total Value</div>
            </div>
          </div>

          {totalEarnings > 0 && (
            <div className="text-center">
              <Button 
                onClick={handleClaimAll}
                disabled={loading}
                className="cyber-button neon-glow bg-green-500/80 hover:bg-green-500"
              >
                <Coins className="w-4 h-4 mr-2" />
                Claim All Yield ({totalEarnings.toFixed(3)} FLOW)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Stakes */}
      <div className="space-y-4">
        {yields.map((yieldInfo) => (
          <Card key={yieldInfo.eventId} className="holo-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="cyber-text text-white">{yieldInfo.eventTitle}</CardTitle>
                <Badge className="bg-green-500/20 text-green-400 neon-border">
                  {yieldInfo.apy}% APY
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Yield Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="cyber-text opacity-80">Principal</div>
                  <div className="font-bold text-white">{yieldInfo.principal} FLOW</div>
                </div>
                <div>
                  <div className="cyber-text opacity-80">Time Yield</div>
                  <div className="font-bold text-blue-400">{yieldInfo.timeYield.toFixed(3)} FLOW</div>
                </div>
                <div>
                  <div className="cyber-text opacity-80">Pool Share</div>
                  <div className="font-bold text-purple-400">{yieldInfo.poolYield.toFixed(3)} FLOW</div>
                </div>
                <div>
                  <div className="cyber-text opacity-80">Kitty Punch</div>
                  <div className="font-bold text-pink-400">{yieldInfo.kittypunchYield.toFixed(3)} FLOW</div>
                </div>
                <div>
                  <div className="cyber-text opacity-80">FTSO Rewards</div>
                  <div className="font-bold text-orange-400">{yieldInfo.ftsoYield.toFixed(3)} FLOW</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm cyber-text">
                  <span>Yield Progress</span>
                  <span>{yieldInfo.daysSinceStake} days</span>
                </div>
                <Progress 
                  value={(yieldInfo.daysSinceStake / 30) * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>

              {/* Yield Sources Breakdown */}
              <div className="space-y-2">
                <div className="text-sm cyber-text opacity-90">Yield Sources:</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Time: 5% APY
                  </Badge>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    <Coins className="w-3 h-3 mr-1" />
                    Pool: {((yieldInfo.poolYield / yieldInfo.principal) * 365 / yieldInfo.daysSinceStake * 100).toFixed(1)}% APY
                  </Badge>
                  <Badge variant="outline" className="text-pink-400 border-pink-400/30">
                    🐱 Kitty Punch: {((yieldInfo.kittypunchYield / yieldInfo.principal) * 365 / yieldInfo.daysSinceStake * 100).toFixed(1)}% APY
                  </Badge>
                  <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                    <Zap className="w-3 h-3 mr-1" />
                    FTSO: 2% APY
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleClaimYield(yieldInfo.eventId)}
                  disabled={loading || yieldInfo.totalYield < 0.001}
                  size="sm"
                  className="cyber-button neon-glow flex-1"
                >
                  <Coins className="w-4 h-4 mr-1" />
                  Claim Yield ({yieldInfo.totalYield.toFixed(3)} FLOW)
                </Button>
                
                {/* 🚀 Flow Actions Auto-Optimize Button */}
                <Button
                  onClick={() => handleAutoOptimize(yieldInfo.eventId)}
                  disabled={loading}
                  size="sm"
                  className="cyber-button neon-glow bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                  title="Auto-optimize yields using Flow Actions"
                >
                  <Rocket className="w-4 h-4 mr-1" />
                  Auto-Optimize
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="neon-border hover:bg-cyan-500/20"
                >
                  Compound
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Yield Information */}
      <Card className="holo-card bg-cyan-500/10 border border-cyan-400/30">
        <CardHeader>
          <CardTitle className="cyber-text text-cyan-400">💡 How Yield Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm cyber-text">
          <div><strong className="text-white">Time Yield:</strong> Earn 5% APY just for staking tokens over time</div>
          <div><strong className="text-white">Pool Share:</strong> Get a portion of forfeited stakes from no-show attendees</div>
          <div><strong className="text-white">FTSO Rewards:</strong> Earn additional yield from Flare's FTSO system (Flare only)</div>
          <div><strong className="text-white">Compound:</strong> Automatically restake your yield to earn yield on yield!</div>
        </CardContent>
      </Card>
    </div>
  );
}
