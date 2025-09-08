import { AIContext, AICapability } from '@/types/ai';
import { Event, EventTicket, EventCategory, BookingRecord, EventFilters, EventSystemInfo } from '@/types/event';

// Enhanced AI Knowledge System - Comprehensive data understanding
export interface SystemKnowledge {
  events: Event[];
  categories: EventCategory[];
  tickets: EventTicket[];
  bookings: BookingRecord[];
  users: any[];
  systemStats: {
    totalEvents: number;
    activeEvents: number;
    totalTickets: number;
    totalRevenue: number;
    totalUsers: number;
    activeUsers: number;
    revenueGrowth?: number;
    popularCategories?: string[];
    upcomingEvents: number;
    pastEvents: number;
    averageTicketPrice?: number;
    systemHealth?: any;
  };
  capabilities: AICapability[];
  systemInfo: EventSystemInfo;
}

export class AIKnowledgeBuilder {
  private knowledge: SystemKnowledge;

  constructor() {
    this.knowledge = {
      events: [],
      categories: [],
      tickets: [],
      bookings: [],
      users: [],
      systemStats: {
        totalEvents: 0,
        activeEvents: 0,
        totalTickets: 0,
        totalRevenue: 0,
        totalUsers: 0,
        activeUsers: 0,
        upcomingEvents: 0,
        pastEvents: 0,
      },
      capabilities: [],
      systemInfo: {
        name: 'Event Ticket System',
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalEvents: 0
      },
    };
  }

  // Update system knowledge with fresh data
  updateKnowledge(data: Partial<SystemKnowledge>): void {
    this.knowledge = { ...this.knowledge, ...data };
    this.analyzeDataRelationships();
  }

  // Analyze relationships and derive insights from data
  private analyzeDataRelationships(): void {
    const events = this.knowledge.events;
    const tickets = this.knowledge.tickets;
    const now = new Date();
    
    // Analyze events
    const upcomingEvents = events.filter(event => 
      new Date(event.schedule?.startDate || 0) > now
    );
    const pastEvents = events.filter(event => 
      new Date(event.schedule?.endDate || 0) < now
    );
    const activeEvents = events.filter(event => {
      const startDate = new Date(event.schedule?.startDate || 0);
      const endDate = new Date(event.schedule?.endDate || 0);
      return startDate <= now && now <= endDate;
    });
    
    // Analyze pricing
    const ticketPrices = tickets.map(ticket => ticket.price).filter(price => price > 0);
    const averageTicketPrice = ticketPrices.length > 0 
      ? ticketPrices.reduce((a, b) => a + b, 0) / ticketPrices.length 
      : 0;
    
    // Analyze popular categories
    const categoryCount = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
    
    // Update derived statistics
    this.knowledge.systemStats = {
      ...this.knowledge.systemStats,
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      totalTickets: tickets.length,
      totalRevenue: tickets.reduce((sum, ticket) => sum + (ticket.totalAmount || ticket.price || 0), 0),
      averageTicketPrice,
      popularCategories,
    };
    
    // Update system info
    this.knowledge.systemInfo.totalEvents = events.length;
    this.knowledge.systemInfo.lastUpdated = new Date().toISOString();
  }

