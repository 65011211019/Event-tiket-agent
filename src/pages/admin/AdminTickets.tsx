import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ChevronLeft, Eye, QrCode, Ticket, Trash2 } from 'lucide-react';
import { eventApi } from '@/lib/api';
import { EventTicket, BookingRecord, BookingTicket } from '@/types/event';
import { useLanguage } from '@/contexts/AppContext';
import QRCodeModal from '@/components/tickets/QRCodeModal';

// Helper function to determine if an object is a BookingRecord
const isBookingRecord = (item: any): item is BookingRecord => {
  return item && Array.isArray(item.tickets);
};

// Helper function to determine if an object is an EventTicket
const isEventTicket = (item: any): item is EventTicket => {
  return item && typeof item.ticketType === 'string';
};

// Helper function to convert booking records to individual tickets
const convertToIndividualTickets = (data: (BookingRecord | EventTicket)[]): EventTicket[] => {
  const tickets: EventTicket[] = [];
  
  data.forEach(item => {
    if (isBookingRecord(item)) {
      // Convert each ticket in the booking to an individual EventTicket
      item.tickets.forEach((bookingTicket: BookingTicket, index) => {
        const ticket: EventTicket = {
          id: `${item.id}-${index}`, // Create unique ID for each ticket
          eventId: item.eventId,
          ticketType: bookingTicket.type,
          price: bookingTicket.price,
          quantity: bookingTicket.quantity,
          currency: item.currency || 'THB',
          holder: item.holder || item.customerInfo || { name: '', email: '', phone: '' },
          customerInfo: item.customerInfo || item.holder,
          purchaseDate: new Date().toISOString(), // Use current date as fallback
          status: 'confirmed', // Assume confirmed for display
          totalAmount: bookingTicket.price * bookingTicket.quantity,
          notes: item.notes,
          event: undefined // Will be populated if needed
        };
        tickets.push(ticket);
      });
    } else if (isEventTicket(item)) {
      // Already an individual ticket
      tickets.push(item);
    }
  });
  
  return tickets;
};

