// Payment types for Omise integration
export interface OmiseCard {
  id: string;
  name: string;
  last_digits: string;
  brand: string;
  expiration_month: number;
  expiration_year: number;
}

export interface OmiseToken {
  id: string;
  used: boolean;
  card: OmiseCard;
  created_at: string;
}

export interface OmiseCharge {
  id: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending';
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  paid_at: string | null;
  card: OmiseCard;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata: {
    eventId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  charge?: OmiseCharge;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaymentFormData {
  cardName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  securityCode: string;
}

export type PaymentMethod = 'credit_card';