  // Build comprehensive system context
  buildSystemContext(context: AIContext): string {
    const currentUser = context.currentUser;
    const isAdmin = currentUser?.role === 'admin';
    
    const stats = this.knowledge.systemStats;
    const events = this.knowledge.events;
    const categories = this.knowledge.categories;
    
    let contextInfo = `ข้อมูลระบบจัดการตั๋วอีเว้นท์ปัจจุบัน:\n\n`;
    
    // Event statistics
    contextInfo += `📊 สถิติอีเว้นท์:\n`;
    contextInfo += `- อีเว้นท์ทั้งหมด: ${stats.totalEvents} รายการ\n`;
    contextInfo += `- อีเว้นท์ที่กำลังดำเนินการ: ${stats.activeEvents} รายการ\n`;
    contextInfo += `- อีเว้นท์ที่จะมาถึง: ${stats.upcomingEvents} รายการ\n`;
    contextInfo += `- อีเว้นท์ที่ผ่านไปแล้ว: ${stats.pastEvents} รายการ\n\n`;
    
    // Category information
    if (categories.length > 0) {
      contextInfo += `🏷️ หมวดหมู่อีเว้นท์ (${categories.length} หมวดหมู่):\n`;
      categories.slice(0, 5).forEach(cat => {
        contextInfo += `- ${cat.name}: ${cat.description}\n`;
      });
      if (stats.popularCategories && stats.popularCategories.length > 0) {
        contextInfo += `หมวดหมู่ที่ได้รับความนิยม: ${stats.popularCategories.join(', ')}\n\n`;
      }
    }
    
    // Ticket and revenue info
    contextInfo += `🎫 ข้อมูลตั๋ว:\n`;
    contextInfo += `- ตั๋วที่ออกแล้ว: ${stats.totalTickets} ใบ\n`;
    contextInfo += `- รายได้รวม: ${stats.totalRevenue.toLocaleString()} บาท\n`;
    if (stats.averageTicketPrice && stats.averageTicketPrice > 0) {
      contextInfo += `- ราคาเฉลี่ยต่อใบ: ${stats.averageTicketPrice.toFixed(0)} บาท\n`;
    }
    contextInfo += `\n`;
    
    // User information
    contextInfo += `👤 ข้อมูลผู้ใช้ปัจจุบัน:\n`;
    contextInfo += `- ชื่อ: ${currentUser?.name || 'ไม่ระบุ'}\n`;
    contextInfo += `- สิทธิ์: ${currentUser?.role || 'ผู้ใช้ทั่วไป'}`;
    if (isAdmin) {
      contextInfo += ` (มีสิทธิ์ผู้ดูแลระบบ)`;
    }
    contextInfo += `\n- หน้าปัจจุบัน: ${context.currentPage || 'หน้าหลัก'}\n\n`;
    
    // System capabilities
    const capabilities = this.getAvailableCapabilities(currentUser?.role);
    contextInfo += `⚡ ความสามารถที่มี:\n`;
    capabilities.slice(0, 8).forEach(cap => {
      contextInfo += `- ${cap}\n`;
    });
    
    return contextInfo;
  }

  // Build detailed event summary with ALL fields
  buildEventSummary(includeDetails: boolean = false): string {
    const recentEvents = this.getRelevantEvents(5);
    
    if (recentEvents.length === 0) {
      return 'ไม่มีอีเว้นท์ที่จะมาถึงในขณะนี้';
    }

    let summary = `อีเว้นท์ที่จะมาถึง (${recentEvents.length} รายการ):\n`;
    
    recentEvents.forEach(event => {
      summary += `\n📅 ${event.title}\n`;
      summary += `   หมวดหมู่: ${event.category}\n`;
      summary += `   วันที่: ${new Date(event.schedule?.startDate || 0).toLocaleDateString('th-TH')}\n`;
      
      if (includeDetails) {
        // Location details
        if (event.location?.type) {
          const locationText = event.location.type === 'onsite' ? 'ออนไซต์' : 
                              event.location.type === 'online' ? 'ออนไลน์' : 'ไฮบริด';
          summary += `   รูปแบบ: ${locationText}`;
          if (event.location.venue) {
            summary += ` ที่ ${event.location.venue}`;
          }
          summary += `\n`;
        }
        
        // Pricing details
        if (event.pricing) {
          const prices: string[] = [];
          Object.entries(event.pricing).forEach(([type, price]) => {
            if (type !== 'currency' && typeof price === 'number' && price > 0) {
              const typeMap: Record<string, string> = {
                'regular': 'ราคาปกติ',
                'earlyBird': 'ราคาก่อนวัน',
                'student': 'ราคานักเรียน',
                'vip': 'VIP',
                'general': 'ทั่วไป',
                'free': 'ฟรี'
              };
              prices.push(`${typeMap[type] || type}: ${price} ${event.pricing.currency || 'บาท'}`);
            }
          });
          if (prices.length > 0) {
            summary += `   ราคา: ${prices.slice(0, 3).join(', ')}\n`;
          }
        }
        
        // Capacity info
        if (event.capacity) {
          summary += `   ที่นั่ง: ${event.capacity.registered}/${event.capacity.max} คน`;
          if (event.capacity.available > 0) {
            summary += ` (เหลือ ${event.capacity.available} ที่)`;
          }
          summary += `\n`;
        }
        
        // Special features
        if (event.featured) {
          summary += `   🌟 อีเว้นท์แนะนำ\n`;
        }
        if (event.speakers && event.speakers.length > 0) {
          summary += `   🎤 วิทยากร: ${event.speakers.slice(0, 2).map(s => s.name).join(', ')}\n`;
        }
        if (event.artists && event.artists.length > 0) {
          summary += `   🎵 ศิลปิน: ${event.artists.slice(0, 2).map(a => a.name).join(', ')}\n`;
        }
      }
    });

    return summary;
  }

