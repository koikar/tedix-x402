import { createUIResource } from "@mcp-ui/server";

// Mock Mansory merchandise data (matching existing data)
const MANSORY_MERCHANDISE = [
  {
    id: "hoodie-1",
    name: "MANSORY Hoodie",
    category: "hoodie",
    salePrice: 61.0,
    regularPrice: 95.0,
    savings: 34.0,
    colors: ["Arctic White", "Charles Blue", "Infinity black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Premium MANSORY hoodie with signature logo",
    inStock: true,
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0234/5678/products/mansory-hoodie-arctic-white.jpg",
  },
  {
    id: "hoodie-2",
    name: "Mansory Hoodie",
    category: "hoodie",
    salePrice: 41.0,
    regularPrice: 71.0,
    savings: 30.0,
    colors: ["Red", "Pink", "Orange"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Colorful Mansory hoodie collection",
    inStock: true,
    imageUrl: "https://cdn.shopify.com/s/files/1/0234/5678/products/mansory-hoodie-red.jpg",
  },
  {
    id: "hoodie-zip",
    name: "MANSORY Hoodie with ZIP",
    category: "hoodie",
    salePrice: 71.0,
    regularPrice: 99.0,
    savings: 28.0,
    colors: ["Arctic White", "Infinity black", "Charles Blue"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Premium zip-up MANSORY hoodie",
    inStock: true,
    imageUrl: "https://cdn.shopify.com/s/files/1/0234/5678/products/mansory-hoodie-zip.jpg",
  },
];

/**
 * Enhanced browse merchandise tool with interactive UI
 */
export function createBrowseMerchandiseUI() {
  return {
    name: "browse-merchandise-ui",
    description: "Browse Mansory merchandise with interactive product gallery",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "Search query (e.g., 'hoodie', 'red hoodie', 'size L', etc.)",
        },
        category: {
          type: "string" as const,
          description: "Filter by category (hoodie, t-shirt, jacket, etc.)",
        },
        color: {
          type: "string" as const,
          description: "Filter by color",
        },
        size: {
          type: "string" as const,
          description: "Filter by size",
        },
      },
      required: ["query"],
    },
    handler: async ({ query, category, color }: any) => {
      let results = [...MANSORY_MERCHANDISE];

      // Apply filters (same logic as original)
      if (category) {
        results = results.filter((item) =>
          item.category.toLowerCase().includes(category.toLowerCase()),
        );
      }

      if (query) {
        const searchTerm = query.toLowerCase();
        results = results.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.colors.some((c) => c.toLowerCase().includes(searchTerm)),
        );
      }

      if (color) {
        results = results.filter((item) =>
          item.colors.some((c) => c.toLowerCase().includes(color.toLowerCase())),
        );
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No merchandise found matching your search. Try searching for "hoodie", "t-shirt", or browse all products.`,
            },
          ],
        };
      }

      // Create interactive product gallery HTML
      const productGalleryHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MANSORY Boutique</title>
          <style>
            :root {
              --primary-color: #007bff;
              --success-color: #28a745;
              --warning-color: #ffc107;
              --danger-color: #dc3545;
              --dark-color: #343a40;
              --light-color: #f8f9fa;
              --border-color: #dee2e6;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }

            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }

            .header {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }

            .header h1 {
              font-size: 2.5rem;
              margin-bottom: 10px;
              font-weight: 700;
            }

            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
            }

            .products-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
              gap: 30px;
              padding: 40px;
            }

            .product-card {
              background: white;
              border-radius: 12px;
              box-shadow: 0 8px 25px rgba(0,0,0,0.08);
              overflow: hidden;
              transition: all 0.3s ease;
              border: 1px solid var(--border-color);
            }

            .product-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            }

            .product-image {
              height: 200px;
              background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 3rem;
              color: #999;
            }

            .product-info {
              padding: 25px;
            }

            .product-title {
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 8px;
              color: var(--dark-color);
            }

            .product-description {
              color: #666;
              margin-bottom: 15px;
              line-height: 1.5;
            }

            .price-section {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 15px;
            }

            .sale-price {
              font-size: 1.8rem;
              font-weight: 700;
              color: var(--success-color);
            }

            .regular-price {
              font-size: 1.2rem;
              text-decoration: line-through;
              color: #999;
            }

            .savings {
              background: var(--danger-color);
              color: white;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 0.85rem;
              font-weight: 500;
            }

            .colors-section {
              margin-bottom: 15px;
            }

            .colors-title {
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 8px;
              color: var(--dark-color);
            }

            .color-options {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }

            .color-chip {
              padding: 6px 12px;
              background: var(--light-color);
              border: 1px solid var(--border-color);
              border-radius: 20px;
              font-size: 0.85rem;
              color: var(--dark-color);
            }

            .sizes-section {
              margin-bottom: 20px;
            }

            .sizes-title {
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 8px;
              color: var(--dark-color);
            }

            .size-options {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }

            .size-chip {
              padding: 8px 12px;
              background: var(--light-color);
              border: 1px solid var(--border-color);
              border-radius: 6px;
              font-size: 0.85rem;
              color: var(--dark-color);
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .size-chip:hover {
              background: var(--primary-color);
              color: white;
              border-color: var(--primary-color);
            }

            .size-chip.selected {
              background: var(--primary-color);
              color: white;
              border-color: var(--primary-color);
            }

            .purchase-section {
              display: flex;
              gap: 10px;
              align-items: center;
            }

            .buy-button {
              flex: 1;
              background: linear-gradient(135deg, var(--success-color), #20c997);
              color: white;
              border: none;
              padding: 12px 20px;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }

            .buy-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
            }

            .buy-button:disabled {
              background: #ccc;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }

            .stock-badge {
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 0.85rem;
              font-weight: 500;
            }

            .in-stock {
              background: #d4edda;
              color: var(--success-color);
            }

            .out-of-stock {
              background: #f8d7da;
              color: var(--danger-color);
            }

            @media (max-width: 768px) {
              .products-grid {
                grid-template-columns: 1fr;
                padding: 20px;
              }

              .header {
                padding: 20px;
              }

              .header h1 {
                font-size: 2rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏪 MANSORY Boutique</h1>
              <p>Premium automotive luxury merchandise</p>
            </div>

            <div class="products-grid">
              ${results
                .map(
                  (item, index) => `
                <div class="product-card" data-product-index="${index}">
                  <div class="product-image">
                    🏎️
                  </div>

                  <div class="product-info">
                    <h3 class="product-title">${item.name}</h3>
                    <p class="product-description">${item.description}</p>

                    <div class="price-section">
                      <span class="sale-price">€${item.salePrice.toFixed(2)}</span>
                      <span class="regular-price">€${item.regularPrice.toFixed(2)}</span>
                      <span class="savings">Save €${item.savings.toFixed(2)}</span>
                    </div>

                    <div class="colors-section">
                      <div class="colors-title">🎨 Available Colors:</div>
                      <div class="color-options">
                        ${item.colors
                          .map(
                            (color) => `
                          <span class="color-chip">${color}</span>
                        `,
                          )
                          .join("")}
                      </div>
                    </div>

                    <div class="sizes-section">
                      <div class="sizes-title">📏 Available Sizes:</div>
                      <div class="size-options">
                        ${item.sizes
                          .map(
                            (sizeOption) => `
                          <span class="size-chip" data-size="${sizeOption}">${sizeOption}</span>
                        `,
                          )
                          .join("")}
                      </div>
                    </div>

                    <div class="purchase-section">
                      <button class="buy-button" onclick="purchaseProduct(${index + 1}, '${item.colors[0]}', 'L')">
                        🛒 Buy Now - Size L
                      </button>
                      <span class="stock-badge ${item.inStock ? "in-stock" : "out-of-stock"}">
                        ${item.inStock ? "✅ In Stock" : "❌ Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <script>
            // Handle size selection
            document.querySelectorAll('.size-chip').forEach(chip => {
              chip.addEventListener('click', function() {
                // Remove selection from siblings
                this.parentElement.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
                // Add selection to clicked chip
                this.classList.add('selected');

                // Update the buy button with selected size
                const card = this.closest('.product-card');
                const productIndex = card.dataset.productIndex;
                const buyButton = card.querySelector('.buy-button');
                const selectedSize = this.dataset.size;
                const firstColor = buyButton.onclick.toString().match(/'([^']+)'/)[1];

                buyButton.onclick = () => purchaseProduct(parseInt(productIndex) + 1, firstColor, selectedSize);
                buyButton.innerHTML = \`🛒 Buy Now - Size \${selectedSize}\`;
              });
            });

            // Purchase function that communicates with parent
            function purchaseProduct(productNumber, color, size) {
              window.parent.postMessage({
                type: 'tool',
                payload: {
                  toolName: 'purchase-merchandise',
                  params: {
                    productNumber: productNumber,
                    color: color,
                    size: size,
                    quantity: 1
                  }
                }
              }, '*');
            }

            // Set default size selection to L
            document.querySelectorAll('.product-card').forEach(card => {
              const sizeL = card.querySelector('[data-size="L"]');
              if (sizeL) {
                sizeL.classList.add('selected');
              }
            });
          </script>
        </body>
        </html>
      `;

      const uiResource = createUIResource({
        uri: `ui://mansory-store/products-${Date.now()}`,
        content: { type: "rawHtml", htmlString: productGalleryHTML },
        encoding: "text",
      });

      return {
        content: [
          {
            type: "text",
            text: `# 🏪 MANSORY Boutique - Interactive Gallery\n\nFound ${results.length} product(s) matching your search. Use the interactive gallery below to browse and purchase items.`,
          },
          uiResource,
        ],
      };
    },
  };
}

/**
 * Enhanced purchase tool with rich checkout UI
 */
export function createPurchaseMerchandiseUI() {
  return {
    name: "purchase-merchandise-ui",
    description: "Purchase Mansory merchandise with interactive checkout",
    inputSchema: {
      type: "object" as const,
      properties: {
        productNumber: { type: "number" as const, minimum: 1, maximum: 3 },
        color: { type: "string" as const },
        size: { type: "string" as const },
        quantity: {
          type: "number" as const,
          minimum: 1,
          maximum: 10,
          default: 1,
        },
      },
      required: ["productNumber", "color", "size"],
    },
    handler: async ({ productNumber, color, size, quantity = 1 }: any) => {
      const selectedProduct = MANSORY_MERCHANDISE[productNumber - 1];

      if (!selectedProduct) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Invalid product number. Please use browse-merchandise-ui first to see available products.",
            },
          ],
        };
      }

      // Validation logic (same as original)
      const normalizedColor = selectedProduct.colors.find(
        (c) =>
          c.toLowerCase().includes(color.toLowerCase()) ||
          color.toLowerCase().includes(c.toLowerCase()),
      );

      if (!normalizedColor) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Color "${color}" not available for ${selectedProduct.name}. Available colors: ${selectedProduct.colors.join(", ")}`,
            },
          ],
        };
      }

      const normalizedSize = size.toUpperCase();
      if (!selectedProduct.sizes.includes(normalizedSize)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Size "${size}" not available for ${selectedProduct.name}. Available sizes: ${selectedProduct.sizes.join(", ")}`,
            },
          ],
        };
      }

      if (!selectedProduct.inStock) {
        return {
          content: [
            {
              type: "text",
              text: `❌ ${selectedProduct.name} is currently out of stock. Please try again later.`,
            },
          ],
        };
      }

      // Calculate totals
      const itemPrice = selectedProduct.salePrice;
      const subtotal = itemPrice * quantity;
      const tax = subtotal * 0.19; // 19% VAT
      const shipping = subtotal > 50 ? 0 : 4.99;
      const total = subtotal + tax + shipping;

      // Generate order details
      const orderNumber = `MANS-${Date.now().toString().slice(-6)}`;
      const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-GB",
      );

      // Create rich checkout UI
      const checkoutHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MANSORY Checkout</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .checkout-container {
              max-width: 500px;
              width: 100%;
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }

            .header {
              background: linear-gradient(135deg, #28a745, #20c997);
              color: white;
              padding: 30px;
              text-align: center;
            }

            .header h1 {
              font-size: 1.8rem;
              margin-bottom: 8px;
            }

            .order-number {
              opacity: 0.9;
              font-size: 1rem;
            }

            .content {
              padding: 30px;
            }

            .product-summary {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 25px;
            }

            .product-name {
              font-size: 1.3rem;
              font-weight: 600;
              margin-bottom: 10px;
              color: #343a40;
            }

            .product-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }

            .detail-item {
              display: flex;
              justify-content: space-between;
              font-size: 0.95rem;
            }

            .detail-label {
              color: #666;
            }

            .detail-value {
              font-weight: 500;
              color: #343a40;
            }

            .pricing-breakdown {
              border-top: 1px solid #dee2e6;
              padding-top: 20px;
            }

            .pricing-title {
              font-size: 1.1rem;
              font-weight: 600;
              margin-bottom: 15px;
              color: #343a40;
            }

            .price-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 0.95rem;
            }

            .price-line.total {
              border-top: 1px solid #dee2e6;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: 600;
              font-size: 1.1rem;
              color: #28a745;
            }

            .delivery-info {
              background: #e3f2fd;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }

            .delivery-title {
              font-weight: 600;
              margin-bottom: 8px;
              color: #1976d2;
            }

            .delivery-detail {
              font-size: 0.9rem;
              color: #1565c0;
              margin-bottom: 4px;
            }

            .payment-status {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }

            .payment-icon {
              font-size: 2rem;
              margin-bottom: 8px;
            }

            .payment-text {
              color: #155724;
              font-weight: 500;
            }

            .processing-fee {
              font-size: 0.85rem;
              color: #666;
              margin-top: 5px;
            }

            .thank-you {
              text-align: center;
              padding: 20px 0;
            }

            .thank-you-text {
              color: #666;
              line-height: 1.5;
            }

            .brand-footer {
              text-align: center;
              padding: 15px;
              background: #f8f9fa;
              color: #666;
              font-size: 0.9rem;
            }

            @media (max-width: 480px) {
              .checkout-container {
                margin: 10px;
              }

              .content {
                padding: 20px;
              }

              .product-details {
                grid-template-columns: 1fr;
                gap: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="checkout-container">
            <div class="header">
              <h1>🛒 Purchase Confirmed!</h1>
              <div class="order-number">Order #${orderNumber}</div>
            </div>

            <div class="content">
              <div class="product-summary">
                <div class="product-name">${selectedProduct.name}</div>
                <div class="product-details">
                  <div class="detail-item">
                    <span class="detail-label">Color:</span>
                    <span class="detail-value">${normalizedColor}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Size:</span>
                    <span class="detail-value">${normalizedSize}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Quantity:</span>
                    <span class="detail-value">${quantity}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Unit Price:</span>
                    <span class="detail-value">€${itemPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div class="pricing-breakdown">
                <div class="pricing-title">💰 Pricing Breakdown</div>
                <div class="price-line">
                  <span>Subtotal:</span>
                  <span>€${subtotal.toFixed(2)}</span>
                </div>
                <div class="price-line">
                  <span>Tax (19% VAT):</span>
                  <span>€${tax.toFixed(2)}</span>
                </div>
                <div class="price-line">
                  <span>Shipping:</span>
                  <span>€${shipping.toFixed(2)}${shipping === 0 ? " (FREE!)" : ""}</span>
                </div>
                <div class="price-line total">
                  <span>Total:</span>
                  <span>€${total.toFixed(2)}</span>
                </div>
              </div>

              <div class="delivery-info">
                <div class="delivery-title">📦 Delivery Information</div>
                <div class="delivery-detail">📅 Estimated Delivery: ${estimatedDelivery}</div>
                <div class="delivery-detail">🚚 Shipping Method: Standard EU Delivery</div>
                <div class="delivery-detail">📍 Ships from: Germany</div>
              </div>

              <div class="payment-status">
                <div class="payment-icon">✅</div>
                <div class="payment-text">Payment Processed Successfully!</div>
                <div class="processing-fee">💳 Processing fee: $0.05 (demonstration)</div>
              </div>

              <div class="thank-you">
                <div class="thank-you-text">
                  Your MANSORY merchandise will be shipped within 2-3 business days.
                  You will receive a tracking number via email once your order is dispatched.
                </div>
              </div>
            </div>

            <div class="brand-footer">
              Thank you for shopping at MANSORY Boutique! 🏎️✨
            </div>
          </div>
        </body>
        </html>
      `;

      const uiResource = createUIResource({
        uri: `ui://mansory-checkout/${orderNumber}`,
        content: { type: "rawHtml", htmlString: checkoutHTML },
        encoding: "text",
      });

      return {
        content: [uiResource],
      };
    },
  };
}
