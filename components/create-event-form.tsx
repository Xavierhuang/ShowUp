'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CreateEventFormProps {
  onCreateEvent: (eventData: {
    title: string;
    description: string;
    date: string;
    location: string;
    stakeAmount: string;
    maxAttendees: number;
    creator: string;
  }) => Promise<void>;
  userAddress: string;
  onClose: () => void;
}

export function CreateEventForm({ onCreateEvent, userAddress, onClose }: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    stakeAmount: '10.0',
    maxAttendees: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const eventDate = new Date(formData.date);
      const now = new Date();
      if (eventDate <= now) {
        newErrors.date = 'Event date must be in the future';
      }
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }
    
    const stakeAmount = parseFloat(formData.stakeAmount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      newErrors.stakeAmount = 'Stake amount must be a positive number';
    }
    
    if (formData.maxAttendees < 1 || formData.maxAttendees > 1000) {
      newErrors.maxAttendees = 'Max attendees must be between 1 and 1000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onCreateEvent({
        ...formData,
        creator: userAddress
      });
      onClose();
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate minimum datetime for input (current time + 1 hour)
  const [minDateTime, setMinDateTime] = useState('');
  
  useEffect(() => {
    // Set minimum datetime on client side only to prevent hydration mismatch
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto holo-card neon-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-heading text-2xl">
            <Plus className="w-5 h-5 text-cyan-400" />
            CREATE NEW EVENT
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium cyber-text">Event Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Web3 Developer Meetup"
                className={`neon-border bg-black/50 text-white placeholder-gray-400 ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-sm text-red-400 neon-text">{errors.title}</p>}
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium cyber-text">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event, what attendees can expect, and any requirements..."
                className={`neon-border bg-black/50 text-white placeholder-gray-400 ${errors.description ? 'border-red-500' : ''}`}
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-400 neon-text">{errors.description}</p>}
            </div>

            {/* Date and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 cyber-text">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={minDateTime}
                  className={`neon-border bg-black/50 text-white ${errors.date ? 'border-red-500' : ''}`}
                />
                {errors.date && <p className="text-sm text-red-400 neon-text">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 cyber-text">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  Location *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className={`neon-border bg-black/50 text-white placeholder-gray-400 ${errors.location ? 'border-red-500' : ''}`}
                />
                {errors.location && <p className="text-sm text-red-400 neon-text">{errors.location}</p>}
              </div>
            </div>

            {/* Stake Amount and Max Attendees Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 cyber-text">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Stake Amount (FLOW) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.stakeAmount}
                  onChange={(e) => handleInputChange('stakeAmount', e.target.value)}
                  placeholder="10.0"
                  className={`neon-border bg-black/50 text-white placeholder-gray-400 ${errors.stakeAmount ? 'border-red-500' : ''}`}
                />
                {errors.stakeAmount && <p className="text-sm text-red-400 neon-text">{errors.stakeAmount}</p>}
                <p className="text-xs cyber-text opacity-70">
                  Amount each attendee must stake to secure their spot
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 cyber-text">
                  <Users className="w-4 h-4 text-orange-400" />
                  Max Attendees *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
                  placeholder="50"
                  className={`neon-border bg-black/50 text-white placeholder-gray-400 ${errors.maxAttendees ? 'border-red-500' : ''}`}
                />
                {errors.maxAttendees && <p className="text-sm text-red-400 neon-text">{errors.maxAttendees}</p>}
              </div>
            </div>

            {/* Info Box */}
            <div className="holo-card bg-cyan-500/10 border border-cyan-400/50 rounded-lg p-4">
              <h4 className="font-medium cyber-text text-cyan-400 mb-2">⚡ How it works:</h4>
              <ul className="text-sm cyber-text space-y-1">
                <li>• Attendees stake FLOW tokens to secure their spot</li>
                <li>• Stakes are returned when attendees check in at the event</li>
                <li>• No-shows forfeit their stake, ensuring committed attendance</li>
                <li>• You can check in attendees using the event management dashboard</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 neon-border hover:bg-red-500/20">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 cyber-button neon-glow"
              >
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