  // Get events with comprehensive filtering
  getRelevantEvents(limit: number = 5, filters?: EventFilters): Event[] {
    let events = [...this.knowledge.events];
    
    // Apply filters if provided
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        events = events.filter(event => filters.categories!.includes(event.category));
      }
      
      if (filters.location) {
        events = events.filter(event => event.location?.type === filters.location);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        events = events.filter(event => 
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    
    // Sort by date (upcoming first)
    events = events
      .filter(event => new Date(event.schedule?.startDate || 0) > new Date())
      .sort((a, b) => new Date(a.schedule?.startDate || 0).getTime() - new Date(b.schedule?.startDate || 0).getTime());
    
    return events.slice(0, limit);
  }

  // Get system capabilities based on user role with detailed descriptions
  getAvailableCapabilities(userRole?: string): string[] {
    const capabilities = [
      'ดูรายการอีเว้นท์พร้อมรายละเอียดครบถ้วน',
      'ค้นหาอีเว้นท์ตามหมวดหมู่ ราคา สถานที่ และวันที่',
      'ดูข้อมูลอีเว้นท์แบบละเอียด (วิทยากร ศิลปิน ราคา ที่นั่ง)',
      'ดูหมวดหมู่อีเว้นท์ทั้งหมดพร้อมคำอธิบาย',
      'ดูตั๋วของตนเองพร้อมสถานะและรายละเอียด',
      'ค้นหาและแนะนำอีเว้นท์ตามความสนใจ',
      'ดูสถิติการใช้งานและความนิยม',
      'ตรวจสอบที่นั่งว่างและราคาปัจจุบัน'
    ];

    if (userRole === 'admin') {
      capabilities.push(
        'สร้างและแก้ไขอีเว้นท์พร้อมข้อมูลครบถ้วน',
        'จัดการหมวดหมู่และการจำแนกอีเว้นท์',
        'ดูสถิติรายได้และการขายตั๋วแบบละเอียด',
        'จัดการผู้ใช้และสิทธิ์การเข้าถึง',
        'ดูรายงานระบบและ analytics ครบถ้วน',
        'ตั้งค่าราคาและโปรโมชั่นต่างๆ',
        'จัดการที่นั่งและ capacity ของอีเว้นท์',
        'ดูข้อมูลการจองและสถิติการเข้าร่วม'
      );
    }

    return capabilities;
  }

  // Build comprehensive category knowledge
  buildCategoryKnowledge(): string {
    if (this.knowledge.categories.length === 0) {
      return 'ไม่มีข้อมูลหมวดหมู่อีเว้นท์';
    }

    let categoryInfo = `หมวดหมู่อีเว้นท์ทั้งหมด (${this.knowledge.categories.length} หมวดหมู่):\n`;
    
    this.knowledge.categories.forEach(cat => {
      categoryInfo += `\n🏷️ ${cat.name}\n`;
      if (cat.description) {
        categoryInfo += `   คำอธิบาย: ${cat.description}\n`;
      }
      
      // Count events in this category
      const eventCount = this.knowledge.events.filter(event => event.category === cat.name).length;
      categoryInfo += `   อีเว้นท์ในหมวดหมู่นี้: ${eventCount} รายการ\n`;
    });
    
    return categoryInfo;
  }

  // Get current system knowledge for AI
  getCurrentKnowledge(): SystemKnowledge {
    return this.knowledge;
  }

  // Build complete context for AI with comprehensive information
  buildCompleteContext(context: AIContext, includeEventDetails: boolean = false): string {
    let fullContext = this.buildSystemContext(context);
    
    fullContext += '\n' + this.buildCategoryKnowledge();
    
    if (includeEventDetails) {
      fullContext += '\n\n' + this.buildEventSummary(true);
    }
    
    return fullContext;
  }
}

// Export singleton instance
export const aiKnowledge = new AIKnowledgeBuilder();

// Helper functions for backward compatibility and easy migration
export const updateSystemKnowledge = (data: Partial<SystemKnowledge>): void => {
  aiKnowledge.updateKnowledge(data);
};

export const getSystemContext = (context: AIContext, includeDetails: boolean = false): string => {
  return aiKnowledge.buildCompleteContext(context, includeDetails);
};

export const getCurrentEvents = (): Event[] => {
  return aiKnowledge.getRelevantEvents();
};

export const getSystemCapabilities = (userRole?: string): string[] => {
  return aiKnowledge.getAvailableCapabilities(userRole);
};

export default aiKnowledge;