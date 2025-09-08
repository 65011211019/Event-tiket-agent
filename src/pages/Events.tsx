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
  const [events, setEvents] = React.useState<Event[]>([]);
  const [categories, setCategories] = React.useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<any>({});
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

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder === 'asc' || sortOrder === 'desc') {
      filters.sortOrder = sortOrder;
    }

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
    if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);
    if (newFilters.priceRange?.min !== undefined) {
      params.set('minPrice', newFilters.priceRange.min.toString());
    }
    if (newFilters.priceRange?.max !== undefined) {
      params.set('maxPrice', newFilters.priceRange.max.toString());
    }

    setSearchParams(params);
  };

  // Load events based on filters
  const loadEvents = React.useCallback(async (currentFilters: Filters) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await eventApi.getEvents(currentFilters);
      const eventsData = response.events || [];
      setEvents(eventsData);
      setPagination(response.pagination || {});
      
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load categories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await eventApi.getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Load events when filters change
  React.useEffect(() => {
    loadEvents(filters);
  }, [filters, loadEvents]);

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
    loadEvents(filters);
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
          {pagination.totalItems ? 
            `พบ ${pagination.totalItems.toLocaleString()} อีเว้นท์` :
            'ค้นหาและจองอีเว้นท์ที่คุณสนใจ'
          }
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
        ) : events.length === 0 ? (
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
              {(filters.search || filters.categories?.length || filters.location || filters.dateRange) && (
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
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  bookedTicketsCount={bookedTicketsCounts[event.id] || 0}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => {
                      // Handle previous page
                    }}
                  >
                    ก่อนหน้า
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                      const page = i + 1;
                      const isActive = page === pagination.currentPage;
                      
                      return (
                        <Button
                          key={page}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            // Handle page change
                          }}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => {
                      // Handle next page
                    }}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}