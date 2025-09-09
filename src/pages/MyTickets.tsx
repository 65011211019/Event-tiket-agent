import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Ticket, QrCode, Loader2, Search, Filter, X } from 'lucide-react';
import { useAuth, useLanguage } from '@/contexts/AppContext';
import { eventApi } from '@/lib/api';
import { EventTicket, BookingRecord } from '@/types/event';
import QRCodeModal from '@/components/tickets/QRCodeModal';

export default function MyTickets() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  const [events, setEvents] = useState<{[key: string]: any}>({});
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Sort options for tickets
  const sortOptions = [
    { value: 'newest', label: 'ล่าสุด' },
    { value: 'oldest', label: 'เก่าสุด' },
    { value: 'event-date-asc', label: 'วันอีเวนต์ (เร็วสุด)' },
    { value: 'event-date-desc', label: 'วันอีเวนต์ (ช้าสุด)' },
    { value: 'price-asc', label: 'ราคา (ต่ำ-สูง)' },
    { value: 'price-desc', label: 'ราคา (สูง-ต่ำ)' },
    { value: 'name-asc', label: 'ชื่อ A-Z' },
    { value: 'name-desc', label: 'ชื่อ Z-A' }
  ];

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userTickets = await eventApi.getUserTickets(user.id);
        
        // Process booking data to create individual tickets
        const processedTickets = [];
        
        for (const booking of userTickets) {
          // Skip if eventId is null or invalid
          if (!booking.eventId || booking.eventId === 'null') {
            console.warn(`Skipping booking with invalid eventId: ${booking.eventId}`);
            continue;
          }
          
          // Get event details
          let eventDetails = null;
          try {
            eventDetails = await eventApi.getEvent(booking.eventId);
          } catch (error) {
            console.warn(`Could not fetch event details for ${booking.eventId}:`, error);
          }
          
          // Convert booking tickets to individual EventTicket objects
          if (booking.tickets && Array.isArray(booking.tickets)) {
            for (let i = 0; i < booking.tickets.length; i++) {
              const bookingTicket = booking.tickets[i];
              
              // Create individual tickets based on quantity
              for (let j = 0; j < bookingTicket.quantity; j++) {
                const individualTicket = {
                  id: `${booking.id}-${i}-${j}`, // Generate unique ID
                  eventId: booking.eventId,
                  ticketType: bookingTicket.type,
                  price: bookingTicket.price,
                  currency: booking.currency || 'THB',
                  holder: booking.holder || {
                    name: booking.customerInfo?.name || 'ไม่ระบุ',
                    email: booking.customerInfo?.email || '',
                    phone: booking.customerInfo?.phone || ''
                  },
                  customerInfo: booking.customerInfo,
                  purchaseDate: new Date().toISOString(),
                  status: 'confirmed' as const,
                  notes: booking.notes,
                  quantity: 1, // Individual ticket
                  totalAmount: booking.totalAmount // Add totalAmount from booking
                };
                
                processedTickets.push(individualTicket);
              }
            }
          }
        }
        
        setTickets(processedTickets);
        setFilteredTickets(processedTickets);
        
        // Fetch event details for display (we already fetched some during processing)
        const eventIds = [...new Set(processedTickets.map(ticket => ticket.eventId))];
        const eventPromises = eventIds.map(async (eventId) => {
          try {
            const event = await eventApi.getEvent(eventId);
            return { eventId, event };
          } catch (error) {
            console.warn(`Could not fetch event details for display ${eventId}:`, error);
            // Return a fallback event object for missing events
            return { 
              eventId, 
              event: {
                title: `Event ID: ${eventId}`,
                schedule: { startDate: null },
                location: { venue: 'ไม่ระบุสถานที่' }
              }
            };
          }
        });
        
        const eventResults = await Promise.all(eventPromises);
        const eventsMap = eventResults.reduce((acc, { eventId, event }) => {
          if (event) {
            acc[eventId] = event;
          }
          return acc;
        }, {} as {[key: string]: any});
        
        setEvents(eventsMap);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('ไม่สามารถโหลดตั๋วได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = [...tickets];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => {
        const eventTitle = events[ticket.eventId]?.title || '';
        const holderName = ticket.holder?.name || ticket.customerInfo?.name || '';
        const ticketId = ticket.id || '';
        
        return eventTitle.toLowerCase().includes(query) ||
               holderName.toLowerCase().includes(query) ||
               ticketId.toLowerCase().includes(query);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(ticket => {
        const eventDate = events[ticket.eventId]?.schedule?.startDate;
        if (!eventDate) return false;
        
        const ticketEventDate = new Date(eventDate);
        
        switch (dateFilter) {
          case 'upcoming':
            return ticketEventDate >= today;
          case 'past':
            return ticketEventDate < today;
          case 'thisWeek':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return ticketEventDate >= today && ticketEventDate <= weekFromNow;
          case 'thisMonth':
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            return ticketEventDate >= today && ticketEventDate <= monthFromNow;
          default:
            return true;
        }
      });
    }

    // Ticket type filter
    if (ticketTypeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.ticketType === ticketTypeFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // Sort by purchase date (newest first) - fallback to ticket ID
          return new Date(b.purchaseDate || '').getTime() - new Date(a.purchaseDate || '').getTime() || b.id.localeCompare(a.id);
        
        case 'oldest':
          // Sort by purchase date (oldest first)
          return new Date(a.purchaseDate || '').getTime() - new Date(b.purchaseDate || '').getTime() || a.id.localeCompare(b.id);
        
        case 'event-date-asc':
          // Sort by event start date (earliest first)
          const eventDateA = events[a.eventId]?.schedule?.startDate;
          const eventDateB = events[b.eventId]?.schedule?.startDate;
          if (!eventDateA && !eventDateB) return 0;
          if (!eventDateA) return 1;
          if (!eventDateB) return -1;
          return new Date(eventDateA).getTime() - new Date(eventDateB).getTime();
        
        case 'event-date-desc':
          // Sort by event start date (latest first)
          const eventDateA2 = events[a.eventId]?.schedule?.startDate;
          const eventDateB2 = events[b.eventId]?.schedule?.startDate;
          if (!eventDateA2 && !eventDateB2) return 0;
          if (!eventDateA2) return 1;
          if (!eventDateB2) return -1;
          return new Date(eventDateB2).getTime() - new Date(eventDateA2).getTime();
        
        case 'price-asc':
          // Sort by price (lowest first)
          const priceA = a.totalAmount || (a.price || 0) * (a.quantity || 1);
          const priceB = b.totalAmount || (b.price || 0) * (b.quantity || 1);
          return priceA - priceB;
        
        case 'price-desc':
          // Sort by price (highest first)
          const priceA2 = a.totalAmount || (a.price || 0) * (a.quantity || 1);
          const priceB2 = b.totalAmount || (b.price || 0) * (b.quantity || 1);
          return priceB2 - priceA2;
        
        case 'name-asc':
          // Sort by event title A-Z
          const titleA = events[a.eventId]?.title || '';
          const titleB = events[b.eventId]?.title || '';
          return titleA.localeCompare(titleB, 'th');
        
        case 'name-desc':
          // Sort by event title Z-A
          const titleA2 = events[a.eventId]?.title || '';
          const titleB2 = events[b.eventId]?.title || '';
          return titleB2.localeCompare(titleA2, 'th');
        
        default:
          return 0;
      }
    });

    setFilteredTickets(filtered);
  }, [tickets, events, searchQuery, statusFilter, dateFilter, ticketTypeFilter, sortBy]);

  // Get unique ticket types for filter
  const uniqueTicketTypes = [...new Set(tickets.map(ticket => ticket.ticketType))].filter(Boolean);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setTicketTypeFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter !== 'all' || ticketTypeFilter !== 'all' || sortBy !== 'newest';

  const handleShowQR = (ticket: EventTicket) => {
    setSelectedTicket(ticket);
    setIsQRModalOpen(true);
  };

  const handleCloseQR = () => {
    setIsQRModalOpen(false);
    setSelectedTicket(null);
  };

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-muted-foreground">เพื่อดูตั๋วของคุณ</p>
          <Button onClick={() => window.location.href = '/login'}>
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">กำลังโหลดตั๋วของคุณ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">เกิดข้อผิดพลาด</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('tickets.myTickets')}</h1>
        <p className="text-muted-foreground mt-2">
          ตั๋วทั้งหมดของคุณ ({filteredTickets.length} จาก {tickets.length} ตั๋ว)
          {sortBy !== 'newest' && (
            <span className="ml-2 text-sm text-primary">
              • เรียงตาม: {sortOptions.find(option => option.value === sortBy)?.label}
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card border rounded-lg">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาตั๋ว, ชื่อผู้ถือ, หรือ ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[160px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="min-w-[160px]">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกช่วงเวลา</SelectItem>
                <SelectItem value="upcoming">กำลังจะมาถึง</SelectItem>
                <SelectItem value="thisWeek">สัปดาห์นี้</SelectItem>
                <SelectItem value="thisMonth">เดือนนี้</SelectItem>
                <SelectItem value="past">ผ่านมาแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Type Filter */}
          <div className="min-w-[160px]">
            <Select value={ticketTypeFilter} onValueChange={setTicketTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ประเภทตั๋ว" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                {uniqueTicketTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="min-w-[180px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              ล้างตัวกรอง
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ค้นหา: "{searchQuery}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                สถานะ: {statusFilter === 'confirmed' ? 'ยืนยันแล้ว' : 
                       statusFilter === 'pending' ? 'รอดำเนินการ' : 
                       statusFilter === 'cancelled' ? 'ยกเลิก' : statusFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setStatusFilter('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                เวลา: {dateFilter === 'upcoming' ? 'กำลังจะมาถึง' :
                      dateFilter === 'thisWeek' ? 'สัปดาห์นี้' :
                      dateFilter === 'thisMonth' ? 'เดือนนี้' :
                      dateFilter === 'past' ? 'ผ่านมาแล้ว' : dateFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setDateFilter('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {ticketTypeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ประเภท: {ticketTypeFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setTicketTypeFilter('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {sortBy !== 'newest' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                เรียงตาม: {sortOptions.find(option => option.value === sortBy)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setSortBy('newest')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {filteredTickets.length === 0 ? (
        tickets.length === 0 ? (
          <div className="text-center space-y-4 py-12">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">ยังไม่มีตั๋ว</h2>
            <p className="text-muted-foreground">คุณยังไม่ได้จองตั๋วใดๆ</p>
            <Button onClick={() => window.location.href = '/events'}>
              เลือกดูอีเวนต์
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-12">
            <Filter className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">ไม่พบตั๋วที่ตรงกับเงื่อนไข</h2>
            <p className="text-muted-foreground">ลองปรับเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
            <Button onClick={clearFilters}>
              ล้างตัวกรองทั้งหมด
            </Button>
          </div>
        )
      ) : (
        <div className="grid gap-6">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{events[ticket.eventId]?.title || ticket.event?.title || 'ไม่ระบุชื่ออีเวนต์'}</CardTitle>
                  <Badge className={`status-${ticket.status}`}>
                    {ticket.status === 'confirmed' ? 'ยืนยันแล้ว' :
                     ticket.status === 'pending' ? 'รอดำเนินการ' :
                     ticket.status === 'cancelled' ? 'ยกเลิก' : ticket.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  ผู้ถือตั๋ว: {ticket.holder?.name || ticket.customerInfo?.name || 'ไม่ระบุ'}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {events[ticket.eventId]?.schedule?.startDate ? 
                        new Date(events[ticket.eventId].schedule.startDate).toLocaleDateString('th-TH') : 
                        'ไม่ระบุวันที่'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{events[ticket.eventId]?.location?.venue || 'ไม่ระบุสถานที่'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {ticket.ticketType} - {ticket.currency || 'THB'} {(ticket.totalAmount || ((ticket.price || 0) * (ticket.quantity || 1))).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {ticket.notes && (
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    หมายเหตุ: {ticket.notes}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <QrCode className="h-4 w-4" />
                    <span className="text-sm font-mono">{ticket.id}</span>
                  </div>
                  <Button 
                     variant="outline" 
                     size="sm"
                     disabled={ticket.status === 'cancelled'}
                     onClick={() => handleShowQR(ticket)}
                   >
                     แสดง QR Code
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <QRCodeModal 
        ticket={selectedTicket}
        isOpen={isQRModalOpen}
        onClose={handleCloseQR}
      />
    </div>
  );
}