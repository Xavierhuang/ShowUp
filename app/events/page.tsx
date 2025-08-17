'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useDynamicContext, useIsLoggedIn } from '@/lib/dynamic';
import { isFlowWallet } from '@dynamic-labs/flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EventCard } from '@/components/event-card';
import { CreateEventForm } from '@/components/create-event-form';
import { eventStore, EventData } from '@/lib/events';
import { FlowService } from '@/lib/flow';

type EventFilter = 'all' | 'upcoming' | 'today' | 'past';

export default function EventsPage() {
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet, user } = useDynamicContext();
  const [events, setEvents] = useState<EventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<EventFilter>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userStakes, setUserStakes] = useState<string[]>([]);
  const [flowBalance, setFlowBalance] = useState<string>('0.0');
  const [isLoading, setIsLoading] = useState(true);

  const userAddress = primaryWallet?.address || '';
  const isFlowConnected = primaryWallet && isFlowWallet(primaryWallet);

  // Load events and user data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load events
        const allEvents = eventStore.getAllEvents();
        setEvents(allEvents);
        setFilteredEvents(allEvents);

        // Load user stakes if connected
        if (isLoggedIn && userAddress) {
          const stakes = eventStore.getUserStakes(userAddress);
          setUserStakes(stakes.map(stake => stake.eventId));

          // Load Flow balance if Flow wallet is connected
          if (isFlowConnected) {
            try {
              const balance = await FlowService.getBalance(userAddress);
              setFlowBalance(balance);
            } catch (error) {
              console.error('Failed to load Flow balance:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn, userAddress, isFlowConnected]);

  // Filter events based on search and filter
  useEffect(() => {
    let filtered = events;

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        const isToday = eventDate.toDateString() === now.toDateString();
        const isUpcoming = eventDate > now;
        const isPast = eventDate < now && !isToday;

        switch (filter) {
          case 'today':
            return isToday;
          case 'upcoming':
            return isUpcoming && !isToday;
          case 'past':
            return isPast;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filter]);

  const handleCreateEvent = async (eventData: any) => {
    try {
      if (isFlowConnected) {
        // Create event on Flow blockchain
        await FlowService.createEvent(eventData);
      }
      
      // Add to local store
      const eventId = eventStore.createEvent(eventData);
      
      // Refresh events list
      const allEvents = eventStore.getAllEvents();
      setEvents(allEvents);
      
      console.log('Event created successfully:', eventId);
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  };

  const handleStakeForEvent = async (eventId: string, amount: string) => {
    if (!isLoggedIn || !userAddress) {
      throw new Error('Please connect your wallet first');
    }

    try {
      if (isFlowConnected) {
        // Stake on Flow blockchain
        await FlowService.stakeForEvent(eventId, amount);
      }
      
      // Update local store
      const success = eventStore.stakeForEvent(eventId, userAddress, amount);
      if (!success) {
        throw new Error('Failed to stake for event');
      }
      
      // Refresh data
      const allEvents = eventStore.getAllEvents();
      setEvents(allEvents);
      
      const stakes = eventStore.getUserStakes(userAddress);
      setUserStakes(stakes.map(stake => stake.eventId));
      
      console.log('Successfully staked for event:', eventId);
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  };

  const getFilterCount = (filterType: EventFilter) => {
    if (filterType === 'all') return events.length;
    
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const isToday = eventDate.toDateString() === now.toDateString();
      const isUpcoming = eventDate > now;
      const isPast = eventDate < now && !isToday;

      switch (filterType) {
        case 'today':
          return isToday;
        case 'upcoming':
          return isUpcoming && !isToday;
        case 'past':
          return isPast;
        default:
          return true;
      }
    }).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-grid">
        <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-lg w-1/3 mx-auto neon-glow"></div>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 holo-card bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-lg pulse-glow"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="space-y-6">
            <h1 className="cyber-heading text-4xl md:text-6xl font-black tracking-wider">
              CYBER EVENTS
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto neon-glow"></div>
            <p className="cyber-text text-lg opacity-90 max-w-2xl mx-auto">
              Stake FLOW or FLR tokens to secure your spot at the most exclusive Web3 events
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          
          <div className="flex items-center gap-4">
            {isFlowConnected && (
              <div className="text-sm">
                <Badge variant="outline" className="font-mono neon-border bg-cyan-400/10 text-cyan-400">
                  💰 {parseFloat(flowBalance).toFixed(2)} FLOW
                </Badge>
              </div>
            )}
            
            {isLoggedIn && (
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 cyber-button neon-glow">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative holo-card p-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
            <Input
              placeholder="Search events by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-cyan-400/30 text-white placeholder-gray-400 neon-border"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(['all', 'upcoming', 'today', 'past'] as EventFilter[]).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className={`capitalize cyber-button ${filter === filterType ? 'neon-glow' : 'neon-border'}`}
              >
                {filterType} ({getFilterCount(filterType)})
              </Button>
            ))}
          </div>
        </div>

        {/* Connection Warning */}
        {isLoggedIn && !isFlowConnected && (
          <div className="holo-card bg-orange-500/10 border border-orange-400/50 rounded-lg p-4 mb-8 neon-glow">
            <p className="cyber-text text-orange-400">
              ⚡ Connect a Flow wallet to stake for events and interact with the Flow blockchain.
            </p>
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 holo-card">
            <p className="cyber-text mb-4 text-lg">
              {searchTerm || filter !== 'all' 
                ? '🔍 No events match your search criteria' 
                : '🚀 No events available yet'
              }
            </p>
            {isLoggedIn && (
              <Button onClick={() => setShowCreateForm(true)} className="cyber-button neon-glow">
                Create the first event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onStake={handleStakeForEvent}
                userAddress={userAddress}
                userStakes={userStakes}
              />
            ))}
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateForm && (
          <CreateEventForm
            onCreateEvent={handleCreateEvent}
            userAddress={userAddress}
            onClose={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </div>
  );
}
