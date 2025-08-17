'use client';

import { useState } from 'react';
import { useDynamicContext } from '@/lib/dynamic';
import { isFlowWallet } from '@dynamic-labs/flow';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlowService } from '@/lib/flow';
import { FlareService, FLARE_MAINNET } from '@/lib/flare';

export default function MultiChainDemo() {
  const { primaryWallet, user } = useDynamicContext();
  const [flowBalance, setFlowBalance] = useState<string>('0.0');
  const [flareBalance, setFlareBalance] = useState<string>('0.0');
  const [flareEvents, setFlareEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const userAddress = primaryWallet?.address || '';
  const isFlowConnected = primaryWallet && isFlowWallet(primaryWallet);
  const isFlareConnected = primaryWallet && isEthereumWallet(primaryWallet);
  
  const loadFlowBalance = async () => {
    if (!isFlowConnected || !userAddress) return;
    
    setLoading(true);
    try {
      const balance = await FlowService.getBalance(userAddress);
      setFlowBalance(balance);
    } catch (error) {
      console.error('Failed to load Flow balance:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFlareBalance = async () => {
    if (!isFlareConnected || !userAddress) return;
    
    setLoading(true);
    try {
      const balance = await FlareService.getBalance(userAddress);
      setFlareBalance(balance);
    } catch (error) {
      console.error('Failed to load Flare balance:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFlareEvents = async () => {
    setLoading(true);
    try {
      const events = await FlareService.getAllEvents();
      setFlareEvents(events);
      console.log('📄 Loaded Flare events:', events);
    } catch (error) {
      console.error('Failed to load Flare events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkContractDeployment = async () => {
    setLoading(true);
    try {
      const isDeployed = await FlareService.isContractDeployed();
      alert(`🔍 Contract Status: ${isDeployed ? '✅ DEPLOYED' : '❌ NOT FOUND'} at 0x073F9...955e`);
    } catch (error) {
      console.error('Failed to check contract:', error);
      alert(`❌ Check failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const testFlareContract = async () => {
    if (!isFlareConnected || !primaryWallet) {
      alert('Please connect a Flare wallet first!');
      return;
    }
    
    setLoading(true);
    try {
      const wallet = {
        address: userAddress,
        connector: primaryWallet.connector,
        provider: primaryWallet.connector
      };
      
      // Test creating an event on Flare
      const eventData = {
        title: 'Flare Test Event',
        description: 'Testing ShowUp on Flare mainnet',
        location: 'Flare Network',
        date: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
        stakeAmount: '0.01' // 0.01 FLR
      };
      
      const txHash = await FlareService.createEvent(wallet, eventData);
      alert(`✅ Event created on Flare! Tx: ${txHash}`);
      
      // Reload events
      await loadFlareEvents();
    } catch (error) {
      console.error('Failed to test Flare contract:', error);
      alert(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const switchToFlare = async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    
    try {
      // Request network switch to Flare
      await primaryWallet.connector.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xE' }], // Flare chainId in hex
      });
    } catch (error: any) {
      // If network not added, add it
      if (error.code === 4902) {
        try {
          await primaryWallet.connector.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xE',
              chainName: 'Flare Mainnet',
              nativeCurrency: {
                name: 'Flare',
                symbol: 'FLR',
                decimals: 18
              },
              rpcUrls: ['https://flare-api.flare.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://flare-explorer.flare.network/']
            }]
          });
        } catch (addError) {
          console.error('Failed to add Flare network:', addError);
        }
      } else {
        console.error('Failed to switch to Flare:', error);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="holo-card neon-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-heading text-2xl">
            🌐 Multi-Chain ShowUp
            <Badge variant="outline" className="neon-border bg-cyan-400/10 text-cyan-400">Flow + Flare</Badge>
          </CardTitle>
          <CardDescription className="cyber-text text-lg">
            First cross-chain event platform supporting Flow and Flare networks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Wallet Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Flow Network */}
            <Card className="holo-card border-cyan-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 cyber-text">
                  <div className="w-6 h-6 bg-blue-500 rounded-full neon-glow"></div>
                  Flow Network
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm cyber-text">
                  Status: {isFlowConnected ? 
                    <Badge className="bg-green-500/20 text-green-400 neon-border">Connected</Badge> : 
                    <Badge variant="outline" className="neon-border text-gray-400">Not Connected</Badge>
                  }
                </div>
                
                {isFlowConnected && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm cyber-text">
                        <strong className="text-white">Balance:</strong> {flowBalance} FLOW
                      </div>
                      <div className="text-xs cyber-text opacity-80">
                        Address: {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={loadFlowBalance} 
                      disabled={loading}
                      size="sm"
                      className="w-full cyber-button neon-glow"
                    >
                      {loading ? 'Loading...' : 'Refresh Balance'}
                    </Button>
                  </>
                )}
                
                <div className="text-xs cyber-text opacity-90">
                  • Native ShowUp contracts
                  • Cadence smart contracts
                  • FLOW token staking
                </div>
              </CardContent>
            </Card>
            
            {/* Flare Network */}
            <Card className="holo-card border-orange-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 cyber-text">
                  <div className="w-6 h-6 bg-orange-500 rounded-full neon-glow"></div>
                  Flare Network
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400 neon-border">NEW</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm cyber-text">
                  Status: {isFlareConnected ? 
                    <Badge className="bg-green-500/20 text-green-400 neon-border">Connected</Badge> : 
                    <Badge variant="outline" className="neon-border text-gray-400">Not Connected</Badge>
                  }
                </div>
                
                {isFlareConnected && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm cyber-text">
                        <strong className="text-white">Balance:</strong> {flareBalance} FLR
                      </div>
                      <div className="text-xs cyber-text opacity-80">
                        Address: {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={switchToFlare} 
                        size="sm"
                        variant="outline"
                        className="w-full neon-border hover:bg-orange-500/20"
                      >
                        Switch to Flare
                      </Button>
                      
                      <Button 
                        onClick={loadFlareBalance} 
                        disabled={loading}
                        size="sm"
                        className="w-full cyber-button neon-glow"
                      >
                        {loading ? 'Loading...' : 'Refresh Balance'}
                      </Button>
                      
                      <Button 
                        onClick={loadFlareEvents} 
                        disabled={loading}
                        size="sm"
                        variant="outline"
                        className="w-full neon-border hover:bg-cyan-500/20"
                      >
                        Load Events
                      </Button>
                      
                      <Button 
                        onClick={checkContractDeployment} 
                        disabled={loading}
                        size="sm"
                        variant="secondary"
                        className="w-full neon-border bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                      >
                        🔍 Check Contract
                      </Button>
                      
                      <Button 
                        onClick={testFlareContract} 
                        disabled={loading}
                        size="sm"
                        className="w-full cyber-button bg-orange-500/80 hover:bg-orange-500 neon-glow"
                      >
                        🚀 Test Contract
                      </Button>
                    </div>
                  </>
                )}
                
                <div className="text-xs cyber-text opacity-90">
                  • EVM compatible contracts
                  • FTSO price oracles
                  • FAssets (BTC/XRP) support
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Cross-Chain Features Preview */}
          <Card className="holo-card bg-gradient-to-r from-cyan-500/10 to-orange-500/10 neon-glow">
            <CardHeader>
              <CardTitle className="text-lg cyber-heading">🚀 Coming Soon: Cross-Chain Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium cyber-text text-white">🔗 Cross-Chain Events</div>
                  <div className="cyber-text opacity-80 text-xs">
                    Create events on Flow, stake from Flare
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium cyber-text text-white">💰 Multi-Token Staking</div>
                  <div className="cyber-text opacity-80 text-xs">
                    Stake FLOW, FLR, BTC, or XRP for any event
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium cyber-text text-white">📊 FTSO Price Feeds</div>
                  <div className="cyber-text opacity-80 text-xs">
                    Real-time USD pricing for all assets
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Flare Events Display */}
          {flareEvents.length > 0 && (
            <Card className="holo-card neon-glow">
              <CardHeader>
                <CardTitle className="text-lg cyber-heading">📄 Flare Events ({flareEvents.length})</CardTitle>
                <CardDescription className="cyber-text">
                  Events loaded from deployed contract: 0x073F9...955e
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {flareEvents.map((event, index) => (
                    <div key={index} className="p-3 border border-cyan-400/30 rounded-lg text-sm holo-card">
                      <div className="font-medium cyber-text text-white">{event.title}</div>
                      <div className="cyber-text opacity-80">{event.description}</div>
                      <div className="flex justify-between mt-1 cyber-text">
                        <span>Stake: {event.stakeAmount} FLR</span>
                        <span>Attendees: {event.attendeeCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Network Information */}
          <div className="text-xs cyber-text opacity-80 space-y-1">
            <div><strong className="text-white">Flow Mainnet:</strong> {FlowService.constructor.name} integration</div>
            <div><strong className="text-white">Flare Mainnet:</strong> Chain ID {FLARE_MAINNET.chainId}, Contract deployed ✅</div>
            <div><strong className="text-white">Contract Address:</strong> 0x073F9866fA39E873A13F1D211b38bB42A653955e</div>
            <div><strong className="text-white">Wallet SDK:</strong> Dynamic Labs multi-chain support</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
