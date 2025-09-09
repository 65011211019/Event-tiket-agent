import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse } from '@/types/ai';
import { aiApi } from './ai-api';
import { aiKnowledge, getSystemContext } from './ai-prompts';

// Gemini API configuration with multiple keys for load balancing
const GEMINI_API_KEYS = [
  'AIzaSyDxOtuESZB_IeWBbaB3aljbLV7hDXtGFRY',
  'AIzaSyBW3tywgCWHLL5-0dcPm99WGamY2m_6oqw'
];

// Current key index for rotation
let currentKeyIndex = 0;

// Function to get current API key
const getCurrentApiKey = () => {
  return GEMINI_API_KEYS[currentKeyIndex];
};

// Function to rotate to next API key
const rotateApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  console.log(`🔄 Rotated to API key index: ${currentKeyIndex}`);
};

// Initialize Gemini AI with current key
let genAI = new GoogleGenerativeAI(getCurrentApiKey());
let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Function to reinitialize model with new API key
const reinitializeModel = () => {
  genAI = new GoogleGenerativeAI(getCurrentApiKey());
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
};

// Function to get API key status
export const getApiKeyStatus = () => {
  return {
    currentKeyIndex,
    totalKeys: GEMINI_API_KEYS.length,
    currentKey: `${getCurrentApiKey().substring(0, 20)}...`,
    availableKeys: GEMINI_API_KEYS.length
  };
};

// Function to manually rotate API key
export const manualRotateApiKey = () => {
  rotateApiKey();
  reinitializeModel();
  return getApiKeyStatus();
};

