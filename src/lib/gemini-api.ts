import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse } from '@/types/ai';
import { aiApi } from './ai-api';
import { aiKnowledge, getSystemContext } from './ai-prompts';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyDxOtuESZB_IeWBbaB3aljbLV7hDXtGFRY';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize Gemini 2.5 Flash model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Enhanced action types to support automatic navigation
export const parseUserInput = (input: string): { type: string; payload?: any } => {
  const lowerInput = input.toLowerCase().trim();
  
  // Navigation confirmation responses
  if (lowerInput.includes('ไปเลย') || lowerInput.includes('ตกลง') || lowerInput.includes('ใช่') || 
      lowerInput.includes('yes') || lowerInput.includes('ok') || lowerInput.includes('โอเค') ||
      lowerInput === 'ไป' || lowerInput === 'go') {
    return { type: 'confirm_navigation' };
  }
  
  // Auto navigation patterns
  if (lowerInput.includes('พาไป') || lowerInput.includes('ไป') || lowerInput.includes('navigate') || lowerInput.includes('auto')) {
    // Extract event name if mentioned
    const eventNames = [
      'creative photography workshop',
      'jazz festival',
      'food festival',
      'tech summit',
      'art exhibition',
      'music concert',
      'workshop',
      'festival',
      'conference'
    ];
    
    const mentionedEvent = eventNames.find(name => 
      lowerInput.includes(name.toLowerCase()) ||
      input.toLowerCase().includes(name.toLowerCase())
    );
    
    if (lowerInput.includes('จอง') || lowerInput.includes('booking') || lowerInput.includes('book')) {
      return { type: 'auto_navigate_booking', payload: { eventName: mentionedEvent } };
    }
    
    if (lowerInput.includes('รายละเอียด') || lowerInput.includes('detail')) {
      return { type: 'auto_navigate_detail', payload: { eventName: mentionedEvent } };
    }
    
    return { type: 'auto_navigate', payload: { eventName: mentionedEvent, destination: lowerInput } };
  }
  
  // Event management
  if (lowerInput.includes('ดูอีเว้นท์') || lowerInput.includes('อีเว้นท์ทั้งหมด') || lowerInput.includes('รายการอีเว้นท์') || 
      lowerInput.includes('มีอีเว้นท์อะไรบ้าง') || lowerInput.includes('อีเว้นท์อะไรบ้าง') || 
      lowerInput.includes('มีงานอะไรบ้าง') || lowerInput.includes('งานอะไรบ้าง') ||
      lowerInput.includes('event') && (lowerInput.includes('list') || lowerInput.includes('all'))) {
    return { type: 'get_events' };
  }
  
  // Event recommendations
  if (lowerInput.includes('อีเว้นท์ไหนน่าสนใจ') || lowerInput.includes('แนะนำอีเว้นท์') || 
      lowerInput.includes('อีเว้นท์น่าสนใจ') || lowerInput.includes('งานไหนน่าสนใจ') ||
      lowerInput.includes('แนะนำงาน') || lowerInput.includes('อีเว้นท์ดีๆ')) {
    return { type: 'recommend_events' };
  }
  
  if (lowerInput.includes('ค้นหาอีเว้นท์') || lowerInput.startsWith('หาอีเว้นท์')) {
    const query = input.replace(/ค้นหาอีเว้นท์|หาอีเว้นท์/gi, '').trim();
    return { type: 'search_events', payload: { query } };
  }
  
  // Ticket management
  if (lowerInput.includes('ตั๋วของฉัน') || lowerInput.includes('ดูตั๋ว') || lowerInput.includes('ตั๋วที่จอง')) {
    return { type: 'get_tickets' };
  }
  
  // Statistics
  if (lowerInput.includes('สถิติ') || lowerInput.includes('รายงาน') || lowerInput.includes('ข้อมูลระบบ')) {
    return { type: 'get_stats' };
  }
  
  // Global search
  if (lowerInput.includes('ค้นหา') || lowerInput.includes('หา')) {
    const query = input.replace(/ค้นหา|หา/gi, '').trim();
    return { type: 'global_search', payload: { query } };
  }
  
  // Default: treat as general query for Gemini
  return { type: 'general_query', payload: { query: input } };
};

