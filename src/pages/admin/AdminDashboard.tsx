import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  MoreHorizontal 
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
import { eventApi } from '@/lib/api';
import { Event } from '@/types/event';
import { useLanguage } from '@/contexts/AppContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = React.useState({
    totalEvents: 0,
    activeEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
  });
  const [recentEvents, setRecentEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const eventsResponse = await eventApi.getEvents();
        const events = eventsResponse.events || [];
        
        // Calculate stats
        const activeEvents = events.filter(e => e.status === 'active');
        const totalRegistered = events.reduce((sum, e) => sum + (e.capacity?.registered || 0), 0);
        
        // Calculate revenue from booking records
        let totalRevenue = 0;
        try {
          const tickets = await eventApi.getTickets();
          totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.totalAmount || 0), 0);
        } catch (error) {
          console.warn('Could not load ticket data for revenue calculation:', error);
        }
        
        setStats({
          totalEvents: events.length,
          activeEvents: activeEvents.length,
          totalTickets: totalRegistered,
          totalRevenue: totalRevenue,
        });

        setRecentEvents(events.slice(0, 10));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'ไม่ระบุวันที่';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'วันที่ไม่ถูกต้อง';
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-active">เปิดใช้งาน</Badge>;
      case 'draft':
        return <Badge variant="secondary">ฉบับร่าง</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ยกเลิก</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="h-8 w-48 bg-muted rounded loading-shimmer" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg loading-shimmer" />
          ))}
        </div>

        <div className="h-96 bg-muted rounded-lg loading-shimmer" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
          <p className="text-muted-foreground mt-2">
            ภาพรวมระบบจัดการอีเว้นท์
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.createEvent')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อีเว้นท์ทั้งหมด</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEvents} อีเว้นท์เปิดใช้งาน
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้เข้าร่วมทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ผู้ลงทะเบียนเข้าร่วมงาน
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ตั๋วที่ขายแล้ว</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              จำนวนตั๋วทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              รายได้จากการขายตั๋ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>อีเว้นท์ล่าสุด</CardTitle>
            <Button asChild variant="outline">
              <Link to="/admin/events">
                ดูทั้งหมด
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่ออีเว้นท์</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ผู้เข้าร่วม</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.organizer?.name || 'ไม่ระบุผู้จัด'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(event.schedule?.startDate || '')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(event.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {(event.capacity?.registered || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        / {(event.capacity?.max || 0).toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/events/${event.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            ดู
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/events/${event.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            แก้ไข
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}