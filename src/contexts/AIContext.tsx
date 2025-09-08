import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AIAgentState, ChatMessage, AIContext, AICapability, AIResponse, AIMemory } from '@/types/ai';
import { useAuth } from './AppContext';
import { aiApi, executeAIAction } from '@/lib/ai-api';
import { aiKnowledge, updateSystemKnowledge } from '@/lib/ai-prompts';
import { useNavigate } from 'react-router-dom';

interface AIContextType extends AIAgentState {
  sendMessage: (message: string) => Promise<void>;
  toggleChat: () => void;
  clearChat: () => void;
  updateContext: (context: Partial<AIContext>) => void;
  executeAction: (action: any) => Promise<void>;
  updateMemory: (key: keyof AIMemory, data: any) => void;
  cacheSearchResult: (query: string, results: any[], ttl?: number) => void;
  getCachedSearchResult: (query: string) => any[] | null;
  clearExpiredCache: () => void;
}

const AIContextProvider = createContext<AIContextType | undefined>(undefined);

type AIAction = 
  | { type: 'TOGGLE_CHAT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'UPDATE_CONTEXT'; payload: Partial<AIContext> }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_CAPABILITIES'; payload: AICapability[] }
  | { type: 'UPDATE_MEMORY'; payload: { key: keyof AIMemory; data: any } }
  | { type: 'CACHE_SEARCH_RESULT'; payload: { query: string; results: any[]; ttl?: number } }
  | { type: 'CLEAR_EXPIRED_CACHE' };

const initialMemory: AIMemory = {
  events: [],
  categories: [],
  tickets: [],
  searchResults: {},
  userPreferences: {
    favoriteCategories: [],
    recentSearches: [],
    bookingHistory: [],
  },
  lastFetchTime: {},
};

const initialState: AIAgentState = {
  isOpen: false,
  isLoading: false,
  messages: [],
  context: {
    currentPage: '/',
    availableActions: [],
    memory: initialMemory,
  },
  capabilities: [
    // Event Management
    { name: 'ดูรายการอีเว้นท์', description: 'แสดงรายการอีเว้นท์ทั้งหมด', endpoint: '/events', method: 'GET' },
    { name: 'ค้นหาอีเว้นท์', description: 'ค้นหาอีเว้นท์ตามเงื่อนไข', endpoint: '/events', method: 'GET' },
    { name: 'ดูรายละเอียดอีเว้นท์', description: 'แสดงรายละเอียดอีเว้นท์', endpoint: '/events/:id', method: 'GET' },
    { name: 'สร้างอีเว้นท์ใหม่', description: 'สร้างอีเว้นท์ใหม่', endpoint: '/events', method: 'POST', adminOnly: true },
    { name: 'แก้ไขอีเว้นท์', description: 'แก้ไขข้อมูลอีเว้นท์', endpoint: '/events/:id', method: 'PUT', adminOnly: true },
    { name: 'ลบอีเว้นท์', description: 'ลบอีเว้นท์', endpoint: '/events/:id', method: 'DELETE', adminOnly: true },
    
    // Category Management
    { name: 'ดูหมวดหมู่', description: 'แสดงรายการหมวดหมู่', endpoint: '/categories', method: 'GET' },
    
    // Ticket Management
    { name: 'ดูตั๋วของฉัน', description: 'แสดงตั๋วของผู้ใช้', endpoint: '/tickets', method: 'GET' },
    { name: 'จองตั๋ว', description: 'จองตั๋วอีเว้นท์', endpoint: '/bookings', method: 'POST' },
    { name: 'ดูการจอง', description: 'ดูรายละเอียดการจอง', endpoint: '/bookings/:id', method: 'GET' },
    { name: 'ตรวจสอบตั๋ว', description: 'ตรวจสอบความถูกต้องของตั๋ว', endpoint: '/tickets/:id/validate', method: 'POST' },
    
    // User Management (Admin only)
    { name: 'ดูสถิติระบบ', description: 'แสดงสถิติการใช้งานระบบ', endpoint: '/admin/stats', method: 'GET', adminOnly: true },
  ],
  error: undefined,
};

