'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { POAPService } from '@/lib/poap';
import { Award, ExternalLink, Gift, Star, Zap } from 'lucide-react';

interface POAPInfo {
  eventId: string;
  eventTitle: string;
  poapId?: number;
  mintLink?: string;
  claimedBy: string[];
  totalClaims: number;
  isActive: boolean;
}

export default function POAPIntegration() {
  const [poaps, setPOAPs] = useState<POAPInfo[]>([]);
  const [userPOAPs, setUserPOAPs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demo
  useEffect(() => {
    const mockPOAPs: POAPInfo[] = [
      {
        eventId: 'event1',
        eventTitle: 'Web3 Developer Meetup',
        poapId: 156789,
        mintLink: 'https://poap.delivery/claim/abc123def456',
        claimedBy: ['0xa19273...54e1e1', '0xb29384...65f2f2'],
        totalClaims: 2,
        isActive: true
      },
      {
        eventId: 'event2',
        eventTitle: 'Blockchain Summit',
        poapId: 156790,
        mintLink: 'https://poap.delivery/claim/xyz789uvw012',
        claimedBy: ['0xa19273...54e1e1'],
        totalClaims: 1,
        isActive: true
      }
    ];

    const mockUserPOAPs = [
      {
        event: {
          id: 156789,
          name: 'ShowUp: Web3 Developer Meetup',
          image_url: 'https://assets.poap.xyz/showup-demo-1.png',
          start_date: '2024-12-15'
        },
        tokenId: '7891234',
        created: '2024-12-15T18:30:00Z'
      },
      {
        event: {
          id: 156790,
          name: 'ShowUp: Blockchain Summit',
          image_url: 'https://assets.poap.xyz/showup-demo-2.png',
          start_date: '2024-12-10'
        },
        tokenId: '7891235',
        created: '2024-12-10T20:15:00Z'
      }
    ];

    setPOAPs(mockPOAPs);
    setUserPOAPs(mockUserPOAPs);
  }, []);

  const handleCreatePOAP = async (eventTitle: string) => {
    setLoading(true);
    try {
      const result = await POAPService.createDemoPOAP(eventTitle);
      
      // Update the POAP info
      setPOAPs(prev => prev.map(poap => 
        poap.eventTitle === eventTitle 
          ? { ...poap, poapId: result.poapId, mintLink: result.mintLink, isActive: true }
          : poap
      ));
      
      alert(`🎖️ POAP created successfully!\n\nPOAP ID: ${result.poapId}\nMint Link: ${result.mintLink}`);
    } catch (error) {
      console.error('Failed to create POAP:', error);
      alert('Failed to create POAP');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPOAP = async (eventTitle: string, userAddress: string) => {
    setLoading(true);
    try {
      const claimedPOAP = await POAPService.simulatePOAPClaim(userAddress, eventTitle);
      
      // Add to user's POAPs
      setUserPOAPs(prev => [...prev, claimedPOAP]);
      
      // Update claimed count
      setPOAPs(prev => prev.map(poap => 
        poap.eventTitle === eventTitle 
          ? { 
              ...poap, 
              claimedBy: [...poap.claimedBy, userAddress],
              totalClaims: poap.totalClaims + 1
            }
          : poap
      ));
      
      alert(`🎖️ POAP claimed successfully!\n\nToken ID: ${claimedPOAP.tokenId}\nYou now own this commemorative NFT!`);
    } catch (error) {
      console.error('Failed to claim POAP:', error);
      alert('Failed to claim POAP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* POAP Overview */}
      <Card className="holo-card neon-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-heading">
            <Award className="w-6 h-6 text-yellow-400" />
            POAP Integration
            <Badge className="bg-yellow-500/20 text-yellow-400 neon-border">Proof of Attendance</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 neon-text">
                {poaps.filter(p => p.isActive).length}
              </div>
              <div className="text-sm cyber-text">Active POAPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 neon-text">
                {poaps.reduce((sum, p) => sum + p.totalClaims, 0)}
              </div>
              <div className="text-sm cyber-text">Total Claims</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 neon-text">
                {userPOAPs.length}
              </div>
              <div className="text-sm cyber-text">Your POAPs</div>
            </div>
          </div>

          <div className="space-y-2 text-sm cyber-text">
            <div>📝 <strong className="text-white">Manual POAP submission</strong> through POAP admin interface</div>
            <div>🔍 <strong className="text-white">Curation review process</strong> ensures quality and authenticity</div>
            <div>🔗 <strong className="text-white">Mint link integration</strong> for approved POAPs</div>
            <div>🎖️ <strong className="text-white">Auto-distribute on check-in</strong> using approved mint links</div>
            <div>🏆 <strong className="text-white">Permanent NFT proof</strong> of event attendance</div>
          </div>
        </CardContent>
      </Card>

      {/* Event POAPs */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold cyber-heading">Event POAPs</h3>
        
        {poaps.map((poapInfo) => (
          <Card key={poapInfo.eventId} className="holo-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="cyber-text text-white">{poapInfo.eventTitle}</CardTitle>
                <div className="flex gap-2">
                  {poapInfo.isActive && (
                    <Badge className="bg-green-500/20 text-green-400 neon-border">
                      <Zap className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  {poapInfo.poapId && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 neon-border">
                      #{poapInfo.poapId}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* POAP Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="cyber-text opacity-80">Claims</div>
                  <div className="font-bold text-green-400">{poapInfo.totalClaims}</div>
                </div>
                <div>
                  <div className="cyber-text opacity-80">Status</div>
                  <div className="font-bold text-white">
                    {poapInfo.isActive ? '🟢 Live' : '🔴 Inactive'}
                  </div>
                </div>
                <div>
                  <div className="cyber-text opacity-80">POAP ID</div>
                  <div className="font-bold text-yellow-400">
                    {poapInfo.poapId ? `#${poapInfo.poapId}` : 'Not created'}
                  </div>
                </div>
              </div>

              {/* Claimed Addresses */}
              {poapInfo.claimedBy.length > 0 && (
                <div>
                  <div className="text-sm cyber-text opacity-80 mb-2">Claimed by:</div>
                  <div className="flex flex-wrap gap-2">
                    {poapInfo.claimedBy.map((address, index) => (
                      <Badge key={index} variant="outline" className="text-gray-400 border-gray-600">
                        {address}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {!poapInfo.poapId ? (
                  <div className="space-y-2 w-full">
                    <Button
                      onClick={() => window.open('https://app.poap.xyz/admin/events', '_blank')}
                      className="cyber-button bg-yellow-500/80 hover:bg-yellow-500 neon-glow"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Submit POAP Request
                    </Button>
                    <div className="text-xs cyber-text opacity-70">
                      ↳ Manual submission required through POAP admin interface
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={() => handleClaimPOAP(poapInfo.eventTitle, '0xa19273...54e1e1')}
                      disabled={loading}
                      className="cyber-button neon-glow"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Demo Claim
                    </Button>
                    
                    {poapInfo.mintLink && (
                      <Button
                        onClick={() => window.open(poapInfo.mintLink, '_blank')}
                        variant="outline"
                        className="neon-border hover:bg-cyan-500/20"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Mint Link
                      </Button>
                    )}
                  </>
                )}
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* User's POAP Collection */}
      {userPOAPs.length > 0 && (
        <Card className="holo-card bg-purple-500/10 border border-purple-400/30">
          <CardHeader>
            <CardTitle className="cyber-text text-purple-400">
              <Star className="w-5 h-5 mr-2 inline" />
              Your POAP Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPOAPs.map((poap, index) => (
                <div key={index} className="p-4 border border-purple-400/30 rounded-lg holo-card">
                  <div className="space-y-2">
                    <div className="text-sm cyber-text font-medium">{poap.event.name}</div>
                    <div className="text-xs cyber-text opacity-80">
                      Token #{poap.tokenId}
                    </div>
                    <div className="text-xs cyber-text opacity-80">
                      Claimed: {new Date(poap.created).toLocaleDateString()}
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 neon-border text-xs">
                      Commemorative NFT
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Info */}
      <Card className="holo-card bg-cyan-500/10 border border-cyan-400/30">
        <CardHeader>
          <CardTitle className="cyber-text text-cyan-400">🔗 Production POAP Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm cyber-text">
          <div className="space-y-2">
            <div><strong className="text-orange-400">Step 1:</strong> Event organizer submits POAP manually at <span className="font-mono text-cyan-400">app.poap.xyz/admin/events</span></div>
            <div><strong className="text-orange-400">Step 2:</strong> POAP Curation Body reviews submission (1-3 days)</div>
            <div><strong className="text-orange-400">Step 3:</strong> If approved, mint links sent via email</div>
            <div><strong className="text-orange-400">Step 4:</strong> ShowUp integrates mint links for automatic distribution</div>
            <div><strong className="text-orange-400">Step 5:</strong> POAPs auto-distributed when users check in</div>
          </div>
          <div className="border-t border-cyan-400/20 pt-3 mt-4">
            <div><strong className="text-white">Benefits:</strong> Permanent NFT proof, community building, gamification, mainstream adoption</div>
            <div><strong className="text-white">Used by:</strong> Adidas, Coinbase, Google Cloud, Spotify, Tommy Hilfiger, Red Bull</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
