import React, { useEffect, useState } from 'react';
import { Loader2, Filter, Search, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { shopifyQuery } from '../lib/shopify';
import { useCartStore } from '../store/cartStore';

interface ProductVariant {
  id: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  collections: {
    edges: Array<{
      node: {
        title: string;
      };
    }>;
  };
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

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const addItem = useCartStore(state => state.addItem);

  const toggleDescription = (productId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    const firstVariant = product.variants.edges[0]?.node;
    if (!firstVariant) {
      console.error('No variant found for product:', product.title);
      return;
    }

    // Get the raw ID from the Shopify Global ID
    const matches = firstVariant.id.match(/gid:\/\/shopify\/ProductVariant\/(\d+)/);
    if (!matches) {
      console.error('Invalid variant ID format:', firstVariant.id);
      return;
    }

    const variantId = matches[1];
    console.log('Adding to cart:', {
      productTitle: product.title,
      variantId,
      originalId: firstVariant.id
    });

    addItem({
      id: variantId,
      title: product.title,
      price: parseFloat(firstVariant.price.amount),
      currency: firstVariant.price.currencyCode,
      quantity: 1,
      imageUrl: product.images.edges[0]?.node.url
    });
  };

  const fetchProducts = async () => {
    try {
      const data = await shopifyQuery(`
        query {
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
                description
                descriptionHtml
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                collections(first: 10) {
                  edges {
                    node {
                      title
                    }
                  }
                }
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
      
      const allCategories = shopifyProducts.flatMap((p: Product) => 
        p.collections.edges.map(edge => edge.node.title)
      );
      const uniqueCategories = Array.from(new Set(allCategories)).filter(Boolean);
      setCategories(uniqueCategories);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (amount: string, currencyCode: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(parseFloat(amount));
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.collections.edges.some(edge => edge.node.title === selectedCategory);
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 bg-black/40 p-8 rounded-lg backdrop-blur-sm">
          <h1 className="text-4xl font-baskerville text-dolce-gold mb-4 drop-shadow-[0_0_25px_rgba(255,228,77,0.2)]">
            Our Products
          </h1>
          <p className="text-white/90 font-baskerville text-lg">
            Explore our curated selection of authentic Italian delicacies
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-6 rounded-lg backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dolce-gold/60" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-dolce-gold/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-dolce-gold/40 font-baskerville"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-dolce-gold/60" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-dolce-gold/20 rounded-lg text-white focus:outline-none focus:border-dolce-gold/40 font-baskerville appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 bg-black/40 rounded-lg">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-dolce-gold animate-spin" />
              <p className="text-dolce-gold/80 font-baskerville">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-black/40 rounded-lg">
            <p className="text-red-400 font-baskerville">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group relative bg-black/40 rounded-lg overflow-hidden hover:bg-black/60 transition-all duration-500 backdrop-blur-sm">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={product.images.edges[0]?.node.url}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="grain-overlay"></div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-baskerville text-white mb-3 group-hover:text-dolce-gold transition-colors">
                      {product.title}
                    </h3>
                    <div className="relative">
                      <div 
                        className={`text-white/80 text-sm font-baskerville transition-all duration-300 ${
                          expandedDescriptions.has(product.id) ? '' : 'max-h-[4.5em] overflow-hidden'
                        }`}
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                      />
                      {(product.descriptionHtml || product.description) && (
                        <button
                          onClick={() => toggleDescription(product.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-dolce-gold/10 hover:bg-dolce-gold/20 text-dolce-gold border border-dolce-gold/30 rounded text-sm transition-all duration-300"
                        >
                          {expandedDescriptions.has(product.id) ? (
                            <>
                              Read Less
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Read More
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-dolce-gold font-baskerville text-lg">
                      {formatPrice(
                        product.variants.edges[0]?.node.price.amount || product.priceRange.minVariantPrice.amount,
                        product.variants.edges[0]?.node.price.currencyCode || product.priceRange.minVariantPrice.currencyCode
                      )}
                    </p>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-dolce-gold/20 text-dolce-gold font-baskerville hover:bg-dolce-gold/30 transition-all border border-dolce-gold/40 rounded group-hover:bg-dolce-gold/40"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}