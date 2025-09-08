import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star,
  Share2,
  ExternalLink,
  ChevronLeft,
  Tag,
  User,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eventApi } from '@/lib/api';
import { Event, EventTicket, BookingRecord, BookingTicket } from '@/types/event';
import { useLanguage } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

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

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [event, setEvent] = React.useState<Event | null>(null);
  const [tickets, setTickets] = React.useState<(BookingRecord | EventTicket)[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch event and tickets in parallel
        const [eventData, ticketsData] = await Promise.all([
          eventApi.getEvent(id),
          eventApi.getTickets()
        ]);
        
        setEvent(eventData);
        setTickets(ticketsData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to load event:', err);
        setError('ไม่พบอีเว้นท์ที่ต้องการ');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
    
    // Set up polling for real-time updates
    const interval = setInterval(async () => {
      if (id) {
        try {
          const [updatedEvent, updatedTickets] = await Promise.all([
            eventApi.getEvent(id),
            eventApi.getTickets()
          ]);
          
          if (updatedEvent) {
            setEvent(updatedEvent);
            setTickets(updatedTickets);
            setLastUpdated(new Date());
          }
        } catch (err) {
          console.error('Failed to refresh event data:', err);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  // Calculate actual participants for this event
  const getEventParticipants = () => {
    if (!id || !event) return 0;
    
    // Extract individual tickets from mixed data (BookingRecords and EventTickets)
    const allTickets = extractTicketsFromData(tickets);
    
    // Filter confirmed tickets for this specific event
    const eventTickets = allTickets.filter(
      ticket => ticket.eventId === id && ticket.status === 'confirmed'
    );
    
    // Calculate total participants from ticket quantities
    const totalParticipants = eventTickets.reduce((sum, ticket) => {
      return sum + (ticket.quantity || 1);
    }, 0);
    
    return totalParticipants;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // HH:MM format
  };

  const formatPrice = (pricing: any) => {
    const prices = Object.entries(pricing)
      .filter(([key, value]) => key !== 'currency' && typeof value === 'number')
      .map(([key, value]) => ({ key, value: value as number }))
      .filter(price => price.value > 0);

    if (prices.length === 0) return 'ฟรี';
    
    return prices.map(price => ({
      type: price.key,
      price: price.value,
      label: getPriceLabel(price.key)
    }));
  };

  const getPriceLabel = (key: string) => {
    const labels: Record<string, string> = {
      earlyBird: 'Early Bird',
      regular: 'ราคาปกติ',
      student: 'นักเรียน/นักศึกษา',
      group: 'กลุ่ม',
      vip: 'VIP',
      premium: 'Premium',
      general: 'ทั่วไป',
      fullMarathon: 'Full Marathon',
      halfMarathon: 'Half Marathon',
      miniMarathon: 'Mini Marathon',
      funRun: 'Fun Run',
      adult: 'ผู้ใหญ่',
      child: 'เด็ก',
      senior: 'ผู้สูงอายุ',
      free: 'ฟรี',
      member: 'สมาชิก',
    };
    return labels[key] || key;
  };

  const getCategoryClass = (categoryId: string) => {
    return `category-${categoryId}`;
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'online': return 'ออนไลน์';
      case 'hybrid': return 'ไฮบริด';
      case 'onsite': return 'ที่งาน';
      default: return type;
    }
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="h-8 w-24 bg-muted rounded loading-shimmer" />
        <div className="h-96 bg-muted rounded-xl loading-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-muted rounded-lg loading-shimmer" />
            <div className="h-32 bg-muted rounded-lg loading-shimmer" />
          </div>
          <div className="h-96 bg-muted rounded-lg loading-shimmer" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error || 'ไม่พบอีเว้นท์ที่ต้องการ'}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
              กลับไปหน้ารายการ
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isUpcoming = event.schedule?.startDate ? new Date(event.schedule.startDate) > new Date() : false;
  const actualParticipants = getEventParticipants();
  const maxCapacity = event.capacity?.max || 0;
  const availableCapacity = maxCapacity - actualParticipants;
  const availabilityPercentage = maxCapacity > 0 ? (availableCapacity / maxCapacity) * 100 : 0;
  const priceData = formatPrice(event.pricing || {});

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container py-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          กลับ
        </Button>
      </div>

      {/* Hero Image */}
      {event.images?.banner && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={event.images.banner}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-8 left-0 right-0">
            <div className="container">
              <div className="max-w-4xl text-white space-y-4">
                <div className="flex flex-wrap gap-2">
                  {event.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      แนะนำ
                    </Badge>
                  )}
                  <Badge className={cn("text-white", getCategoryClass(event.category))}>
                    {event.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {getLocationTypeLabel(event.location?.type || 'onsite')}
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-balance">
                  {event.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{event.schedule?.startDate ? formatDate(event.schedule.startDate) : 'ไม่ระบุวันที่'}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.schedule?.startTime ? formatTime(event.schedule.startTime) : ''} {event.schedule?.endTime ? `- ${formatTime(event.schedule.endTime)}` : ''}
                      </div>
                      {event.schedule?.startDate && event.schedule?.endDate && event.schedule.startDate !== event.schedule.endDate && (
                        <div className="text-sm text-muted-foreground">
                          ถึง {formatDate(event.schedule.endDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {event.location?.venue || 'ออนไลน์'}
                      </div>
                      {event.location?.address && (
                        <div className="text-sm text-muted-foreground">
                          {event.location.address}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-lg">
                        {availableCapacity.toLocaleString()} <span className="text-base font-normal">ที่เหลือ</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ผู้เข้าร่วม {actualParticipants.toLocaleString()} / {maxCapacity.toLocaleString()}
                      </div>
                      {maxCapacity > 0 && (
                        <div className="mt-1">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
                              style={{ width: `${((actualParticipants) / maxCapacity) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ที่เหลือ {availableCapacity.toLocaleString()}/{maxCapacity.toLocaleString()}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString('th-TH')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดอีเว้นท์</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>วิทยากร</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex space-x-4">
                      {speaker.image && (
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{speaker.name}</div>
                        <div className="text-sm text-primary">{speaker.title}</div>
                        <div className="text-sm text-muted-foreground">{speaker.company}</div>
                        {speaker.bio && (
                          <p className="text-sm text-muted-foreground mt-2">{speaker.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {(event.requirements?.length || event.includes?.length || event.activities?.length || event.tracks?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {event.requirements && event.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">สิ่งที่ต้องเตรียม</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {event.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.includes && event.includes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">รวมในราคา</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {event.includes.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.tracks && event.tracks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">หัวข้อ</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tracks.map((track, index) => (
                          <Badge key={index} variant="outline">{track}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.activities && event.activities.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">กิจกรรม</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {event.activities.map((activity, index) => (
                          <li key={index}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.distances && event.distances.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">ระยะทาง</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.distances.map((distance, index) => (
                          <Badge key={index} variant="outline">{distance}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {event.tags?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>แท็ก</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>จองตั๋ว</span>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                {Array.isArray(priceData) ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">ราคาบัตร</h4>
                    {priceData.map((price, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{price.label}</span>
                        <span className="font-semibold">฿{price.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{priceData}</div>
                    <div className="text-sm text-muted-foreground">ราคาบัตร</div>
                  </div>
                )}

                <Separator />

                {/* Availability with real-time updates */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ผู้เข้าร่วม</span>
                    <span className="font-medium">
                      {actualParticipants.toLocaleString()} / {maxCapacity.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${maxCapacity > 0 ? (actualParticipants / maxCapacity) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>ที่เหลือ: {availableCapacity.toLocaleString()}</span>
                    <span>{availabilityPercentage.toFixed(0)}%</span>
                  </div>
                  {availabilityPercentage < 20 && availabilityPercentage > 0 && (
                    <div className="flex items-center text-destructive text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      เหลือไม่มาก!
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground text-center">
                    อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString('th-TH')}
                  </div>
                </div>

                {/* Booking Button */}
                <div className="space-y-2">
                  {event.capacity?.available === 0 ? (
                    <Button disabled className="w-full">
                      ขายหมดแล้ว
                    </Button>
                  ) : !isUpcoming ? (
                    <Button disabled className="w-full">
                      อีเว้นท์สิ้นสุดแล้ว
                    </Button>
                  ) : (
                    <Button asChild className="w-full bg-gradient-primary">
                      <Link to={`/events/${event.id}/book`}>
                        จองตั๋วเลย
                      </Link>
                    </Button>
                  )}
                  
                  {event.location?.onlineLink && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={event.location.onlineLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        เข้าร่วมออนไลน์
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card>
              <CardHeader>
                <CardTitle>ผู้จัดงาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{event.organizer?.name || 'ไม่ระบุ'}</span>
                </div>
                {event.organizer?.contact && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${event.organizer.contact}`}
                      className="text-primary hover:underline"
                    >
                      {event.organizer.contact}
                    </a>
                  </div>
                )}
                {event.organizer?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${event.organizer.phone}`}
                      className="text-primary hover:underline"
                    >
                      {event.organizer.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}