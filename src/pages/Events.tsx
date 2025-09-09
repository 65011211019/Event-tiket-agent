import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';
import { eventApi } from '@/lib/api';
import { Event, EventCategory, EventFilters as Filters } from '@/types/event';
import { useLanguage } from '@/contexts/AppContext';

export default function Events() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allEvents, setAllEvents] = React.useState<Event[]>([]); // Store all events
  const [filteredEvents, setFilteredEvents] = React.useState<Event[]>([]); // Store filtered events
  const [categories, setCategories] = React.useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bookedTicketsCounts, setBookedTicketsCounts] = React.useState<Record<string, number>>({});

  // Parse filters from URL
  const getFiltersFromUrl = (): Filters => {
    const filters: Filters = {};
    
    const search = searchParams.get('search');
    if (search) filters.search = search;

    const categories = searchParams.get('categories');
    if (categories) {
      filters.categories = categories.split(',').filter(Boolean);
    }

    const location = searchParams.get('location');
    if (location) filters.location = location;

    const dateRange = searchParams.get('dateRange');
    if (dateRange) filters.dateRange = dateRange;

    const sortBy = searchParams.get('sortBy');
    if (sortBy) filters.sortBy = sortBy;

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice ? parseInt(minPrice) : undefined,
        max: maxPrice ? parseInt(maxPrice) : undefined,
      };
    }

    return filters;
  };

  const [filters, setFilters] = React.useState<Filters>(getFiltersFromUrl());

  // Update URL when filters change
  const updateUrl = (newFilters: Filters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.categories?.length) {
      params.set('categories', newFilters.categories.join(','));
    }
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.dateRange) params.set('dateRange', newFilters.dateRange);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.priceRange?.min !== undefined) {
      params.set('minPrice', newFilters.priceRange.min.toString());
    }
    if (newFilters.priceRange?.max !== undefined) {
      params.set('maxPrice', newFilters.priceRange.max.toString());
    }

    setSearchParams(params);
  };



  // Client-side filtering function
  const filterEventsLocally = React.useCallback((events: Event[], filters: Filters) => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.organizer.name.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories?.length) {
      filtered = filtered.filter(event => 
        filters.categories!.includes(event.category)
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location.type === filters.location
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.schedule.startDate);
        
        switch (filters.dateRange) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return eventDate >= today && eventDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            return eventDate >= today && eventDate <= monthFromNow;
          case 'quarter':
            const quarterFromNow = new Date(today);
            quarterFromNow.setMonth(today.getMonth() + 3);
            return eventDate >= today && eventDate <= quarterFromNow;
          case 'year':
            const yearFromNow = new Date(today);
            yearFromNow.setFullYear(today.getFullYear() + 1);
            return eventDate >= today && eventDate <= yearFromNow;
          default:
            return true;
        }
      });
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(event => {
        const pricing = event.pricing;
        const prices = [
          pricing.regular,
          pricing.earlyBird,
          pricing.student,
          pricing.group,
          pricing.vip,
          pricing.premium,
          pricing.general,
          pricing.adult,
          pricing.child,
          pricing.senior,
          pricing.member
        ].filter(price => price !== undefined && price !== null);

        if (prices.length === 0) {
          // If no prices, consider it free
          return filters.priceRange!.min === 0 && (filters.priceRange!.max === undefined || filters.priceRange!.max === 0);
        }

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const filterMin = filters.priceRange!.min || 0;
        const filterMax = filters.priceRange!.max;

        if (filterMax === undefined) {
          return minPrice >= filterMin;
        }

        return minPrice >= filterMin && maxPrice <= filterMax;
      });
    }

    // Sorting
    const sortBy = filters.sortBy || 'newest';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // Sort by creation date (assuming id contains timestamp or using event date as fallback)
          return new Date(b.schedule.startDate).getTime() - new Date(a.schedule.startDate).getTime();
        
        case 'oldest':
          // Sort by creation date (oldest first)
          return new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime();
        
        case 'date-asc':
          // Sort by event start date (earliest first)
          return new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime();
        
        case 'date-desc':
          // Sort by event start date (latest first)
          return new Date(b.schedule.startDate).getTime() - new Date(a.schedule.startDate).getTime();
        
        case 'price-asc':
          // Sort by lowest price first
          const pricesA = [
            a.pricing.regular,
            a.pricing.earlyBird,
            a.pricing.student,
            a.pricing.group,
            a.pricing.vip,
            a.pricing.premium,
            a.pricing.general,
            a.pricing.adult,
            a.pricing.child,
            a.pricing.senior,
            a.pricing.member
          ].filter(price => price !== undefined && price !== null);
          
          const pricesB = [
            b.pricing.regular,
            b.pricing.earlyBird,
            b.pricing.student,
            b.pricing.group,
            b.pricing.vip,
            b.pricing.premium,
            b.pricing.general,
            b.pricing.adult,
            b.pricing.child,
            b.pricing.senior,
            b.pricing.member
          ].filter(price => price !== undefined && price !== null);
          
          const minPriceA = pricesA.length > 0 ? Math.min(...pricesA) : 0;
          const minPriceB = pricesB.length > 0 ? Math.min(...pricesB) : 0;
          
          return minPriceA - minPriceB;
        
        case 'price-desc':
          // Sort by highest price first
          const maxPricesA = [
            a.pricing.regular,
            a.pricing.earlyBird,
            a.pricing.student,
            a.pricing.group,
            a.pricing.vip,
            a.pricing.premium,
            a.pricing.general,
            a.pricing.adult,
            a.pricing.child,
            a.pricing.senior,
            a.pricing.member
          ].filter(price => price !== undefined && price !== null);
          
          const maxPricesB = [
            b.pricing.regular,
            b.pricing.earlyBird,
            b.pricing.student,
            b.pricing.group,
            b.pricing.vip,
            b.pricing.premium,
            b.pricing.general,
            b.pricing.adult,
            b.pricing.child,
            b.pricing.senior,
            b.pricing.member
          ].filter(price => price !== undefined && price !== null);
          
          const maxPriceA = maxPricesA.length > 0 ? Math.max(...maxPricesA) : 0;
          const maxPriceB = maxPricesB.length > 0 ? Math.max(...maxPricesB) : 0;
          
          return maxPriceB - maxPriceA;
        
        default:
          return 0;
      }
    });

    return filtered;
  }, []);
  const extractCategoriesFromEvents = React.useCallback((events: Event[]) => {
    const categoryMap = new Map<string, { id: string; name: string; description: string; color: string }>();
    
    events.forEach(event => {
      if (event.category && !categoryMap.has(event.category)) {
        // Create category object from event category
        const categoryName = getCategoryDisplayName(event.category);
        categoryMap.set(event.category, {
          id: event.category,
          name: categoryName,
          description: `งาน${categoryName}`,
          color: getCategoryColor(event.category)
        });
      }
    });
    
    return Array.from(categoryMap.values());
  }, []);

  // Helper function to get category display name
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'workshop': 'เวิร์กช็อป',
      'seminar': 'สัมมนา',
      'conference': 'การประชุม',
      'music': 'ดนตรี',
      'sports': 'กีฬา',
      'technology': 'เทคโนโลยี',
      'education': 'การศึกษา',
      'food': 'อาหาร',
      'art': 'ศิลปะ',
      'business': 'ธุรกิจ',
      'health': 'สุขภาพ',
      'travel': 'ท่องเที่ยว',
      'lifestyle': 'ไลฟ์สไตล์',
      'entertainment': 'บันเทิง'
    };
    
    return categoryNames[category.toLowerCase()] || category;
  };

  // Helper function to get category color
  const getCategoryColor = (category: string): string => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#fdcb6e', '#6c5ce7', '#e17055', '#00b894'];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper function to get sort display name
  const getSortDisplayName = (sortBy: string): string => {
    const sortNames: Record<string, string> = {
      'newest': 'ล่าสุด',
      'oldest': 'เก่าสุด',
      'date-asc': 'วันที่เริ่มงาน (เร็วสุด)',
      'date-desc': 'วันที่เริ่มงาน (ช้าสุด)',
      'price-asc': 'ราคา (ต่ำ-สูง)',
      'price-desc': 'ราคา (สูง-ต่ำ)'
    };
    return sortNames[sortBy] || sortBy;
  };

  // Load all events and extract categories
  const loadAllEvents = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await eventApi.getEvents(); // Load all events without filters
      const eventsData = response.events || [];
      setAllEvents(eventsData);
      
      // Extract categories from events
      const extractedCategories = extractCategoriesFromEvents(eventsData);
      console.log('Categories extracted from events:', extractedCategories);
      setCategories(extractedCategories);
      
      // Load booked tickets count for each event
      const counts: Record<string, number> = {};
      for (const event of eventsData) {
        try {
          const bookedCount = await eventApi.getBookedTicketsCount(event.id);
          counts[event.id] = bookedCount;
        } catch (err) {
          console.warn(`Failed to get booked count for event ${event.id}:`, err);
          counts[event.id] = 0;
        }
      }
      setBookedTicketsCounts(counts);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลอีเว้นท์');
      
      // Use fallback categories on error
      const fallbackCategories = [
        { id: 'workshop', name: 'เวิร์กช็อป', description: 'งานเวิร์กช็อป', color: '#ff6b6b' },
        { id: 'seminar', name: 'สัมมนา', description: 'งานสัมมนา', color: '#4ecdc4' },
        { id: 'conference', name: 'การประชุม', description: 'งานการประชุม', color: '#45b7d1' }
      ];
      setCategories(fallbackCategories);
    } finally {
      setIsLoading(false);
    }
  }, [extractCategoriesFromEvents]);


  // Load events and extract categories
  React.useEffect(() => {
    console.log('Loading events and extracting categories...');
    loadAllEvents();
  }, [loadAllEvents]);

  // Apply filters when filters or allEvents change
  React.useEffect(() => {
    const filtered = filterEventsLocally(allEvents, filters);
    setFilteredEvents(filtered);
  }, [filters, allEvents, filterEventsLocally]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: Filters = {};
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  const retry = () => {
    loadAllEvents();
  };

  if (error) {
    return (
      <div className="container py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={retry}>
              {t('general.tryAgain')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('events.title')}</h1>
        <p className="text-muted-foreground">
          {filteredEvents.length > 0 ? 
            `พบ ${filteredEvents.length.toLocaleString()} อีเว้นท์${allEvents.length !== filteredEvents.length ? ` จากทั้งหมด ${allEvents.length.toLocaleString()} อีเว้นท์` : ''}` :
            'ค้นหาและจองอีเว้นท์ที่คุณสนใจ'
          }
          {filters.sortBy && filters.sortBy !== 'newest' && (
            <span className="ml-2 text-sm text-primary">
              • เรียงตาม: {getSortDisplayName(filters.sortBy)}
            </span>
          )}
        </p>
      </div>



      {/* Filters */}
      <EventFilters
        filters={filters}
        categories={categories}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-xl loading-shimmer" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{t('general.noResults')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                ไม่พบอีเว้นท์ที่ตรงกับเงื่อนไขการค้นหา ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา
              </p>
              {(filters.search || filters.categories?.length || filters.location || filters.dateRange || filters.priceRange || filters.sortBy) && (
                <Button onClick={handleClearFilters} className="mt-4">
                  ล้างตัวกรองทั้งหมด
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Events Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  bookedTicketsCount={bookedTicketsCounts[event.id] || 0}
                />
              ))}
            </div>




          </>
        )}
      </div>
    </div>
  );
}
