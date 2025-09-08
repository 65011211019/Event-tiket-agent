export interface EventCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface EventOrganizer {
  name: string;
  contact: string;
  phone: string;
}

export interface EventSchedule {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface EventLocation {
  type: 'onsite' | 'online' | 'hybrid';
  venue?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  onlineLink?: string;
}

export interface EventPricing {
  currency: string;
  earlyBird?: number;
  regular?: number;
  student?: number;
  group?: number;
  vip?: number;
  premium?: number;
  general?: number;
  fullMarathon?: number;
  halfMarathon?: number;
  miniMarathon?: number;
  funRun?: number;
  adult?: number;
  child?: number;
  senior?: number;
  free?: number;
  member?: number;
}

export interface EventCapacity {
  max: number;
  registered: number;
  available: number;
}

export interface EventImages {
  banner?: string;
  thumbnail?: string;
  gallery?: string[];
}

export interface EventSpeaker {
  name: string;
  title: string;
  company: string;
  bio: string;
  image?: string;
}

export interface EventArtist {
  name: string;
  instrument: string;
  country: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: string;
  featured: boolean;
  organizer: EventOrganizer;
  schedule: EventSchedule;
  location: EventLocation;
  pricing: EventPricing;
  capacity: EventCapacity;
  images: EventImages;
  tags: string[];
  requirements?: string[];
  speakers?: EventSpeaker[];
  tracks?: string[];
  includes?: string[];
  artists?: EventArtist[];
  distances?: string[];
  activities?: string[];
}

export interface EventTicket {
  id: string;
  eventId: string;
  ticketType: string;
  price: number;
  currency: string;
  holder: {
    name: string;
    email: string;
    phone: string;
  };
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  purchaseDate: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  qrCode?: string;
  notes?: string;
  quantity?: number;
  totalAmount?: number;
  event?: Event;
}

export interface BookingRequest {
  eventId: string;
  tickets: Array<{
    type: string;
    quantity: number;
    price: number;
  }>;
  holder: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  currency?: string;
  notes?: string;
  // Optional field for backward compatibility
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface BookingTicket {
  type: string;
  quantity: number;
  price: number;
}

export interface BookingRecord {
  id: string;
  eventId: string;
  tickets: BookingTicket[];
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  holder?: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  currency?: string;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  eventId: string;
  tickets: EventTicket[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface FilterOptions {
  categories: string[];
  priceRanges: Array<{ min: number; max: number | null }>;
  locations: ('onsite' | 'online' | 'hybrid')[];
  dateRanges: ('today' | 'week' | 'month' | 'quarter' | 'year')[];
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  label: string;
}

export interface EventSystemInfo {
  name: string;
  version: string;
  lastUpdated: string;
  totalEvents: number;
}

export interface EventFilters {
  search?: string;
  categories?: string[];
  priceRange?: { min?: number; max?: number };
  location?: string;
  dateRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}