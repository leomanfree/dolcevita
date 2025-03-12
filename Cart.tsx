import React from 'react';
import { ShoppingCart, X, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { createShopifyCheckout } from '../lib/shopify';

interface CheckoutError {
  message: string;
  type: 'error' | 'warning';
  details?: string[];
}

export function Cart() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<CheckoutError | null>(null);
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

  console.log("Cart Items Debug:", items);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleCheckout = async () => {
    if (!items.length) {
      setCheckoutError({
        type: 'warning',
        message: 'Your cart is empty',
      });
      return;
    }

    console.log("Cart Items Debug:", items);

    try {
      setIsProcessing(true);
      setCheckoutError(null);

      const lines = items.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity
      }));

      const response = await fetch("https://nsdolcevita.xyz/api/2023-10/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": "IL_TUO_TOKEN"
        },
        body: JSON.stringify({
          query: `mutation cartCreate($input: CartInput!) { 
                      cartCreate(input: $input) { 
                          cart { id checkoutUrl } 
                          userErrors { field message } 
                      } 
                  }`,
          variables: { input: { lines } }
        })
      });

      const data = await response.json();
      console.log("🔥 Full API Response:", JSON.stringify(data, null, 2));

      if (data.data.cartCreate.cart && data.data.cartCreate.cart.checkoutUrl) {
        console.log("✅ Redirecting to:", data.data.cartCreate.cart.checkoutUrl);
        window.location.href = data.data.cartCreate.cart.checkoutUrl;
        clearCart();
      } else {
        console.error("❌ Checkout creation failed:", data);
        setCheckoutError({
          type: 'error',
          message: 'No checkout returned',
          details: data.data.cartCreate.userErrors
        });
      }
    } catch (error) {
      console.error("🚨 API Error:", error);
      setCheckoutError({
        type: 'error',
        message: 'Failed to create checkout',
        details: [error instanceof Error ? error.message : 'An unexpected error occurred']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-white hover:text-dolce-gold transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-dolce-gold text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-black/95 shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-baskerville text-dolce-gold">Shopping Cart</h2>
                {!isProcessing && (
                  <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="text-center text-white/60 mt-8">
                    Your cart is empty
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-white/5 p-4 rounded-lg">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-baskerville text-white">{item.title}</h3>
                          <p className="text-dolce-gold">
                            {formatPrice(item.price, item.currency)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              disabled={isProcessing}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-white/60 hover:text-white disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white">{item.quantity}</span>
                            <button
                              disabled={isProcessing}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-white/60 hover:text-white disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              disabled={isProcessing}
                              onClick={() => removeItem(item.id)}
                              className="ml-auto text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-white/10 p-4 space-y-4">
                  <div className="flex justify-between text-lg font-baskerville">
                    <span className="text-white">Total</span>
                    <span className="text-dolce-gold">{formatPrice(total(), items[0]?.currency || 'USD')}</span>
                  </div>

                  {checkoutError && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${
                      checkoutError.type === 'error' 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                    }`}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium">{checkoutError.message}</p>
                        {checkoutError.details && checkoutError.details.length > 0 && (
                          <ul className="text-sm space-y-1 opacity-90">
                            {checkoutError.details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    disabled={isProcessing}
                    onClick={handleCheckout}
                    className="w-full px-6 py-3 bg-dolce-gold text-black font-baskerville hover:bg-dolce-gold/90 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating checkout...
                      </>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}