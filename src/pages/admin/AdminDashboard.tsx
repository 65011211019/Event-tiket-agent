import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp, 
  Plus,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { eventApi } from '@/lib/api';
import { Event, EventTicket, BookingRecord, BookingTicket } from '@/types/event';
import { useLanguage } from '@/contexts/AppContext';
import { ticketUpdateService } from '@/services/ticketService';

// Define types for our chart data
interface ChartData {
  name: string;
  value: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  isCurrency?: boolean;
}

// Helper function to determine if an object is a BookingRecord
const isBookingRecord = (item: any): item is BookingRecord => {
  return item && Array.isArray(item.tickets);
};

// Helper function to determine if an object is an EventTicket
const isEventTicket = (item: any): item is EventTicket => {
  return item && typeof item.ticketType === 'string';
};

// Helper function to extract ticket information from mixed data
const extractTicketsFromData = (data: (BookingRecord | EventTicket)[]): EventTicket[] => {
  const tickets: EventTicket[] = [];
  
  data.forEach(item => {
    if (isBookingRecord(item)) {
      // Convert BookingRecord to individual EventTickets
      item.tickets.forEach((bookingTicket: BookingTicket) => {
        const ticket: EventTicket = {
          id: `${item.id}-${bookingTicket.type}`,
          eventId: item.eventId,
          ticketType: bookingTicket.type,
          price: bookingTicket.price,
          quantity: bookingTicket.quantity,
          currency: item.currency || 'THB',
          holder: item.holder || item.customerInfo || { name: '', email: '', phone: '' },
          customerInfo: item.customerInfo || item.holder,
          purchaseDate: new Date().toISOString(),
          status: 'confirmed', // Assume confirmed for dashboard
          totalAmount: item.totalAmount,
          notes: item.notes
        };
        tickets.push(ticket);
      });
    } else if (isEventTicket(item)) {
      // Already an EventTicket
      tickets.push(item);
    }
  });
  
  return tickets;
};

