import React from 'react';
import { Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { eventApi } from '@/lib/api';
import { Event, EventLocation } from '@/types/event';
import { toast } from '@/hooks/use-toast';

interface EditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: (updatedEvent: Event) => void;
}

export default function EditEventModal({ event, isOpen, onClose, onEventUpdated }: EditEventModalProps) {
  const [isSaving, setIsSaving] = React.useState(false);
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

  // Load event data when modal opens
  React.useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        type: event.type || '',
        status: event.status || 'active',
        featured: event.featured || false,
        organizer: {
          name: event.organizer?.name || '',
          contact: event.organizer?.contact || '',
          phone: event.organizer?.phone || ''
        },
        schedule: {
          startDate: event.schedule?.startDate || '',
          endDate: event.schedule?.endDate || '',
          startTime: event.schedule?.startTime || '',
          endTime: event.schedule?.endTime || '',
          timezone: event.schedule?.timezone || 'Asia/Bangkok'
        },
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
        capacity: {
          max: event.capacity?.max || 100,
          registered: event.capacity?.registered || 0,
          available: event.capacity?.available || 100
        },
        images: {
          banner: event.images?.banner || '',
          thumbnail: event.images?.thumbnail || '',
          gallery: event.images?.gallery || []
        },
        tags: event.tags || []
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setIsSaving(true);
    try {
      const updatedEvent = await eventApi.updateEvent(event.id, formData);
      onEventUpdated(updatedEvent);
      onClose();
      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตอีเว้นท์เรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตอีเว้นท์ได้',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as object),
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขอีเว้นท์</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ข้อมูลพื้นฐาน</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่ออีเว้นท์ *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่ *</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">การประชุม</SelectItem>
                    <SelectItem value="workshop">เวิร์กช็อป</SelectItem>
                    <SelectItem value="seminar">สัมมนา</SelectItem>
                    <SelectItem value="concert">คอนเสิร์ต</SelectItem>
                    <SelectItem value="exhibition">นิทรรศการ</SelectItem>
                    <SelectItem value="sports">กีฬา</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">ประเภท</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">ฟรี</SelectItem>
                    <SelectItem value="paid">เสียค่าใช้จ่าย</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">สถานะ</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">เปิดใช้งาน</SelectItem>
                    <SelectItem value="draft">ฉบับร่าง</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => updateFormData('featured', checked)}
                />
                <Label htmlFor="featured">อีเว้นท์แนะนำ</Label>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">กำหนดการ</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">วันที่เริ่ม *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.schedule.startDate}
                  onChange={(e) => updateNestedFormData('schedule', 'startDate', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.schedule.endDate}
                  onChange={(e) => updateNestedFormData('schedule', 'endDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">เวลาเริ่ม *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={(e) => updateNestedFormData('schedule', 'startTime', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={(e) => updateNestedFormData('schedule', 'endTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">สถานที่</h3>
            
            <div className="space-y-2">
              <Label htmlFor="locationType">ประเภทสถานที่</Label>
              <Select 
                value={formData.location.type} 
                onValueChange={(value) => updateNestedFormData('location', 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทสถานที่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">ที่สถานที่จริง</SelectItem>
                  <SelectItem value="online">ออนไลน์</SelectItem>
                  <SelectItem value="hybrid">ผสมผสาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(formData.location.type === 'onsite' || formData.location.type === 'hybrid') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">สถานที่</Label>
                  <Input
                    id="venue"
                    value={formData.location.venue}
                    onChange={(e) => updateNestedFormData('location', 'venue', e.target.value)}
                    placeholder="ชื่อสถานที่"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Input
                    id="address"
                    value={formData.location.address}
                    onChange={(e) => updateNestedFormData('location', 'address', e.target.value)}
                    placeholder="ที่อยู่สถานที่"
                  />
                </div>
              </div>
            )}
            
            {(formData.location.type === 'online' || formData.location.type === 'hybrid') && (
              <div className="space-y-2">
                <Label htmlFor="onlineLink">ลิงก์ออนไลน์</Label>
                <Input
                  id="onlineLink"
                  value={formData.location.onlineLink}
                  onChange={(e) => updateNestedFormData('location', 'onlineLink', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ราคา</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regularPrice">ราคาปกติ *</Label>
                <Input
                  id="regularPrice"
                  type="number"
                  min="0"
                  value={formData.pricing.regular}
                  onChange={(e) => updateNestedFormData('pricing', 'regular', Number(e.target.value))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="earlyBirdPrice">ราคา Early Bird</Label>
                <Input
                  id="earlyBirdPrice"
                  type="number"
                  min="0"
                  value={formData.pricing.earlyBird || ''}
                  onChange={(e) => updateNestedFormData('pricing', 'earlyBird', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentPrice">ราคานักเรียน/นักศึกษา</Label>
                <Input
                  id="studentPrice"
                  type="number"
                  min="0"
                  value={formData.pricing.student || ''}
                  onChange={(e) => updateNestedFormData('pricing', 'student', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="groupPrice">ราคากลุ่ม</Label>
                <Input
                  id="groupPrice"
                  type="number"
                  min="0"
                  value={formData.pricing.group || ''}
                  onChange={(e) => updateNestedFormData('pricing', 'group', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">จำนวนผู้เข้าร่วม</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">จำนวนสูงสุด *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  value={formData.capacity.max}
                  onChange={(e) => {
                    const max = Number(e.target.value);
                    updateNestedFormData('capacity', 'max', max);
                    updateNestedFormData('capacity', 'available', max - formData.capacity.registered);
                  }}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registered">ลงทะเบียนแล้ว</Label>
                <Input
                  id="registered"
                  type="number"
                  min="0"
                  value={formData.capacity.registered}
                  onChange={(e) => {
                    const registered = Number(e.target.value);
                    updateNestedFormData('capacity', 'registered', registered);
                    updateNestedFormData('capacity', 'available', formData.capacity.max - registered);
                  }}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="available">ที่ว่างอยู่</Label>
                <Input
                  id="available"
                  type="number"
                  value={formData.capacity.available}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ผู้จัดงาน</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizerName">ชื่อผู้จัด *</Label>
                <Input
                  id="organizerName"
                  value={formData.organizer.name}
                  onChange={(e) => updateNestedFormData('organizer', 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizerContact">อีเมล</Label>
                <Input
                  id="organizerContact"
                  type="email"
                  value={formData.organizer.contact}
                  onChange={(e) => updateNestedFormData('organizer', 'contact', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizerPhone">เบอร์โทร</Label>
                <Input
                  id="organizerPhone"
                  value={formData.organizer.phone}
                  onChange={(e) => updateNestedFormData('organizer', 'phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">รูปภาพ</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner">รูปแบนเนอร์</Label>
                <Input
                  id="banner"
                  value={formData.images.banner}
                  onChange={(e) => updateNestedFormData('images', 'banner', e.target.value)}
                  placeholder="URL รูปแบนเนอร์"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnail">รูปย่อ</Label>
                <Input
                  id="thumbnail"
                  value={formData.images.thumbnail}
                  onChange={(e) => updateNestedFormData('images', 'thumbnail', e.target.value)}
                  placeholder="URL รูปย่อ"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}