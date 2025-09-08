import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { eventApi } from '@/lib/api';
import { Event, EventTicket, BookingRecord, BookingTicket } from '@/types/event';
import { ticketUpdateService } from '@/services/ticketService';

// Helper function to determine if an object is a BookingRecord
const isBookingRecord = (item: any): item is BookingRecord => {
  return item && Array.isArray(item.tickets);
};

// Helper function to determine if an object is an EventTicket
const isEventTicket = (item: any): item is EventTicket => {
  return item && typeof item.ticketType === 'string';
};

// Helper function to extract ticket information from mixed data
const extractTicketsFromData = (data: (BookingRecord | EventTicket)[]): EventTicket[] => {
  const tickets: EventTicket[] = [];
  
  data.forEach(item => {
    if (isBookingRecord(item)) {
      // Convert BookingRecord to individual EventTickets
      item.tickets.forEach((bookingTicket: BookingTicket) => {
        const ticket: EventTicket = {
          id: `${item.id}-${bookingTicket.type}`,
          eventId: item.eventId,
          ticketType: bookingTicket.type,
          price: bookingTicket.price,
          quantity: bookingTicket.quantity,
          currency: item.currency || 'THB',
          holder: item.holder || item.customerInfo || { name: '', email: '', phone: '' },
          customerInfo: item.customerInfo || item.holder,
          purchaseDate: new Date().toISOString(),
          status: 'confirmed', // Assume confirmed for dashboard
          totalAmount: item.totalAmount,
          notes: item.notes
        };
        tickets.push(ticket);
      });
    } else if (isEventTicket(item)) {
      // Already an EventTicket
      tickets.push(item);
    }
  });
  
  return tickets;
};

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [tickets, setTickets] = React.useState<(BookingRecord | EventTicket)[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const loadEventsAndTickets = async () => {
      try {
        setIsLoading(true);
        
        // Fetch events and tickets in parallel
        const [eventsResponse, ticketsData] = await Promise.all([
          eventApi.getEvents(),
          eventApi.getTickets()
        ]);
        
        setEvents(eventsResponse.events || []);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Failed to load events and tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEventsAndTickets();
  }, []);

  // Subscribe to real-time updates for events
  React.useEffect(() => {
    const unsubscribe = ticketUpdateService.subscribe((updatedEvent) => {
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    });

    // Start polling for updates
    ticketUpdateService.startPolling();

    return () => {
      unsubscribe();
    };
  }, []);

  // Calculate actual participants for each event
  const getEventParticipants = (eventId: string) => {
    // Extract individual tickets from mixed data (BookingRecords and EventTickets)
    const allTickets = extractTicketsFromData(tickets);
    
    // Filter confirmed tickets for this specific event
    const eventTickets = allTickets.filter(
      ticket => ticket.eventId === eventId && ticket.status === 'confirmed'
    );
    
    // Calculate total participants from ticket quantities
    const totalParticipants = eventTickets.reduce((sum, ticket) => {
      return sum + (ticket.quantity || 1);
    }, 0);
    
    return totalParticipants;
  };

  const filteredEvents = events.filter(event =>
    (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-active">เปิดใช้งาน</Badge>;
      case 'draft':
        return <Badge variant="secondary">ฉบับร่าง</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'ไม่ระบุวันที่';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'วันที่ไม่ถูกต้อง';
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Enhanced Header with gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            จัดการอีเว้นท์
          </h1>
          <p className="text-muted-foreground mt-2">
            สร้าง แก้ไข และจัดการอีเว้นท์ทั้งหมด
          </p>
        </div>
        <Button asChild className="bg-gradient-primary hover:shadow-lg transition-all">
          <Link to="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" />
            สร้างอีเว้นท์ใหม่
          </Link>
        </Button>
      </div>

      {/* Enhanced Search and Filter Section */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาอีเว้นท์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 border-primary/20 hover:bg-primary/10">
              <Filter className="h-4 w-4" />
              กรอง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Events Table */}
      <Card className="shadow-sm hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            รายการอีเว้นท์
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded loading-shimmer" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Calendar className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <p className="text-muted-foreground">
                ไม่พบอีเว้นท์
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/admin/events/create">
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างอีเว้นท์ใหม่
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">ชื่ออีเว้นท์</TableHead>
                    <TableHead className="font-semibold">หมวดหมู่</TableHead>
                    <TableHead className="font-semibold">วันที่</TableHead>
                    <TableHead className="font-semibold">สถานะ</TableHead>
                    <TableHead className="font-semibold">ผู้เข้าร่วม</TableHead>
                    <TableHead className="text-right font-semibold">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow 
                      key={event.id} 
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.organizer?.name || 'ไม่ระบุผู้จัด'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {event.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(event.schedule?.startDate || '')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(event.status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {getEventParticipants(event.id).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            / {(event.capacity?.max || 0).toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10" asChild>
                            <Link to={`/events/${event.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10" asChild>
                            <Link to={`/admin/events/${event.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-destructive/20 hover:bg-destructive/10"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}