const StatCard = ({ title, value, change, icon, isCurrency = false }: StatCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card className="hover-lift transition-all duration-300 border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 mr-1" />
          )}
          {isPositive ? '+' : ''}{change}% จากเดือนที่แล้ว
        </p>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = React.useState({
    totalEvents: 0,
    activeEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    avgTicketsPerEvent: 0,
  });
  const [categoryData, setCategoryData] = React.useState<ChartData[]>([]);
  const [ticketTypeData, setTicketTypeData] = React.useState<ChartData[]>([]);
  const [popularCategories, setPopularCategories] = React.useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [events, setEvents] = React.useState<Event[]>([]);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch events and tickets in parallel
        const [eventsResponse, ticketsData] = await Promise.all([
          eventApi.getEvents(),
          eventApi.getTickets()
        ]);
        
        const events = eventsResponse.events || [];
        setEvents(events);
        
        // Extract individual tickets from mixed data (BookingRecords and EventTickets)
        const allTickets = extractTicketsFromData(ticketsData);
        
        // Calculate stats
        const activeEvents = events.filter(e => e.status === 'active');
        
        // Calculate actual participants from booked tickets (only confirmed tickets)
        const confirmedTickets = allTickets.filter(ticket => ticket.status === 'confirmed');
        const totalParticipants = confirmedTickets.reduce((sum, ticket) => {
          // Use quantity if available, otherwise default to 1
          return sum + (ticket.quantity || 1);
        }, 0);
        
        // Calculate revenue from confirmed bookings
        const totalRevenue = confirmedTickets.reduce((sum, ticket) => {
          // Use totalAmount if available and this is the first ticket in a booking
          if (ticket.totalAmount !== undefined && ticket.id.includes('-')) {
            // For converted tickets from BookingRecords, we only count totalAmount once per booking
            const price = ticket.price || 0;
            const quantity = ticket.quantity || 1;
            return sum + (price * quantity);
          }
          
          // For individual EventTickets, use totalAmount if available
          if (ticket.totalAmount !== undefined) {
            return sum + ticket.totalAmount;
          }
          
          // Otherwise calculate from price and quantity
          const price = ticket.price || 0;
          const quantity = ticket.quantity || 1;
          return sum + (price * quantity);
        }, 0);
        
        // Calculate average tickets per event
        const avgTicketsPerEvent = events.length > 0 
          ? Math.round(totalParticipants / events.length) 
          : 0;
        
        setStats({
          totalEvents: events.length,
          activeEvents: activeEvents.length,
          totalTickets: totalParticipants,
          totalRevenue: totalRevenue,
          avgTicketsPerEvent: avgTicketsPerEvent,
        });

        // Prepare category data for pie chart
        const categoryCount: Record<string, number> = {};
        events.forEach(event => {
          categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
        });
        
        const categoryChartData = Object.entries(categoryCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        
        setCategoryData(categoryChartData);
        setPopularCategories(categoryChartData.slice(0, 5));
        
        // Prepare ticket type data
        const ticketTypeCount: Record<string, number> = {};
        confirmedTickets.forEach(ticket => {
          ticketTypeCount[ticket.ticketType] = (ticketTypeCount[ticket.ticketType] || 0) + (ticket.quantity || 1);
        });
        
        const ticketTypeChartData = Object.entries(ticketTypeCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        
        setTicketTypeData(ticketTypeChartData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Subscribe to real-time updates for events
  React.useEffect(() => {
    const unsubscribe = ticketUpdateService.subscribe((updatedEvent) => {
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      // Recalculate stats when events are updated
      setStats(prevStats => ({
        ...prevStats,
        totalEvents: events.length,
        activeEvents: events.filter(e => e.status === 'active').length,
      }));
    });

    // Start polling for updates
    ticketUpdateService.startPolling();

    return () => {
      unsubscribe();
    };
  }, [events]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Stat cards data with icons
  const statCards: StatCardProps[] = [
    {
      title: 'รายได้รวม',
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      change: 12,
      icon: <TrendingUp className="h-4 w-4" />,
      isCurrency: true
    },
    {
      title: 'ตั๋วที่ขายแล้ว',
      value: stats.totalTickets.toLocaleString(),
      change: 8,
      icon: <Ticket className="h-4 w-4" />
    },
    {
      title: 'อีเว้นท์ทั้งหมด',
      value: stats.totalEvents.toString(),
      change: 3,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      title: 'เฉลี่ยต่ออีเว้นท์',
      value: stats.avgTicketsPerEvent.toString(),
      change: 5,
      icon: <Users className="h-4 w-4" />
    }
  ];

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted rounded loading-shimmer" />
            <div className="h-4 w-64 bg-muted rounded mt-2 loading-shimmer" />
          </div>
          <div className="h-10 w-32 bg-muted rounded loading-shimmer" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg loading-shimmer" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded-lg loading-shimmer" />
          <div className="h-80 bg-muted rounded-lg loading-shimmer" />
        </div>

        <div className="h-96 bg-muted rounded-lg loading-shimmer" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header with gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('admin.dashboard')}
          </h1>
          <p className="text-muted-foreground mt-2">
            ภาพรวมระบบจัดการอีเว้นท์
          </p>
        </div>
      </div>

      {/* Stats Cards with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section with better spacing and styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="shadow-sm hover:shadow-lg transition-all bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              การกระจายประเภทอีเว้นท์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'จำนวนอีเว้นท์']} 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Ticket Types */}
        <Card className="shadow-sm hover:shadow-lg transition-all bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-primary" />
              ประเภทตั๋วที่นิยม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={ticketTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ticketTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'จำนวนตั๋ว']} 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Popular Ticket Types List */}
        <Card className="shadow-sm hover:shadow-lg transition-all bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>ประเภทตั๋วที่นิยม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketTypeData.slice(0, 5).map((ticketType, index) => (
                <div key={ticketType.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{ticketType.name}</span>
                  </div>
                  <span className="font-medium">{ticketType.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories List */}
        <Card className="shadow-sm hover:shadow-lg transition-all bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>หมวดหมู่อีเว้นท์ยอดนิยม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="font-medium">{category.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Statistics */}
        <Card className="shadow-sm hover:shadow-lg transition-all bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>สถิติอีเว้นท์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg hover-lift">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalEvents}
                </div>
                <div className="text-sm text-muted-foreground">ทั้งหมด</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg hover-lift">
                <div className="text-2xl font-bold text-success">
                  {stats.activeEvents}
                </div>
                <div className="text-sm text-muted-foreground">เปิดใช้งาน</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg hover-lift">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round((stats.activeEvents / Math.max(stats.totalEvents, 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">อัตราการใช้งาน</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg hover-lift">
                <div className="text-2xl font-bold text-purple-500">
                  ฿{Math.round(stats.totalRevenue / Math.max(stats.totalEvents, 1)).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">รายได้ต่ออีเว้นท์</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}