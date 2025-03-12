import { loadCBPaySDK } from '@coinbase/cbpay-js';
import { loadStripe } from '@stripe/stripe-js';
import { shopifyQuery } from './shopify';

// Initialize payment SDKs
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const cbPayPromise = loadCBPaySDK();

export async function createShopifyCheckout(items: any[]) {
  const lineItems = items.map(item => ({
    variantId: item.id,
    quantity: item.quantity,
  }));

  const checkoutData = await shopifyQuery(`
    mutation createCheckout($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `, {
    input: {
      lineItems,
      allowPartialAddresses: true,
    },
  });

  return checkoutData.checkoutCreate.checkout;
}

export async function handleCardPayment(items: any[]) {
  try {
    // Create Shopify checkout
    const checkout = await createShopifyCheckout(items);
    
    // Redirect to Shopify checkout
    window.location.href = checkout.webUrl;
  } catch (error) {
    console.error('Error processing card payment:', error);
    throw error;
  }
}

export async function handleCryptoPayment(items: any[]) {
  try {
    const cbPay = await cbPayPromise;
    
    // Calculate total in USD
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const paymentConfig = {
      appId: import.meta.env.VITE_COINBASE_APP_ID,
      metadata: {
        orderId: Date.now().toString(),
      },
      onPaymentDetected: (event: any) => {
        console.log('Payment detected:', event);
      },
      onPaymentConfirmed: async (event: any) => {
        console.log('Payment confirmed:', event);
        // Clear cart and redirect to success page
        window.location.href = '/payment-success';
      },
      onModalClosed: () => {
        console.log('Modal closed');
      },
    };

    await cbPay.showPaymentDialog({
      ...paymentConfig,
      amount: total.toString(),
      currency: 'USD',
    });
  } catch (error) {
    console.error('Error processing crypto payment:', error);
    throw error;
  }
}