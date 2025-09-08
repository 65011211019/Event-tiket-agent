import { Event, EventCategory, EventTicket, EventFilters, BookingRequest, BookingResponse, BookingRecord } from '@/types/event';

const API_BASE_URL = import.meta.env.DEV ? '/api' : '/api/proxy';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // For production, use proxy with path parameter
  const url = import.meta.env.DEV 
    ? `${API_BASE_URL}${endpoint}`
    : `${API_BASE_URL}?path=${encodeURIComponent(endpoint.substring(1))}`;
  
  const config: RequestInit = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors, CORS errors, etc.
    console.error('API Request failed:', error);
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const eventApi = {
  // Events
  getEvents: async (filters?: EventFilters): Promise<{ events: Event[]; pagination: any }> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categories?.length) params.append('categories', filters.categories.join(','));
    if (filters?.location) params.append('location', filters.location);
    if (filters?.dateRange) params.append('dateRange', filters.dateRange);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const endpoint = `/events${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiRequest<any>(endpoint);
    
    // Handle different response formats
    let events = [];
    if (response.eventSystem?.events) {
      // Nested eventSystem response
      events = response.eventSystem.events;
    } else if (response.events) {
      // Direct events property
      events = response.events;
    } else if (Array.isArray(response)) {
      // Direct array response
      events = response;
    }
    
    return {
      events: events,
      pagination: response.eventSystem?.metadata?.pagination || response.pagination || {}
    };
  },

  getEvent: async (id: string): Promise<Event | null> => {
    try {
      const response = await apiRequest<any>(`/events/${id}`);
      return response.event || response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createEvent: async (event: Omit<Event, 'id'>): Promise<Event> => {
    return await apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  updateEvent: async (id: string, event: Partial<Event>): Promise<Event> => {
    return await apiRequest<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  deleteEvent: async (id: string): Promise<void> => {
    await apiRequest<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  getCategories: async (): Promise<EventCategory[]> => {
    const response = await apiRequest<any>('/events');
    
    // Handle different response formats for categories
    let categories = [];
    if (response.eventSystem?.categories) {
      // Nested eventSystem response
      categories = response.eventSystem.categories;
    } else if (response.categories) {
      categories = response.categories;
    }
    
    return categories;
  },

  // Tickets
  getTickets: async (): Promise<EventTicket[]> => {
    return await apiRequest<EventTicket[]>('/event-tickets');
  },

  getTicket: async (id: string): Promise<EventTicket> => {
    return await apiRequest<EventTicket>(`/event-tickets/${id}`);
  },

  createTicket: async (ticket: Omit<EventTicket, 'id'>): Promise<EventTicket> => {
    return await apiRequest<EventTicket>('/event-tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  },

  updateTicket: async (id: string, ticket: Partial<EventTicket>): Promise<EventTicket> => {
    return await apiRequest<EventTicket>(`/event-tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticket),
    });
  },

  deleteTicket: async (id: string): Promise<void> => {
    await apiRequest<void>(`/event-tickets/${id}`, {
      method: 'DELETE',
    });
  },

  // Booking
  createBooking: async (booking: BookingRequest): Promise<BookingResponse> => {
    return await apiRequest<BookingResponse>('/event-tickets', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  },

  getBooking: async (id: string): Promise<BookingResponse> => {
    return await apiRequest<BookingResponse>(`/event-tickets/${id}`);
  },

  getUserTickets: async (userId?: string): Promise<BookingRecord[]> => {
    return await apiRequest<BookingRecord[]>('/event-tickets');
  },

  // Get booked tickets count for a specific event
  getBookedTicketsCount: async (eventId: string): Promise<number> => {
    try {
      const tickets = await apiRequest<BookingRecord[]>('/event-tickets');
      const eventTickets = tickets.filter(ticket => ticket.eventId === eventId);
      
      // Count total tickets booked for this event
      const totalBooked = eventTickets.reduce((sum, booking) => {
        return sum + booking.tickets.reduce((ticketSum, ticket) => {
          return ticketSum + ticket.quantity;
        }, 0);
      }, 0);
      
      return totalBooked;
    } catch (error) {
      console.warn('Failed to get booked tickets count:', error);
      return 0;
    }
  },

  validateTicket: async (ticketId: string): Promise<{ valid: boolean; message: string }> => {
    return await apiRequest<{ valid: boolean; message: string }>(`/tickets/${ticketId}/validate`, {
      method: 'POST',
    });
  },
};

export { ApiError };