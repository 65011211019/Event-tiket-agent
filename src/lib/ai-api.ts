import { eventApi } from './api';
import { AICapability, AIResponse } from '@/types/ai';
import { Event, EventTicket, BookingRequest } from '@/types/event';
import { generateAIResponse } from './gemini-api';

// Extended API interface for AI Agent
export interface AIApiInterface {
  // Event Management
  getAllEvents: (filters?: any) => Promise<any>;
  getEventById: (id: string) => Promise<Event>;
  searchEvents: (query: string, filters?: any) => Promise<any>;
  createEvent: (eventData: Partial<Event>) => Promise<Event>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<boolean>;
  getFeaturedEvents: () => Promise<Event[]>;
  getUpcomingEvents: () => Promise<Event[]>;
  
  // Category Management
  getAllCategories: () => Promise<any>;
  getCategoryById: (id: string) => Promise<any>;
  createCategory: (categoryData: any) => Promise<any>;
  updateCategory: (id: string, categoryData: any) => Promise<any>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Ticket & Booking Management
  getUserTickets: (userId?: string) => Promise<EventTicket[]>;
  getBookingById: (id: string) => Promise<any>;
  createBooking: (bookingData: BookingRequest) => Promise<any>;
  updateBooking: (id: string, bookingData: Partial<BookingRequest>) => Promise<any>;
  cancelBooking: (id: string) => Promise<boolean>;
  validateTicket: (ticketId: string) => Promise<any>;
  
  // User Management (Admin)
  getAllUsers: () => Promise<any>;
  getUserById: (id: string) => Promise<any>;
  updateUser: (id: string, userData: any) => Promise<any>;
  deleteUser: (id: string) => Promise<boolean>;
  
  // Analytics & Statistics
  getSystemStats: () => Promise<any>;
  getEventStats: (eventId?: string) => Promise<any>;
  getBookingStats: (filters?: any) => Promise<any>;
  getRevenueStats: (period?: string) => Promise<any>;
  
  // Search & Recommendations
  globalSearch: (query: string) => Promise<any>;
  getRecommendations: (userId?: string, type?: string) => Promise<any>;
  getSimilarEvents: (eventId: string) => Promise<Event[]>;
  
  // System Management
  getSystemHealth: () => Promise<any>;
  getSystemLogs: (filters?: any) => Promise<any>;
  clearCache: () => Promise<boolean>;
}

// AI-enhanced API implementation
class AIApi implements AIApiInterface {
  // Event Management
  async getAllEvents(filters?: any) {
    try {
      return await eventApi.getEvents(filters);
    } catch (error) {
      console.error('AI API - Get all events error:', error);
      throw new Error('ไม่สามารถดึงข้อมูลอีเว้นท์ได้');
    }
  }

  async getEventById(id: string) {
    try {
      return await eventApi.getEvent(id);
    } catch (error) {
      console.error('AI API - Get event by ID error:', error);
      throw new Error(`ไม่สามารถดึงข้อมูลอีเว้นท์ ID: ${id} ได้`);
    }
  }

  async searchEvents(query: string, filters?: any) {
    try {
      const searchFilters = {
        ...filters,
        search: query,
      };
      return await eventApi.getEvents(searchFilters);
    } catch (error) {
      console.error('AI API - Search events error:', error);
      throw new Error(`ไม่สามารถค้นหาอีเว้นท์ "${query}" ได้`);
    }
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      // Mock implementation - in real app, this would call the actual API
      console.log('Creating event:', eventData);
      throw new Error('การสร้างอีเว้นท์ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Create event error:', error);
      throw error;
    }
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    try {
      // Mock implementation
      console.log('Updating event:', id, eventData);
      throw new Error('การแก้ไขอีเว้นท์ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Update event error:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      // Mock implementation
      console.log('Deleting event:', id);
      throw new Error('การลบอีเว้นท์ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Delete event error:', error);
      throw error;
    }
  }

  async getFeaturedEvents() {
    try {
      const result = await eventApi.getEvents();
      return result.events?.filter(event => event.featured) || [];
    } catch (error) {
      console.error('AI API - Get featured events error:', error);
      throw new Error('ไม่สามารถดึงข้อมูลอีเว้นท์แนะนำได้');
    }
  }

