# Hi-Perf B2B Ecommerce Implementation

## Backend Files to Create/Modify

### PART 1 — PRICING
- ✅ `prisma/schema.prisma` – Updated Product with type, publicPrice, priceDescription, etc.
- `src/products/dto/product.dto.ts` – DTO with CDC fields + validation
- `src/products/products.service.ts` – Enforce product type rules
- `src/catalog/catalog.service.ts` – NEW: catalog logic with effective pricing
- `src/catalog/catalog.controller.ts` – NEW: GET /catalog endpoint
- `src/pricing/pricing.service.ts` – Update effective price logic for multi-network MIN

### PART 2 — CART/QUOTATION/ORDER
- `src/cart/dto/cart.dto.ts` – NEW: CreateCartLineDto, UpdateCartLineDto
- `src/cart/cart.service.ts` – NEW: cart operations
- `src/cart/cart.controller.ts` – NEW: POST /cart/lines, etc.
- `src/quotations/quotations.service.ts` – EXTEND: from-cart, accept->order
- `src/quotations/quotations.controller.ts` – EXTEND: POST /quotations/from-cart
- `src/orders/dto/order.dto.ts` – NEW
- `src/orders/orders.service.ts` – NEW: order CRUD
- `src/orders/orders.controller.ts` – NEW: GET /orders, POST /orders/:id/cancel
- `src/parameters/parameters.service.ts` – NEW: fetch allowMultiNetworkCart flag

### PART 3 — PAYMENT
- `src/payment/dto/payment.dto.ts` – NEW
- `src/payment/stripe.service.ts` – NEW: Stripe integration
- `src/payment/payment.service.ts` – NEW: generic payment interface
- `src/payment/payment.controller.ts` – NEW: checkout-session, webhook

## Frontend Files to Create/Modify

### PART 1 — PRICING
- `lib/api/http.ts` – NEW: fetch wrapper with auth
- `lib/api/catalog.ts` – NEW: getCatalog, getProduct
- `app/shop/catalog/page.tsx` – NEW or UPDATE product list (load from backend)
- `app/shop/products/[id]/page.tsx` – UPDATE (use backend data)
- `components/ProductCard.tsx` – UPDATE (show PARTNER vs NORMAL)

### PART 2 — CART/QUOTATION/ORDER
- `src/contexts/CartContext.tsx` – UPDATE: backend-backed cart
- `src/lib/api/cart.ts` – NEW: cart API client
- `src/lib/api/quotations.ts` – UPDATE: extend with from-cart, accept
- `src/lib/api/orders.ts` – NEW: orders API client
- `app/shop/cart/page.tsx` – UPDATE: load from backend
- `app/shop/checkout/page.tsx` – UPDATE: create quotation flow
- `app/shop/orders/page.tsx` – NEW: list orders
- `app/shop/orders/[id]/page.tsx` – NEW: order detail

### PART 3 — PAYMENT
- `src/lib/api/payment.ts` – NEW: payment API client
- `app/shop/orders/[id]/payment/page.tsx` – NEW: redirect to Stripe
- `app/shop/orders/[id]/success/page.tsx` – NEW: payment confirmation

---

## Key Endpoints

### Catalog & Products
```
GET /catalog?q=&networkId=&type=NORMAL
  Response: { products: CatalogProductDto[] }

GET /products/:id
  Response: ProductDetailDto
```

### Cart
```
GET /cart
POST /cart/lines
PATCH /cart/lines/:id
DELETE /cart/lines/:id
POST /cart/clear
```

### Quotations
```
GET /quotations
POST /quotations/from-cart
GET /quotations/:id
POST /quotations/:id/accept  → Creates Order
POST /quotations/:id/reject
PATCH /quotations/:id (BO only)
```

### Orders
```
GET /orders
GET /orders/:id
POST /orders/:id/cancel
```

### Payments
```
POST /payments/checkout-session (orderId) → { checkoutUrl, sessionId }
POST /payments/webhook (Stripe webhook)
GET /payments/status/:orderId
```

---

## Curl Test Suite (10+ commands)

See test-suite.md for full testing guide.
