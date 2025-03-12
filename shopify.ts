import { createStorefrontClient } from '@shopify/hydrogen';

const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function shopifyQuery(query: string, variables = {}) {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
        throw new Error('Missing required Shopify configuration. Please check your environment variables.');
    }

    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }

    const data = await response.json();
    console.log("Shopify API Response:", JSON.stringify(data, null, 2));

    if (data.errors) {
        throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
}

interface LineItem {
  id: string;
  quantity: number;
}

export async function createShopifyCheckout(items: LineItem[]) {
  try {
    console.group('Creating Shopify Cart');
    console.log('Input Items:', JSON.stringify(items, null, 2));

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('No items provided for cart');
    }

    const invalidItems = items.filter(item => !item.id || item.quantity <= 0);
    if (invalidItems.length > 0) {
      throw new Error('Invalid line items detected');
    }

    // Convert IDs to Shopify Global IDs
    const lines = items.map(item => ({
      merchandiseId: btoa(`gid://shopify/ProductVariant/${item.id}`),
      quantity: item.quantity
    }));

    const query = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: { lines }
    };

    console.log('Cart Creation Variables:', JSON.stringify(variables, null, 2));

    const result = await shopifyQuery(query, variables);
    console.log('Cart Creation Result:', JSON.stringify(result, null, 2));

    if (result?.cartCreate?.userErrors?.length > 0) {
      const errors = result.cartCreate.userErrors;
      throw new Error(`Cart creation failed: ${errors[0].message}`);
    }

    if (!result?.cartCreate?.cart) {
      throw new Error('Cart creation failed: No cart returned');
    }

    const cart = result.cartCreate.cart;
    console.log('Cart created successfully:', cart);

    return {
      id: cart.id,
      webUrl: cart.checkoutUrl
    };
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  } finally {
    console.groupEnd();
  }
}