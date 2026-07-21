(async () => {
  const storeUrl = "https://darkorange-newt-323940.hostingersite.com";
  
  // Test endpoint 1: get cart
  console.log("Testing GET cart/items to get Nonce:");
  try {
    const res1 = await fetch(`${storeUrl}/wp-json/wc/store/v1/cart`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log("Status:", res1.status);
    console.log("Nonce Header:", res1.headers.get('nonce'));
    console.log("Cart-Token Header:", res1.headers.get('cart-token'));
    
    const nonce = res1.headers.get('nonce');
    const cartToken = res1.headers.get('cart-token');

    if (nonce) {
      console.log("\nTesting cart/add-item with Nonce:");
      const res2 = await fetch(`${storeUrl}/wp-json/wc/store/v1/cart/add-item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Nonce': nonce,
          'Cart-Token': cartToken || ''
        },
        body: JSON.stringify({ id: 25, quantity: 1 }) // replace 25 with any id
      });
      console.log("Status:", res2.status);
      console.log("Body:", await res2.text());
    }

  } catch (e) {
    console.error(e);
  }
})();