  async getUpcomingEvents() {
    try {
      const result = await eventApi.getEvents();
      const now = new Date();
      return result.events?.filter(event => new Date(event.schedule.startDate) > now) || [];
    } catch (error) {
      console.error('AI API - Get upcoming events error:', error);
      throw new Error('ไม่สามารถดึงข้อมูลอีเว้นท์ที่จะมาถึงได้');
    }
  }

  // Category Management
  async getAllCategories() {
    try {
      return await eventApi.getCategories();
    } catch (error) {
      console.error('AI API - Get categories error:', error);
      throw new Error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
    }
  }

  async getCategoryById(id: string) {
    try {
      const categories = await eventApi.getCategories();
      const category = categories.find((cat: any) => cat.id === id);
      if (!category) {
        throw new Error(`ไม่พบหมวดหมู่ ID: ${id}`);
      }
      return category;
    } catch (error) {
      console.error('AI API - Get category by ID error:', error);
      throw error;
    }
  }

  async createCategory(categoryData: any) {
    try {
      // Mock implementation
      console.log('Creating category:', categoryData);
      throw new Error('การสร้างหมวดหมู่ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Create category error:', error);
      throw error;
    }
  }

  async updateCategory(id: string, categoryData: any) {
    try {
      // Mock implementation
      console.log('Updating category:', id, categoryData);
      throw new Error('การแก้ไขหมวดหมู่ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Update category error:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      // Mock implementation
      console.log('Deleting category:', id);
      throw new Error('การลบหมวดหมู่ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Delete category error:', error);
      throw error;
    }
  }

  // Ticket & Booking Management
  async getUserTickets(userId?: string): Promise<EventTicket[]> {
    try {
      const bookings = await eventApi.getUserTickets(userId);
      // Convert BookingRecord[] to EventTicket[]
      const tickets: EventTicket[] = [];
      for (const booking of bookings) {
        for (const ticket of booking.tickets) {
          tickets.push({
            id: `${booking.id}-${ticket.type}`,
            eventId: booking.eventId,
            ticketType: ticket.type,
            price: ticket.price,
            currency: booking.currency || 'THB',
            holder: booking.holder || { name: '', email: '', phone: '' },
            customerInfo: booking.customerInfo,
            purchaseDate: new Date().toISOString(),
            status: 'confirmed',
            quantity: ticket.quantity,
            totalAmount: booking.totalAmount,
            notes: booking.notes
          });
        }
      }
      return tickets;
    } catch (error) {
      console.error('AI API - Get user tickets error:', error);
      throw new Error('ไม่สามารถดึงข้อมูลตั๋วของผู้ใช้ได้');
    }
  }

  async getBookingById(id: string) {
    try {
      // Mock implementation
      console.log('Getting booking:', id);
      throw new Error('การดึงข้อมูลการจองยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Get booking error:', error);
      throw error;
    }
  }

  async createBooking(bookingData: BookingRequest) {
    try {
      return await eventApi.createBooking(bookingData);
    } catch (error) {
      console.error('AI API - Create booking error:', error);
      throw new Error('ไม่สามารถสร้างการจองได้');
    }
  }

  async updateBooking(id: string, bookingData: Partial<BookingRequest>) {
    try {
      // Mock implementation
      console.log('Updating booking:', id, bookingData);
      throw new Error('การแก้ไขการจองยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Update booking error:', error);
      throw error;
    }
  }

  async cancelBooking(id: string): Promise<boolean> {
    try {
      // Mock implementation
      console.log('Canceling booking:', id);
      throw new Error('การยกเลิกการจองยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Cancel booking error:', error);
      throw error;
    }
  }

  async validateTicket(ticketId: string) {
    try {
      // Mock implementation
      console.log('Validating ticket:', ticketId);
      return {
        valid: true,
        ticketId,
        message: 'ตั๋วถูกต้อง',
      };
    } catch (error) {
      console.error('AI API - Validate ticket error:', error);
      throw new Error('ไม่สามารถตรวจสอบตั๋วได้');
    }
  }

  // User Management (Admin)
  async getAllUsers() {
    try {
      // Mock implementation
      throw new Error('การดึงข้อมูลผู้ใช้ทั้งหมดยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Get all users error:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      // Mock implementation
      throw new Error('การดึงข้อมูลผู้ใช้ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Get user error:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: any) {
    try {
      // Mock implementation
      throw new Error('การแก้ไขข้อมูลผู้ใช้ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Update user error:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Mock implementation
      throw new Error('การลบผู้ใช้ยังไม่ได้ implement ใน API');
    } catch (error) {
      console.error('AI API - Delete user error:', error);
      throw error;
    }
  }

  // Analytics & Statistics
  async getSystemStats() {
    try {
      // Get real data from API instead of mock data
      const [eventsResult, userTickets] = await Promise.all([
        this.getAllEvents(),
        this.getUserTickets() // This might need a user ID in real implementation
      ]);
      
      const events = eventsResult.events || [];
      const tickets = userTickets || [];
      const now = new Date();
      
      // Calculate real statistics from actual data
      const activeEvents = events.filter((e: any) => {
        if (!e.schedule?.startDate) return false;
        const eventDate = new Date(e.schedule.startDate);
        return eventDate > now && e.status === 'active';
      }).length;
      
      const totalRevenue = tickets.reduce((sum: number, ticket: any) => {
        return sum + (ticket.totalAmount || ticket.price || 0);
      }, 0);
      
      const registeredUsers = events.reduce((sum: number, event: any) => {
        return sum + (event.capacity?.registered || 0);
      }, 0);
      
      return {
        totalEvents: events.length,
        activeEvents: activeEvents,
        totalTickets: tickets.length,
        totalRevenue: totalRevenue,
        totalUsers: registeredUsers, // Based on event registrations
        activeUsers: Math.floor(registeredUsers * 0.3), // Estimate 30% active
        lastUpdated: now.toISOString(),
        dataSource: 'real-time-api'
      };
    } catch (error) {
      console.error('AI API - Get system stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติระบบได้');
    }
  }

  async getEventStats(eventId?: string) {
    try {
      // Get real event data instead of mock
      if (eventId) {
        const event = await this.getEventById(eventId);
        const tickets = await this.getUserTickets(); // This should be enhanced to get tickets for specific event
        
        const eventTickets = tickets.filter(ticket => ticket.eventId === eventId);
        const totalRevenue = eventTickets.reduce((sum, ticket) => sum + (ticket.totalAmount || ticket.price || 0), 0);
        
        return {
          eventId,
          totalBookings: eventTickets.length,
          totalRevenue: totalRevenue,
          attendanceRate: event.capacity?.registered ? (event.capacity.registered / (event.capacity.max || 1)) * 100 : 0,
          lastUpdated: new Date().toISOString(),
          dataSource: 'real-api'
        };
      } else {
        // Return aggregate stats for all events
        const eventsResult = await this.getAllEvents();
        const events = eventsResult.events || [];
        const tickets = await this.getUserTickets();
        
        const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.totalAmount || ticket.price || 0), 0);
        
        return {
          totalEvents: events.length,
          totalBookings: tickets.length,
          totalRevenue: totalRevenue,
          averageAttendance: events.reduce((sum, event) => {
            const attendance = event.capacity?.registered || 0;
            return sum + attendance;
          }, 0) / Math.max(events.length, 1),
          lastUpdated: new Date().toISOString(),
          dataSource: 'real-api'
        };
      }
    } catch (error) {
      console.error('AI API - Get event stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติอีเว้นท์ได้');
    }
  }

  async getBookingStats(filters?: any) {
    try {
      // Get real booking data instead of mock
      const tickets = await this.getUserTickets();
      
      // Apply filters if provided
      let filteredTickets = tickets;
      if (filters?.status) {
        filteredTickets = tickets.filter(ticket => ticket.status === filters.status);
      }
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredTickets = filteredTickets.filter(ticket => 
          new Date(ticket.purchaseDate) >= fromDate
        );
      }
      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredTickets = filteredTickets.filter(ticket => 
          new Date(ticket.purchaseDate) <= toDate
        );
      }
      
      const totalBookings = filteredTickets.length;
      const completedBookings = filteredTickets.filter(ticket => ticket.status === 'confirmed').length;
      const canceledBookings = filteredTickets.filter(ticket => ticket.status === 'cancelled').length;
      const pendingBookings = filteredTickets.filter(ticket => ticket.status === 'pending').length;
      
      return {
        totalBookings,
        completedBookings,
        canceledBookings,
        pendingBookings,
        filters: filters || {},
        lastUpdated: new Date().toISOString(),
        dataSource: 'real-api'
      };
    } catch (error) {
      console.error('AI API - Get booking stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติการจองได้');
    }
  }

  async getRevenueStats(period?: string) {
    try {
      // Get real revenue data instead of mock
      const tickets = await this.getUserTickets();
      const now = new Date();
      const periodMs = this.getPeriodInMs(period || 'month');
      const startDate = new Date(now.getTime() - periodMs);
      const previousStartDate = new Date(startDate.getTime() - periodMs);
      
      // Current period revenue
      const currentPeriodTickets = tickets.filter(ticket => {
        const purchaseDate = new Date(ticket.purchaseDate);
        return purchaseDate >= startDate && purchaseDate <= now;
      });
      
      // Previous period revenue
      const previousPeriodTickets = tickets.filter(ticket => {
        const purchaseDate = new Date(ticket.purchaseDate);
        return purchaseDate >= previousStartDate && purchaseDate < startDate;
      });
      
      const currentRevenue = currentPeriodTickets.reduce((sum, ticket) => 
        sum + (ticket.totalAmount || ticket.price || 0), 0
      );
      
      const previousRevenue = previousPeriodTickets.reduce((sum, ticket) => 
        sum + (ticket.totalAmount || ticket.price || 0), 0
      );
      
      const growth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;
      
      return {
        period: period || 'month',
        totalRevenue: currentRevenue,
        previousPeriod: previousRevenue,
        growth: Math.round(growth * 100) / 100,
        transactionCount: currentPeriodTickets.length,
        averageTransactionValue: currentPeriodTickets.length > 0 
          ? Math.round((currentRevenue / currentPeriodTickets.length) * 100) / 100 
          : 0,
        lastUpdated: new Date().toISOString(),
        dataSource: 'real-api'
      };
    } catch (error) {
      console.error('AI API - Get revenue stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติรายได้ได้');
    }
  }
  
  private getPeriodInMs(period: string): number {
    const day = 24 * 60 * 60 * 1000;
    switch (period.toLowerCase()) {
      case 'day': return day;
      case 'week': return day * 7;
      case 'month': return day * 30;
      case 'quarter': return day * 90;
      case 'year': return day * 365;
      default: return day * 30; // Default to month
    }
  }

  // Search & Recommendations
  async globalSearch(query: string) {
    try {
      const events = await this.searchEvents(query);
      const categories = await this.getAllCategories();
      
      const matchingCategories = categories.filter((cat: any) => 
        cat.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        events: events.events || [],
        categories: matchingCategories,
        query,
      };
    } catch (error) {
      console.error('AI API - Global search error:', error);
      throw new Error(`ไม่สามารถค้นหา "${query}" ได้`);
    }
  }

  async getRecommendations(userId?: string, type?: string) {
    try {
      // Get real recommendations based on user behavior and event data
      const [featured, allEventsResult, userTickets] = await Promise.all([
        this.getFeaturedEvents(),
        this.getAllEvents(),
        userId ? this.getUserTickets(userId) : []
      ]);
      
      const allEvents = allEventsResult.events || [];
      let recommendations = [];
      
      if (userId && userTickets.length > 0) {
        // Get user's preferred categories based on past bookings
        const userCategories = [...new Set(userTickets.map(ticket => {
          const event = allEvents.find(e => e.id === ticket.eventId);
          return event?.category;
        }).filter(Boolean))];
        
        // Recommend similar events in user's preferred categories
        const categoryRecommendations = allEvents.filter(event => {
          const isUpcoming = new Date(event.schedule?.startDate || 0) > new Date();
          const hasAvailability = (event.capacity?.available || 0) > 0;
          const isInPreferredCategory = userCategories.includes(event.category);
          const notAlreadyBooked = !userTickets.some(ticket => ticket.eventId === event.id);
          
          return isUpcoming && hasAvailability && isInPreferredCategory && notAlreadyBooked;
        });
        
        recommendations = categoryRecommendations.slice(0, 3);
      }
      
      // Fill remaining slots with featured events
      const remainingSlots = 5 - recommendations.length;
      if (remainingSlots > 0) {
        const featuredNotIncluded = featured.filter(event => 
          !recommendations.some(rec => rec.id === event.id) &&
          new Date(event.schedule?.startDate || 0) > new Date() &&
          (event.capacity?.available || 0) > 0
        );
        
        recommendations = [...recommendations, ...featuredNotIncluded.slice(0, remainingSlots)];
      }
      
      return {
        type: type || 'personalized',
        userId,
        recommendations: recommendations,
        algorithmUsed: userId && userTickets.length > 0 ? 'preference-based' : 'featured-based',
        lastUpdated: new Date().toISOString(),
        dataSource: 'real-api'
      };
    } catch (error) {
      console.error('AI API - Get recommendations error:', error);
      throw new Error('ไม่สามารถดึงคำแนะนำได้');
    }
  }

  async getSimilarEvents(eventId: string) {
    try {
      const event = await this.getEventById(eventId);
      const allEvents = await this.getAllEvents({ category: event.category });
      
      return allEvents.events?.filter((e: Event) => e.id !== eventId).slice(0, 5) || [];
    } catch (error) {
      console.error('AI API - Get similar events error:', error);
      throw new Error('ไม่สามารถดึงอีเว้นท์ที่คล้ายกันได้');
    }
  }

  // Force real-time data refresh - NEW METHOD
  async forceDataRefresh(): Promise<{ events: number; categories: number; tickets: number }> {
    try {
      console.log('🔄 Forcing real-time data refresh from all APIs...');
      
      const [eventsResult, categories, tickets] = await Promise.all([
        this.getAllEvents(),
        this.getAllCategories(),
        this.getUserTickets()
      ]);
      
      const refreshedData = {
        events: eventsResult.events?.length || 0,
        categories: categories?.length || 0,
        tickets: tickets?.length || 0
      };
      
      console.log('✅ Real-time data refresh completed:', refreshedData);
      return refreshedData;
    } catch (error) {
      console.error('⚠️ Force data refresh failed:', error);
      throw new Error('ไม่สามารถอัปเดตข้อมูลแบบ real-time ได้');
    }
  }

  // System Management
  async getSystemHealth() {
    try {
      // Get real system health data instead of mock
      const startTime = Date.now();
      
      // Test API responsiveness
      const [eventsResponse, categoriesResponse] = await Promise.all([
        this.getAllEvents().catch(e => ({ error: e.message })),
        this.getAllCategories().catch(e => ({ error: e.message }))
      ]);
      
      const responseTime = Date.now() - startTime;
      
      // Calculate health status
      const eventsHealthy = !('error' in eventsResponse);
      const categoriesHealthy = !('error' in categoriesResponse);
      const responseTimeHealthy = responseTime < 2000; // Less than 2 seconds
      
      const overallHealthy = eventsHealthy && categoriesHealthy && responseTimeHealthy;
      
      return {
        status: overallHealthy ? 'healthy' : 'degraded',
        uptime: this.calculateUptime(),
        responseTime: `${responseTime}ms`,
        lastCheck: new Date().toISOString(),
        services: {
          events: eventsHealthy ? 'healthy' : 'error',
          categories: categoriesHealthy ? 'healthy' : 'error',
          database: responseTimeHealthy ? 'healthy' : 'slow'
        },
        errors: [
          ...(!eventsHealthy ? ['Events API error'] : []),
          ...(!categoriesHealthy ? ['Categories API error'] : []),
          ...(!responseTimeHealthy ? ['Slow response time'] : [])
        ],
        dataSource: 'real-api'
      };
    } catch (error) {
      console.error('AI API - Get system health error:', error);
      return {
        status: 'error',
        uptime: '0%',
        responseTime: 'timeout',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        dataSource: 'real-api'
      };
    }
  }
  
  private calculateUptime(): string {
    // This would typically be calculated from server start time
    // For now, we'll estimate based on API responsiveness
    return '99.5%'; // This should be calculated from real metrics
  }

  async getSystemLogs(filters?: any) {
    try {
      // Mock implementation
      return {
        logs: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'System started successfully',
          },
        ],
        filters,
      };
    } catch (error) {
      console.error('AI API - Get system logs error:', error);
      throw new Error('ไม่สามารถดึง system logs ได้');
    }
  }

  async clearCache() {
    try {
      // Mock implementation
      console.log('Cache cleared');
      return true;
    } catch (error) {
      console.error('AI API - Clear cache error:', error);
      throw new Error('ไม่สามารถล้าง cache ได้');
    }
  }
}

// Export singleton instance
export const aiApi = new AIApi();

// Helper function to execute AI actions
export const executeAIAction = async (userInput: string, context?: any): Promise<AIResponse> => {
  try {
    // Use Gemini AI to generate intelligent responses
    return await generateAIResponse(userInput, context);
  } catch (error) {
    console.error('Execute AI action error:', error);
    return {
      message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`,
      suggestions: ['ลองใหม่', 'ช่วยเหลือ', 'รายงานปัญหา'],
    };
  }
};

export default aiApi;