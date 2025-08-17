'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { EventData, formatEventDate, getEventStatus } from '@/lib/events';
import { StakeModal } from './stake-modal';

interface EventCardProps {
  event: EventData;
  onStake?: (eventId: string, amount: string) => Promise<void>;
  userAddress?: string;
  userStakes?: string[];
}

export function EventCard({ event, onStake, userAddress, userStakes = [] }: EventCardProps) {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  
  const status = getEventStatus(event);
  const isUserStaked = userStakes.includes(event.id);
  const spotsLeft = event.maxAttendees - event.currentAttendees;
  
  const handleStake = async (amount: string) => {
    if (!onStake) return;
    
    setIsStaking(true);
    try {
      await onStake(event.id, amount);
      setShowStakeModal(false);
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'full':
        return <Badge variant="destructive">Full</Badge>;
      case 'today':
        return <Badge variant="warning">Today</Badge>;
      case 'upcoming':
        return <Badge variant="success">Open</Badge>;
      case 'past':
        return <Badge variant="secondary">Past</Badge>;
      default:
        return null;
    }
  };

  const getAttendancePercentage = () => {
    return (event.currentAttendees / event.maxAttendees) * 100;
  };

  return (
    <>
      <Card className="w-full holo-card hover:neon-glow transition-all duration-500 transform hover:scale-[1.02] float">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold leading-tight cyber-text">{event.title}</CardTitle>
            {getStatusBadge()}
          </div>
          <p className="cyber-text opacity-80 text-sm line-clamp-2">{event.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm cyber-text">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm cyber-text">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm cyber-text">
            <Users className="w-4 h-4 text-green-400" />
            <span>{event.currentAttendees}/{event.maxAttendees} attendees</span>
          </div>
          
          {/* Attendance bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Attendance</span>
              <span>{spotsLeft} spots left</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getAttendancePercentage(), 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Stake Required:</span>
              <Badge variant="outline" className="font-mono">
                {event.stakeAmount} FLOW
              </Badge>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          {isUserStaked ? (
            <div className="w-full space-y-2">
              <Badge variant="success" className="w-full justify-center py-2">
                ✓ You're attending this event
              </Badge>
              <p className="text-xs text-muted-foreground text-center">
                Your {event.stakeAmount} FLOW stake will be returned after check-in
              </p>
            </div>
          ) : status === 'full' ? (
            <Button variant="secondary" disabled className="w-full">
              Event is Full
            </Button>
          ) : status === 'past' ? (
            <Button variant="secondary" disabled className="w-full">
              Event Has Ended
            </Button>
          ) : !userAddress ? (
            <Button variant="outline" disabled className="w-full">
              Connect Wallet to Stake
            </Button>
          ) : (
            <Button 
              onClick={() => setShowStakeModal(true)}
              className="w-full"
              disabled={isStaking}
            >
              {isStaking ? 'Staking...' : `Stake ${event.stakeAmount} FLOW to Attend`}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {showStakeModal && (
        <StakeModal
          event={event}
          onStake={handleStake}
          onClose={() => setShowStakeModal(false)}
          isLoading={isStaking}
        />
      )}
    </>
  );
}
