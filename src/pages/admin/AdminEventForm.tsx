import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { eventApi } from '@/lib/api';
import { Event, EventLocation } from '@/types/event';
import { toast } from '@/hooks/use-toast';

export default function AdminEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isLoading, setIsLoading] = React.useState(isEdit);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedEvent, setSavedEvent] = React.useState<Event | null>(null); // Track the saved event

  const [formData, setFormData] = React.useState<{
    title: string;
    description: string;
    category: string;
    type: string;
    status: string;
    featured: boolean;
    organizer: {
      name: string;
      contact: string;
      phone: string;
    };
    schedule: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      timezone: string;
    };
    location: EventLocation;
    pricing: {
      currency: string;
      earlyBird?: number;
      regular: number;
      student?: number;
      group?: number;
    };
    capacity: {
      max: number;
      registered: number;
      available: number;
    };
    images: {
      banner: string;
      thumbnail: string;
      gallery: string[];
    };
    tags: string[];
  }>({
    title: '',
    description: '',
    category: '',
    type: '',
    status: 'active',
    featured: false,
    organizer: {
      name: '',
      contact: '',
      phone: ''
    },
    schedule: {
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      timezone: 'Asia/Bangkok'
    },
    location: {
      type: 'onsite' as EventLocation['type'],
      venue: '',
      address: '',
      coordinates: { lat: 0, lng: 0 },
      onlineLink: ''
    },
    pricing: {
      currency: 'THB',
      earlyBird: undefined,
      regular: 0,
      student: undefined,
      group: undefined
    },
    capacity: {
      max: 100,
      registered: 0,
      available: 100
    },
    images: {
      banner: '',
      thumbnail: '',
      gallery: []
    },
    tags: []
  });

  React.useEffect(() => {
    if (isEdit && id) {
      const loadEvent = async () => {
        try {
          const event = await eventApi.getEvent(id);
          setFormData({
            title: event.title || '',
            description: event.description || '',
            category: event.category || '',
            type: event.type || '',
            status: event.status || 'active',
            featured: event.featured || false,
            organizer: event.organizer || { name: '', contact: '', phone: '' },
            schedule: event.schedule || { startDate: '', endDate: '', startTime: '', endTime: '', timezone: 'Asia/Bangkok' },
            location: {
              type: event.location?.type || 'onsite',
              venue: event.location?.venue || '',
              address: event.location?.address || '',
              coordinates: event.location?.coordinates || { lat: 0, lng: 0 },
              onlineLink: event.location?.onlineLink || ''
            },
            pricing: {
              currency: event.pricing?.currency || 'THB',
              earlyBird: event.pricing?.earlyBird,
              regular: event.pricing?.regular || 0,
              student: event.pricing?.student,
              group: event.pricing?.group
            },
            capacity: event.capacity || { max: 100, registered: 0, available: 100 },
            images: {
              banner: event.images?.banner || '',
              thumbnail: event.images?.thumbnail || '',
              gallery: event.images?.gallery || []
            },
            tags: event.tags || []
          });
        } catch (error) {
          console.error('Failed to load event:', error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลอีเว้นท์ได้",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadEvent();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      if (isEdit && id) {
        const updatedEvent = await eventApi.updateEvent(id, formData);
        setSavedEvent(updatedEvent);
        toast({
          title: "อัปเดตอีเว้นท์สำเร็จ",
          description: "ข้อมูลอีเว้นท์ได้รับการอัปเดตแล้ว",
        });
        navigate('/admin/events');
      } else {
        const createdEvent = await eventApi.createEvent(formData);
        setSavedEvent(createdEvent);
        toast({
          title: "สร้างอีเว้นท์สำเร็จ",
          description: "อีเว้นท์ใหม่ได้ถูกสร้างแล้ว คุณสามารถดูตัวอย่างได้โดยคลิกปุ่ม \"ดูตัวอย่างหน้าหลัก\"",
        });
        // Stay on the page to show the preview button
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (savedEvent?.id) {
      window.open(`/events/${savedEvent.id}`, '_blank');
    }
  };

  const handleBackToList = () => {
    navigate('/admin/events');
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-8 w-48 bg-muted rounded loading-shimmer" />
          <div className="h-96 bg-muted rounded-lg loading-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToList}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? 'แก้ไขอีเว้นท์' : 'สร้างอีเว้นท์ใหม่'}
            </h1>
            <p className="text-muted-foreground">
              กรอกข้อมูลอีเว้นท์ให้ครบถ้วน
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่ออีเว้นท์ *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">หมวดหมู่ *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop & Training</SelectItem>
                      <SelectItem value="conference">Conference & Seminar</SelectItem>
                      <SelectItem value="networking">Networking Event</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="sports">Sports & Fitness</SelectItem>
                      <SelectItem value="cultural">Cultural Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">ประเภท</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="เช่น workshop, conference"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, featured: !!checked })
                  }
                />
                <Label htmlFor="featured">อีเว้นท์แนะนำ</Label>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Information */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลผู้จัดงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizerName">ชื่อผู้จัดงาน *</Label>
                <Input
                  id="organizerName"
                  value={formData.organizer.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    organizer: { ...formData.organizer, name: e.target.value }
                  })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizerContact">อีเมล</Label>
                  <Input
                    id="organizerContact"
                    type="email"
                    value={formData.organizer.contact}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      organizer: { ...formData.organizer, contact: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizerPhone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="organizerPhone"
                    value={formData.organizer.phone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      organizer: { ...formData.organizer, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle>กำหนดการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">วันที่เริ่ม *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.schedule.startDate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { ...formData.schedule, startDate: e.target.value }
                    })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.schedule.endDate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { ...formData.schedule, endDate: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">เวลาเริ่ม *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.schedule.startTime}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { ...formData.schedule, startTime: e.target.value }
                    })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.schedule.endTime}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { ...formData.schedule, endTime: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>สถานที่จัดงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locationType">รูปแบบงาน *</Label>
                <Select
                  value={formData.location.type}
                  onValueChange={(value: 'onsite' | 'online' | 'hybrid') => 
                    setFormData({ 
                      ...formData, 
                      location: { ...formData.location, type: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกรูปแบบงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">งานที่สถานที่จริง</SelectItem>
                    <SelectItem value="online">งานออนไลน์</SelectItem>
                    <SelectItem value="hybrid">งานแบบผสม</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(formData.location.type === 'onsite' || formData.location.type === 'hybrid') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="venue">สถานที่ *</Label>
                    <Input
                      id="venue"
                      value={formData.location.venue}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, venue: e.target.value }
                      })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">ที่อยู่</Label>
                    <Textarea
                      id="address"
                      value={formData.location.address}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, address: e.target.value }
                      })}
                      rows={2}
                    />
                  </div>
                </>
              )}
              
              {(formData.location.type === 'online' || formData.location.type === 'hybrid') && (
                <div className="space-y-2">
                  <Label htmlFor="onlineLink">ลิงก์ออนไลน์</Label>
                  <Input
                    id="onlineLink"
                    type="url"
                    value={formData.location.onlineLink}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, onlineLink: e.target.value }
                    })}
                    placeholder="https://zoom.us/j/example123"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle>ราคาตั๋ว</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="earlyBirdPrice">ราคา Early Bird (บาท)</Label>
                  <Input
                    id="earlyBirdPrice"
                    type="number"
                    min="0"
                    value={formData.pricing.earlyBird || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pricing: { ...formData.pricing, earlyBird: e.target.value ? Number(e.target.value) : undefined }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">ราคาปกติ (บาท) *</Label>
                  <Input
                    id="regularPrice"
                    type="number"
                    min="0"
                    value={formData.pricing.regular}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pricing: { ...formData.pricing, regular: Number(e.target.value) }
                    })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentPrice">ราคานักเรียน/นักศึกษา (บาท)</Label>
                  <Input
                    id="studentPrice"
                    type="number"
                    min="0"
                    value={formData.pricing.student || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pricing: { ...formData.pricing, student: e.target.value ? Number(e.target.value) : undefined }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="groupPrice">ราคากลุ่ม (บาท)</Label>
                  <Input
                    id="groupPrice"
                    type="number"
                    min="0"
                    value={formData.pricing.group || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pricing: { ...formData.pricing, group: e.target.value ? Number(e.target.value) : undefined }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Information */}
          <Card>
            <CardHeader>
              <CardTitle>จำนวนที่นั่ง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">จำนวนที่นั่งสูงสุด *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  value={formData.capacity.max}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    capacity: { 
                      ...formData.capacity, 
                      max: Number(e.target.value),
                      available: Number(e.target.value) - formData.capacity.registered
                    }
                  })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Images Information */}
          <Card>
            <CardHeader>
              <CardTitle>รูปภาพ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bannerImage">รูปแบนเนอร์</Label>
                <Input
                  id="bannerImage"
                  type="url"
                  value={formData.images.banner}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    images: { ...formData.images, banner: e.target.value }
                  })}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnailImage">รูปย่อ</Label>
                <Input
                  id="thumbnailImage"
                  type="url"
                  value={formData.images.thumbnail}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    images: { ...formData.images, thumbnail: e.target.value }
                  })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags Information */}
          <Card>
            <CardHeader>
              <CardTitle>แท็ก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">แท็ก (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  placeholder="digital marketing, workshop, online business"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleBackToList}>
              กลับไปรายการ
            </Button>
            {savedEvent && !isEdit && (
              <Button type="button" variant="outline" onClick={handlePreview}>
                ดูตัวอย่างหน้าหลัก
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'กำลังบันทึก...' : (isEdit ? 'อัปเดต' : 'สร้างอีเว้นท์')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}