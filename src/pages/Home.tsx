import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Calendar, Users, Star, MapPin, Sparkles, TrendingUp, Bot, MessageCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EventCard from '@/components/events/EventCard';

import { EventGridSkeleton } from '@/components/events/EventSkeleton';
import SearchBox from '@/components/common/SearchBox';
import { useLanguage } from '@/contexts/AppContext';
import { eventApi } from '@/lib/api';
import { Event, EventCategory } from '@/types/event';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [featuredEvents, setFeaturedEvents] = React.useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);
  const [categories, setCategories] = React.useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [bookedTicketsCounts, setBookedTicketsCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [eventsResponse, categoriesData] = await Promise.all([
          eventApi.getEvents(),
          eventApi.getCategories(),
        ]);

        const events = eventsResponse.events || [];
        
        setFeaturedEvents(events.filter(e => e.featured).slice(0, 6));
        setUpcomingEvents(events.slice(0, 8));
        setCategories(categoriesData || []);
        
        // Load booked tickets count for all events
        const counts: Record<string, number> = {};
        for (const event of events) {
          try {
            const bookedCount = await eventApi.getBookedTicketsCount(event.id);
            counts[event.id] = bookedCount;
          } catch (err) {
            console.warn(`Failed to get booked count for event ${event.id}:`, err);
            counts[event.id] = 0;
          }
        }
        setBookedTicketsCounts(counts);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/events?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const stats = [
    { 
      icon: Calendar, 
      label: 'อีเว้นท์ทั้งหมด', 
      value: `${upcomingEvents.length + featuredEvents.length}+`,
      color: 'text-blue-600'
    },
    { 
      icon: Users, 
      label: 'ผู้เข้าร่วม', 
      value: '50,000+',
      color: 'text-green-600'
    },
    { 
      icon: Star, 
      label: 'คะแนนรีวิว', 
      value: '4.8/5',
      color: 'text-yellow-600'
    },
    { 
      icon: MapPin, 
      label: 'เมืองที่ให้บริการ', 
      value: '77',
      color: 'text-purple-600'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden" style={{backgroundImage: 'url(https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-light/20" />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative container py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur text-sm px-4 py-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  แพลตฟอร์มอีเว้นท์อันดับ 1 ในไทย
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight text-white">
                ค้นหาและจองอีเว้นท์
                <br />
                <span className="bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent">
                  ที่คุณชื่นชอบ
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 text-balance max-w-2xl mx-auto">
                แพลตฟอร์มจองตั๋วอีเว้นท์ออนไลน์ที่ครบครันที่สุดในประเทศไทย
                พร้อมอีเว้นท์คุณภาพจากผู้จัดมืออาชีพ
              </p>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearch}
                placeholder="ค้นหาอีเว้นท์, หมวดหมู่, หรือสถานที่..."
                size="lg"
                className="bg-white/20 backdrop-blur rounded-2xl p-2 [&>div>input]:bg-white/90 [&>div>input]:text-gray-900 [&>div>input]:placeholder:text-gray-600"
              />
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/events?featured=true">
                <Button variant="outline" className="border-white/20 text-black dark:text-white hover:bg-white/10 backdrop-blur">
                  <Star className="w-4 h-4 mr-2" />
                  อีเว้นท์แนะนำ
                </Button>
              </Link>
              <Link to="/events?dateRange=week">
                <Button variant="outline" className="border-white/20 text-black dark:text-white hover:bg-white/10 backdrop-blur">
                  <Calendar className="w-4 h-4 mr-2" />
                  สัปดาห์นี้
                </Button>
              </Link>
              <Link to="/events?location=online">
                <Button variant="outline" className="border-white/20 text-black dark:text-white hover:bg-white/10 backdrop-blur">
                  <MapPin className="w-4 h-4 mr-2" />
                  อีเว้นท์ออนไลน์
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-light/20 rounded-full blur-xl" />
      </section>

      <div className="container py-16 space-y-20">
        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6 hover-lift border-0 bg-gradient-card shadow-soft">
                <CardContent className="space-y-3">
                  <div className={cn("w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-white to-muted flex items-center justify-center", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Agent Section */}
        <section className="space-y-8">
          <Card className="border-0 bg-gradient-to-br from-primary/5 via-primary-light/5 to-transparent shadow-soft overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    <Badge className="bg-gradient-to-r from-primary to-primary-light text-white border-0">
                      <Bot className="w-4 h-4 mr-2" />
                      AI Assistant
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    ผู้ช่วย AI สำหรับการจองตั๋ว
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    ใช้ผู้ช่วย AI ที่ชาญฉลาดของเราเพื่อค้นหาและจองอีเว้นท์ได้อย่างง่ายดาย 
                    เพียงแค่พิมพ์ "จองให้หน่อย" หรือชื่ออีเว้นท์ที่ต้องการ AI จะช่วยแนะนำและจัดการการจองให้คุณแบบครบวงจร
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 border border-white/20">
                      <MessageCircle className="w-8 h-8 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">สนทนาธรรมชาติ</h4>
                        <p className="text-xs text-muted-foreground">พูดคุยเหมือนกับคนจริง</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 border border-white/20">
                      <Zap className="w-8 h-8 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">จองได้ทันที</h4>
                        <p className="text-xs text-muted-foreground">ไม่ต้องค้นหาเอง</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 border border-white/20">
                      <Bot className="w-8 h-8 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">แนะนำส่วนตัว</h4>
                        <p className="text-xs text-muted-foreground">เหมาะกับความชอบ</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span className="font-medium">ลองพิมพ์:</span>
                      <Badge variant="outline" className="text-xs">"จองให้หน่อย"</Badge>
                      <Badge variant="outline" className="text-xs">"จอง concert"</Badge>
                      <Badge variant="outline" className="text-xs">"หาอีเว้นท์ tech"</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-xl">
                      <Bot className="w-16 h-16 md:w-20 md:h-20 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Categories */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Badge variant="outline" className="text-primary border-primary/20">
                <TrendingUp className="w-4 h-4 mr-2" />
                หมวดหมู่ยอดนิยม
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">หมวดหมู่อีเว้นท์</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              เลือกหมวดหมู่ที่คุณสนใจ จากอีเว้นท์คุณภาพที่คัดสรรมาเป็นพิเศษ
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-xl loading-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.id} to={`/events?categories=${category.id}`}>
                  <Card className="group hover-lift text-center p-6 h-full border-0 bg-gradient-card shadow-soft hover:shadow-glow transition-all duration-300">
                    <CardContent className="space-y-3">
                      <div
                        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured Events */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className="text-primary border-primary/20">
                  <Star className="w-4 h-4 mr-2" />
                  แนะนำพิเศษ
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">อีเว้นท์แนะนำ</h2>
              <p className="text-muted-foreground">
                อีเว้นท์ยอดนิยมที่ไม่ควรพลาด คัดสรรโดยทีมงานเฉพาะ
              </p>
            </div>
            <Button asChild variant="outline" className="hover:bg-primary hover:text-primary-foreground">
              <Link to="/events?featured=true">
                ดูทั้งหมด
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <EventGridSkeleton count={6} />
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 6).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  variant="featured" 
                  bookedTicketsCount={bookedTicketsCounts[event.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              ไม่มีอีเว้นท์แนะนำในขณะนี้
            </div>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className="text-primary border-primary/20">
                  <Calendar className="w-4 h-4 mr-2" />
                  เพิ่งเปิดจอง
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">อีเว้นท์ที่กำลังจะมาถึง</h2>
              <p className="text-muted-foreground">
                อีเว้นท์ใหม่ล่าสุดที่เปิดให้จองแล้ว รีบจองก่อนหมด!
              </p>
            </div>
            <Button asChild variant="outline" className="hover:bg-primary hover:text-primary-foreground">
              <Link to="/events">
                ดูทั้งหมด
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <EventGridSkeleton count={8} />
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 8).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  bookedTicketsCount={bookedTicketsCounts[event.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              ไม่มีอีเว้นท์ใหม่ในขณะนี้
            </div>
          )}
        </section>
      </div>

      {/* CTA Section - Full Width */}
      <section className="relative">
        <Card className="border-0 bg-gradient-hero text-white overflow-hidden rounded-none">
          <div className="absolute inset-0 bg-black/20" />
          <CardContent className="relative p-12 md:p-16 text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                พร้อมจัดอีเว้นท์ของคุณแล้วหรือยัง?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                เข้าร่วมเป็นผู้จัดอีเว้นท์กับเรา และเข้าถึงผู้เข้าร่วมงานหลักพันคน
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="border-white/20 text-black dark:text-white hover:bg-white/10">
                เรียนรู้เพิ่มเติม
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}