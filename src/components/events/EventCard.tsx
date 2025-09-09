import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Clock, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { useLanguage } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured';
  className?: string;
  isAdmin?: boolean;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  bookedTicketsCount?: number;
}

export default function EventCard({ event, variant = 'default', className, isAdmin = false, onEdit, onDelete, bookedTicketsCount = 0 }: EventCardProps) {
  const { t } = useLanguage();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (pricing: any) => {
    if (!pricing) return t('events.free');
    
    const prices = Object.entries(pricing)
      .filter(([key, value]) => key !== 'currency' && typeof value === 'number')
      .map(([key, value]) => value as number)
      .filter(price => price > 0);

    if (prices.length === 0) return t('events.free');
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `฿${minPrice.toLocaleString()}`;
    }
    
    return `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  const getCategoryClass = (categoryId: string) => {
    return `category-${categoryId}`;
  };

  const isUpcoming = event.schedule?.startDate ? new Date(event.schedule.startDate) > new Date() : false;
  
  // Calculate real available tickets: max capacity - booked tickets
  const realAvailableTickets = event.capacity?.max ? Math.max(0, event.capacity.max - bookedTicketsCount) : 0;
  const availabilityPercentage = event.capacity?.max ? (realAvailableTickets / event.capacity.max) * 100 : 0;

  return (
    <Card 
      className={cn(
        "group overflow-hidden hover-lift focus-ring bg-card text-card-foreground",
        variant === 'featured' && "ring-2 ring-primary/20",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={event.images?.thumbnail || event.images?.banner || '/placeholder.svg'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {event.featured && (
            <Badge className="bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              {t('eventsComponents.eventCard.featured')}
            </Badge>
          )}
          <Badge className={cn("text-white", getCategoryClass(event.category))}>
            {event.category}
          </Badge>
        </div>

        {/* Location type */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur text-foreground">
            {event.location?.type === 'online' ? t('eventsComponents.eventCard.online') :
             event.location?.type === 'hybrid' ? t('eventsComponents.eventCard.hybrid') : t('eventsComponents.eventCard.onsite')}
          </Badge>
        </div>

        {/* Availability indicator */}
        {availabilityPercentage < 20 && availabilityPercentage > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="destructive" className="animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              {t('eventsComponents.eventCard.lowStock')}
            </Badge>
          </div>
        )}

        {realAvailableTickets === 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="destructive">
              {t('eventsComponents.eventCard.soldOut')}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {event.description}
          </p>
        </div>

        {/* Event details */}
        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {event.schedule?.startDate ? formatDate(event.schedule.startDate) : t('eventsComponents.eventCard.unknownDate')}
              {event.schedule?.startDate !== event.schedule?.endDate && event.schedule?.endDate && 
                ` - ${formatDate(event.schedule.endDate)}`}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">
              {event.location?.venue || t('eventsComponents.eventCard.online')}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {realAvailableTickets} / {event.capacity?.max || 0} {t('eventsComponents.eventCard.spotsLeft')}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-primary">
            {formatPrice(event.pricing)}
          </div>
          {event.organizer?.name && (
            <div className="text-xs text-muted-foreground">
              โดย {event.organizer.name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        {isAdmin ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-input hover:bg-accent hover:text-accent-foreground"
              onClick={() => onEdit?.(event.id)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('eventsComponents.eventCard.edit')}
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={() => onDelete?.(event.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('eventsComponents.eventCard.delete')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            <Button asChild variant="outline" size="sm" className="flex-1 border-input hover:bg-accent hover:text-accent-foreground">
              <Link to={`/events/${event.id}`}>
                {t('eventsComponents.eventCard.viewDetails')}
              </Link>
            </Button>


            {realAvailableTickets > 0 && isUpcoming && (
              <Button asChild size="sm" className="flex-1 bg-gradient-primary">

                <Link to={`/events/${event.id}/booking`}>
                  {t('eventsComponents.eventCard.bookNow')}
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-border">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-border">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