function aiReducer(state: AIAgentState, action: AIAction): AIAgentState {
  switch (action.type) {
    case 'TOGGLE_CHAT':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'UPDATE_CONTEXT':
      return { ...state, context: { ...state.context, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CAPABILITIES':
      return { ...state, capabilities: action.payload };
    case 'UPDATE_MEMORY':
      const { key, data } = action.payload;
      return {
        ...state,
        context: {
          ...state.context,
          memory: {
            ...state.context.memory!,
            [key]: data,
            lastFetchTime: {
              ...state.context.memory!.lastFetchTime,
              [key]: new Date(),
            },
          },
        },
      };
    case 'CACHE_SEARCH_RESULT':
      const { query, results, ttl = 300000 } = action.payload; // Default 5 minutes TTL
      return {
        ...state,
        context: {
          ...state.context,
          memory: {
            ...state.context.memory!,
            searchResults: {
              ...state.context.memory!.searchResults,
              [query]: {
                results,
                timestamp: new Date(),
                ttl,
              },
            },
          },
        },
      };
    case 'CLEAR_EXPIRED_CACHE':
      const now = new Date();
      const validSearchResults = Object.entries(state.context.memory!.searchResults)
        .filter(([_, cache]) => {
          const expiryTime = new Date(cache.timestamp.getTime() + cache.ttl);
          return now < expiryTime;
        })
        .reduce((acc, [query, cache]) => ({ ...acc, [query]: cache }), {});
      
      return {
        ...state,
        context: {
          ...state.context,
          memory: {
            ...state.context.memory!,
            searchResults: validSearchResults,
          },
        },
      };
    default:
      return state;
  }
}

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Update context when user changes
  useEffect(() => {
    if (user) {
      dispatch({
        type: 'UPDATE_CONTEXT',
        payload: {
          currentUser: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        },
      });
    }
  }, [user]);

  // Update available actions based on user role
  useEffect(() => {
    const availableCapabilities = state.capabilities.filter(
      cap => !cap.adminOnly || (user && user.role === 'admin')
    );
    
    dispatch({
      type: 'UPDATE_CONTEXT',
      payload: {
        availableActions: availableCapabilities.map(cap => cap.name),
      },
    });
  }, [state.capabilities, user]);

  // Auto cleanup expired cache every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredCache();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (message: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: {
          userId: user?.id,
          context: state.context,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      // Build conversation context from recent messages
      const recentMessages = state.messages.slice(-3); // Last 3 messages
      const conversationContext = recentMessages.length > 0 
        ? recentMessages.map(msg => `${msg.role}: ${msg.content}`).join(' | ')
        : 'เริ่มต้นการสนทนา';
      
      // Add conversation context to the context object
      const contextWithConversation = {
        ...state.context,
        conversationContext
      };
      
      // Process AI response with memory and conversation context
      const aiResponse = await processAIMessage(message, contextWithConversation, state.capabilities);
      
      // Update memory if we have new data
      if (aiResponse.data && Array.isArray(aiResponse.data)) {
        // Determine what type of data this is and update memory accordingly
        if (message.includes('อีเว้นท์') || message.includes('event')) {
          updateMemory('events', aiResponse.data);
          // Update AI knowledge system too
          updateSystemKnowledge({ events: aiResponse.data });
        }
        
        // Cache search results if this was a search
        if (message.includes('ค้นหา') || message.includes('search')) {
          const searchTerm = extractSearchTerm(message);
          if (searchTerm) {
            cacheSearchResult(searchTerm, aiResponse.data, 300000); // 5 minutes TTL
          }
        }
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        metadata: {
          action: aiResponse.action?.type,
          context: aiResponse.data,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

      // Execute action if provided
      if (aiResponse.action) {
        await executeAction(aiResponse.action);
      }
    } catch (error) {
      console.error('AI message error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'เกิดข้อผิดพลาดในการประมวลผล' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const toggleChat = () => {
    dispatch({ type: 'TOGGLE_CHAT' });
  };

  const clearChat = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const updateContext = (context: Partial<AIContext>) => {
    dispatch({ type: 'UPDATE_CONTEXT', payload: context });
  };

  const executeAction = async (action: any): Promise<void> => {
    try {
      switch (action.type) {
        case 'navigate':
          // Use React Router navigate instead of window.location.href to avoid page reload
          navigate(action.payload.url);
          break;
        case 'api_call':
          // Execute API call based on action payload
          await executeAPICall(action.payload);
          break;
        case 'display_data':
          // Handle data display
          console.log('Display data:', action.payload);
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Action execution error:', error);
      throw error;
    }
  };

  const updateMemory = (key: keyof AIMemory, data: any) => {
    dispatch({ type: 'UPDATE_MEMORY', payload: { key, data } });
  };

  const cacheSearchResult = (query: string, results: any[], ttl?: number) => {
    dispatch({ type: 'CACHE_SEARCH_RESULT', payload: { query, results, ttl } });
  };

  const getCachedSearchResult = (query: string): any[] | null => {
    const cache = state.context.memory?.searchResults[query];
    if (!cache) return null;
    
    const now = new Date();
    const expiryTime = new Date(cache.timestamp.getTime() + cache.ttl);
    
    if (now > expiryTime) {
      // Cache expired, clean it up
      dispatch({ type: 'CLEAR_EXPIRED_CACHE' });
      return null;
    }
    
    return cache.results;
  };

  const clearExpiredCache = () => {
    dispatch({ type: 'CLEAR_EXPIRED_CACHE' });
  };

  const value: AIContextType = {
    ...state,
    sendMessage,
    toggleChat,
    clearChat,
    updateContext,
    executeAction,
    updateMemory,
    cacheSearchResult,
    getCachedSearchResult,
    clearExpiredCache,
  };

  return (
    <AIContextProvider.Provider value={value}>
      {children}
    </AIContextProvider.Provider>
  );
};

// Enhanced AI processing function with full API access
async function processAIMessage(
  message: string,
  context: AIContext,
  capabilities: AICapability[]
): Promise<AIResponse> {
  try {
    // Use Gemini AI to process the message intelligently
    return await executeAIAction(message, context);
  } catch (error) {
    console.error('Process AI message error:', error);
    return {
      message: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
      suggestions: ['ลองใหม่', 'ช่วยเหลือ', 'ติดต่อผู้ดูแล']
    };
  }
};

// Keep the old function as backup (can be removed later)
async function processAIMessageOld(
  message: string,
  context: AIContext,
  capabilities: AICapability[]
): Promise<AIResponse> {
  const lowerMessage = message.toLowerCase();
  
  try {
    // Event-related queries
    if (lowerMessage.includes('อีเว้นท์') || lowerMessage.includes('event')) {
      if (lowerMessage.includes('ค้นหา') || lowerMessage.includes('search')) {
        // Extract search term from message
        const searchTerm = extractSearchTerm(message);
        if (searchTerm) {
          return await executeAIAction(message, context);
        }
      }
      
      if (lowerMessage.includes('แนะนำ') || lowerMessage.includes('featured')) {
        const featured = await aiApi.getFeaturedEvents();
        return {
          message: `อีเว้นท์แนะนำ ${featured.length} รายการ`,
          data: featured,
          suggestions: ['ดูรายละเอียด', 'จองตั๋ว', 'ดูอีเว้นท์อื่น'],
        };
      }
      
      if (lowerMessage.includes('สร้าง') || lowerMessage.includes('create')) {
        if (context.currentUser?.role === 'admin') {
          return {
            message: 'ฉันสามารถช่วยคุณสร้างอีเว้นท์ใหม่ได้ กรุณาให้ข้อมูลพื้นฐานของอีเว้นท์',
            suggestions: ['ใส่ชื่ออีเว้นท์', 'เลือกหมวดหมู่', 'กำหนดวันที่'],
            action: { type: 'navigate', payload: { url: '/admin/events/create' } },
          };
        } else {
          return {
            message: 'ขออภัย การสร้างอีเว้นท์ต้องมีสิทธิ์ผู้ดูแลระบบ',
            suggestions: ['ดูอีเว้นท์', 'จองตั๋ว', 'ติดต่อผู้ดูแล'],
          };
        }
      }
      
      return await executeAIAction(message, context);
    }
    
    // Ticket-related queries
    if (lowerMessage.includes('ตั๋ว') || lowerMessage.includes('ticket')) {
      if (lowerMessage.includes('ของฉัน') || lowerMessage.includes('my')) {
        return await executeAIAction(message, context);
      }
      
      if (lowerMessage.includes('ตรวจสอบ') || lowerMessage.includes('validate')) {
        return {
          message: 'กรุณาให้รหัสตั๋วที่ต้องการตรวจสอบ',
          suggestions: ['สแกน QR Code', 'ใส่รหัสตั๋ว', 'ยกเลิก'],
        };
      }
      
      if (lowerMessage.includes('จอง') || lowerMessage.includes('book')) {
        return {
          message: 'คุณต้องการจองตั๋วอีเว้นท์ไหน? ฉันสามารถแสดงอีเว้นท์ที่เปิดจองได้',
          suggestions: ['ดูอีเว้นท์ทั้งหมด', 'อีเว้นท์แนะนำ', 'ค้นหาอีเว้นท์'],
        };
      }
      
      return {
        message: 'ฉันสามารถช่วยคุณเกี่ยวกับตั๋วได้ คุณต้องการทำอะไร?',
        suggestions: ['ดูตั๋วของฉัน', 'จองตั๋วใหม่', 'ตรวจสอบตั๋ว'],
      };
    }
    
    // Statistics and admin queries
    if (lowerMessage.includes('สถิติ') || lowerMessage.includes('stats') || lowerMessage.includes('รายงาน')) {
      if (context.currentUser?.role === 'admin') {
        return await executeAIAction('ดูสถิติระบบและรายงานการใช้งาน', context);
      } else {
        return {
          message: 'ขออภัย การดูสถิติระบบต้องมีสิทธิ์ผู้ดูแลระบบ',
          suggestions: ['ดูตั๋วของฉัน', 'ดูอีเว้นท์', 'ติดต่อผู้ดูแล'],
        };
      }
    }

    // Search queries
    if (lowerMessage.includes('ค้นหา') || lowerMessage.includes('search')) {
      const searchTerm = extractSearchTerm(message);
      if (searchTerm) {
        return await executeAIAction(`ค้นหา: ${searchTerm}`, context);
      } else {
        return {
          message: 'คุณต้องการค้นหาอะไร? กรุณาระบุคำค้นหา',
          suggestions: ['ค้นหาอีเว้นท์', 'ค้นหาหมวดหมู่', 'ค้นหาตั๋ว'],
        };
      }
    }
    
    // Help queries
    if (lowerMessage.includes('ช่วย') || lowerMessage.includes('help')) {
      const userCapabilities = capabilities.filter(
        cap => !cap.adminOnly || (context.currentUser?.role === 'admin')
      );
      
      return {
        message: `ฉันสามารถช่วยคุณได้ในเรื่องต่างๆ เหล่านี้:\n\n${userCapabilities.map(cap => `• ${cap.name}: ${cap.description}`).join('\n')}\n\nคุณสามารถพิมพ์คำสั่งหรือคำถามได้เลย`,
        suggestions: userCapabilities.slice(0, 3).map(cap => cap.name),
      };
    }
    
    // Category queries
    if (lowerMessage.includes('หมวดหมู่') || lowerMessage.includes('category')) {
      const categories = await aiApi.getAllCategories();
      return {
        message: `มีหมวดหมู่อีเว้นท์ทั้งหมด ${categories.length} หมวดหมู่`,
        data: categories,
        suggestions: categories.slice(0, 3).map((cat: any) => cat.name),
      };
    }
    
    // Default response with smart suggestions
    return {
      message: 'ขอโทษครับ ฉันยังไม่เข้าใจคำถามของคุณ กรุณาลองถามใหม่หรือเลือกจากตัวเลือกด้านล่าง',
      suggestions: [
        'ช่วยเหลือ',
        'ดูอีเว้นท์ทั้งหมด',
        'ดูตั๋วของฉัน',
        context.currentUser?.role === 'admin' ? 'ดูสถิติระบบ' : 'ค้นหาอีเว้นท์'
      ].filter(Boolean),
    };
    
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`,
      suggestions: ['ลองใหม่', 'ช่วยเหลือ', 'รายงานปัญหา'],
    };
  }
}

// Helper function to extract search terms from message
function extractSearchTerm(message: string): string | null {
  const patterns = [
    /ค้นหา["']([^"']+)["']/,
    /ค้นหา\s+(.+)/,
    /search["']([^"']+)["']/i,
    /search\s+(.+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Execute API calls based on AI actions - now using aiApi
async function executeAPICall(payload: any): Promise<any> {
  const { endpoint, method, params, data } = payload;
  
  try {
    switch (method) {
      case 'GET':
        if (endpoint.includes('/events')) {
          if (params?.id) {
            return await aiApi.getEventById(params.id);
          }
          return await aiApi.getAllEvents(params);
        }
        if (endpoint.includes('/categories')) {
          if (params?.id) {
            return await aiApi.getCategoryById(params.id);
          }
          return await aiApi.getAllCategories();
        }
        if (endpoint.includes('/tickets')) {
          return await aiApi.getUserTickets(params?.userId);
        }
        if (endpoint.includes('/admin/stats')) {
          return await aiApi.getSystemStats();
        }
        break;
      case 'POST':
        if (endpoint.includes('/events')) {
          return await aiApi.createEvent(data);
        }
        if (endpoint.includes('/bookings')) {
          return await aiApi.createBooking(data);
        }
        if (endpoint.includes('/tickets') && endpoint.includes('/validate')) {
          return await aiApi.validateTicket(params.id);
        }
        break;
      case 'PUT':
        if (endpoint.includes('/events')) {
          return await aiApi.updateEvent(params.id, data);
        }
        if (endpoint.includes('/bookings')) {
          return await aiApi.updateBooking(params.id, data);
        }
        break;
      case 'DELETE':
        if (endpoint.includes('/events')) {
          return await aiApi.deleteEvent(params.id);
        }
        if (endpoint.includes('/bookings')) {
          return await aiApi.cancelBooking(params.id);
        }
        break;
    }
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

export const useAI = () => {
  const context = useContext(AIContextProvider);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIProvider;