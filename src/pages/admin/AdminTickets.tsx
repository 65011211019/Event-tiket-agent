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
import { ChevronLeft, Eye, QrCode, Ticket } from 'lucide-react';
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

  useEffect(() => {
    const fetchAllTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all tickets from the API
        const rawData = await eventApi.getTickets();
        
        // Convert booking records to individual tickets
        const individualTickets = convertToIndividualTickets(rawData);
        setTickets(individualTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('ไม่สามารถโหลดตั๋วได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTickets();
  }, []);

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

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="status-active">ยืนยันแล้ว</Badge>;
      case 'pending':
        return <Badge variant="secondary">รอดำเนินการ</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ยกเลิก</Badge>;
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
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">เกิดข้อผิดพลาด</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => window.location.reload()}
              >
                ลองใหม่อีกครั้ง
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalTickets = tickets.length;
  const confirmedTickets = tickets.filter(t => t.status === 'confirmed').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const cancelledTickets = tickets.filter(t => t.status === 'cancelled').length;

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header with gradient */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ตั๋วทั้งหมด
            </h1>
            <p className="text-muted-foreground">
              จัดการตั๋วที่ผู้ใช้จองไว้
            </p>
          </div>
          <Button asChild className="bg-gradient-primary hover:shadow-lg transition-all">
            <Link to="/admin/ticket-types/create">
              สร้างประเภทตั๋วใหม่
            </Link>
          </Button>
        </div>

        {/* Enhanced Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-lift transition-all border-primary/10 shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ตั๋วทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalTickets}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-all border-success/10 shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ยืนยันแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {confirmedTickets}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-all border-warning/10 shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">รอดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {pendingTickets}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift transition-all border-destructive/10 shadow-sm hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ยกเลิก</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {cancelledTickets}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tickets Table */}
        <Card className="shadow-sm hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-primary" />
              รายการตั๋ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Ticket className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <p className="text-muted-foreground">
                  ยังไม่มีตั๋วที่ถูกจอง
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">อีเว้นท์</TableHead>
                      <TableHead className="font-semibold">ผู้จอง</TableHead>
                      <TableHead className="font-semibold">ประเภทตั๋ว</TableHead>
                      <TableHead className="font-semibold">จำนวน</TableHead>
                      <TableHead className="font-semibold">ราคา</TableHead>
                      <TableHead className="font-semibold">วันที่จอง</TableHead>
                      <TableHead className="font-semibold">สถานะ</TableHead>
                      <TableHead className="text-right font-semibold">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
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
                          <Badge variant="outline">
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
                              className="border-primary/20 hover:bg-primary/10"
                              onClick={() => handleShowQR(ticket)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-primary/20 hover:bg-primary/10"
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