// Function to generate AI response using dynamic system knowledge
export const generateAIResponse = async (userInput: string, context?: any): Promise<AIResponse> => {
  try {
    const action = parseUserInput(userInput);
    
    // Update AI knowledge with current system data
    await updateAIKnowledge(context);
    
    // Handle specific actions
    if (action.type !== 'general_query') {
      return await executeSpecificAction(action, context);
    }
    
    // For general queries, use dynamic system knowledge instead of hardcoded prompts
    const systemKnowledge = getSystemContext(context, true); // Include event details
    const conversationContext = context?.conversationContext || 'เริ่มต้นการสนทนา';
    
    const prompt = `
คุณคือ AI Assistant ที่เข้าใจระบบนี้อย่างลึกซึ้ง ไม่ต้องพึ่งพาคำสั่งที่ตายตัว แต่ใช้ความรู้จริงเกี่ยวกับระบบ

${systemKnowledge}

บริบทการสนทนา: ${conversationContext}

ผู้ใช้ถาม: "${userInput}"

กรุณาตอบคำถามโดยใช้:
1. ความรู้เกี่ยวกับระบบที่คุณมี
2. ข้อมูลจริงที่เกี่ยวข้อง
3. ประสบการณ์จากการสนทนาก่อนหน้า
4. ความเข้าใจในบริบทปัจจุบัน

ตอบอย่างเป็นธรรมชาติ เป็นมิตร และมีประโยชน์ หลีกเลี่ยงการใช้คำสั่งระบบแบบตายตัว
ตอบเป็นภาษาไทยเท่านั้น
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Generate contextual suggestions based on current system state
    const suggestions = generateContextualSuggestions(context);
    
    return {
      message: text,
      suggestions: suggestions
    };
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return {
      message: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
      suggestions: ['ลองใหม่', 'ช่วยเหลือ', 'ติดต่อผู้ดูแล']
    };
  }
};

// Update AI knowledge with fresh system data - Enhanced to capture ALL fields
const updateAIKnowledge = async (context?: any): Promise<void> => {
  try {
    // Check if we need to refresh data
    const memory = context?.memory;
    const lastFetch = memory?.lastFetchTime;
    const now = new Date();
    
    // Fetch events with ALL their fields if not cached or cache is older than 5 minutes
    const eventsCacheAge = lastFetch?.events ? now.getTime() - lastFetch.events.getTime() : Infinity;
    if (!memory?.events || memory.events.length === 0 || eventsCacheAge > 300000) {
      try {
        const eventsResult = await aiApi.getAllEvents();
        // Update with complete event data including all fields
        aiKnowledge.updateKnowledge({ 
          events: eventsResult.events || [],
        });
      } catch (error) {
        console.warn('Failed to fetch events for AI knowledge:', error);
      }
    } else {
      // Use cached data
      aiKnowledge.updateKnowledge({ events: memory.events });
    }
    
    // Fetch categories with full details
    try {
      const categories = await aiApi.getAllCategories();
      aiKnowledge.updateKnowledge({ categories: categories || [] });
    } catch (error) {
      console.warn('Failed to fetch categories for AI knowledge:', error);
    }
    
    // Update tickets with complete information if user is available
    if (context?.currentUser?.id) {
      try {
        const tickets = await aiApi.getUserTickets(context.currentUser.id);
        aiKnowledge.updateKnowledge({ tickets: tickets || [] });
      } catch (error) {
        console.warn('Failed to fetch tickets for AI knowledge:', error);
      }
    }
    
    // Fetch comprehensive system stats if user is admin
    if (context?.currentUser?.role === 'admin') {
      try {
        const stats = await aiApi.getSystemStats();
        const eventStats = await aiApi.getEventStats();
        const bookingStats = await aiApi.getBookingStats();
        const revenueStats = await aiApi.getRevenueStats();
        
        // Combine all statistics with proper typing
        const comprehensiveStats = {
          totalEvents: stats.totalEvents || 0,
          activeEvents: stats.activeEvents || 0,
          totalTickets: stats.totalTickets || 0,
          totalRevenue: stats.totalRevenue || revenueStats.totalRevenue || 0,
          totalUsers: stats.totalUsers || 0,
          activeUsers: stats.activeUsers || 0,
          upcomingEvents: 0, // Will be calculated by AIKnowledgeBuilder
          pastEvents: 0, // Will be calculated by AIKnowledgeBuilder
          revenueGrowth: revenueStats.growth,
          ...eventStats,
          ...bookingStats,
        };
        
        aiKnowledge.updateKnowledge({ systemStats: comprehensiveStats });
      } catch (error) {
        console.warn('Failed to fetch comprehensive stats for AI knowledge:', error);
      }
    }
    
    // Update system info
    try {
      const systemInfo = {
        name: 'Event Ticket Management System',
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalEvents: aiKnowledge.getCurrentKnowledge().events.length
      };
      aiKnowledge.updateKnowledge({ systemInfo });
    } catch (error) {
      console.warn('Failed to update system info:', error);
    }
    
  } catch (error) {
    console.error('Failed to update comprehensive AI knowledge:', error);
  }
};

// Generate contextual suggestions based on system state
const generateContextualSuggestions = (context?: any): string[] => {
  const suggestions: string[] = [];
  const userRole = context?.currentUser?.role;
  const currentKnowledge = aiKnowledge.getCurrentKnowledge();
  
  // Add suggestions based on available data
  if (currentKnowledge.events.length > 0) {
    suggestions.push('ดูอีเว้นท์ทั้งหมด');
    
    const upcomingEvents = currentKnowledge.events.filter(
      event => new Date(event.schedule?.startDate || 0) > new Date()
    );
    
    if (upcomingEvents.length > 0) {
      suggestions.push('อีเว้นท์ที่กำลังจะมาถึง');
    }
  }
  
  if (currentKnowledge.categories.length > 0) {
    suggestions.push('ดูหมวดหมู่อีเว้นท์');
  }
  
  if (context?.currentUser?.id) {
    suggestions.push('ดูตั๋วของฉัน');
  }
  
  if (userRole === 'admin') {
    suggestions.push('ดูสถิติระบบ');
    suggestions.push('จัดการอีเว้นท์');
  }
  
  // Add default suggestions if not enough contextual ones
  if (suggestions.length < 3) {
    suggestions.push('ช่วยเหลือ', 'ค้นหาข้อมูล', 'ติดต่อสอบถาม');
  }
  
  return suggestions.slice(0, 4); // Return max 4 suggestions
};

// Execute specific actions with dynamic knowledge
const executeSpecificAction = async (action: any, context?: any): Promise<AIResponse> => {
  try {
    const { type, payload } = action;
    const memory = context?.memory;
    
    switch (type) {
      case 'confirm_navigation':
        return await handleNavigationConfirmation(context);
        
      case 'auto_navigate_booking':
      case 'auto_navigate_detail':
      case 'auto_navigate':
        return await handleAutoNavigation(type, payload, context);
          
      case 'get_events':
        // Check if we have cached events data
        let events;
        const cachedEvents = memory?.events;
        const lastFetch = memory?.lastFetchTime?.events;
        const cacheAge = lastFetch ? Date.now() - lastFetch.getTime() : Infinity;
        
        // Use cache if it's less than 5 minutes old
        if (cachedEvents && cachedEvents.length > 0 && cacheAge < 300000) {
          events = { events: cachedEvents };
        } else {
          // Fetch fresh data
          events = await aiApi.getAllEvents(payload?.filters);
        }
        
        const eventCount = events.events?.length || 0;
        
        // Generate natural response based on actual data
        let message;
        if (eventCount === 0) {
          message = 'ขณะนี้ยังไม่มีอีเว้นท์ในระบบค่ะ แต่เร็วๆ นี้อาจจะมีอีเว้นท์ใหม่ๆ เข้ามา ติดตามได้เลยค่ะ';
        } else {
          const upcomingCount = events.events?.filter(
            event => new Date(event.schedule?.startDate || 0) > new Date()
          ).length || 0;
          
          message = `ตอนนี้มีอีเว้นท์ทั้งหมด ${eventCount} รายการค่ะ`;
          if (upcomingCount > 0) {
            message += ` มีอีเว้นท์ที่กำลังจะมาถึง ${upcomingCount} รายการ`;
          }
          message += ' สามารถดูรายละเอียดได้ด้านล่างเลยค่ะ ✨';
        }
        
        return {
          message,
          data: events.events,
          suggestions: eventCount > 0 
            ? ['ดูรายละเอียด', 'ค้นหาอีเว้นท์', 'อีเว้นท์แนะนำ']
            : ['รออีเว้นท์ใหม่', 'ติดตามข่าวสาร', 'ติดต่อสอบถาม']
        };
        
      case 'search_events':
        // Check cache for search results
        let searchResults;
        const cacheKey = `${payload.query}_${JSON.stringify(payload.filters || {})}`;
        const cachedSearch = memory?.searchResults?.[cacheKey];
        
        if (cachedSearch) {
          const now = new Date();
          const expiryTime = new Date(cachedSearch.timestamp.getTime() + cachedSearch.ttl);
          
          if (now < expiryTime) {
            searchResults = { events: cachedSearch.results };
          } else {
            // Cache expired, fetch fresh data
            searchResults = await aiApi.searchEvents(payload.query, payload.filters);
            // Note: Cache update should be handled by the calling context
          }
        } else {
          // No cache, fetch fresh data
          searchResults = await aiApi.searchEvents(payload.query, payload.filters);
          // Note: Cache update should be handled by the calling context
        }
        
        const searchCount = searchResults.events?.length || 0;
        
        // Return simple message with search results for EventPreview component
        return {
          message: `พบอีเว้นท์ที่ตรงกับ "${payload.query}" จำนวน ${searchCount} รายการค่ะ 🔍 ดูรายละเอียดด้านล่างได้เลยค่ะ`,
          data: searchResults.events,
          suggestions: ['ดูรายละเอียด', 'จองตั๋ว', 'ค้นหาอื่น']
        };
        
      case 'recommend_events':
        // Use cached events data to recommend interesting events
        let recommendEvents;
        const cachedEventsForRecommend = memory?.events;
        
        if (cachedEventsForRecommend && cachedEventsForRecommend.length > 0) {
          // Use cached data
          recommendEvents = { events: cachedEventsForRecommend };
        } else {
          // Fetch fresh data if no cache
          recommendEvents = await aiApi.getAllEvents();
        }
        
        // Select interesting events (featured, upcoming, or popular)
        const interestingEvents = recommendEvents.events?.filter(event => 
          event.featured || 
          event.capacity?.available > 0 ||
          new Date(event.schedule?.startDate) > new Date()
        ).slice(0, 3) || [];
        
        const recommendCount = interestingEvents.length;
        
        return {
          message: `นี่คืออีเว้นท์น่าสนใจที่แนะนำให้คุณ ${recommendCount} รายการค่ะ ✨ เลือกดูรายละเอียดที่สนใจได้เลยค่ะ`,
          data: interestingEvents,
          suggestions: ['ดูรายละเอียด', 'จองตั๋ว', 'ดูอีเว้นท์ทั้งหมด']
        };
        
      case 'get_tickets':
        const tickets = await aiApi.getUserTickets(payload?.userId);
        const ticketCount = tickets.length;
        
        const ticketsPrompt = `
สร้างข้อความตอบกลับเป็นภาษาไทยสำหรับการแสดงตั๋วของผู้ใช้
จำนวนตั๋ว: ${ticketCount} ใบ
ให้ข้อความที่เป็นมิตรและมีประโยชน์
`;
        
        const ticketsResult = await model.generateContent(ticketsPrompt);
        const ticketsMessage = await ticketsResult.response.text();
        
        return {
          message: ticketsMessage,
          data: tickets,
          suggestions: ['ดูรายละเอียดตั๋ว', 'ตรวจสอบตั๋ว', 'จองตั๋วใหม่']
        };
        
      case 'get_stats':
        const stats = await aiApi.getSystemStats();
        
        const statsPrompt = `
สร้างข้อความตอบกลับเป็นภาษาไทยสำหรับการแสดงสถิติระบบ
ให้สรุปข้อมูลสถิติอย่างเข้าใจง่าย
`;
        
        const statsResult = await model.generateContent(statsPrompt);
        const statsMessage = await statsResult.response.text();
        
        return {
          message: statsMessage,
          data: stats,
          suggestions: ['ดูรายละเอียด', 'ส่งออกรายงาน', 'ตั้งค่าการแจ้งเตือน']
        };
        
      case 'global_search':
        const globalResults = await aiApi.globalSearch(payload.query);
        
        const globalPrompt = `
สร้างข้อความตอบกลับเป็นภาษาไทยสำหรับผลการค้นหาทั่วไป
คำค้นหา: "${payload.query}"
ให้ข้อความที่เป็นมิตรและช่วยเหลือ
`;
        
        const globalResult = await model.generateContent(globalPrompt);
        const globalMessage = await globalResult.response.text();
        
        return {
          message: globalMessage,
          data: globalResults,
          suggestions: ['ดูเพิ่มเติม', 'กรองผลลัพธ์', 'ค้นหาใหม่']
        };
        
      default:
        return {
          message: `ขออภัย ไม่เข้าใจคำขอ "${type}" ค่ะ ลองถามด้วยคำอื่นได้ไหมคะ`,
          suggestions: ['ช่วยเหลือ', 'ดูคำสั่งที่ใช้ได้', 'ติดต่อผู้ดูแล']
        };
    }
  } catch (error) {
    console.error('Execute specific action error:', error);
    return {
      message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'} กรุณาลองใหม่อีกครั้งค่ะ`,
      suggestions: ['ลองใหม่', 'ช่วยเหลือ', 'รายงานปัญหา']
    };
  }
};

