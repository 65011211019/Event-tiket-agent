import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/AppContext';

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [tickets, setTickets] = React.useState<(BookingRecord | EventTicket)[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [dateFilter, setDateFilter] = React.useState<string>('all');
  
  // Available categories
  const [availableCategories, setAvailableCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Check for alert message from navigation state
    if (location.state?.alert) {
      toast({
        title: location.state.alert.title,
        description: location.state.alert.description,
      });
      
      // Clear the state to prevent showing the alert again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
        
        // Extract unique categories
        const categories = [...new Set((eventsResponse.events || []).map(event => event.category))];
        setAvailableCategories(categories);
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

  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = 
      (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    // Date filter (simplified - in a real app, you might want more sophisticated date filtering)
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const eventDate = new Date(event.schedule?.startDate || '');
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = eventDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesDate = eventDate >= now && eventDate <= weekFromNow;
          break;
        case 'month':
          const monthFromNow = new Date();
          monthFromNow.setMonth(monthFromNow.getMonth() + 1);
          matchesDate = eventDate >= now && eventDate <= monthFromNow;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm(t('adminEvents.messages.deleteConfirm'))) {
      try {
        await eventApi.deleteEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
        toast({
          title: t('adminEvents.messages.deleteSuccess'),
          description: t('adminEvents.messages.deleteSuccess'),
        });
      } catch (error) {
        console.error('Failed to delete event:', error);
        toast({
          title: t('adminEvents.messages.deleteError'),
          description: t('adminEvents.messages.deleteError'),
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-active">{t('adminEvents.statuses.active')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('adminEvents.statuses.draft')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('adminEvents.statuses.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('adminEvents.noDate');
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return t('adminEvents.invalidDate');
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
            {t('adminEvents.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('adminEvents.subtitle')}
          </p>
        </div>
        <Button asChild className="bg-gradient-primary hover:shadow-lg transition-all text-primary-foreground">
          <Link to="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('adminEvents.createNewEvent')}
          </Link>
        </Button>
      </div>

      {/* Enhanced Search and Filter Section */}
      <Card className="shadow-sm bg-card text-card-foreground">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('adminEvents.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background text-foreground border-input"
              />
            </div>
            
            <div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">{t('adminEvents.filters.allCategories')}</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">{t('adminEvents.filters.allStatuses')}</option>
                <option value="active">{t('adminEvents.statuses.active')}</option>
                <option value="draft">{t('adminEvents.statuses.draft')}</option>
                <option value="cancelled">{t('adminEvents.statuses.cancelled')}</option>
              </select>
            </div>
            
            <div>
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">{t('adminEvents.filters.allDates')}</option>
                <option value="today">{t('adminEvents.filters.today')}</option>
                <option value="week">{t('adminEvents.filters.thisWeek')}</option>
                <option value="month">{t('adminEvents.filters.thisMonth')}</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="border-input hover:bg-accent hover:text-accent-foreground"
            >
{t('adminEvents.filters.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Events Table */}
      <Card className="shadow-sm hover:shadow-lg transition-all bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            {t('adminEvents.table.title')}
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
                {t('adminEvents.emptyState.title')}
              </p>
              <Button asChild variant="outline" className="mt-4 border-input hover:bg-accent">
                <Link to="/admin/events/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('adminEvents.createNewEvent')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground">{t('adminEvents.table.eventName')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('adminEvents.table.category')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('adminEvents.table.date')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('adminEvents.table.status')}</TableHead>
                    <TableHead className="font-semibold text-foreground">{t('adminEvents.table.participants')}</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">{t('adminEvents.table.actions')}</TableHead>
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
                          {event.organizer?.name || t('adminEvents.noOrganizer')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize border-border">
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
                          <Button variant="outline" size="sm" className="border-input hover:bg-accent" asChild>
                            <Link to={`/events/${event.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="border-input hover:bg-accent" asChild>
                            <Link to={`/admin/events/${event.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-destructive/20 hover:bg-destructive/10 text-destructive"
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
