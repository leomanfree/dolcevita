import { shopifyQuery, createShopifyCheckout } from './lib/shopify';

async function testCheckout() {
  console.group('Checkout Flow Test');
  
  try {
    // First, query for a real product variant
    console.log('Fetching available product variants...');
    
    const productsData = await shopifyQuery(`
      query {
        products(first: 1) {
          edges {
            node {
              title
              handle
              variants(first: 1) {
                edges {
                  node {
                    id
                    sku
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `);

    const firstProduct = productsData.products.edges[0]?.node;
    const firstVariant = firstProduct?.variants.edges[0]?.node;

    if (!firstVariant) {
      throw new Error('No product variants found in the store');
    }

    if (!firstVariant.availableForSale) {
      throw new Error(`Product variant ${firstVariant.id} is not available for sale`);
    }

    console.log('Found product:', {
      title: firstProduct.title,
      handle: firstProduct.handle,
      variantId: firstVariant.id,
      sku: firstVariant.sku,
      price: firstVariant.price,
      availableForSale: firstVariant.availableForSale
    });

    // Extract the numeric ID from the global ID
    const matches = firstVariant.id.match(/gid:\/\/shopify\/ProductVariant\/(\d+)/);
    if (!matches) {
      throw new Error('Invalid variant ID format: ' + firstVariant.id);
    }
    const numericId = matches[1];

    // Test item for checkout
    const testItem = {
      id: numericId,
      quantity: 1
    };

    console.log('Creating checkout with item:', testItem);

    // Test checkout creation
    const checkout = await createShopifyCheckout([testItem]);
    console.log('Checkout Result:', {
      id: checkout.id,
      webUrl: checkout.webUrl,
      // Redact any sensitive information
      ...checkout.userErrors && { userErrors: checkout.userErrors }
    });

    if (checkout.webUrl) {
      console.log('Success! Checkout URL:', checkout.webUrl);
    } else {
      throw new Error('No checkout URL in response');
    }
  } catch (error) {
    console.error('Test Failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  } finally {
    console.groupEnd();
  }
}

// Run the test
testCheckout();