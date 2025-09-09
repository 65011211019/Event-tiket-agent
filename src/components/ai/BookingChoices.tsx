import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, CreditCard } from 'lucide-react';
import { Event } from '@/types/event';
import { useAI } from '@/contexts/AIContext';

interface BookingChoicesProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  className?: string;
}

const BookingChoices: React.FC<BookingChoicesProps> = ({ 
  events, 
  onEventSelect, 
  className = '' 
}) => {
  const { sendMessage } = useAI();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLowestPrice = (pricing: any) => {
    if (!pricing) return 0;
    const prices = Object.values(pricing).filter(p => typeof p === 'number' && p > 0) as number[];
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const handleBookEvent = async (event: Event) => {
    // Send a message to AI to handle specific event booking
    await sendMessage(`จอง ${event.title}`);
    onEventSelect(event);
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground mb-3">
        🎉 เลือกอีเว้นท์ที่ต้องการจอง:
      </div>
      
      {events.map((event, index) => {
        const lowestPrice = getLowestPrice(event.pricing);
        const eventDate = new Date(event.schedule?.startDate || 0);
        
        return (
          <Card key={event.id || index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Event Title */}
                <div>
                  <h4 className="font-semibold text-sm leading-tight">
                    {event.title}
                  </h4>
                  {event.featured && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      แนะนำ
                    </Badge>
                  )}
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(event.schedule?.startDate || '')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">
                      {event.location?.venue || 'ออนไลน์'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    <span>เริ่มต้น {lowestPrice.toLocaleString()} ฿</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>เหลือ {event.capacity?.available || 0} ที่</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <Button 
                    size="sm" 
                    onClick={() => handleBookEvent(event)}
                    className="flex-1 h-8 text-xs"
                  >
                    🎫 จองเลย
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => sendMessage(`ดูรายละเอียด ${event.title}`)}
                    className="h-8 text-xs"
                  >
                    📋 รายละเอียด
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <div className="flex gap-2 pt-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => sendMessage('ดูอีเว้นท์ทั้งหมด')}
          className="flex-1 h-8 text-xs"
        >
          📋 ดูอีเว้นท์ทั้งหมด
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => sendMessage('ยกเลิก')}
          className="h-8 text-xs"
        >
          ❌ ยกเลิก
        </Button>
      </div>
    </div>
  );
};

export default BookingChoices;