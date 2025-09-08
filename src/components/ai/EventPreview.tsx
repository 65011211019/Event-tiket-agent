import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Event } from '@/types/event';

interface EventPreviewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onViewAll?: () => void;
}

const EventPreview: React.FC<EventPreviewProps> = ({ events, onEventClick, onViewAll }) => {
  if (!events || events.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'ไม่ระบุเวลา';
    // If it's just time format like "09:00", return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    // If it's a full date string, parse it
    const date = new Date(timeString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        พบ {events.length} อีเว้นท์
      </div>
      {events.slice(0, 3).map((event) => (
        <div
          key={event.id}
          onClick={() => onEventClick?.(event)}
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            {(event.images?.thumbnail || event.images?.banner) && (
              <img
                src={event.images?.thumbnail || event.images?.banner || '/api/placeholder/300/200'}
                alt={event.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {event.title}
              </h4>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{event.schedule?.startDate ? formatDate(event.schedule.startDate) : 'ไม่ระบุวันที่'}</span>
                <Clock className="w-3 h-3 ml-1" />
                <span>{event.schedule?.startTime ? formatTime(event.schedule.startTime) : 'ไม่ระบุเวลา'}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.location?.venue || 'ไม่ระบุสถานที่'}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{event.capacity?.available || 0} ที่นั่งเหลือ</span>
                </div>
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    ฿{(event.pricing?.regular || event.pricing?.general || event.pricing?.adult || 0).toLocaleString()}
                  </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {events.length > 3 && (
        <div className="text-center">
          <button 
            onClick={onViewAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            ดูทั้งหมด {events.length} อีเว้นท์
          </button>
        </div>
      )}
    </div>
  );
};

export default EventPreview;