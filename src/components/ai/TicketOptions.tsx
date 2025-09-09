import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, CreditCard, Users } from 'lucide-react';
import { Event } from '@/types/event';
import { useAI } from '@/contexts/AIContext';

interface TicketOption {
  type: string;
  label: string;
  price: number;
}

interface TicketOptionsProps {
  event: Event;
  ticketOptions: TicketOption[];
  eventId: string;
  className?: string;
}

const TicketOptions: React.FC<TicketOptionsProps> = ({ 
  event, 
  ticketOptions, 
  eventId,
  className = '' 
}) => {
  const { sendMessage } = useAI();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleTicketSelect = async (ticketOption: TicketOption) => {
    // Send confirmation message to AI
    await sendMessage(`จอง${ticketOption.label}`);
  };

  if (!event || !ticketOptions || ticketOptions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Event Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm leading-tight">
                🎫 {event.title}
              </h4>
              {event.featured && (
                <Badge variant="secondary" className="text-xs mt-1">
                  ⭐ แนะนำ
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(event.schedule?.startDate || '')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{event.location?.venue || 'ออนไลน์'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span>เหลือ {event.capacity?.available || 0} ที่นั่ง</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Options */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          🎫 เลือกประเภทตั๋ว:
        </div>
        
        {ticketOptions.map((option, index) => (
          <Card 
            key={`${option.type}-${index}`} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleTicketSelect(option)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ประเภท: {option.type}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-primary">
                    {option.price.toLocaleString()} ฿
                  </div>
                  {option.price === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      ฟรี
                    </Badge>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  className="ml-3 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTicketSelect(option);
                  }}
                >
                  เลือก
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => sendMessage(`ดูรายละเอียด ${event.title}`)}
          className="flex-1 h-8 text-xs"
        >
          📋 ดูรายละเอียดอีเว้นท์
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => sendMessage('เลือกอีเว้นท์อื่น')}
          className="h-8 text-xs"
        >
          🔄 เลือกอีเว้นท์อื่น
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

export default TicketOptions;