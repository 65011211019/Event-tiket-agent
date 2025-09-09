import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Language Context
type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Theme Context
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Auth Context
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Translations
const translations = {
  th: {
    // Navigation
    'nav.home': 'หน้าแรก',
    'nav.events': 'อีเว้นท์',
    'nav.categories': 'หมวดหมู่',
    'nav.myTickets': 'ตั๋วของฉัน',
    'nav.help': 'ช่วยเหลือ',
    'nav.admin': 'ผู้ดูแลระบบ',
    'nav.dashboard': 'แดชบอร์ด',
    'nav.users': 'ผู้ใช้',
    'nav.settings': 'การตั้งค่า',
    
    // General
    'general.search': 'ค้นหา',
    'general.filter': 'กรอง',
    'general.sort': 'เรียงตาม',
    'general.clear': 'ล้าง',
    'general.save': 'บันทึก',
    'general.cancel': 'ยกเลิก',
    'general.delete': 'ลบ',
    'general.edit': 'แก้ไข',
    'general.view': 'ดู',
    'general.create': 'สร้าง',
    'general.update': 'อัปเดต',
    'general.loading': 'กำลังโหลด...',
    'general.error': 'เกิดข้อผิดพลาด',
    'general.noResults': 'ไม่พบผลลัพธ์',
    'general.tryAgain': 'ลองใหม่',
    
    // Events
    'events.title': 'อีเว้นท์',
    'events.featured': 'อีเว้นท์แนะนำ',
    'events.upcoming': 'อีเว้นท์ที่จะมาถึง',
    'events.categories': 'หมวดหมู่',
    'events.allCategories': 'ทุกหมวดหมู่',
    'events.location': 'สถานที่',
    'events.date': 'วันที่',
    'events.price': 'ราคา',
    'events.available': 'ที่เหลือ',
    'events.soldOut': 'ขายหมดแล้ว',
    'events.free': 'ฟรี',
    'events.bookNow': 'จองเลย',
    'events.viewDetails': 'ดูรายละเอียด',
    'events.share': 'แชร์',
    'events.addToCalendar': 'เพิ่มในปฏิทิน',
    
    // Event Details
    'event.description': 'รายละเอียด',
    'event.schedule': 'กำหนดการ',
    'event.location': 'สถานที่',
    'event.pricing': 'ราคาบัตร',
    'event.capacity': 'จำนวนที่นั่ง',
    'event.organizer': 'ผู้จัด',
    'event.speakers': 'วิทยากร',
    'event.requirements': 'สิ่งที่ต้องเตรียม',
    'event.includes': 'รวมในราคา',
    'event.tags': 'แท็ก',
    
    // Tickets
    'tickets.myTickets': 'ตั๋วของฉัน',
    'tickets.selectTickets': 'เลือกประเภทบัตร',
    'tickets.quantity': 'จำนวน',
    'tickets.total': 'รวมทั้งสิ้น',
    'tickets.summary': 'สรุปคำสั่งซื้อ',
    'tickets.checkout': 'ชำระเงิน',
    'tickets.confirmation': 'ยืนยันการสั่งซื้อ',
    
    // Admin
    'admin.dashboard': 'แดชบอร์ด',
    'admin.events': 'จัดการอีเว้นท์',
    'admin.categories': 'จัดการหมวดหมู่',
    'admin.tickets': 'จัดการตั๋ว',
    'admin.createEvent': 'สร้างอีเว้นท์ใหม่',
    'admin.editEvent': 'แก้ไขอีเว้นท์',
    'admin.eventForm': 'ฟอร์มอีเว้นท์',
    
    // Messages
    'message.eventCreated': 'สร้างอีเว้นท์สำเร็จ',
    'message.eventUpdated': 'อัปเดตอีเว้นท์สำเร็จ',
    'message.eventDeleted': 'ลบอีเว้นท์สำเร็จ',
    'message.ticketBooked': 'จองตั๋วสำเร็จ',
    'message.loginRequired': 'กรุณาเข้าสู่ระบบ',
    'message.accessDenied': 'ไม่มีสิทธิ์เข้าถึง',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.events': 'Events',
    'nav.categories': 'Categories',
    'nav.myTickets': 'My Tickets',
    'nav.help': 'Help',
    'nav.admin': 'Admin',
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    
    // General
    'general.search': 'Search',
    'general.filter': 'Filter',
    'general.sort': 'Sort',
    'general.clear': 'Clear',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.view': 'View',
    'general.create': 'Create',
    'general.update': 'Update',
    'general.loading': 'Loading...',
    'general.error': 'Error occurred',
    'general.noResults': 'No results found',
    'general.tryAgain': 'Try again',
    
    // Events
    'events.title': 'Events',
    'events.featured': 'Featured Events',
    'events.upcoming': 'Upcoming Events',
    'events.categories': 'Categories',
    'events.allCategories': 'All Categories',
    'events.location': 'Location',
    'events.date': 'Date',
    'events.price': 'Price',
    'events.available': 'Available',
    'events.soldOut': 'Sold Out',
    'events.free': 'Free',
    'events.bookNow': 'Book Now',
    'events.viewDetails': 'View Details',
    'events.share': 'Share',
    'events.addToCalendar': 'Add to Calendar',
    
    // Event Details
    'event.description': 'Description',
    'event.schedule': 'Schedule',
    'event.location': 'Location',
    'event.pricing': 'Pricing',
    'event.capacity': 'Capacity',
    'event.organizer': 'Organizer',
    'event.speakers': 'Speakers',
    'event.requirements': 'Requirements',
    'event.includes': 'Includes',
    'event.tags': 'Tags',
    
    // Tickets
    'tickets.myTickets': 'My Tickets',
    'tickets.selectTickets': 'Select Tickets',
    'tickets.quantity': 'Quantity',
    'tickets.total': 'Total',
    'tickets.summary': 'Order Summary',
    'tickets.checkout': 'Checkout',
    'tickets.confirmation': 'Order Confirmation',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.events': 'Event Management',
    'admin.categories': 'Category Management',
    'admin.tickets': 'Ticket Management',
    'admin.createEvent': 'Create New Event',
    'admin.editEvent': 'Edit Event',
    'admin.eventForm': 'Event Form',
    
    // Messages
    'message.eventCreated': 'Event created successfully',
    'message.eventUpdated': 'Event updated successfully',
    'message.eventDeleted': 'Event deleted successfully',
    'message.ticketBooked': 'Ticket booked successfully',
    'message.loginRequired': 'Please log in',
    'message.accessDenied': 'Access denied',
  },
};

// Providers
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = React.useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'th' || saved === 'en') ? saved : 'th';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Mock users database
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@tiketagent.com',
    password: 'password123',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Jason',
    email: 'jason@gmail.com',
    password: 'password123',
    role: 'user' as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true); // Start with loading true

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login with predefined users
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      
      const authenticatedUser: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      };
      
      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Initialize user from localStorage
  React.useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Validate the parsed user has required fields
          if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
            setUser(parsedUser);
          } else {
            // Invalid user data, remove it
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false); // Always set loading to false after initialization
      }
    };

    initializeAuth();
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hooks
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};