import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EventCard from '@/components/events/EventCard';
import EditEventModal from '@/components/admin/EditEventModal';
import { eventApi } from '@/lib/api';
import { Event } from '@/types/event';

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await eventApi.getEvents();
        setEvents(response.events || []);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setIsEditModalOpen(true);
    }
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบอีเว้นท์นี้?')) {
      try {
        await eventApi.deleteEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
        alert('ลบอีเว้นท์เรียบร้อยแล้ว');
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('เกิดข้อผิดพลาดในการลบอีเว้นท์');
      }
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการอีเว้นท์</h1>
          <p className="text-muted-foreground mt-2">
            สร้าง แก้ไข และจัดการอีเว้นท์ทั้งหมด
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" />
            สร้างอีเว้นท์ใหม่
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาอีเว้นท์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          กรอง
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-xl loading-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isAdmin={true}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}
      
      <EditEventModal
        event={editingEvent}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
}