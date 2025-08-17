'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlowService } from '@/lib/flow';
import { useDynamicContext, useIsLoggedIn } from '@/lib/dynamic';
import { isFlowWallet } from '@dynamic-labs/flow';
import { Loader2, Plus, Coins, Users } from 'lucide-react';

export default function BlockchainDemo() {
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [lastTxId, setLastTxId] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [userStakes, setUserStakes] = useState<string[]>([]);
  const [balance, setBalance] = useState<string>('0.0');

  const userAddress = primaryWallet?.address || '';
  const isFlowConnected = primaryWallet && isFlowWallet(primaryWallet);

  // Demo event data - ALWAYS UNIQUE! (using useState to prevent hydration mismatch)
  const [eventCounter, setEventCounter] = useState(1);

  // Generate unique event names with various themes
  const generateUniqueTitle = () => {
    const themes = [
      'Web3 Developer Meetup',
      'Blockchain Workshop',
      'DeFi Learning Session',
      'NFT Art Exhibition',
      'Crypto Trading Seminar',
      'Smart Contract Bootcamp',
      'Flow Ecosystem Event',
      'Decentralized Future Conference',
      'Digital Asset Summit',
      'Metaverse Builder Gathering'
    ];
    
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    return `${theme} #${eventCounter}-${timestamp}`;
  };
  
  const demoEvent = {
    title: generateUniqueTitle(), // Always unique with theme + counter + timestamp
    description: "Testing the blockchain integration for our MVP",
    date: "2024-12-21", // Fixed date to prevent hydration issues
    location: "Virtual Meeting",
    stakeAmount: "0.1", // 0.1 FLOW
    maxAttendees: 10,
    creator: userAddress
  };

  const handleCreateTestEvent = async () => {
    if (!isFlowConnected) {
      alert('Please connect a Flow wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await FlowService.createEvent(demoEvent);
      setLastTxId(result.txId);
      console.log('✅ Event created:', result);
      
      // Increment counter for next event to keep names unique
      setEventCounter(prev => prev + 1);
      
      // Refresh events list
      await loadEvents();
    } catch (error) {
      console.error('❌ Failed to create event:', error);
      alert('Failed to create event. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStakeForEvent = async (eventId: string) => {
    if (!isFlowConnected) {
      alert('Please connect a Flow wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const txId = await FlowService.stakeForEvent(eventId, "0.1");
      setLastTxId(txId);
      console.log('✅ Staked for event:', txId);
      
      // Refresh stakes
      await loadUserStakes();
      await loadBalance();
    } catch (error) {
      console.error('❌ Failed to stake:', error);
      
      // More helpful error messages
      if (error.message.includes('Already staked')) {
        alert(`❌ You've already staked for this event!\n\n💡 Solution: Create a NEW event with a different title and stake for that instead.`);
      } else if (error.message.includes('insufficient')) {
        alert(`❌ Insufficient FLOW balance!\n\n💡 Solution: You need at least 0.1 FLOW to stake.`);
      } else if (error.message.includes('wallet') || error.message.includes('authenticate')) {
        alert(`❌ Wallet connection issue!\n\n💡 Solution: Reconnect your Flow wallet and try again.`);
      } else {
        alert(`❌ Staking failed: ${error.message}\n\n💡 Check console for full details.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const allEvents = await FlowService.getAllEvents();
      setEvents(allEvents);
      console.log('📋 Loaded events:', allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadUserStakes = async () => {
    if (!userAddress) return;
    
    try {
      const stakes = await FlowService.getUserStakes(userAddress);
      setUserStakes(stakes);
      console.log('💰 User stakes:', stakes);
      
      // Show which events you've staked for
      if (stakes.length > 0) {
        console.log(`🔍 You've already staked for ${stakes.length} event(s): ${stakes.join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to load user stakes:', error);
    }
  };

  const loadBalance = async () => {
    if (!userAddress) return;
    
    try {
      const userBalance = await FlowService.getBalance(userAddress);
      setBalance(userBalance);
      console.log('💳 User balance:', userBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadEvents(),
        loadUserStakes(),
        loadBalance()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🔗 Blockchain Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please connect your wallet to test the blockchain integration.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isFlowConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🔗 Blockchain Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-yellow-600">
              ⚠️ Please connect a Flow wallet to test blockchain features.
            </p>
            <p className="text-sm text-muted-foreground">
              Connected wallet: {primaryWallet?.connector?.name} ({userAddress})
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 ShowUp - Event & Stake Management
            <Badge variant="outline" className="ml-auto">
              Live on Flow
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{balance}</div>
              <div className="text-sm text-muted-foreground">FLOW Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-sm text-muted-foreground">Events Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStakes.length}</div>
              <div className="text-sm text-muted-foreground">Your Stakes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Test Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div><strong>Title:</strong> {demoEvent.title}</div>
              <div><strong>Stake:</strong> {demoEvent.stakeAmount} FLOW</div>
              <div><strong>Max Attendees:</strong> {demoEvent.maxAttendees}</div>
            </div>
            <Button 
              onClick={handleCreateTestEvent} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event on Blockchain'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Load Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Load events and stakes from your deployed contracts on Flow mainnet.
            </p>
            <Button 
              onClick={loadAllData} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Refresh from Blockchain'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Events from Blockchain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Stake: {event.stakeAmount} FLOW • Max: {event.maxAttendees} attendees
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStakeForEvent(event.id)}
                    disabled={isLoading || userStakes.includes(event.id)}
                    size="sm"
                  >
                    {userStakes.includes(event.id) ? 'Staked ✅' : 'Stake 0.1 FLOW'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {lastTxId && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Last Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm break-all bg-muted p-3 rounded">
              {lastTxId}
            </div>
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0"
              onClick={() => window.open(`https://www.flowscan.io/tx/${lastTxId}`, '_blank')}
            >
              View on FlowScan →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>📄 Deployed Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div>ShowUpEvents: <span className="text-blue-600">0xa19273383554e1e1</span></div>
            <div>ShowUpStaking: <span className="text-blue-600">0xa19273383554e1e1</span></div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ✅ All contracts deployed and working on Flow mainnet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
