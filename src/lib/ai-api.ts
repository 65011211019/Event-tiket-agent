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
      // Mock implementation with sample data
      const events = await this.getAllEvents();
      const tickets = await this.getUserTickets();
      
      return {
        totalEvents: events.events?.length || 0,
        activeEvents: events.events?.filter((e: Event) => new Date(e.schedule.startDate) > new Date()).length || 0,
        totalTickets: tickets.length || 0,
        totalRevenue: tickets.reduce((sum: number, ticket: any) => sum + (ticket.price || 0), 0),
        totalUsers: 150, // Mock data
        activeUsers: 45, // Mock data
      };
    } catch (error) {
      console.error('AI API - Get system stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติระบบได้');
    }
  }

  async getEventStats(eventId?: string) {
    try {
      // Mock implementation
      return {
        eventId,
        totalBookings: 25,
        totalRevenue: 125000,
        attendanceRate: 85,
      };
    } catch (error) {
      console.error('AI API - Get event stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติอีเว้นท์ได้');
    }
  }

  async getBookingStats(filters?: any) {
    try {
      // Mock implementation
      return {
        totalBookings: 150,
        completedBookings: 120,
        canceledBookings: 30,
        pendingBookings: 0,
      };
    } catch (error) {
      console.error('AI API - Get booking stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติการจองได้');
    }
  }

  async getRevenueStats(period?: string) {
    try {
      // Mock implementation
      return {
        period: period || 'month',
        totalRevenue: 500000,
        previousPeriod: 450000,
        growth: 11.1,
      };
    } catch (error) {
      console.error('AI API - Get revenue stats error:', error);
      throw new Error('ไม่สามารถดึงสถิติรายได้ได้');
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
      // Mock implementation based on featured events
      const featured = await this.getFeaturedEvents();
      return {
        type: type || 'general',
        userId,
        recommendations: featured.slice(0, 5),
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

  // System Management
  async getSystemHealth() {
    try {
      // Mock implementation
      return {
        status: 'healthy',
        uptime: '99.9%',
        responseTime: '150ms',
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI API - Get system health error:', error);
      throw new Error('ไม่สามารถตรวจสอบสถานะระบบได้');
    }
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