export default function AdminTickets() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('all');
  
  // Ticket types state with Thai descriptions
  const [ticketTypes, setTicketTypes] = useState<Array<{id: string, name: string, price: number, description: string}>>([]);
  const [ticketTypesLoading, setTicketTypesLoading] = useState(true);

  // Pagination state for tickets
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    const fetchAllTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all tickets from the API
        const rawData = await eventApi.getTickets();
        
        // Convert booking records to individual tickets
        let individualTickets = convertToIndividualTickets(rawData);
        
        // Sort tickets from newest to oldest based on purchase date
        individualTickets = individualTickets.sort((a, b) => {
          const dateA = new Date(a.purchaseDate || '').getTime();
          const dateB = new Date(b.purchaseDate || '').getTime();
          return dateB - dateA; // Newest first
        });
        
        setTickets(individualTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(t('adminTickets.messages.loadError'));
      } finally {
        setLoading(false);
      }
    };

    const fetchTicketTypes = async () => {
      try {
        setTicketTypesLoading(true);
        // In a real implementation, this would fetch from a dedicated ticket types API
        // For now, we'll extract ticket types from existing tickets
        const rawData = await eventApi.getTickets();
        const individualTickets = convertToIndividualTickets(rawData);
        
        // Extract unique ticket types with Thai names and descriptions
        const uniqueTicketTypes = Array.from(
          new Map(
            individualTickets.map(ticket => {
              const ticketInfo = getTicketTypeInfo(ticket.ticketType);
              return [
                ticket.ticketType,
                {
                  id: ticket.ticketType,
                  name: ticketInfo.name, // Use Thai name
                  price: ticket.price || 0,
                  description: ticketInfo.description // Use Thai description
                }
              ];
            })
          ).values()
        );
        
        setTicketTypes(uniqueTicketTypes);
      } catch (err) {
        console.error('Error fetching ticket types:', err);
      } finally {
        setTicketTypesLoading(false);
      }
    };

    fetchAllTickets();
    fetchTicketTypes();
  }, []);

  // Reset to first page when tickets change
  useEffect(() => {
    setCurrentPage(1);
  }, [tickets]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('adminTickets.noDate');
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return t('adminTickets.invalidDate');
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="status-active">{t('adminTickets.statuses.confirmed')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('adminTickets.statuses.pending')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('adminTickets.statuses.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleShowQR = (ticket: EventTicket) => {
    setSelectedTicket(ticket);
    setIsQRModalOpen(true);
  };

  const handleCloseQR = () => {
    setIsQRModalOpen(false);
    setSelectedTicket(null);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-muted rounded loading-shimmer" />
              <div className="h-4 w-64 bg-muted rounded mt-2 loading-shimmer" />
            </div>
            <div className="h-10 w-32 bg-muted rounded loading-shimmer" />
          </div>
          <div className="h-32 bg-muted rounded-lg loading-shimmer" />
          <div className="h-96 bg-muted rounded-lg loading-shimmer" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-destructive/20 bg-destructive/10 text-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">{t('adminTickets.messages.errorOccurred')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 border-destructive/20 hover:bg-destructive/10 text-destructive"
                onClick={() => window.location.reload()}
              >
{t('adminTickets.messages.tryAgain')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics for all tickets (not just current page)
  const totalTickets = tickets.length;
  const confirmedTickets = tickets.filter(t => t.status === 'confirmed').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const cancelledTickets = tickets.filter(t => t.status === 'cancelled').length;

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    // Search filter (check multiple fields)
    const matchesSearch = 
      searchQuery === '' ||
      (ticket.event?.title && ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticket.holder?.name && ticket.holder.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticket.holder?.email && ticket.holder.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticket.ticketType && ticket.ticketType.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    // Ticket type filter
    const matchesTicketType = ticketTypeFilter === 'all' || ticket.ticketType === ticketTypeFilter;
    
    return matchesSearch && matchesStatus && matchesTicketType;
  });

  // Calculate statistics for current page
  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * ticketsPerPage, 
    currentPage * ticketsPerPage
  );

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header with gradient */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('adminTickets.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('adminTickets.subtitle')}
            </p>
          </div>
        </div>

        {/* Enhanced Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-lift transition-all border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminTickets.stats.totalTickets')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {filteredTickets.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-all border border-success/20 bg-card text-card-foreground shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminTickets.stats.confirmed')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {filteredTickets.filter(t => t.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-all border border-warning/20 bg-card text-card-foreground shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminTickets.stats.pending')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {filteredTickets.filter(t => t.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-all border border-destructive/20 bg-card text-card-foreground shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminTickets.stats.cancelled')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {filteredTickets.filter(t => t.status === 'cancelled').length}
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Enhanced Tickets Table */}
        <Card className="shadow-sm hover:shadow-lg transition-all bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-primary" />
              {t('adminTickets.ticketList.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Ticket className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <p className="text-muted-foreground">
                  {t('adminTickets.noTickets')}
                </p>
              </div>
            ) : (
              <>
                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="relative col-span-2">
                    <input
                      type="text"
                      placeholder={t('adminTickets.ticketList.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <select 
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1); // Reset to first page when filtering
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">{t('adminTickets.ticketList.allStatuses')}</option>
                      <option value="confirmed">{t('adminTickets.statuses.confirmed')}</option>
                      <option value="pending">{t('adminTickets.statuses.pending')}</option>
                      <option value="cancelled">{t('adminTickets.statuses.cancelled')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <select 
                      value={ticketTypeFilter}
                      onChange={(e) => {
                        setTicketTypeFilter(e.target.value);
                        setCurrentPage(1); // Reset to first page when filtering
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">{t('adminTickets.ticketList.allTicketTypes')}</option>
                      {[...new Set(tickets.map(ticket => ticket.ticketType))].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setTicketTypeFilter('all');
                      setCurrentPage(1);
                    }}
                    className="border-input hover:bg-accent hover:text-accent-foreground"
                  >
{t('adminTickets.ticketList.clearFilters')}
                  </Button>
                </div>
                
                <div className="rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold text-foreground">{t('adminTickets.table.event')}</TableHead>
                        <TableHead className="font-semibold text-foreground">{t('adminTickets.table.booker')}</TableHead>
                        <TableHead className="font-semibold text-foreground">{t('adminTickets.table.ticketType')}</TableHead>
                        <TableHead className="font-semibold text-foreground">{t('adminTickets.table.quantity')}</TableHead>
                        <TableHead className="font-semibold text-foreground">{t('adminTickets.table.price')}</TableHead>
                        <TableHead className="font-semibold text-foreground">{t('adminTickets.table.bookingDate')}</TableHead>
                        <TableHead className="font-semibold text-foreground">{t('adminTickets.table.status')}</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">{t('adminTickets.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Display only tickets for the current page */}
                      {filteredTickets
                        .slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage)
                        .map((ticket) => (
                        <TableRow 
                          key={ticket.id} 
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="font-medium">
                              {ticket.event?.title || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {ticket.eventId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {ticket.holder?.name || ticket.customerInfo?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {ticket.holder?.email || ticket.customerInfo?.email || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-border">
                              {ticket.ticketType}
                            </Badge>
                          </TableCell>
                          <TableCell>{ticket.quantity || 1}</TableCell>
                          <TableCell>
                            ฿{(ticket.totalAmount || ((ticket.price || 0) * (ticket.quantity || 1))).toLocaleString()}
                          </TableCell>
                          <TableCell>{formatDate(ticket.purchaseDate)}</TableCell>
                          <TableCell>{getTicketStatusBadge(ticket.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-input hover:bg-accent"
                                onClick={() => handleShowQR(ticket)}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-input hover:bg-accent"
                                asChild
                              >
                                <Link to={`/events/${ticket.eventId}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {t('adminTickets.pagination.showing')} {Math.min((currentPage - 1) * ticketsPerPage + 1, filteredTickets.length)} {t('adminTickets.pagination.to')} {Math.min(currentPage * ticketsPerPage, filteredTickets.length)} {t('adminTickets.pagination.of')} {filteredTickets.length} {t('adminTickets.pagination.items')}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || filteredTickets.length === 0}
                    >
{t('adminTickets.pagination.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTickets.length / ticketsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredTickets.length / ticketsPerPage) || filteredTickets.length === 0}
                    >
{t('adminTickets.pagination.next')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        <QRCodeModal 
          ticket={selectedTicket}
          isOpen={isQRModalOpen}
          onClose={handleCloseQR}
        />
      </div>
    </div>
  );
}

// Helper function to get Thai names and descriptions for ticket types
const getTicketTypeInfo = (ticketType: string) => {
  const ticketInfo: Record<string, { name: string; description: string }> = {
    'general': { 
      name: 'ตั๋วทั่วไป', 
      description: 'ตั๋วทั่วไปสำหรับผู้เข้าร่วมทั่วไป' 
    },
    'vip': { 
      name: 'ตั๋ว VIP', 
      description: 'ตั๋ว VIP พร้อมสิทธิประโยชน์พิเศษ' 
    },
    'student': { 
      name: 'ตั๋วนักศึกษา', 
      description: 'ตั๋วสำหรับนักเรียนนักศึกษา' 
    },
    'earlyBird': { 
      name: 'ตั๋วจองล่วงหน้า', 
      description: 'ตั๋วราคาพิเศษสำหรับผู้จองล่วงหน้า' 
    },
    'group': { 
      name: 'ตั๋วกลุ่ม', 
      description: 'ตั๋วสำหรับการจองเป็นกลุ่ม' 
    },
    'member': { 
      name: 'ตั๋วสมาชิก', 
      description: 'ตั๋วสำหรับสมาชิก' 
    },
    'free': { 
      name: 'ตั๋วฟรี', 
      description: 'ตั๋วฟรี' 
    },
    'adult': { 
      name: 'ตั๋วผู้ใหญ่', 
      description: 'ตั๋วสำหรับผู้ใหญ่' 
    },
    'child': { 
      name: 'ตั๋วเด็ก', 
      description: 'ตั๋วสำหรับเด็ก' 
    },
    'senior': { 
      name: 'ตั๋วผู้สูงอายุ', 
      description: 'ตั๋วสำหรับผู้สูงอายุ' 
    },
    'fullMarathon': { 
      name: 'มาราธอนเต็มระยะ', 
      description: 'ตั๋วสำหรับมาราธอนเต็มระยะ' 
    },
    'halfMarathon': { 
      name: 'มาราธอนครึ่งระยะ', 
      description: 'ตั๋วสำหรับมาราธอนครึ่งระยะ' 
    },
    'miniMarathon': { 
      name: 'มาราธอนระยะสั้น', 
      description: 'ตั๋วสำหรับมาราธอนระยะสั้น' 
    },
    'funRun': { 
      name: 'Fun Run', 
      description: 'ตั๋วสำหรับ Fun Run' 
    },
    'regular': { 
      name: 'ตั๋วปกติ', 
      description: 'ตั๋วปกติสำหรับผู้เข้าร่วม' 
    }
  };
    
  return ticketInfo[ticketType] || { 
    name: ticketType, 
    description: `${ticketType} ประเภทตั๋ว` 
  };
};
