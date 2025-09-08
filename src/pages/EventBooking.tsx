import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, CreditCard, User, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eventApi } from '@/lib/api';
import { Event, BookingRequest } from '@/types/event';
import { useAuth, useLanguage } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import PaymentForm from '@/components/payment/PaymentForm';

interface TicketSelection {
  type: string;
  label: string;
  price: number;
  quantity: number;
}

export default function EventBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [event, setEvent] = React.useState<Event | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ticketSelections, setTicketSelections] = React.useState<TicketSelection[]>([]);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [chargeId, setChargeId] = React.useState<string | null>(null);

  // Form data
  const [formData, setFormData] = React.useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    specialRequests: '',
  });

  // Get available ticket types from event pricing
  const getTicketTypes = () => {
    if (!event?.pricing) return [];
    
    const types = [];
    const pricing = event.pricing;
    
    if (pricing.earlyBird) types.push({ type: 'earlyBird', name: 'Early Bird', price: pricing.earlyBird });
    if (pricing.regular) types.push({ type: 'regular', name: 'Regular', price: pricing.regular });
    if (pricing.student) types.push({ type: 'student', name: 'Student', price: pricing.student });
    if (pricing.group) types.push({ type: 'group', name: 'Group', price: pricing.group });
    if (pricing.vip) types.push({ type: 'vip', name: 'VIP', price: pricing.vip });
    if (pricing.premium) types.push({ type: 'premium', name: 'Premium', price: pricing.premium });
    if (pricing.general) types.push({ type: 'general', name: 'General', price: pricing.general });
    if (pricing.fullMarathon) types.push({ type: 'fullMarathon', name: 'Full Marathon', price: pricing.fullMarathon });
    if (pricing.halfMarathon) types.push({ type: 'halfMarathon', name: 'Half Marathon', price: pricing.halfMarathon });
    if (pricing.miniMarathon) types.push({ type: 'miniMarathon', name: 'Mini Marathon', price: pricing.miniMarathon });
    if (pricing.funRun) types.push({ type: 'funRun', name: 'Fun Run', price: pricing.funRun });
    if (pricing.adult) types.push({ type: 'adult', name: 'Adult', price: pricing.adult });
    if (pricing.child) types.push({ type: 'child', name: 'Child', price: pricing.child });
    if (pricing.senior) types.push({ type: 'senior', name: 'Senior', price: pricing.senior });
    if (pricing.member) types.push({ type: 'member', name: 'Member', price: pricing.member });
    if (pricing.free !== undefined) types.push({ type: 'free', name: 'Free', price: pricing.free });
    
    return types;
  };

  React.useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const eventData = await eventApi.getEvent(id);
        setEvent(eventData);

        // Initialize ticket selections
        const prices = Object.entries(eventData.pricing)
          .filter(([key, value]) => key !== 'currency' && typeof value === 'number')
          .map(([key, value]) => ({
            type: key,
            label: getPriceLabel(key),
            price: value as number,
            quantity: 0,
          }));
        
        setTicketSelections(prices);
      } catch (err) {
        console.error('Failed to load event:', err);
        setError('ไม่พบอีเว้นท์ที่ต้องการ');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const getPriceLabel = (key: string) => {
    const labels: Record<string, string> = {
      earlyBird: 'Early Bird',
      regular: 'ราคาปกติ',
      student: 'นักเรียน/นักศึกษา',
      group: 'กลุ่ม',
      vip: 'VIP',
      premium: 'Premium',
      general: 'ทั่วไป',
      fullMarathon: 'Full Marathon',
      halfMarathon: 'Half Marathon',
      miniMarathon: 'Mini Marathon',
      funRun: 'Fun Run',
      adult: 'ผู้ใหญ่',
      child: 'เด็ก',
      senior: 'ผู้สูงอายุ',
      free: 'ฟรี',
      member: 'สมาชิก',
    };
    return labels[key] || key;
  };

  const updateTicketQuantity = (index: number, change: number) => {
    const newSelections = [...ticketSelections];
    const newQuantity = Math.max(0, newSelections[index].quantity + change);
    
    // Check availability
    const totalSelected = ticketSelections.reduce((sum, ticket, i) => 
      sum + (i === index ? newQuantity : ticket.quantity), 0
    );
    
    if (event && totalSelected <= event.capacity.available) {
      newSelections[index].quantity = newQuantity;
      setTicketSelections(newSelections);
    } else {
      toast({
        title: "ไม่สามารถเพิ่มตั๋วได้",
        description: "จำนวนตั๋วที่เลือกเกินจำนวนที่เหลือ",
        variant: "destructive",
      });
    }
  };

  const getTotalTickets = () => {
    return ticketSelections.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const getTotalPrice = () => {
    return ticketSelections.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
  };

  const getSelectedTickets = () => {
    return ticketSelections.filter(ticket => ticket.quantity > 0).map(ticket => ({
      type: ticket.type,
      label: ticket.label,
      quantity: ticket.quantity,
      price: ticket.price
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const selectedTickets = getSelectedTickets();
      if (selectedTickets.length === 0) {
        toast({
          title: "กรุณาเลือกตั๋ว",
          description: "กรุณาเลือกประเภทและจำนวนตั๋วที่ต้องการ",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast({
          title: "กรุณากรอกข้อมูลให้ครบถ้วน",
          description: "กรุณากรอกชื่อ นามสกุล และอีเมล",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const handlePaymentSuccess = async (paymentChargeId: string) => {
    console.log('🎉 Payment Success Handler Called');
    console.log('Charge ID:', paymentChargeId);
    console.log('User:', user);
    console.log('Event:', event);
    console.log('Event ID:', id);
    
    if (!id) {
      console.error('❌ Event ID is missing');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่พบรหัสอีเว้นท์ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      return;
    }
    
    setChargeId(paymentChargeId);
    setPaymentSuccess(true);
    
    try {
      const selectedTickets = getSelectedTickets();
      console.log('Selected Tickets:', selectedTickets);
      
      const bookingRequest: BookingRequest = {
        eventId: id,
        holder: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        },
        tickets: selectedTickets.map(ticket => ({
          type: ticket.type,
          quantity: ticket.quantity,
          price: ticket.price
        })),
        totalAmount: selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0),
        currency: 'THB',
        notes: `จองตั๋วงาน ${event?.title} ผ่านระบบออนไลน์ - Charge ID: ${paymentChargeId}`
      };

      console.log('📤 Creating booking request:', bookingRequest);
      
      const bookingResponse = await eventApi.createBooking(bookingRequest);
      console.log('✅ Booking created successfully:', bookingResponse);
      
      toast({
        title: "จองสำเร็จ!",
        description: "การจองตั๋วของคุณเสร็จสิ้นแล้ว",
      });
      
      // Navigate to tickets page
      navigate('/my-tickets');
      
    } catch (error) {
      console.error('❌ Booking creation failed:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างการจองได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('💥 Payment Error:', error);
    toast({
      title: "การชำระเงินล้มเหลว",
      description: error,
      variant: "destructive",
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "กรุณาเข้าสู่ระบบก่อนทำการจองตั๋ว",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedTickets = getSelectedTickets();
      
      const bookingRequest: BookingRequest = {
         eventId: event.id,
         tickets: selectedTickets.map(ticket => ({
           type: ticket.type,
           quantity: ticket.quantity,
           price: ticket.price
         })),
         holder: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone
          },
          totalAmount: getTotalPrice(),
          currency: event.pricing?.currency || 'THB',
          notes: `จองตั๋วงาน ${event.title} ผ่านระบบออนไลน์`
       };
      
      await eventApi.createBooking(bookingRequest);

      toast({
        title: "จองตั๋วสำเร็จ!",
        description: "ตั๋วของคุณได้ถูกจองแล้ว คุณจะได้รับอีเมลยืนยันเร็วๆ นี้",
      });

      navigate('/my-tickets');
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถจองตั๋วได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-8 w-48 bg-muted rounded loading-shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-muted rounded-lg loading-shimmer" />
            <div className="h-64 bg-muted rounded-lg loading-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertDescription className="flex items-center justify-between">
            <span>{error || 'ไม่พบอีเว้นท์ที่ต้องการ'}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
              กลับไปหน้ารายการ
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold">จองตั๋ว</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
              <span className={`ml-2 ${step <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step === 1 && 'เลือกตั๋ว'}
                {step === 2 && 'กรอกข้อมูล'}
                {step === 3 && 'ยืนยันการจอง'}
                {step === 4 && 'ชำระเงิน'}
              </span>
              {step < 4 && <div className="w-8 h-px bg-border mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Ticket Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>เลือกประเภทตั๋ว</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketSelections.map((ticket, index) => (
                    <div
                      key={ticket.type}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{ticket.label}</div>
                        <div className="text-lg font-bold text-primary">
                          ฿{ticket.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketQuantity(index, -1)}
                          disabled={ticket.quantity === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {ticket.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketQuantity(index, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {getTotalTickets() === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      กรุณาเลือกประเภทและจำนวนตั๋วที่ต้องการ
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Customer Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลผู้จอง</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">ชื่อ *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="ชื่อ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">นามสกุล *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="นามสกุล"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="อีเมล"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">ข้อกำหนดพิเศษ</Label>
                    <Input
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      placeholder="ข้อกำหนดหรือคำขออื่นๆ (ถ้ามี)"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>ยืนยันการจอง</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Info */}
                  <div>
                    <h4 className="font-semibold mb-2">ข้อมูลอีเว้นท์</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>{event.title}</div>
                      <div>{new Date(event.schedule.startDate).toLocaleDateString('th-TH')}</div>
                      <div>{event.location.venue || 'ออนไลน์'}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold mb-2">ข้อมูลผู้จอง</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>{formData.firstName} {formData.lastName}</div>
                      <div>{formData.email}</div>
                      {formData.phone && <div>{formData.phone}</div>}
                    </div>
                  </div>

                  <Separator />

                  {/* Selected Tickets */}
                  <div>
                    <h4 className="font-semibold mb-2">ตั๋วที่เลือก</h4>
                    <div className="space-y-2">
                      {getSelectedTickets().map((ticket, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{ticket.label} x {ticket.quantity}</span>
                          <span>฿{(ticket.price * ticket.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <Alert>
                    <AlertDescription>
                      การจองตั๋วนี้เป็นการยืนยันว่าคุณยอมรับเงื่อนไขการใช้งานและนโยบายการคืนเงิน
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Payment Step */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {paymentSuccess ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">ชำระเงินสำเร็จ!</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        การชำระเงินของคุณเสร็จสิ้นแล้ว กำลังสร้างการจอง...
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <PaymentForm
                    amount={getSelectedTickets().reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0)}
                    currency="THB"
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    isLoading={isSubmitting}
                    eventId={id!}
                    customerName={`${formData.firstName} ${formData.lastName}`}
                    customerEmail={formData.email}
                    customerPhone={formData.phone}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Info */}
                <div className="space-y-2">
                  <div className="font-semibold text-sm">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.schedule.startDate).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <Separator />

                {/* Selected Tickets */}
                {getSelectedTickets().length > 0 ? (
                  <div className="space-y-2">
                    {getSelectedTickets().map((ticket, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{ticket.label} x {ticket.quantity}</span>
                        <span>฿{(ticket.price * ticket.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    ยังไม่ได้เลือกตั๋ว
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between font-semibold">
                  <span>รวมทั้งสิ้น</span>
                  <span className="text-primary">฿{getTotalPrice().toLocaleString()}</span>
                </div>

                {/* Action Button */}
                <div className="space-y-2">
                  {currentStep < 4 ? (
                    <Button 
                      onClick={handleNext}
                      className="w-full"
                      disabled={currentStep === 1 && getTotalTickets() === 0}
                    >
                      {currentStep === 1 ? 'ต่อไป' : currentStep === 2 ? 'ยืนยันข้อมูล' : 'ชำระเงิน'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        // Trigger payment form submission
                        const paymentForm = document.querySelector('form[data-payment-form]') as HTMLFormElement;
                        if (paymentForm) {
                          paymentForm.requestSubmit();
                        }
                      }}
                      className="w-full bg-gradient-primary"
                      disabled={isSubmitting}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'กำลังจอง...' : 'ชำระเงิน'}
                    </Button>
                  )}

                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handleBack} className="w-full">
                      กลับ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}