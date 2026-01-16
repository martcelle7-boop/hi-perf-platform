# API Quick Reference

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints except `/payments/webhook` require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints by Category

### 🔐 Authentication
```
POST   /auth/login                    - Login user (returns JWT)
POST   /auth/logout                   - Logout
POST   /auth/register                 - Register new user (if enabled)
GET    /auth/me                       - Get current user info
POST   /auth/refresh                  - Refresh JWT token
```

### 📦 Catalog & Products
```
GET    /catalog                       - List products with effective pricing
GET    /catalog/:productId            - Get product detail
GET    /catalog/search/:term          - Search products
```

**Query Parameters for /catalog:**
- `q` - Search term (searches code, name, description, brand)
- `type` - Filter: GENERIC, NORMAL, or PARTNER
- `networkId` - Specific network (defaults to user's primary)
- `skip` - Pagination offset (default: 0)
- `take` - Page size (default: 50)

---

### 🛒 Shopping Cart
```
GET    /cart                          - Get user's active cart
POST   /cart/lines                    - Add product to cart
PATCH  /cart/lines/:cartLineId        - Update line quantity
DELETE /cart/lines/:cartLineId        - Remove product from cart
POST   /cart/clear                    - Clear entire cart
```

**Add to Cart (POST /cart/lines):**
```json
{
  "productId": 1,
  "quantity": 5,
  "metadata": "{\"notes\": \"urgent\"}"  // optional
}
```

**Update Quantity (PATCH /cart/lines/:cartLineId):**
```json
{
  "quantity": 10,
  "metadata": "{...}"  // optional
}
```

---

### 📋 Quotations
```
GET    /quotations/current            - Get or create current DRAFT quotation
GET    /quotations                    - List all quotations (filtered by status)
GET    /quotations/:quotationId       - Get quotation detail
POST   /quotations/:quotationId/items - Add item to quotation
PATCH  /quotations/:quotationId/items/:itemId - Update quotation item (BO only)
POST   /quotations/:quotationId/accept - Accept quotation (→ creates Order)
POST   /quotations/:quotationId/reject - Reject quotation
```

**Query Parameters for /quotations:**
- `status` - Filter: DRAFT, ACCEPTED, REJECTED, EXPIRED
- `skip` - Pagination offset
- `take` - Page size

**Accept Quotation (POST /quotations/:quotationId/accept):**
```json
{
  "comment": "Order approved"
}
```

---

### 📦 Orders
```
GET    /orders                        - List user's orders
GET    /orders/:orderId               - Get order detail
POST   /orders                        - Create order from quotation
POST   /orders/:orderId/cancel        - Cancel order (PENDING_PAYMENT only)
```

**Create Order (POST /orders):**
```json
{
  "quotationId": 5
}
```

**Query Parameters for /orders:**
- `skip` - Pagination offset (default: 0)
- `take` - Page size (default: 50)

---

### 💳 Payments
```
POST   /payments/checkout-session     - Create Stripe checkout session
GET    /payments/status/:orderId      - Get payment status
POST   /payments/webhook              - Stripe webhook receiver (no auth)
```

**Create Checkout Session (POST /payments/checkout-session):**
```json
{
  "orderId": 1,
  "successUrl": "http://localhost:3000/orders/1/success",  // optional
  "cancelUrl": "http://localhost:3000/orders/1"             // optional
}
```

Response:
```json
{
  "sessionId": "cs_test_abc123",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_abc123"
}
```

---

### 📊 Pricing (Admin/BO Only)
```
GET    /pricing/products/:productId/networks/:networkId              - Get explicit price
GET    /pricing/products/:productId/networks/:networkId/effective    - Get effective price (with inheritance)
PUT    /pricing/products/:productId/networks/:networkId              - Set price
GET    /pricing/networks/:networkId/products                         - List products with prices in network
```

**Set Price (PUT):**
```json
{
  "amount": "99.99",
  "currency": "EUR",
  "isActive": true,
  "note": "Q4 2024 pricing"
}
```

---

### 👥 Clients (Admin Only)
```
GET    /clients                       - List clients
GET    /clients/:clientId             - Get client detail
POST   /clients                       - Create client
PATCH  /clients/:clientId             - Update client
```

---

### 🌐 Networks (Admin Only)
```
GET    /networks                      - List networks
GET    /networks/:networkId           - Get network detail
POST   /networks                      - Create network
PATCH  /networks/:networkId           - Update network
```

---

### 👤 Users (Admin Only)
```
GET    /users                         - List users
GET    /users/:userId                 - Get user detail
POST   /users                         - Create user
PATCH  /users/:userId                 - Update user
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (business logic violation) |
| 500 | Server Error |

---

## Example Flow: Cart → Order → Payment

### 1. Browse Products
```bash
curl "http://localhost:3000/catalog?type=NORMAL" \
  -H "Authorization: Bearer $JWT"
```

### 2. Add to Cart
```bash
curl -X POST "http://localhost:3000/cart/lines" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5}'
```

### 3. View Cart
```bash
curl "http://localhost:3000/cart" \
  -H "Authorization: Bearer $JWT"
