import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, QrCode, Loader2 } from 'lucide-react';
import { useAuth, useLanguage } from '@/contexts/AppContext';
import { eventApi } from '@/lib/api';
import { EventTicket, BookingRecord } from '@/types/event';
import QRCodeModal from '@/components/tickets/QRCodeModal';

export default function MyTickets() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  const [events, setEvents] = useState<{[key: string]: any}>({});
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

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
        <p className="text-muted-foreground mt-2">ตั๋วทั้งหมดของคุณ</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center space-y-4 py-12">
          <Ticket className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">ยังไม่มีตั๋ว</h2>
          <p className="text-muted-foreground">คุณยังไม่ได้จองตั๋วใดๆ</p>
          <Button onClick={() => window.location.href = '/events'}>
            เลือกดูอีเวนต์
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
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