// Store pending navigation data in localStorage to persist across navigation
const setPendingNavigation = (data: { url: string; eventId: string; eventTitle: string } | null) => {
  if (data) {
    localStorage.setItem('pendingNavigation', JSON.stringify(data));
  } else {
    localStorage.removeItem('pendingNavigation');
  }
};

const getPendingNavigation = (): { url: string; eventId: string; eventTitle: string } | null => {
  try {
    const data = localStorage.getItem('pendingNavigation');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Handle navigation confirmation
const handleNavigationConfirmation = async (context?: any): Promise<AIResponse> => {
  const pendingNavigation = getPendingNavigation();
  
  if (pendingNavigation) {
    const { url, eventId, eventTitle } = pendingNavigation;
    
    // Clear pending navigation
    setPendingNavigation(null);
    
    // Execute the navigation
    const navigationAction = {
      type: 'navigate' as const,
      payload: { 
        url,
        eventId,
        eventTitle
      }
    };
    
    return {
      message: `เยี่ยมค่ะ! กำลังพาคุณไปยัง "${eventTitle}" เดี๋ยวนี้เลยค่ะ... 🚀`,
      action: navigationAction,
      suggestions: ['ดูรายละเอียด', 'จองตั๋ว', 'กลับหน้าหลัก']
    };
  } else {
    return {
      message: 'ขออภัยค่ะ ไม่มีการนำทางที่รออยู่ค่ะ คุณต้องการให้บอกว่าจะไปที่ไหนก่อนไหมคะ? 😅',
      suggestions: ['ดูอีเว้นท์ทั้งหมด', 'ค้นหาอีเว้นท์', 'ช่วยเหลือ']
    };
  }
};

// Handle automatic navigation to event pages
const handleAutoNavigation = async (type: string, payload: any, context?: any): Promise<AIResponse> => {
  try {
    const { eventName } = payload || {};
    
    // Get all events to search for the mentioned event
    const events = await aiApi.getAllEvents();
    const allEvents = events.events || [];
    
    // Filter out invalid events (ensure they have required properties)
    const validEvents = allEvents.filter(event => 
      event && 
      typeof event === 'object' && 
      event.id && 
      event.title && 
      typeof event.title === 'string'
    );
    
    let targetEvent = null;
    
    if (eventName) {
      // Search for event by name (case-insensitive) with null checks
      targetEvent = validEvents.find(event => 
        event.title.toLowerCase().includes(eventName.toLowerCase()) ||
        eventName.toLowerCase().includes(event.title.toLowerCase())
      );
    }
    
    // If no specific event found but user wants navigation, show available events
    if (!targetEvent && validEvents.length > 0) {
      // Try to find Creative Photography Workshop specifically with null checks
      targetEvent = validEvents.find(event => 
        event.title.toLowerCase().includes('creative') ||
        event.title.toLowerCase().includes('photography') ||
        event.title.toLowerCase().includes('workshop')
      );
    }
    
    let navigationUrl = '';
    let message = '';
    
    if (targetEvent) {
      // Generate navigation URL based on type
      switch (type) {
        case 'auto_navigate_booking':
          navigationUrl = `/events/${targetEvent.id}/booking`;
          message = `พบอีเว้นท์ "${targetEvent.title}" แล้วค่ะ! 🎉\n\nคุณต้องการให้ดิฉันพาไปยังหน้าจองตั๋วเลยไหมคะ? ✨`;
          break;
        case 'auto_navigate_detail':
          navigationUrl = `/events/${targetEvent.id}`;
          message = `พบอีเว้นท์ "${targetEvent.title}" แล้วค่ะ! 🎉\n\nคุณต้องการให้ดิฉันพาไปดูรายละเอียดเลยไหมคะ? 📋`;
          break;
        default:
          navigationUrl = `/events/${targetEvent.id}`;
          message = `พบอีเว้นท์ "${targetEvent.title}" แล้วค่ะ! 🎉\n\nคุณต้องการให้ดิฉันพาไปยังหน้านี้เลยไหมคะ? 🎯`;
      }
      
      // Execute navigation action
      const navigationAction = {
        type: 'navigate' as const,
        payload: { 
          url: navigationUrl,
          eventId: targetEvent.id,
          eventTitle: targetEvent.title
        }
      };
      
      // Store pending navigation for confirmation
      setPendingNavigation({
        url: navigationUrl,
        eventId: targetEvent.id,
        eventTitle: targetEvent.title
      });
      
      return {
        message: message + `\n\n📍 หากคุณต้องการไป กรุณาคลิก "ไปเลย" หรือคลิกลิงก์นี้: ${navigationUrl}`,
        data: [targetEvent],
        suggestions: ['ไปเลย', 'ดูรายละเอียดก่อน', 'ยกเลิก']
      };
    } else {
      // No matching event found
      const availableEvents = validEvents.slice(0, 3); // Show first 3 valid events as alternatives
      
      return {
        message: eventName 
          ? `ขออภัยค่ะ ไม่พบอีเว้นท์ "${eventName}" ที่คุณต้องการ 😔\n\nแต่เรามีอีเว้นท์น่าสนใจอื่นๆ ให้เลือกด้านล่างค่ะ ✨`
          : 'เรามีอีเว้นท์น่าสนใจหลายรายการค่ะ กรุณาเลือกอีเว้นท์ที่ต้องการจากด้านล่างค่ะ ✨',
        data: availableEvents,
        suggestions: ['ดูอีเว้นท์ทั้งหมด', 'ค้นหาอีเว้นท์', 'ช่วยเหลือ']
      };
    }
    
  } catch (error) {
    console.error('Auto navigation error:', error);
    console.error('Error details:', {
      type,
      payload,
      contextKeys: context ? Object.keys(context) : 'no context'
    });
    return {
      message: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการนำทาง กรุณาลองใหม่อีกครั้งหรือไปยังหน้าอีเว้นท์ด้วยตนเองค่ะ 😅',
      suggestions: ['ดูอีเว้นท์ทั้งหมด', 'ลองใหม่', 'ติดต่อผู้ดูแล']
    };
  }
};

export default {
  generateAIResponse,
  parseUserInput
};