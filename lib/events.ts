'use client';

import { EventData, StakeData } from './flow';

// Mock database for development - replace with real database in production
class MockEventStore {
  private events: Map<string, EventData> = new Map();
  private stakes: Map<string, StakeData[]> = new Map();

  // Initialize with some sample events
  constructor() {
    this.initializeSampleEvents();
  }

  private initializeSampleEvents() {
    const sampleEvents: EventData[] = [
      {
        id: "event-1",
        title: "Tech Meetup: Web3 & Flow Blockchain",
        description: "Join us for an evening of learning about Web3 development on Flow blockchain. We'll cover smart contracts, NFTs, and DeFi protocols.",
        date: "2024-02-15T18:00:00Z",
        location: "San Francisco, CA",
        stakeAmount: "10.0",
        maxAttendees: 50,
        currentAttendees: 23,
        creator: "0x1234567890abcdef",
        isActive: true,
        attendees: []
      },
      {
        id: "event-2", 
        title: "Flow Developer Workshop",
        description: "Hands-on workshop building your first dApp on Flow. Bring your laptop and get ready to code!",
        date: "2024-02-20T14:00:00Z",
        location: "New York, NY",
        stakeAmount: "25.0",
        maxAttendees: 30,
        currentAttendees: 18,
        creator: "0xabcdef1234567890",
        isActive: true,
        attendees: []
      },
      {
        id: "event-3",
        title: "NFT Art Gallery Opening",
        description: "Exclusive preview of digital art NFTs created by local artists. Network with creators and collectors.",
        date: "2024-02-25T19:00:00Z", 
        location: "Los Angeles, CA",
        stakeAmount: "15.0",
        maxAttendees: 100,
        currentAttendees: 67,
        creator: "0x9876543210fedcba",
        isActive: true,
        attendees: []
      },
      {
        id: "event-4",
        title: "DeFi Protocol Deep Dive",
        description: "Learn about decentralized finance protocols, yield farming, and liquidity mining on Flow.",
        date: "2024-03-01T16:00:00Z",
        location: "Austin, TX", 
        stakeAmount: "20.0",
        maxAttendees: 40,
        currentAttendees: 12,
        creator: "0xfedcba0987654321",
        isActive: true,
        attendees: []
      }
    ];

    sampleEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  createEvent(eventData: Omit<EventData, 'id' | 'currentAttendees' | 'isActive' | 'attendees'>): string {
    const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const event: EventData = {
      ...eventData,
      id,
      currentAttendees: 0,
      isActive: true,
      attendees: []
    };
    
    this.events.set(id, event);
    return id;
  }

  getEvent(id: string): EventData | null {
    return this.events.get(id) || null;
  }

  getAllEvents(): EventData[] {
    return Array.from(this.events.values()).filter(event => event.isActive);
  }

  getUserEvents(userAddress: string): EventData[] {
    return Array.from(this.events.values()).filter(event => 
      event.creator === userAddress || event.attendees.includes(userAddress)
    );
  }

  stakeForEvent(eventId: string, userAddress: string, amount: string): boolean {
    const event = this.events.get(eventId);
    if (!event || !event.isActive || event.currentAttendees >= event.maxAttendees) {
      return false;
    }

    // Check if user already staked for this event
    const userStakes = this.stakes.get(userAddress) || [];
    if (userStakes.some(stake => stake.eventId === eventId)) {
      return false;
    }

    // Add stake record
    const stake: StakeData = {
      eventId,
      user: userAddress,
      amount,
      timestamp: new Date().toISOString(),
      isCheckedIn: false
    };

    if (!this.stakes.has(userAddress)) {
      this.stakes.set(userAddress, []);
    }
    this.stakes.get(userAddress)!.push(stake);

    // Update event
    event.currentAttendees++;
    event.attendees.push(userAddress);
    this.events.set(eventId, event);

    return true;
  }

  checkIn(eventId: string, userAddress: string): boolean {
    const userStakes = this.stakes.get(userAddress) || [];
    const stake = userStakes.find(s => s.eventId === eventId);
    
    if (!stake) {
      return false;
    }

    stake.isCheckedIn = true;
    return true;
  }

  getUserStakes(userAddress: string): StakeData[] {
    return this.stakes.get(userAddress) || [];
  }

  getEventStakes(eventId: string): StakeData[] {
    const allStakes: StakeData[] = [];
    for (const userStakes of this.stakes.values()) {
      allStakes.push(...userStakes.filter(stake => stake.eventId === eventId));
    }
    return allStakes;
  }

  updateEvent(id: string, updates: Partial<EventData>): boolean {
    const event = this.events.get(id);
    if (!event) {
      return false;
    }

    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return true;
  }

  deleteEvent(id: string): boolean {
    return this.events.delete(id);
  }
}

// Global store instance
export const eventStore = new MockEventStore();

// Helper functions for date formatting
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isEventUpcoming(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

export function isEventToday(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  return eventDate.toDateString() === today.toDateString();
}

export function getEventStatus(event: EventData): 'upcoming' | 'today' | 'past' | 'full' {
  if (event.currentAttendees >= event.maxAttendees) {
    return 'full';
  }
  
  if (isEventToday(event.date)) {
    return 'today';
  }
  
  if (isEventUpcoming(event.date)) {
    return 'upcoming';
  }
  
  return 'past';
}

export default eventStore;
