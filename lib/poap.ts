// POAP (Proof of Attendance Protocol) Integration
// https://poap.xyz/

interface POAPEvent {
  id: number;
  fancy_id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  expiry_date: string;
  image_url: string;
  animation_url?: string;
  year: number;
  supply: number;
}

interface POAPToken {
  event: POAPEvent;
  tokenId: string;
  owner: string;
  created: string;
}

interface CreatePOAPEventRequest {
  name: string;
  description: string;
  city: string;
  country: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  expiry_date: string; // YYYY-MM-DD
  image: File | string; // Base64 or File
  secret_code?: string;
  private_event?: boolean;
  requested_codes?: number;
}

interface POAPMintRequest {
  eventId: number;
  address: string;
  secret?: string;
}

export class POAPService {
  private static readonly BASE_URL = 'https://api.poap.tech';
  private static readonly PUBLIC_API = 'https://api.poap.xyz'; // Public read-only API
  
  // Get POAP event details (public API)
  static async getEvent(eventId: number): Promise<POAPEvent> {
    try {
      const response = await fetch(`${this.PUBLIC_API}/events/id/${eventId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch POAP event: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('POAP API Error:', error);
      throw error;
    }
  }
  
  // Get POAPs owned by an address (public API)
  static async getPOAPsByAddress(address: string): Promise<POAPToken[]> {
    try {
      const response = await fetch(`${this.PUBLIC_API}/actions/scan/${address}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch POAPs: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('POAP API Error:', error);
      return [];
    }
  }
  
  // NOTE: POAP creation is currently "internal use only" - not available via public API
  // This would require manual submission through POAP's admin interface
  static async createPOAPEvent(eventData: CreatePOAPEventRequest): Promise<POAPEvent> {
    // For production, this would require:
    // 1. Manual submission through POAP admin interface
    // 2. POAP Curation Body review and approval
    // 3. Internal API access (not publicly available)
    
    throw new Error('POAP creation requires manual submission through POAP admin interface. Currently for internal use only.');
  }
  
  // Mint POAP to an address (requires mint links or admin access)
  static async mintPOAP(mintData: POAPMintRequest): Promise<POAPToken> {
    try {
      const response = await fetch(`${this.BASE_URL}/actions/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.API_KEY,
        },
        body: JSON.stringify(mintData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mint POAP: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('POAP Mint Error:', error);
      throw error;
    }
  }
  
  // Generate POAP mint links for an event
  static async generateMintLinks(eventId: number, amount: number): Promise<string[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/event/${eventId}/mint-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.API_KEY,
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate mint links: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.mint_links || [];
    } catch (error) {
      console.error('POAP Mint Links Error:', error);
      throw error;
    }
  }
  
  // Check if address owns specific POAP
  static async hasEventPOAP(address: string, eventId: number): Promise<boolean> {
    try {
      const poaps = await this.getPOAPsByAddress(address);
      return poaps.some(poap => poap.event.id === eventId);
    } catch (error) {
      console.error('POAP Check Error:', error);
      return false;
    }
  }
  
  // For production: Would require manual POAP creation through admin interface
  static async createShowUpPOAP(
    eventTitle: string,
    eventDescription: string,
    eventDate: string,
    location: string,
    imageUrl?: string
  ): Promise<POAPEvent> {
    // PRODUCTION WORKFLOW:
    // 1. Event organizer manually submits POAP through https://app.poap.xyz/admin/events
    // 2. Includes: title, description, image (500x500 circle), dates, location
    // 3. POAP Curation Body reviews (1-3 days)
    // 4. If approved, organizer receives mint links via email
    // 5. ShowUp platform would integrate those mint links
    
    throw new Error(`Production workflow required:
1. Manually submit POAP at https://app.poap.xyz/admin/events
2. Title: "ShowUp: ${eventTitle}"
3. Description: "Proof of attendance for ${eventTitle} via ShowUp platform"
4. Wait for Curation Body approval
5. Add approved mint links to ShowUp platform`);
  }
  
  // Mock functions for demo purposes
  static async createDemoPOAP(eventTitle: string): Promise<{ poapId: number; mintLink: string }> {
    // For hackathon demo - simulate POAP creation
    const mockPoapId = Math.floor(Math.random() * 100000) + 150000; // Realistic POAP ID
    const mockMintLink = `https://poap.delivery/claim/${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`🎖️ Demo POAP created for: ${eventTitle}`);
    console.log(`📍 POAP ID: ${mockPoapId}`);
    console.log(`🔗 Mint Link: ${mockMintLink}`);
    
    return {
      poapId: mockPoapId,
      mintLink: mockMintLink
    };
  }
  
  static async simulatePOAPClaim(address: string, eventTitle: string): Promise<POAPToken> {
    // For hackathon demo - simulate POAP claim
    const mockPOAP: POAPToken = {
      event: {
        id: Math.floor(Math.random() * 100000) + 150000,
        fancy_id: eventTitle.toLowerCase().replace(/\s+/g, '-'),
        name: `ShowUp: ${eventTitle}`,
        description: `Proof of attendance for ${eventTitle} via ShowUp platform`,
        city: 'San Francisco',
        country: 'USA',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image_url: 'https://assets.poap.xyz/showup-demo-badge.png',
        year: new Date().getFullYear(),
        supply: 1
      },
      tokenId: Math.floor(Math.random() * 1000000).toString(),
      owner: address,
      created: new Date().toISOString()
    };
    
    console.log(`🎖️ POAP claimed by: ${address}`);
    console.log(`🏆 Token ID: ${mockPOAP.tokenId}`);
    
    return mockPOAP;
  }
}
