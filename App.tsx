import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Products } from './pages/Products';
import { ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { shopifyQuery } from './lib/shopify';

interface Product {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  };
}

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const data = await shopifyQuery(`
        query {
          products(first: 4) {
            edges {
              node {
                id
                title
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      `);
      
      const shopifyProducts = data.products.edges.map((edge: any) => edge.node);
      setProducts(shopifyProducts);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching products:', error);
      setConnectionStatus('error');
    }
  };

  const formatPrice = (amount: string, currencyCode: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(parseFloat(amount));
  };

  useEffect(() => {
    setIsLoaded(true);
    fetchProducts();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="relative min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
          <div className="relative min-h-screen flex items-center">
            {/* Floating Chef Card */}
            <div className="absolute right-[55%] top-1/3 -translate-y-1/2 w-[320px] h-[400px] transform -rotate-12 animate-float md:block hidden">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80"
                  alt="Italian Experience"
                  className="w-full h-full object-cover object-center brightness-[0.6]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent"></div>
                <div className="grain-overlay image-grain"></div>
              </div>
            </div>

            {/* Floating Olive Oil Card */}
            <div className="absolute right-[20%] top-[45%] -translate-y-1/2 w-[280px] h-[360px] transform rotate-12 animate-float-delayed md:block hidden">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80"
                  alt="Extra Virgin Olive Oil"
                  className="w-full h-full object-cover object-center brightness-[0.6]"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/90 to-transparent"></div>
                <div className="grain-overlay image-grain"></div>
              </div>
            </div>

            {/* Content */}
            <div className={`relative z-10 max-w-xl transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-baskerville text-dolce-gold mb-4 leading-tight drop-shadow-[0_0_20px_rgba(255,228,77,0.2)]">
                Taste the Italian<br />Dolce Vita
              </h1>
              <h2 className="text-lg sm:text-xl lg:text-2xl text-dolce-cream mb-6 font-baskerville">— No Passport Required</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-10 font-baskerville max-w-lg">
                Discover our carefully curated selection of authentic Italian & Mediterranean delicacies
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/products"
                  className="group px-6 py-2.5 bg-dolce-gold/20 text-dolce-gold font-baskerville text-base hover:bg-dolce-gold/30 transition-all flex items-center gap-2 border border-dolce-gold/40 shadow-[0_0_40px_rgba(255,228,77,0.2)]"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group px-6 py-2.5 bg-white/5 text-white font-baskerville text-base hover:bg-white/10 transition-all flex items-center gap-2 border border-white/20">
                  Experiences at NS
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <section id="featured-products" className="relative py-24 bg-black/40">
        <div className="absolute inset-0 grain-bg opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-baskerville text-dolce-gold mb-4">Featured Products</h2>
            <p className="text-dolce-cream/80 font-baskerville max-w-2xl mx-auto">
              Discover our selection of authentic Italian delicacies, carefully curated to bring the true taste of Italy to your table
            </p>
          </div>

          {connectionStatus === 'connecting' ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-dolce-gold animate-spin" />
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="text-center text-red-500">
              Failed to load products. Please try again later.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {products.map((product) => (
                  <div key={product.id} className="group relative bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-500">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={product.images.edges[0]?.node.url}
                        alt={product.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="grain-overlay"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-baskerville mb-2">{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-dolce-gold font-baskerville text-lg">
                          {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
                        </p>
                        <Link
                          to={`/products?product=${product.handle}`}
                          className="px-6 py-2 bg-dolce-gold/20 text-dolce-gold font-baskerville hover:bg-dolce-gold/30 transition-all border border-dolce-gold/40 rounded group-hover:bg-dolce-gold/40 flex items-center gap-2"
                        >
                          Shop Now
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link 
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 text-white font-baskerville hover:bg-white/10 transition-all border border-white/20 rounded-lg group"
                >
                  View All Products
                  <ExternalLink className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);

    // Test store connection
    shopifyQuery(`
      query {
        shop {
          name
        }
      }
    `)
      .then(() => setConnectionStatus('connected'))
      .catch(() => setConnectionStatus('error'));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dolce-dark text-white relative">
      <div className="grain-bg"></div>
      <ErrorBoundary>
        <Navigation scrollY={scrollY} connectionStatus={connectionStatus} />
      </ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </div>
  );
}

export default App;