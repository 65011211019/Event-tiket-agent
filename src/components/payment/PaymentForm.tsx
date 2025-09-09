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
import { useLanguage } from '@/contexts/AppContext';

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
  const { t } = useLanguage();

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
      newErrors.cardName = t('paymentComponents.paymentForm.cardName.required');
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = t('paymentComponents.paymentForm.cardNumber.required');
    } else {
      const cleaned = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) {
        newErrors.cardNumber = t('paymentComponents.paymentForm.cardNumber.invalid');
      }
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = t('paymentComponents.paymentForm.expiry.month.required');
    } else {
      const month = parseInt(formData.expiryMonth);
      if (month < 1 || month > 12) {
        newErrors.expiryMonth = t('paymentComponents.paymentForm.expiry.month.invalid');
      }
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = t('paymentComponents.paymentForm.expiry.year.required');
    } else {
      const year = parseInt(formData.expiryYear);
      const currentYear = new Date().getFullYear();
      if (year < currentYear || year > currentYear + 10) {
        newErrors.expiryYear = t('paymentComponents.paymentForm.expiry.year.invalid');
      }
    }

    if (!formData.securityCode.trim()) {
      newErrors.securityCode = t('paymentComponents.paymentForm.securityCode.required');
    } else if (!/^\d{3,4}$/.test(formData.securityCode)) {
      newErrors.securityCode = t('paymentComponents.paymentForm.securityCode.invalid');
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
      onPaymentError(t('paymentComponents.paymentForm.errors.minAmount'));
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
          {t('paymentComponents.paymentForm.title')}
        </CardTitle>
        <CardDescription>
          {t('paymentComponents.paymentForm.amount')}: {amount.toLocaleString()} {currency}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" data-payment-form>
          <div className="space-y-2">
            <Label htmlFor="cardName">{t('paymentComponents.paymentForm.cardName.label')}</Label>
            <Input
              id="cardName"
              type="text"
              value={formData.cardName}
              onChange={(e) => handleInputChange('cardName', e.target.value)}
              placeholder={t('paymentComponents.paymentForm.cardName.placeholder')}
              className={errors.cardName ? 'border-red-500' : ''}
            />
            {errors.cardName && (
              <p className="text-sm text-red-500">{errors.cardName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">{t('paymentComponents.paymentForm.cardNumber.label')}</Label>
            <Input
              id="cardNumber"
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder={t('paymentComponents.paymentForm.cardNumber.placeholder')}
              className={errors.cardNumber ? 'border-red-500' : ''}
            />
            {errors.cardNumber && (
              <p className="text-sm text-red-500">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">{t('paymentComponents.paymentForm.expiry.month.label')}</Label>
              <select
                id="expiryMonth"
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                  errors.expiryMonth ? 'border-red-500' : 'border-input'
                }`}
              >
                <option value="">{t('paymentComponents.paymentForm.expiry.month.placeholder')}</option>
                {monthOptions}
              </select>
              {errors.expiryMonth && (
                <p className="text-sm text-red-500">{errors.expiryMonth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryYear">{t('paymentComponents.paymentForm.expiry.year.label')}</Label>
              <select
                id="expiryYear"
                value={formData.expiryYear}
                onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                  errors.expiryYear ? 'border-red-500' : 'border-input'
                }`}
              >
                <option value="">{t('paymentComponents.paymentForm.expiry.year.placeholder')}</option>
                {yearOptions}
              </select>
              {errors.expiryYear && (
                <p className="text-sm text-red-500">{errors.expiryYear}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityCode">{t('paymentComponents.paymentForm.securityCode.label')}</Label>
            <Input
              id="securityCode"
              type="text"
              value={formData.securityCode}
              onChange={(e) => handleInputChange('securityCode', e.target.value)}
              placeholder={t('paymentComponents.paymentForm.securityCode.placeholder')}
              className={errors.securityCode ? 'border-red-500' : ''}
            />
            {errors.securityCode && (
              <p className="text-sm text-red-500">{errors.securityCode}</p>
            )}
          </div>

          <Alert>
            <AlertDescription>
              <strong>{t('paymentComponents.paymentForm.notes.title')}:</strong> {t('paymentComponents.paymentForm.notes.testCard')}
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
                {t('paymentComponents.paymentForm.buttons.processing')}
              </>
            ) : (
              `${t('paymentComponents.paymentForm.buttons.pay')} ${amount.toLocaleString()} ${currency}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
