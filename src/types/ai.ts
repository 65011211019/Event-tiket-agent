export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    eventId?: string;
    userId?: string;
    action?: {
      type: string;
      payload?: any;
    };
    context?: any;
    suggestions?: string[];
  };
}

export interface AIMemory {
  events: any[];
  categories: any[];
  tickets: any[];
  searchResults: {
    [query: string]: {
      results: any[];
      timestamp: Date;
      ttl: number; // Time to live in milliseconds
    };
  };
  userPreferences: {
    favoriteCategories: string[];
    recentSearches: string[];
    bookingHistory: any[];
  };
  lastFetchTime: {
    events?: Date;
    categories?: Date;
    tickets?: Date;
  };
}

export interface AIContext {
  currentPage: string;
  currentUser?: {
    id: string;
    name: string;
    role: 'admin' | 'user';
  };
  currentEvent?: {
    id: string;
    title: string;
    category: string;
  };
  availableActions: string[];
  systemData?: {
    events: any[];
    categories: any[];
    tickets: any[];
  };
  memory?: AIMemory;
  // AI Booking-related properties
  bookingChoices?: {
    events: any[];
    originalQuery?: string;
  };
  ticketOptions?: {
    event: any;
    ticketOptions: any[];
    eventId: string;
  };
  showBookingInterface?: boolean;
  showTicketSelection?: boolean;
}

export interface AICapability {
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiredParams?: string[];
  adminOnly?: boolean;
}

export interface AIResponse {
  message: string;
  action?: {
    type: 'navigate' | 'api_call' | 'form_fill' | 'display_data' | 'proceed_to_booking' | 'show_ticket_options' | 'show_booking_choices';
    payload: any;
  };
  suggestions?: string[];
  data?: any;
}

export interface AIAgentState {
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  context: AIContext;
  capabilities: AICapability[];
  error?: string;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: 'system' | 'user_help' | 'admin_help' | 'data_analysis';
}

export interface AIAnalytics {
  totalQueries: number;
  successfulActions: number;
  commonQuestions: string[];
  userSatisfaction: number;
  responseTime: number;
}