// Enhanced action types to support automatic navigation
export const parseUserInput = (input: string): { type: string; payload?: any } => {
  const lowerInput = input.toLowerCase().trim();
  
  // Booking confirmation and general agreement responses - ENHANCED
  if (lowerInput.includes('จองบัตร') || 
      lowerInput.includes('จองตั๋ว') ||
      lowerInput.includes('ตกลง') || 
      lowerInput.includes('โอเค') || 
      lowerInput.includes('ok') ||
      lowerInput.includes('ใช่') ||
      lowerInput.includes('yes') ||
      lowerInput.includes('ยืนยัน') ||
      lowerInput.includes('ไปเลย') ||
      (lowerInput.includes('จอง') && 
       (lowerInput.includes('ราคาปกติ') || lowerInput.includes('early bird') ||
        lowerInput.includes('นักเรียน') || lowerInput.includes('vip') ||
        lowerInput.includes('premium') || lowerInput.includes('ทั่วไป')))) {
    
    // Extract ticket type if specified
    let ticketType = '';
    if (lowerInput.includes('ราคาปกติ') || lowerInput.includes('regular')) ticketType = 'regular';
    else if (lowerInput.includes('early bird') || lowerInput.includes('ล่วงหน้า')) ticketType = 'earlyBird';
    else if (lowerInput.includes('นักเรียน') || lowerInput.includes('student')) ticketType = 'student';
    else if (lowerInput.includes('vip')) ticketType = 'vip';
    else if (lowerInput.includes('premium')) ticketType = 'premium';
    else if (lowerInput.includes('ทั่วไป') || lowerInput.includes('general')) ticketType = 'general';
    else if (lowerInput.includes('กลุ่ม') || lowerInput.includes('group')) ticketType = 'group';
    
    return { type: 'confirm_booking', payload: { ticketType, originalQuery: input } };
  }
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
  
  // Real-time data requests - NEW
  if (lowerInput.includes('ล่าสุด') || lowerInput.includes('ปัจจุบัน') || 
      lowerInput.includes('real-time') || lowerInput.includes('อัปเดต') ||
      lowerInput.includes('ข้อมูลใหม่') || lowerInput.includes('รีเฟรช')) {
    return { type: 'force_realtime_update' };
  }
  
  // AI Booking requests - NEW
  if (lowerInput.includes('จองให้') || lowerInput.includes('ช่วยจอง') || 
      lowerInput.includes('จองตั๋ว') || lowerInput.includes('book for me') ||
      lowerInput.includes('ai จอง') || lowerInput.includes('จองอัตโนมัติ')) {
    
    // Extract event name if mentioned
    const eventNames = [
      'digital marketing',
      'tech conference', 
      'jazz under the stars',
      'bangkok marathon',
      'cultural heritage',
      'business networking',
      'photography workshop',
      'workshop',
      'conference',
      'concert',
      'marathon',
      'festival',
      'networking'
    ];
    
    const mentionedEvent = eventNames.find(name => 
      lowerInput.includes(name.toLowerCase())
    );
    
    return { type: 'ai_booking_request', payload: { eventName: mentionedEvent, originalQuery: input } };
  }
  
  // Specific booking choices - NEW
  if (lowerInput.includes('จอง') && 
      (lowerInput.includes('digital marketing') || lowerInput.includes('tech conference') ||
       lowerInput.includes('jazz') || lowerInput.includes('marathon') ||
       lowerInput.includes('cultural') || lowerInput.includes('networking') ||
       lowerInput.includes('photography'))) {
    
    // Extract event name
    let eventName = '';
    if (lowerInput.includes('digital marketing')) eventName = 'Digital Marketing Masterclass';
    else if (lowerInput.includes('tech conference')) eventName = 'Thailand Tech Conference';
    else if (lowerInput.includes('jazz')) eventName = 'Jazz Under the Stars';
    else if (lowerInput.includes('marathon')) eventName = 'Bangkok Marathon';
    else if (lowerInput.includes('cultural')) eventName = 'Thai Cultural Heritage Festival';
    else if (lowerInput.includes('networking')) eventName = 'Bangkok Business Networking Night';
    else if (lowerInput.includes('photography')) eventName = 'Creative Photography Workshop';
    
    return { type: 'specific_event_booking', payload: { eventName, originalQuery: input } };
  }
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

// Function to generate AI response using dynamic system knowledge with API key failover
export const generateAIResponse = async (userInput: string, context?: any): Promise<AIResponse> => {
  let lastError = null;
  let attemptCount = 0;
  const maxAttempts = GEMINI_API_KEYS.length;

  while (attemptCount < maxAttempts) {
    try {
      const action = parseUserInput(userInput);
      
      // Force refresh for critical queries to ensure real-time data
      const forceRefresh = userInput.includes('ล่าสุด') || 
                          userInput.includes('ปัจจุบัน') || 
                          userInput.includes('real-time') ||
                          userInput.includes('อัปเดต') ||
                          action.type === 'get_stats';
      
      // Update AI knowledge with current system data (with optional force refresh)
      await updateAIKnowledge(context, forceRefresh);
      
      // Add real-time data indicator to context
      const enhancedContext = {
        ...context,
        isRealTimeQuery: forceRefresh,
        lastDataRefresh: new Date().toISOString()
      };
      
      // Handle specific actions
      if (action.type !== 'general_query') {
        return await executeSpecificAction(action, enhancedContext);
      }
      
      // For general queries, use dynamic system knowledge instead of hardcoded prompts
      const systemKnowledge = getSystemContext(enhancedContext, true); // Include event details
      const conversationContext = enhancedContext?.conversationContext || 'เริ่มต้นการสนทนา';
      
      // Include real-time data status in the prompt
      const dataFreshnessInfo = forceRefresh 
        ? 'ข้อมูลนี้ได้มาจาก API แบบ real-time เมื่อสักครู่ที่ผ่านมา'
        : 'ข้อมูลนี้อาจเป็นข้อมูลที่ถูกเก็บ cache ไว้';
      
      const prompt = `
คุณคือ AI Assistant ที่เข้าใจระบบนี้อย่างลึกซึ้ง ไม่ต้องพึ่งพาคำสั่งที่ตายตัว แต่ใช้ความรู้จริงเกี่ยวกับระบบ

${systemKnowledge}

สถานะข้อมูล: ${dataFreshnessInfo}

บริบทการสนทนา: ${conversationContext}

ผู้ใช้ถาม: "${userInput}"

กรุณาตอบคำถามโดยใช้:
1. ความรู้เกี่ยวกับระบบที่คุณมี
2. ข้อมูลจริงที่เกี่ยวข้อง
3. ประสบการณ์จากการสนทนาก่อนหน้า
4. ความเข้าใจในบริบทปัจจุบัน
5. ข้อมูลล่าสุดและความถูกต้อง (${dataFreshnessInfo})

ตอบอย่างเป็นธรรมชาติ เป็นมิตร และมีประโยชน์ หลีกเลี่ยงการใช้คำสั่งระบบแบบตายตัว
ตอบเป็นภาษาไทยเท่านั้น
`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Generate contextual suggestions based on current system state
      const suggestions = generateContextualSuggestions(enhancedContext);
      
      return {
        message: text,
        suggestions: suggestions
      };
      
    } catch (error: any) {
      console.error(`Gemini AI Error with key ${currentKeyIndex}:`, error);
      lastError = error;
      
      // If this is a quota/rate limit error or authentication error, try next key
      if (error?.message?.includes('quota') || 
          error?.message?.includes('rate') ||
          error?.message?.includes('QUOTA_EXCEEDED') ||
          error?.message?.includes('RATE_LIMIT_EXCEEDED') ||
          error?.message?.includes('API_KEY_INVALID') ||
          error?.status === 429 ||
          error?.status === 403) {
        
        attemptCount++;
        if (attemptCount < maxAttempts) {
          console.log(`🔄 API key ${currentKeyIndex} failed, rotating to next key...`);
          rotateApiKey();
          reinitializeModel();
          continue; // Try with next key
        }
      } else {
        // For other errors, don't retry
        break;
      }
    }
  }
  
  // All keys failed or non-retryable error
  console.error('All Gemini API keys failed or non-retryable error:', lastError);
  return {
    message: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
    suggestions: ['ลองใหม่', 'ช่วยเหลือ', 'ติดต่อผู้ดูแล']
  };
};

// Update AI knowledge with fresh system data - Enhanced for real-time access
const updateAIKnowledge = async (context?: any, forceRefresh = false): Promise<void> => {
  try {
    // Check if we need to refresh data
    const memory = context?.memory;
    const lastFetch = memory?.lastFetchTime;
    const now = new Date();
    
    // Fetch events with ALL their fields - reduced cache time for more real-time data
    const eventsCacheAge = lastFetch?.events ? now.getTime() - lastFetch.events.getTime() : Infinity;
    const cacheTimeout = forceRefresh ? 0 : 60000; // 1 minute cache instead of 5 minutes, or force refresh
    
    if (!memory?.events || memory.events.length === 0 || eventsCacheAge > cacheTimeout) {
      try {
        console.log('🔄 Fetching real-time events data from API...');
        const eventsResult = await aiApi.getAllEvents();
        // Update with complete event data including all fields
        aiKnowledge.updateKnowledge({ 
          events: eventsResult.events || [],
        });
        console.log(`✅ Updated AI knowledge with ${eventsResult.events?.length || 0} events from real-time API`);
      } catch (error) {
        console.warn('⚠️ Failed to fetch real-time events, using cached data:', error);
        // If fresh data fails, use cached data but warn user
        if (memory?.events) {
          aiKnowledge.updateKnowledge({ events: memory.events });
        }
      }
    } else {
      // Use cached data but note its age
      const cacheAgeMinutes = Math.floor(eventsCacheAge / 60000);
      console.log(`📋 Using cached events data (${cacheAgeMinutes} minutes old)`);
      aiKnowledge.updateKnowledge({ events: memory.events });
    }
    
    // Fetch categories with full details - real-time
    const categoriesCacheAge = lastFetch?.categories ? now.getTime() - lastFetch.categories.getTime() : Infinity;
    if (forceRefresh || categoriesCacheAge > cacheTimeout) {
      try {
        console.log('🔄 Fetching real-time categories data...');
        const categories = await aiApi.getAllCategories();
        aiKnowledge.updateKnowledge({ categories: categories || [] });
        console.log(`✅ Updated ${categories?.length || 0} categories from real-time API`);
      } catch (error) {
        console.warn('⚠️ Failed to fetch real-time categories:', error);
      }
    }
    
    // Update tickets with complete information if user is available - real-time
    if (context?.currentUser?.id) {
      const ticketsCacheAge = lastFetch?.tickets ? now.getTime() - lastFetch.tickets.getTime() : Infinity;
      if (forceRefresh || ticketsCacheAge > cacheTimeout) {
        try {
          console.log('🔄 Fetching real-time user tickets...');
          const tickets = await aiApi.getUserTickets(context.currentUser.id);
          aiKnowledge.updateKnowledge({ tickets: tickets || [] });
          console.log(`✅ Updated ${tickets?.length || 0} user tickets from real-time API`);
        } catch (error) {
          console.warn('⚠️ Failed to fetch real-time tickets:', error);
        }
      }
    }
    
    // Fetch comprehensive system stats if user is admin - real-time
    if (context?.currentUser?.role === 'admin') {
      const statsCacheAge = lastFetch?.systemStats ? now.getTime() - lastFetch.systemStats.getTime() : Infinity;
      if (forceRefresh || statsCacheAge > cacheTimeout) {
        try {
          console.log('🔄 Fetching real-time system statistics...');
          const [stats, eventStats, bookingStats, revenueStats] = await Promise.all([
            aiApi.getSystemStats(),
            aiApi.getEventStats(),
            aiApi.getBookingStats(),
            aiApi.getRevenueStats()
          ]);
          
          // Combine all statistics with proper typing and real-time data
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
            lastUpdated: now.toISOString(),
            isRealTime: true,
            ...eventStats,
            ...bookingStats,
          };
          
          aiKnowledge.updateKnowledge({ systemStats: comprehensiveStats });
          console.log('✅ Updated real-time system statistics');
        } catch (error) {
          console.warn('⚠️ Failed to fetch real-time stats:', error);
        }
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
        
      case 'force_realtime_update':
        return await handleRealTimeUpdate(context);
        
      case 'ai_booking_request':
        return await handleAIBookingRequest(payload, context);
        
      case 'specific_event_booking':
        return await handleSpecificEventBooking(payload, context);
        
      case 'confirm_booking':
        return await handleBookingConfirmation(payload, context);
          
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

// Handle booking confirmation and proceed to booking page - ENHANCED
const handleBookingConfirmation = async (payload: any, context?: any): Promise<AIResponse> => {
  try {
    console.log('✅ Processing booking confirmation...', payload);
    
    const { ticketType, originalQuery } = payload || {};
    
    // Check if user is authenticated
    if (!context?.currentUser?.id) {
      return {
        message: '🔐 คุณต้องเข้าสู่ระบบก่อนจองตั๋วค่ะ 😊\n\nการจองตั๋วต้องมีบัญชีผู้ใช้เพื่อความปลอดภัยและการจัดการการชำระเงิน ✨',
        suggestions: ['เข้าสู่ระบบ', 'สมัครสมาชิก', 'ดูอีเว้นท์ก่อน'],
        action: {
          type: 'navigate',
          payload: { url: '/login' }
        }
      };
    }
    
    // Try to get event info from different context sources
    let eventInfo = null;
    let selectedTicketType = ticketType;
    
    // First check for stored ticket options in context
    const ticketOptions = context?.ticketOptions;
    if (ticketOptions?.event) {
      eventInfo = ticketOptions.event;
    }
    
    // If no ticket options, try to get from booking choices
    if (!eventInfo && context?.bookingChoices?.events?.length > 0) {
      // For now, take the first event - in a real scenario, we'd need better event selection logic
      eventInfo = context.bookingChoices.events[0];
    }
    
    // If still no event, try to find "หมอลำ" event specifically from the conversation context
    if (!eventInfo) {
      console.log('กำลังค้นหาอีเว้นท์ "หมอลำ" จากบันทึกการสนทนา...');
      
      try {
        const events = await aiApi.getAllEvents();
        const allEvents = events.events || [];
        
        // Look for "หมอลำ" event
        eventInfo = allEvents.find(event => 
          event && event.title && 
          (event.title.toLowerCase().includes('หมอลำ') ||
           'หมอลำ'.includes(event.title.toLowerCase()))
        );
        
        // Default to regular ticket if not specified
        if (!selectedTicketType && eventInfo) {
          selectedTicketType = 'regular';
        }
      } catch (error) {
        console.error('Error finding หมอลำ event:', error);
      }
    }

    if (!eventInfo) {
      return {
        message: '😔 ขออภัยค่ะ ดิฉันไม่พบข้อมูลอีเว้นท์ที่คุณต้องการจอง\n\nกรุณาบอกชื่ออีเว้นท์ที่ต้องการจองก่อนไหมคะ 😊',
        suggestions: ['ดูอีเว้นท์ทั้งหมด', 'หมอลำ', 'ช่วยเหลือ']
      };
    }
    
    // Find selected ticket type info
    let selectedTicket = null;
    if (selectedTicketType && eventInfo?.pricing) {
      // Map ticket type to pricing info
      const priceMap = {
        regular: 'ราคาปกติ',
        earlyBird: 'บัตรนกผู้จองล่วงหน้า (Early Bird)',
        student: 'บัตรนักเรียน/นักศึกษา',
        vip: 'บัตร VIP',
        premium: 'บัตร Premium',
        general: 'บัตรทั่วไป',
        group: 'บัตรกลุ่ม'
      };
      
      const price = eventInfo.pricing[selectedTicketType];
      if (price !== undefined) {
        selectedTicket = {
          type: selectedTicketType,
          label: priceMap[selectedTicketType as keyof typeof priceMap] || selectedTicketType,
          price: price
        };
      }
    }
    
    // Generate confirmation message
    let message = `✅ เยี่ยมเลย! กำลังพาคุณไปหน้าชำระเงินเลยค่ะ 🎉💳\n\n`;
    message += `🎫 **${eventInfo.title}**\n`;
    
    if (selectedTicket) {
      message += `🎫 ประเภทตั๋ว: ${selectedTicket.label}\n`;
      message += `💰 ราคา: ${selectedTicket.price.toLocaleString()} บาท\n\n`;
    }
    
    message += `ดิฉันจะพาคุณไปยังหน้าชำระเงินโดยตรง พร้อมข้อมูลที่คุณเลือกไว้แล้ว 🚀\n\nคุณจะสามารถ:\n• เลือกจำนวนตั๋วที่ต้องการ\n• กรอกข้อมูลการชำระเงิน\n• ชำระเงินทันที 💳`;
    
    return {
      message,
      data: [eventInfo],
      suggestions: ['ไปจองเลย', 'ดูรายละเอียดก่อน', 'เลือกอีเว้นท์อื่น'],
      action: {
        type: 'navigate',
        payload: {
          url: `/events/${eventInfo.id}/booking?payment=true&ticket=${selectedTicketType}`,
          eventId: eventInfo.id,
          preselectedTicketType: selectedTicketType
        }
      }
    };
    
  } catch (error) {
    console.error('Booking confirmation error:', error);
    return {
      message: '😔 ขออภัยค่ะ เกิดข้อผิดพลาดในการยืนยันการจอง กรุณาลองใหม่อีกครั้งค่ะ',
      suggestions: ['ลองใหม่', 'ดูอีเว้นท์ทั้งหมด', 'ช่วยเหลือ']
    };
  }
};

// Handle specific event booking with ticket options - NEW FUNCTION
const handleSpecificEventBooking = async (payload: any, context?: any): Promise<AIResponse> => {
  try {
    console.log('🎫 Processing specific event booking...', payload);
    
    const { eventName, originalQuery } = payload || {};
    
    // Find the specific event
    const events = await aiApi.getAllEvents();
    const allEvents = events.events || [];
    
    const targetEvent = allEvents.find(event => 
      event && event.title && 
      (event.title.toLowerCase().includes(eventName.toLowerCase()) ||
       eventName.toLowerCase().includes(event.title.toLowerCase()))
    );
    
    if (!targetEvent) {
      return {
        message: `😔 ขออภัยค่ะ ไม่พบอีเว้นท์ "${eventName}" ที่คุณต้องการจอง หรืออาจอีเว้นท์นี้ไม่มีแล้ว\n\nลองดูอีเว้นท์อื่นๆ ได้ไหมคะ? 😊`,
        suggestions: ['ดูอีเว้นท์ทั้งหมด', 'อีเว้นท์แนะนำ', 'ค้นหาอีเว้นท์']
      };
    }
    
    // Check if event is available for booking
    const eventDate = new Date(targetEvent.schedule?.startDate || 0);
    const now = new Date();
    
    if (eventDate <= now) {
      return {
        message: `😔 ขออภัยค่ะ อีเว้นท์ "${targetEvent.title}" ได้จัดขึ้นแล้วหรือกำลังจะมาถึง ไม่สามารถจองได้แล้ว\n\nลองหาอีเว้นท์อื่นๆ ที่ยังจองได้ไหมคะ? 😊`,
        suggestions: ['อีเว้นท์ที่กำลังจะมาถึง', 'อีเว้นท์แนะนำ', 'ค้นหาอีเว้นท์']
      };
    }
    
    if ((targetEvent.capacity?.available || 0) <= 0) {
      return {
        message: `😔 ขออภัยค่ะ อีเว้นท์ "${targetEvent.title}" มีที่นั่งเต็มแล้ว ไม่สามารถจองเพิ่มได้\n\nลองหาอีเว้นท์อื่นๆ ที่ยังมีที่ว่างไหมคะ? 😊`,
        suggestions: ['อีเว้นท์ที่มีที่ว่าง', 'อีเว้นท์แนะนำ', 'ค้นหาอีเว้นท์']
      };
    }
    
    // Get ticket options from event pricing
    const ticketOptions = [];
    const pricing = targetEvent.pricing || {};
    
    // Map pricing to ticket options with Thai labels
    const priceMap = {
      earlyBird: 'บัตรนกผู้จองล่วงหน้า (Early Bird)',
      regular: 'บัตรราคาปกติ',
      student: 'บัตรนักเรียน/นักศึกษา',
      group: 'บัตรกลุ่ม',
      vip: 'บัตร VIP',
      premium: 'บัตร Premium',
      general: 'บัตรทั่วไป',
      fullMarathon: 'มาราธอนเต็มระยะทาง',
      halfMarathon: 'ฮาฟมาราธอน',
      miniMarathon: 'มินิมาราธอน',
      funRun: 'Fun Run',
      adult: 'ผู้ใหญ่',
      child: 'เด็ก',
      senior: 'ผู้สูงอายุ',
      member: 'สมาชิก',
      free: 'ฟรี'
    };
    
    Object.entries(pricing).forEach(([type, price]) => {
      if (typeof price === 'number' && price >= 0 && priceMap[type as keyof typeof priceMap]) {
        ticketOptions.push({
          type,
          label: priceMap[type as keyof typeof priceMap],
          price
        });
      }
    });
    
    // Sort by price
    ticketOptions.sort((a, b) => a.price - b.price);
    
    if (ticketOptions.length === 0) {
      return {
        message: `😔 ขออภัยค่ะ ไม่มีข้อมูลราคาตั๋วสำหรับอีเว้นท์นี้ กรุณาติดต่อผู้จัดงานโดยตรง`,
        suggestions: ['ดูรายละเอียด', 'ติดต่อผู้จัดงาน', 'กลับไปหน้าหลัก']
      };
    }
    
    // Generate message with ticket choices
    const formattedEventDate = new Date(targetEvent.schedule?.startDate || 0);
    const formattedDate = formattedEventDate.toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    let message = `🎉 พบอีเว้นท์แล้ว! ดิฉันพร้อมจะช่วยคุณจอง 🚀\n\n`;
    message += `🎫 **${targetEvent.title}**\n`;
    message += `📅 ${formattedDate}\n`;
    message += `📍 ${targetEvent.location?.venue || 'ออนไลน์'}\n`;
    message += `🎫 เหลือ ${targetEvent.capacity?.available || 0} ที่นั่ง\n\n`;
    
    message += `🎫 **ประเภทตั๋ว:**\n`;
    ticketOptions.forEach((option, index) => {
      message += `${index + 1}. ${option.label} - **${option.price.toLocaleString()} บาท**\n`;
    });
    
    message += `\nคุณต้องการตั๋วประเภทไหนคะ? 🤔\n\nกดปุ่มด้านล่างเพื่อเลือกและดำเนินการจองค่ะ ✨`;
    
    // Generate booking suggestions for each ticket type
    const bookingSuggestions = ticketOptions.map(option => 
      `จอง ${option.label}`
    );
    
    // Add general options
    bookingSuggestions.push('ดูรายละเอียดก่อน');
    
    return {
      message,
      data: [targetEvent],
      suggestions: bookingSuggestions.slice(0, 4),
      action: {
        type: 'show_ticket_options',
        payload: {
          event: targetEvent,
          ticketOptions,
          eventId: targetEvent.id
        }
      }
    };
    
  } catch (error) {
    console.error('Specific event booking error:', error);
    return {
      message: '😔 ขออภัยค่ะ เกิดข้อผิดพลาดในการค้นหาข้อมูลตั๋ว กรุณาลองใหม่อีกครั้งค่ะ',
      suggestions: ['ลองใหม่', 'ดูอีเว้นท์ทั้งหมด', 'ช่วยเหลือ']
    };
  }
};

// Handle AI booking requests with choices - NEW FUNCTION
const handleAIBookingRequest = async (payload: any, context?: any): Promise<AIResponse> => {
  try {
    console.log('🤖 Processing AI booking request...', payload);
    
    const { eventName, originalQuery } = payload || {};
    
    // Get available events
    const events = await aiApi.getAllEvents();
    const allEvents = events.events || [];
    
    // Filter events based on query or show upcoming events
    let candidateEvents = allEvents.filter(event => {
      if (!event || !event.title) return false;
      
      // Filter by event name if mentioned
      if (eventName) {
        return event.title.toLowerCase().includes(eventName.toLowerCase()) ||
               eventName.toLowerCase().includes(event.title.toLowerCase());
      }
      
      // Show upcoming events with available seats
      const eventDate = new Date(event.schedule?.startDate || 0);
      const now = new Date();
      return eventDate > now && 
             event.status === 'active' && 
             (event.capacity?.available || 0) > 0;
    });
    
    // Limit to 5 most relevant events
    candidateEvents = candidateEvents.slice(0, 5);
    
    if (candidateEvents.length === 0) {
      return {
        message: `😔 ขออภัยค่ะ ${eventName ? `ไม่พบอีเว้นท์ "${eventName}"` : 'ไม่มีอีเว้นท์ที่พร้อมจองในขณะนี้'} หรืออาจมีที่นั่งเต็มแล้ว\n\nลองดูอีเว้นท์อื่นๆ ได้ไหมคะ? 😊`,
        suggestions: ['ดูอีเว้นท์ทั้งหมด', 'อีเว้นท์แนะนำ', 'ค้นหาอีเว้นท์']
      };
    }
    
    // Generate message with event choices
    let message = `🎉 เยี่ยมเลยค่ะ! ดิฉันพร้อมจะช่วยคุณจองตั๋ว 🚀\n\n`;
    
    if (eventName) {
      message += `พบอีเว้นท์ที่ตรงกับ "${eventName}" แล้ว ${candidateEvents.length} รายการ:\n\n`;
    } else {
      message += `มีอีเว้นท์ที่น่าสนใจ ${candidateEvents.length} รายการให้เลือก:\n\n`;
    }
    
    // Add event choices with booking buttons
    candidateEvents.forEach((event, index) => {
      const candidateEventDate = new Date(event.schedule?.startDate || 0);
      const formattedDate = candidateEventDate.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short', 
        year: 'numeric'
      });
      
      const lowestPrice = Math.min(
        ...(Object.values(event.pricing || {}).filter(p => typeof p === 'number' && p > 0) as number[])
      );
      
      message += `🎫 **${event.title}**\n`;
      message += `📅 ${formattedDate}\n`;
      message += `📍 ${event.location?.venue || 'ออนไลน์'}\n`;
      message += `💰 เริ่มต้น ${lowestPrice.toLocaleString()} บาท\n`;
      message += `🎫 เหลือ ${event.capacity?.available || 0} ที่นั่ง\n\n`;
    });
    
    message += `คุณต้องการให้ดิฉันจองอีเว้นท์ไหนคะ? 🤔\n\nกดปุ่มด้านล่างเพื่อเลือกอีเว้นท์ที่ต้องการค่ะ ✨`;
    
    // Generate booking suggestions with event names
    const bookingSuggestions = candidateEvents.map(event => 
      `จอง ${event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}`
    );
    
    // Add general suggestions
    bookingSuggestions.push('ดูรายละเอียดก่อน');
    bookingSuggestions.push('ยกเลิก');
    
    return {
      message,
      data: candidateEvents,
      suggestions: bookingSuggestions.slice(0, 4), // Limit to 4 suggestions
      action: {
        type: 'show_booking_choices',
        payload: {
          events: candidateEvents,
          originalQuery
        }
      }
    };
    
  } catch (error) {
    console.error('AI booking request error:', error);
    return {
      message: '😔 ขออภัยค่ะ เกิดข้อผิดพลาดในการค้นหาอีเว้นท์ กรุณาลองใหม่อีกครั้งค่ะ',
      suggestions: ['ลองใหม่', 'ดูอีเว้นท์ทั้งหมด', 'ช่วยเหลือ']
    };
  }
};

// Handle real-time data update requests - NEW FUNCTION
const handleRealTimeUpdate = async (context?: any): Promise<AIResponse> => {
  try {
    console.log('🔄 Processing real-time update request...');
    
    // Force update AI knowledge with real-time data
    await updateAIKnowledge(context, true); // Force refresh
    
    // Get latest statistics
    const stats = await aiApi.getSystemStats();
    const events = await aiApi.getAllEvents();
    
    const eventCount = events.events?.length || 0;
    const activeEvents = events.events?.filter(
      event => new Date(event.schedule?.startDate || 0) > new Date()
    ).length || 0;
    
    const message = `✅ อัปเดตข้อมูลแบบ real-time เรียบร้อยแล้วค่ะ! 🚀

📊 ข้อมูลล่าสุด (เมื่อสักครู่ที่ผ่านมา):
• อีเว้นท์ทั้งหมด: ${eventCount} รายการ
• อีเว้นท์ที่กำลังจะมาถึง: ${activeEvents} รายการ
• ตั๋วที่จองแล้ว: ${stats.totalTickets} ใบ
• รายได้รวม: ${stats.totalRevenue.toLocaleString()} บาท

ตอนนี้คุณสามารถมั่นใจได้ว่าข้อมูลที่แสดงเป็นข้อมูลล่าสุดจากฐานข้อมูล 💾`;
    
    return {
      message,
      data: events.events?.slice(0, 3), // Show latest 3 events
      suggestions: ['ดูอีเว้นท์ทั้งหมด', 'ดูสถิติระบบ', 'ค้นหาอีเว้นท์']
    };
  } catch (error) {
    console.error('Real-time update error:', error);
    return {
      message: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการอัปเดตข้อมูล 😔 กรุณาลองใหม่อีกครั้งค่ะ',
      suggestions: ['ลองใหม่', 'ดูข้อมูลที่มี', 'รายงานปัญหา']
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