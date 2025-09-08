import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createOmiseCharge } from '@/lib/omise';
import { PaymentRequest } from '@/types/payment';
import { PaymentFormData } from '@/types/payment';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onPaymentSuccess: (chargeId: string) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
  eventId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function PaymentForm({
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  isLoading = false,
  eventId,
  customerName,
  customerEmail,
  customerPhone
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    securityCode: ''
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'ชื่อบนบัตรจำเป็น';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'หมายเลขบัตรจำเป็น';
    } else {
      const cleaned = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) {
        newErrors.cardNumber = 'หมายเลขบัตรไม่ถูกต้อง';
      }
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'เดือนหมดอายุจำเป็น';
    } else {
      const month = parseInt(formData.expiryMonth);
      if (month < 1 || month > 12) {
        newErrors.expiryMonth = 'เดือนไม่ถูกต้อง';
      }
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = 'ปีหมดอายุจำเป็น';
    } else {
      const year = parseInt(formData.expiryYear);
      const currentYear = new Date().getFullYear();
      if (year < currentYear || year > currentYear + 10) {
        newErrors.expiryYear = 'ปีไม่ถูกต้อง';
      }
    }

    if (!formData.securityCode.trim()) {
      newErrors.securityCode = 'รหัสความปลอดภัยจำเป็น';
    } else if (!/^\d{3,4}$/.test(formData.securityCode)) {
      newErrors.securityCode = 'รหัสความปลอดภัยไม่ถูกต้อง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let processedValue = value;

    if (field === 'cardNumber') {
      processedValue = formatCardNumber(value);
    } else if (field === 'securityCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'expiryMonth' || field === 'expiryYear') {
      processedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Payment Form Submitted');
    console.log('Form Data:', {
      cardName: formData.cardName,
      cardNumber: '************' + formData.cardNumber.slice(-4),
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      securityCode: '***'
    });

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    // Check minimum amount (20 THB = 2000 satang)
    if (amount < 20) {
      onPaymentError('จำนวนเงินขั้นต่ำคือ 20 บาท');
      return;
    }

    console.log('✅ Form validation passed');

    setIsProcessing(true);

    try {
      const paymentRequest: PaymentRequest = {
        amount: amount * 100, // Convert to satang (1 THB = 100 satang)
        currency: currency,
        description: `Event Ticket Payment - ${eventId}`,
        metadata: {
          eventId,
          customerName,
          customerEmail,
          customerPhone
        }
      };

      console.log('📤 Sending payment request:', paymentRequest);

      // Prepare card data for Omise
      const cardData = {
        name: formData.cardName,
        number: formData.cardNumber.replace(/\s/g, ''), // Remove spaces
        expiration_month: parseInt(formData.expiryMonth),
        expiration_year: parseInt(formData.expiryYear),
        security_code: formData.securityCode
      };

      console.log('💳 Card Data for Omise:', {
        name: cardData.name,
        number: '************' + cardData.number.slice(-4),
        expiration_month: cardData.expiration_month,
        expiration_year: cardData.expiration_year,
        security_code: '***'
      });

      const result = await createOmiseCharge(paymentRequest, cardData);

      if (result.success && result.charge) {
        console.log('🎉 Payment completed successfully!');
        onPaymentSuccess(result.charge.id);
      } else {
        console.log('💥 Payment failed:', result.error);
        onPaymentError(result.error?.message || 'Payment failed');
      }
    } catch (error) {
      console.error('💥 Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return (
      <option key={month} value={month.toString().padStart(2, '0')}>
        {month.toString().padStart(2, '0')}
      </option>
    );
  });

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          ชำระเงิน
        </CardTitle>
        <CardDescription>
          จำนวนเงิน: {amount.toLocaleString()} {currency}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" data-payment-form>
          <div className="space-y-2">
            <Label htmlFor="cardName">ชื่อบนบัตร</Label>
            <Input
              id="cardName"
              type="text"
              value={formData.cardName}
              onChange={(e) => handleInputChange('cardName', e.target.value)}
              placeholder="ชื่อ-นามสกุล"
              className={errors.cardName ? 'border-red-500' : ''}
            />
            {errors.cardName && (
              <p className="text-sm text-red-500">{errors.cardName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">หมายเลขบัตร</Label>
            <Input
              id="cardNumber"
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              className={errors.cardNumber ? 'border-red-500' : ''}
            />
            {errors.cardNumber && (
              <p className="text-sm text-red-500">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">เดือน</Label>
              <select
                id="expiryMonth"
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                  errors.expiryMonth ? 'border-red-500' : 'border-input'
                }`}
              >
                <option value="">เลือกเดือน</option>
                {monthOptions}
              </select>
              {errors.expiryMonth && (
                <p className="text-sm text-red-500">{errors.expiryMonth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryYear">ปี</Label>
              <select
                id="expiryYear"
                value={formData.expiryYear}
                onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                  errors.expiryYear ? 'border-red-500' : 'border-input'
                }`}
              >
                <option value="">เลือกปี</option>
                {yearOptions}
              </select>
              {errors.expiryYear && (
                <p className="text-sm text-red-500">{errors.expiryYear}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityCode">รหัสความปลอดภัย (CVV)</Label>
            <Input
              id="securityCode"
              type="text"
              value={formData.securityCode}
              onChange={(e) => handleInputChange('securityCode', e.target.value)}
              placeholder="123"
              className={errors.securityCode ? 'border-red-500' : ''}
            />
            {errors.securityCode && (
              <p className="text-sm text-red-500">{errors.securityCode}</p>
            )}
          </div>

          <Alert>
            <AlertDescription>
              <strong>หมายเหตุ:</strong> ระบบนี้ใช้บัตรทดสอบ ใช้หมายเลข 4242 4242 4242 4242
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || isLoading}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังประมวลผล...
              </>
            ) : (
              `ชำระเงิน ${amount.toLocaleString()} ${currency}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
