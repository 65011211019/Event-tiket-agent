// Omise Payment Integration with Hardcoded Keys
import { OmiseToken, OmiseCharge, PaymentResponse, OmiseCard } from '@/types/payment';
import { PaymentRequest } from '@/types/payment';

// Hardcoded Omise Test Keys
const OMISE_PUBLIC_KEY = 'pkey_test_64zgvmt7z87s4rw0kp7';
const OMISE_SECRET_KEY = 'skey_test_64zgvmtqln4ol2lxzyj';

// Log configuration
console.log('🔑 Omise Configuration:');
console.log('Public Key:', OMISE_PUBLIC_KEY);
console.log('Secret Key:', OMISE_SECRET_KEY);
console.log('Environment:', import.meta.env.MODE);
console.log('Backend URL: https://payment-omise.onrender.com');

class OmiseError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'OmiseError';
  }
}

// Card validation
function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'Visa';
  if (cleaned.startsWith('5')) return 'MasterCard';
  if (cleaned.startsWith('3')) return 'American Express';
  return 'Unknown';
}

// Create Omise token using Omise.js
export async function createOmiseToken(cardData: {
  name: string;
  number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
}): Promise<OmiseToken> {
  console.log('🔄 Creating Omise Token...');
  console.log('Card Data:', {
    name: cardData.name,
    number: '************' + cardData.number.slice(-4),
    expiration_month: cardData.expiration_month,
    expiration_year: cardData.expiration_year,
    security_code: '***'
  });

  return new Promise((resolve, reject) => {
    // Load Omise.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.omise.co/omise.js';
    script.onload = () => {
      if (window.Omise) {
        window.Omise.setPublicKey(OMISE_PUBLIC_KEY);
        
        window.Omise.createToken('card', {
          'name': cardData.name,
          'number': cardData.number,
          'expiration_month': cardData.expiration_month,
          'expiration_year': cardData.expiration_year,
          'security_code': cardData.security_code
        }, (statusCode: number, response: any) => {
          if (statusCode === 200) {
            console.log('✅ Token created successfully:', {
              id: response.id,
              card_brand: response.card.brand,
              last_digits: response.card.last_digits,
              created_at: response.created_at
            });
            resolve(response);
          } else {
            console.error('❌ Token creation failed:', response);
            reject(new OmiseError(response.code || 'TOKEN_CREATE_FAILED', response.message || 'Failed to create token'));
          }
        });
      } else {
        reject(new OmiseError('SCRIPT_LOAD_FAILED', 'Failed to load Omise.js'));
      }
    };
    script.onerror = () => {
      reject(new OmiseError('SCRIPT_LOAD_FAILED', 'Failed to load Omise.js'));
    };
    document.head.appendChild(script);
  });
}

// Create Omise charge - use real backend
export async function createOmiseCharge(paymentData: PaymentRequest, cardData?: {
  name: string;
  number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
}): Promise<PaymentResponse> {
  console.log('💳 Creating Omise Charge...');
  console.log('Payment Data:', paymentData);

  try {
    // Create token first - use provided card data or default test card
    const token = await createOmiseToken(cardData || {
      name: paymentData.metadata.customerName,
      number: '4242424242424242', // Test card
      expiration_month: 12,
      expiration_year: 2025,
      security_code: '123'
    });

    console.log('🔄 Processing payment...');
    
    // Use real backend
    const response = await fetch('https://payment-omise.onrender.com/api/payment/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        metadata: paymentData.metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new OmiseError(error.error?.code || 'CHARGE_CREATE_FAILED', error.error?.message || 'Failed to create charge');
    }

    const result = await response.json();
    
    if (result.success && result.charge) {
      console.log('✅ Payment successful!', {
        charge_id: result.charge.id,
        amount: result.charge.amount,
        currency: result.charge.currency,
        status: result.charge.status,
        card_brand: result.charge.card?.brand,
        last_digits: result.charge.card?.last_digits,
        paid_at: result.charge.paid_at
      });
      
      return {
        success: true,
        charge: result.charge
      };
    } else {
      console.error('❌ Payment failed:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Payment failed:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

// Declare global Omise
declare global {
  interface Window {
    Omise: any;
  }
}
