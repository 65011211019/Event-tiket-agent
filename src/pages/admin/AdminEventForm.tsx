import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, MapPin, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { eventApi } from '@/lib/api';
import { uploadToCloudinary } from '@/lib/cloudinary'; // Import the Cloudinary utility
import { Event, EventLocation } from '@/types/event';
import { toast } from '@/hooks/use-toast';
import MapSelector from '@/components/maps/MapSelector';

export default function AdminEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isLoading, setIsLoading] = React.useState(isEdit);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedEvent, setSavedEvent] = React.useState<Event | null>(null); // Track the saved event

  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const [previewImages, setPreviewImages] = React.useState<{banner: string, thumbnail: string}>({banner: '', thumbnail: ''});
  const bannerFileRef = React.useRef<File | null>(null);
  const thumbnailFileRef = React.useRef<File | null>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);


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
          
          // Clear file refs and preview images when loading existing event
          bannerFileRef.current = null;
          thumbnailFileRef.current = null;
          setPreviewImages({banner: '', thumbnail: ''});
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

  // Handle image file selection (store file temporarily, don't upload yet)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'banner' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Store the actual file in a ref for later upload
    if (imageType === 'banner') {
      bannerFileRef.current = file;
    } else if (imageType === 'thumbnail') {
      thumbnailFileRef.current = file;
    }
    
    // Show preview of selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImages({
        ...previewImages,
        [imageType]: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
    
    toast({
      title: "เลือกรูปภาพแล้ว",
      description: `รูปภาพ ${imageType === 'banner' ? 'แบนเนอร์' : 'ย่อ'} ถูกเลือกแล้ว ระบบจะอัปโหลดเมื่อบันทึกอีเว้นท์`,
    });
  };

  // Handle removing an image before upload
  const handleRemoveImage = (imageType: 'banner' | 'thumbnail') => {
    // Clear the file ref
    if (imageType === 'banner') {
      bannerFileRef.current = null;
    } else if (imageType === 'thumbnail') {
      thumbnailFileRef.current = null;
    }
    
    // Clear preview
    setPreviewImages({
      ...previewImages,
      [imageType]: ''
    });
    
    // Also clear the URL from formData if it exists
    setFormData({
      ...formData,
      images: {
        ...formData.images,
        [imageType]: ''
      }
    });
    
    // Clear the file input field
    if (imageType === 'banner' && bannerInputRef.current) {
      bannerInputRef.current.value = '';
    } else if (imageType === 'thumbnail' && thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
    
    toast({
      title: "ลบรูปภาพสำเร็จ",
      description: `รูปภาพ ${imageType === 'banner' ? 'แบนเนอร์' : 'ย่อ'} ได้ถูกลบแล้ว`,
    });
  };

  // Upload images to Cloudinary
  const uploadImagesToCloudinary = async () => {
    // Start with existing image URLs
    const uploadedImages = { ...formData.images };
    
    try {
      // Upload banner image if selected
      if (bannerFileRef.current) {
        const bannerUrl = await uploadToCloudinary(bannerFileRef.current);
        uploadedImages.banner = bannerUrl;
      }
      
      // Upload thumbnail image if selected
      if (thumbnailFileRef.current) {
        const thumbnailUrl = await uploadToCloudinary(thumbnailFileRef.current);
        uploadedImages.thumbnail = thumbnailUrl;
      }
      
      return uploadedImages;
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปโหลดรูปภาพได้",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Modify handleSubmit to upload images when saving event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 📝 Log ข้อมูลก่อนบันทึก
    console.log('📦 ข้อมูลอีเว้นท์ที่จะบันทึก:', JSON.stringify(formData, null, 2));
    console.log('🗺️ พิกัดที่เลือก:', formData.location.coordinates);
    
    try {
      setIsSaving(true);
      
      // Upload images to Cloudinary first
      const imagesWithUrls = await uploadImagesToCloudinary();
      
      // Update formData with image URLs
      const formDataWithImages = {
        ...formData,
        images: imagesWithUrls
      };
      
      if (isEdit && id) {
        const updatedEvent = await eventApi.updateEvent(id, formDataWithImages);
        setSavedEvent(updatedEvent);
        toast({
          title: "อัปเดตอีเว้นท์สำเร็จ",
          description: "ข้อมูลอีเว้นท์ได้รับการอัปเดตแล้ว",
        });
        navigate('/admin/events');
      } else {
        const createdEvent = await eventApi.createEvent(formDataWithImages);
        setSavedEvent(createdEvent);
        toast({
          title: "สร้างอีเว้นท์สำเร็จ",
          description: "อีเว้นท์ใหม่ได้ถูกสร้างแล้ว",
        });
        // Navigate back to events list after successful creation
        navigate('/admin/events', { 
          state: { 
            alert: {
              title: "สร้างอีเว้นท์สำเร็จ",
              description: "อีเว้นท์ใหม่ได้ถูกสร้างแล้ว"
            }
          } 
        });
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

  // จัดการการเปลี่ยนแปลงพิกัดจากแผนที่
  const handleCoordinatesChange = (coords: { lat: number; lng: number }) => {
    console.log('🗺️ อัปเดตพิกัดใหม่:', coords);
    setFormData({ 
      ...formData, 
      location: { 
        ...formData.location, 
        coordinates: coords 
      }
    });
  };

  // ฟังก์ชันดึงตำแหน่งปัจจุบัน
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "ไม่รองรับ",
        description: "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 ตำแหน่งปัจจุบัน:', { lat: latitude, lng: longitude });
        
        handleCoordinatesChange({ lat: latitude, lng: longitude });
        
        toast({
          title: "ดึงตำแหน่งสำเร็จ",
          description: `พิกัดปัจจุบัน: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงตำแหน่ง:', error);
        let errorMessage = "ไม่สามารถดึงตำแหน่งได้";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "ผู้ใช้ปฏิเสธการขอสิทธิ์เข้าถึงตำแหน่ง";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "ข้อมูลตำแหน่งไม่พร้อมใช้งาน";
            break;
          case error.TIMEOUT:
            errorMessage = "หมดเวลาในการดึงตำแหน่ง";
            break;
        }
        
        toast({
          title: "เกิดข้อผิดพลาด",
          description: errorMessage,
          variant: "destructive",
        });
        
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // ฟังก์ชันค้นหาสถานที่
  const searchPlaces = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "กรุณากรอกข้อมูล",
        description: "กรุณาใส่ชื่อสถานที่ที่ต้องการค้นหา",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // ใช้ Nominatim API ของ OpenStreetMap
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=th&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const results = await response.json();
      console.log('🔍 ผลการค้นหา:', results);
      
      if (results.length === 0) {
        toast({
          title: "ไม่พบผลการค้นหา",
          description: "ลองใช้คำค้นหาอื่นหรือเพิ่มรายละเอียด เช่น ชื่อเมือง",
        });
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการค้นหา:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาสถานที่ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // เลือกสถานที่จากผลการค้นหา
  const selectPlace = (place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    
    handleCoordinatesChange({ lat, lng });
    
    // อัปเดตข้อมูลสถานที่และที่อยู่ถ้ามี
    const placeName = place.display_name.split(',')[0]; // เอาชื่อแรกเป็นชื่อสถานที่
    
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        coordinates: { lat, lng },
        venue: formData.location.venue || placeName,
        address: formData.location.address || place.display_name
      }
    });
    
    // ล้างผลการค้นหา
    setSearchResults([]);
    setSearchQuery('');
    
    toast({
      title: "เลือกสถานที่สำเร็จ",
      description: `ตำแหน่ง: ${placeName}`,
    });
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
    <div className="min-h-screen bg-background">
      <div className="container py-8 pt-24"> {/* Add top padding to avoid navbar overlap */}
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
                  
                  {/* Map Selector สำหรับเลือกตำแหน่ง */}
                  <div className="space-y-4">
                    <Label>📍 เลือกตำแหน่งบนแผนที่</Label>
                    
                    {/* ปุ่มช่วยเหลือ */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex-1 min-w-0"
                      >
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        {isGettingLocation ? 'กำลังดึงตำแหน่ง...' : 'ดึงตำแหน่งปัจจุบัน'}
                      </Button>
                      
                      <div className="flex-1 min-w-0 flex gap-2">
                        <Input
                          placeholder="ค้นหาสถานที่ เช่น สยามพารากอน, MBK"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
                          className="flex-1 min-w-0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={searchPlaces}
                          disabled={isSearching || !searchQuery.trim()}
                          className="flex-shrink-0"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* ผลการค้นหา */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">ผลการค้นหา (คลิกเพื่อเลือก):</Label>
                        <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                          {searchResults.map((place, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectPlace(place)}
                              className="w-full text-left p-2 hover:bg-muted rounded text-sm border-b last:border-b-0 transition-colors"
                            >
                              <div className="font-medium truncate">{place.display_name.split(',')[0]}</div>
                              <div className="text-xs text-muted-foreground truncate">{place.display_name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <MapSelector
                      coordinates={formData.location.coordinates}
                      onCoordinatesChange={handleCoordinatesChange}
                      height="350px"
                    />
                    
                    {/* แสดงพิกัดปัจจุบัน */}
                    {formData.location.coordinates.lat !== 0 && formData.location.coordinates.lng !== 0 && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="space-y-1">
                          <Label className="text-sm text-blue-700 dark:text-blue-300">ละติจูด (Latitude)</Label>
                          <Input
                            value={formData.location.coordinates.lat.toFixed(6)}
                            readOnly
                            className="bg-white dark:bg-gray-900 text-sm font-mono border-blue-200 dark:border-blue-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm text-blue-700 dark:text-blue-300">ลองติจูด (Longitude)</Label>
                          <Input
                            value={formData.location.coordinates.lng.toFixed(6)}
                            readOnly
                            className="bg-white dark:bg-gray-900 text-sm font-mono border-blue-200 dark:border-blue-700"
                          />
                        </div>
                      </div>
                    )}
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
                <div className="flex items-center space-x-4">
                  <Input
                    id="bannerImage"
                    type="url"
                    value={formData.images.banner}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      images: { ...formData.images, banner: e.target.value }
                    })}
                    placeholder="https://example.com/banner.jpg"
                    className="flex-1"
                  />
                  <Input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'banner')}
                    className="w-1/3"
                  />
                  {(previewImages.banner || formData.images.banner) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveImage('banner')}
                      className="h-10 w-10"
                    >
                      <span className="text-lg">✕</span>
                    </Button>
                  )}
                </div>
                {(previewImages.banner || formData.images.banner) && (
                  <div className="mt-2 relative">
                    <img 
                      src={previewImages.banner || formData.images.banner} 
                      alt="Banner preview" 
                      className="h-32 w-full object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveImage('banner')}
                      className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white"
                    >
                      <span className="text-lg">✕</span>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnailImage">รูปย่อ</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="thumbnailImage"
                    type="url"
                    value={formData.images.thumbnail}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      images: { ...formData.images, thumbnail: e.target.value }
                    })}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="flex-1"
                  />
                  <Input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'thumbnail')}
                    className="w-1/3"
                  />
                  {(previewImages.thumbnail || formData.images.thumbnail) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveImage('thumbnail')}
                      className="h-10 w-10"
                    >
                      <span className="text-lg">✕</span>
                    </Button>
                  )}
                </div>
                {(previewImages.thumbnail || formData.images.thumbnail) && (
                  <div className="mt-2 relative">
                    <img 
                      src={previewImages.thumbnail || formData.images.thumbnail} 
                      alt="Thumbnail preview" 
                      className="h-20 w-20 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveImage('thumbnail')}
                      className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                    >
                      <span className="text-sm">✕</span>
                    </Button>
                  </div>
                )}
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
    </div>
  );
}