```

### 4. Accept Quotation
```bash
# Get quotation ID from current quotation
curl -X POST "http://localhost:3000/quotations/1/accept" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Approved"}'
```

### 5. Create Order
```bash
curl -X POST "http://localhost:3000/orders" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"quotationId": 1}'
```

### 6. Start Payment
```bash
curl -X POST "http://localhost:3000/payments/checkout-session" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

### 7. Redirect to Stripe
User visits the returned `checkoutUrl` to complete payment on Stripe

### 8. Check Order Status
```bash
curl "http://localhost:3000/orders/1" \
  -H "Authorization: Bearer $JWT"
# Status will be PAID after Stripe webhook is processed
```

---

## Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "error": "Bad Request"
}
```

---

## Data Types

### Money/Decimal
All monetary values (prices, amounts) are returned as strings with 2 decimal places:
```
"99.99"
"1500.00"
```

### Timestamps
All dates are ISO 8601 format:
```
"2024-01-15T10:30:00Z"
```

### Status Enums

**Cart Status:**
- ACTIVE - Currently being used
- LOCKED - Being processed
- CONVERTED - Converted to quotation

**Order Status:**
- PENDING_PAYMENT - Waiting for payment
- PAID - Payment completed
- FULFILLED - Order shipped/delivered
- CANCELLED - Order cancelled

**Payment Status:**
- PENDING - Awaiting payment
- PROCESSING - Payment in progress
- COMPLETED - Payment successful
- FAILED - Payment failed
- REFUNDED - Payment refunded

**Quotation Status:**
- DRAFT - Still being edited
- ACCEPTED - Approved by client
- REJECTED - Declined by client
- EXPIRED - Became invalid

**Product Type:**
- GENERIC - BO-managed items (no auto pricing)
- NORMAL - Regular catalog items
- PARTNER - External partner items (no cart)

---

## Rate Limiting

Currently no rate limiting configured (development).
Production should implement:
- 100 requests per minute per user
- 10 requests per second per IP

---

## Webhooks

### Stripe Webhook
Only endpoint that doesn't require JWT:
```
POST /payments/webhook
Headers:
  stripe-signature: t=<timestamp>,v1=<signature>
  Content-Type: application/json
```

Stripe will call this when:
- Payment succeeds (checkout.session.completed)
- Payment fails (charge.failed)
- Payment is refunded (charge.refunded)

---

## Environment Variables

```
STRIPE_SECRET_KEY       - Stripe secret key for API calls
STRIPE_WEBHOOK_SECRET   - Stripe webhook signing secret
DATABASE_URL            - PostgreSQL connection string
JWT_SECRET              - Secret for JWT signing
FRONTEND_URL            - Base URL for payment redirects (http://localhost:3000)
```
