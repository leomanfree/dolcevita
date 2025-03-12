import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Bitcoin, ShoppingCart, AlertCircle, Loader2, X, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { createShopifyCheckout } from '../lib/shopify';

interface NavigationProps {
  scrollY: number;
  connectionStatus: 'connecting' | 'connected' | 'error';
}

export function Navigation({ scrollY, connectionStatus }: NavigationProps) {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const items = useCartStore(state => state.items);
  const clearCart = useCartStore(state => state.clearCart);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    console.group('Checkout Process');
    
    if (!items.length) {
      const error = 'Your cart is empty';
      console.error(error);
      setCheckoutError(error);
      console.groupEnd();
      return;
    }

    try {
      setIsProcessing(true);
      setCheckoutError(null);
      
      console.log('Starting checkout with items:', JSON.stringify(items, null, 2));
      
      const checkout = await createShopifyCheckout(items);
      console.log('Checkout response:', JSON.stringify(checkout, null, 2));
      
      if (!checkout?.webUrl) {
        const error = 'Checkout Error: No checkout URL available';
        console.error(error, checkout);
        throw new Error(error);
      }

      console.log('Redirecting to checkout URL:', checkout.webUrl);
      window.location.href = checkout.webUrl;
      clearCart();
    } catch (error) {
      console.error('Checkout Error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        items
      });
      
      setCheckoutError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during checkout'
      );
    } finally {
      setIsProcessing(false);
      console.groupEnd();
    }
  };

  return (
    <>
      {/* Crypto Banner */}
      <div className="bg-dolce-gold/5 text-dolce-gold py-2.5 px-4 text-center text-sm backdrop-blur-[2px] relative z-50 banner-grain">
        <p className="flex items-center justify-center gap-2">
          <Bitcoin className="w-4 h-4" /> We accept crypto payments | BTC, ETH, USDC, & more
        </p>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <Sun 
                className="h-8 w-8 text-dolce-gold sun-icon transition-all duration-500"
                style={{ 
                  opacity: Math.max(0.6, 1 - scrollY / 300),
                  filter: 'drop-shadow(0 0 20px rgba(255, 228, 77, 0.4))'
                }}
              />
              <span className="ml-3 text-xl font-baskerville font-bold text-white flex items-center gap-3">
                DOLCEVITA
                <svg width="24" height="27" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto opacity-80">
                  <path d="M1.33561 5.99482C1.67255 5.84761 1.90802 5.51142 1.90802 5.12023C1.90802 4.59336 1.4809 4.16626 0.954016 4.16626C0.427124 4.16626 0 4.59336 0 5.12023C0 5.51142 0.235467 5.8476 0.572406 5.99481V22.9488C0.572406 23.0834 0.681527 23.1925 0.816176 23.1925H1.09186C1.22651 23.1925 1.33561 23.0834 1.33561 22.9488V5.99482Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.7556 18.2276C5.83001 18.2276 4.22033 18.3979 2.70303 18.6585C2.5533 18.6842 2.4159 18.5693 2.4159 18.4174V6.02258C2.4159 5.89978 2.50697 5.79619 2.62876 5.78051L2.92743 5.74184C4.36154 5.55563 6.1278 5.32631 8.41751 5.32631C10.3978 5.32631 12.0256 5.50603 13.4653 5.66499C14.6068 5.791 15.6301 5.90398 16.6169 5.90398C18.7146 5.90398 20.2298 5.81891 21.6678 5.64877C21.8136 5.63152 21.9423 5.74495 21.9423 5.89173V18.3219C21.9423 18.4357 21.864 18.5346 21.7519 18.5536C20.7623 18.7213 18.4318 18.8052 16.6169 18.8052C15.7532 18.8052 14.7061 18.6912 13.5421 18.5645L13.54 18.5643C12.0843 18.4059 10.4461 18.2276 8.7556 18.2276ZM12.8894 8.55273V11.3774C14.154 11.5152 14.8417 11.5841 15.7712 11.5841V13.3171C14.913 13.3171 14.0549 13.2483 12.8894 13.1104V15.9729C12.4768 15.8977 12.2059 15.8596 11.9867 15.8287L11.9854 15.8285C11.7603 15.7968 11.5897 15.7727 11.3757 15.724C11.3646 15.4832 11.3622 14.2912 11.3635 12.937C10.2032 12.8357 9.21665 12.8357 8.67073 12.8357V11.1654C8.76291 11.1654 8.85653 11.1653 8.95165 11.1651C9.6642 11.1639 10.4618 11.1626 11.3665 11.2265C11.3702 9.71393 11.3757 8.40691 11.3757 8.40691C11.7984 8.40691 12.8894 8.55273 12.8894 8.55273Z" fill="currentColor"/>
                </svg>
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/products" className="text-sm text-white hover:text-dolce-gold transition-colors font-baskerville">Shop</Link>
              <Link to="/experiences" className="text-sm text-white hover:text-dolce-gold transition-colors font-baskerville">Experiences at NS</Link>
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-dolce-gold/20">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-dolce-gold' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-xs text-dolce-gold/90 font-baskerville whitespace-nowrap">
                  {connectionStatus === 'connected' ? 
                    'Store connected' :
                    connectionStatus === 'connecting' ? 
                    'Connecting to store...' :
                    'Connection error'
                  }
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-white hover:text-dolce-gold transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dolce-gold text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-black/95 shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-baskerville text-dolce-gold">Shopping Cart</h2>
                {!isProcessing && (
                  <button onClick={() => setIsCartOpen(false)} className="text-white/60 hover:text-white">
                    <span className="sr-only">Close cart</span>
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
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: item.currency,
                            }).format(item.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              disabled={isProcessing}
                              onClick={() => useCartStore.getState().updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-white/60 hover:text-white disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white">{item.quantity}</span>
                            <button
                              disabled={isProcessing}
                              onClick={() => useCartStore.getState().updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-white/60 hover:text-white disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              disabled={isProcessing}
                              onClick={() => useCartStore.getState().removeItem(item.id)}
                              className="ml-auto text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t border-white/10 p-4">
                  <div className="flex justify-between text-lg font-baskerville mb-4">
                    <span className="text-white">Total</span>
                    <span className="text-dolce-gold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: items[0].currency,
                      }).format(useCartStore.getState().total())}
                    </span>
                  </div>
                  {checkoutError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{checkoutError}</span>
                    </div>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full px-6 py-3 bg-dolce-gold text-black font-baskerville hover:bg-dolce-gold/90 transition-colors rounded disabled:opacity-50 flex items-center justify-center gap-2"
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