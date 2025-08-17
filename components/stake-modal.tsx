'use client';

import { useState } from 'react';
import { X, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { EventData, formatEventDate } from '@/lib/events';

interface StakeModalProps {
  event: EventData;
  onStake: (amount: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function StakeModal({ event, onStake, onClose, isLoading }: StakeModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleStake = async () => {
    await onStake(event.stakeAmount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Stake to Attend Event</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Event Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold">{event.title}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📅 {formatEventDate(event.date)}</p>
              <p>📍 {event.location}</p>
            </div>
          </div>
          
          {/* Stake Details */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Stake Amount:</span>
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {event.stakeAmount} FLOW
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 mt-0.5 text-green-500" />
                <div>
                  <p className="font-medium text-foreground">How staking works:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Your FLOW tokens are locked until the event</li>
                    <li>• Check in at the event to get your stake back</li>
                    <li>• No-shows forfeit their stake</li>
                    <li>• Stakes help ensure committed attendance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Important Notice
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  By staking, you commit to attending this event. If you don't check in at the event, you will forfeit your {event.stakeAmount} FLOW stake.
                </p>
              </div>
            </div>
          </div>
          
          {/* Confirmation */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="confirm" className="text-sm cursor-pointer">
              I understand that I will forfeit my stake if I don't attend and check in at this event
            </label>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleStake}
              disabled={!confirmed || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Confirming...' : `Stake ${event.stakeAmount} FLOW`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
