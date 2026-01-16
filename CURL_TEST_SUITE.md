# Hi-Perf B2B Ecommerce - Curl Test Suite

This document provides a comprehensive set of curl commands to test all backend endpoints.

## Prerequisites

```bash
# Set environment variables
export BASE_URL="http://localhost:3000"
export USER_JWT="<your-jwt-token>"  # Get from login endpoint
export ADMIN_JWT="<admin-jwt-token>"
```

## 1. Authentication (Required First)

### Login as regular USER
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
# Response contains token - save as $USER_JWT
```

### Login as ADMIN or BO
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
# Response contains token - save as $ADMIN_JWT
```

---

## 2. Catalog & Products Endpoints

### Get Catalog (all NORMAL products in user's network)
```bash
curl "$BASE_URL/catalog" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json"
```

### Search Catalog by term
```bash
curl "$BASE_URL/catalog?q=laptop&type=NORMAL&skip=0&take=20" \
  -H "Authorization: Bearer $USER_JWT"
```

### Get single product detail
```bash
curl "$BASE_URL/catalog/1" \
  -H "Authorization: Bearer $USER_JWT"
```

### Quick search
```bash
curl "$BASE_URL/catalog/search/laptop?type=NORMAL&limit=10" \
  -H "Authorization: Bearer $USER_JWT"
```

### Get effective price for product in specific network
```bash
curl "$BASE_URL/pricing/products/1/networks/5/effective" \
  -H "Authorization: Bearer $ADMIN_JWT"
```

---

## 3. Cart Endpoints

### Get user's cart (creates if doesn't exist)
```bash
curl "$BASE_URL/cart" \
  -H "Authorization: Bearer $USER_JWT"
```

### Add product to cart
```bash
curl -X POST "$BASE_URL/cart/lines" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 5
  }'
```

### Add multiple items
```bash
curl -X POST "$BASE_URL/cart/lines" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 2,
    "quantity": 3,
    "metadata": "{\"notes\": \"urgent delivery\"}"
  }'
```

### Update cart line quantity
```bash
curl -X PATCH "$BASE_URL/cart/lines/1" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10
  }'
```

### Remove product from cart
```bash
curl -X DELETE "$BASE_URL/cart/lines/1" \
  -H "Authorization: Bearer $USER_JWT"
```

### Clear entire cart
```bash
curl -X POST "$BASE_URL/cart/clear" \
  -H "Authorization: Bearer $USER_JWT"
```

---

## 4. Quotation Endpoints

### Get current draft quotation (or create if doesn't exist)
```bash
curl "$BASE_URL/quotations/current" \
  -H "Authorization: Bearer $USER_JWT"
```

### Add item to quotation
```bash
curl -X POST "$BASE_URL/quotations/current/items" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 5,
    "unitPrice": "99.99"
  }'
```

### Get all user's quotations
```bash
curl "$BASE_URL/quotations?status=DRAFT&skip=0&take=50" \
  -H "Authorization: Bearer $USER_JWT"
```

### Get single quotation
```bash
curl "$BASE_URL/quotations/1" \
  -H "Authorization: Bearer $USER_JWT"
```

### Accept quotation (converts to order)
```bash
curl -X POST "$BASE_URL/quotations/1/accept" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Please proceed with this order"}'
```

### Reject quotation
```bash
curl -X POST "$BASE_URL/quotations/1/reject" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Price too high"}'
```

---

## 5. Order Endpoints

### Get all user's orders
```bash
curl "$BASE_URL/orders?skip=0&take=50" \
  -H "Authorization: Bearer $USER_JWT"
```

### Get single order
```bash
curl "$BASE_URL/orders/1" \
  -H "Authorization: Bearer $USER_JWT"
```

### Create order from quotation
```bash
curl -X POST "$BASE_URL/orders" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quotationId": 1
  }'
```

### Cancel order (only if PENDING_PAYMENT)
```bash
curl -X POST "$BASE_URL/orders/1/cancel" \
  -H "Authorization: Bearer $USER_JWT"
```

---

## 6. Payment Endpoints

### Create Stripe checkout session
```bash
curl -X POST "$BASE_URL/payments/checkout-session" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "successUrl": "http://localhost:3000/orders/1/success",
    "cancelUrl": "http://localhost:3000/orders/1"
  }'
# Response: { sessionId, checkoutUrl }
# Redirect user to checkoutUrl
```

### Get payment status
```bash
curl "$BASE_URL/payments/status/1" \
  -H "Authorization: Bearer $USER_JWT"
```

### (Stripe Only) Simulate webhook - payment completed
```bash
curl -X POST "$BASE_URL/payments/webhook" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=<timestamp>,v1=<signature>" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_abc123",
        "payment_status": "paid",
        "metadata": {"orderId": "1"}
      }
    }
  }'
```

---

## 7. Integration Flow Examples

### Complete Happy Path: Cart → Quotation → Order → Payment

#### Step 1: Add to Cart
```bash
curl -X POST "$BASE_URL/cart/lines" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 5
  }'
```

#### Step 2: Accept Quotation (auto-created from cart)
```bash
# First get the current quotation
QUOTE_ID=$(curl -s "$BASE_URL/quotations/current" \
  -H "Authorization: Bearer $USER_JWT" | jq '.id')

# Accept it
curl -X POST "$BASE_URL/quotations/$QUOTE_ID/accept" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Order approved"}'
```

#### Step 3: Create Order
```bash
curl -X POST "$BASE_URL/orders" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quotationId": '$QUOTE_ID'
  }'
# Returns order object with id and code (e.g., ORD-2024-000001)
```

#### Step 4: Create Payment Session
```bash
ORDER_ID=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"quotationId": '$QUOTE_ID'}' | jq '.id')

curl -X POST "$BASE_URL/payments/checkout-session" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": '$ORDER_ID'
  }'
# Returns { sessionId, checkoutUrl }
# User visits checkoutUrl to complete payment on Stripe
```

#### Step 5: Check Order Status (after payment)
```bash
curl "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $USER_JWT"
# Status should be PAID after Stripe webhook processed
```

---

## 8. Error Scenarios

### Try to add PARTNER product to cart
```bash
curl -X POST "$BASE_URL/cart/lines" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 999,
    "quantity": 1
  }'
# Expected response: 409 Conflict - "PARTNER products cannot be added to cart"
```

### Try to checkout without adding items
```bash
curl -X POST "$BASE_URL/payments/checkout-session" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 999
  }'
# Expected response: 404 Not Found
```

### Try to accept already accepted quotation
```bash
curl -X POST "$BASE_URL/quotations/1/accept" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Second acceptance"}'
# Expected response: 409 Conflict - "Quotation is not in DRAFT status"
```

### Try to access another user's order
```bash
# Login as different user
curl "$BASE_URL/orders/1" \
  -H "Authorization: Bearer $OTHER_USER_JWT"
# Expected response: 400 Bad Request - "Order does not belong to current user"
```

---

## 9. Data Validation

### Invalid product quantity
```bash
curl -X POST "$BASE_URL/cart/lines" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 0
  }'
# Expected response: 400 Bad Request - validation error
```

### Missing required field
```bash
curl -X POST "$BASE_URL/cart/lines" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1
  }'
# Expected response: 400 Bad Request - missing "quantity"
```

---

## 10. Admin/BO Operations (examples)

### Add GENERIC item to quotation (BO only)
```bash
curl -X POST "$BASE_URL/quotations/1/items" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 999,
    "quantity": 1,
    "unitPrice": "500.00"
  }'
# GENERIC products can be added to quotations by BO even without active prices
```

### Update quotation line (BO only)
```bash
curl -X PATCH "$BASE_URL/quotations/1/items/1" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "unitPrice": "125.00"
  }'
```

### Set product price in network
```bash
curl -X PUT "$BASE_URL/pricing/products/1/networks/5" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "99.99",
    "currency": "EUR",
    "isActive": true,
    "note": "Q4 2024 pricing"
  }'
```

---

## 11. Response Format Examples

### Successful Cart GET
```json
{
  "id": 1,
  "clientId": 1,
  "userId": 1,
  "status": "ACTIVE",
  "currency": "EUR",
  "lines": [
    {
      "id": 1,
      "cartId": 1,
      "productId": 1,
      "quantity": 5,
      "unitPrice": "99.99",
      "sourceNetworkId": 1,
      "currency": "EUR",
      "metadata": null,
      "product": {
        "id": 1,
        "code": "PROD-001",
        "name": "Laptop XYZ",
        "brand": "TechBrand",
        "unit": "piece"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalItems": 5,
  "totalAmount": "499.95",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Successful Order GET
```json
{
  "id": 1,
  "code": "ORD-2024-000001",
  "clientId": 1,
  "userId": 1,
  "quotationId": 5,
  "status": "PENDING_PAYMENT",
  "totalAmount": "499.95",
  "currency": "EUR",
  "lines": [
    {
      "id": 1,
      "orderId": 1,
      "productId": 1,
      "productCode": "PROD-001",
      "productName": "Laptop XYZ",
      "quantity": 5,
      "unitPrice": "99.99",
      "currency": "EUR",
      "sourceNetworkId": 1,
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  ],
  "payment": {
    "id": 1,
    "status": "PENDING",
    "provider": "stripe",
    "providerSessionId": "cs_test_abc123"
  },
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Successful Payment Session
```json
{
  "sessionId": "cs_test_abc123",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_abc123"
}
```

---

## 12. Troubleshooting

### 401 Unauthorized
- JWT token is missing or invalid
- Token may be expired
- Solution: Re-login to get fresh token

### 403 Forbidden
- User role doesn't have permission for this operation
- Solution: Check user role requirements for the endpoint

### 404 Not Found
- Resource doesn't exist (product, order, quotation, etc.)
- Solution: Verify ID exists in database

### 409 Conflict
- Business logic constraint violated
- Examples: PARTNER product add-to-cart, wrong order status, etc.
- Solution: Check error message and fix the request

### 422 Unprocessable Entity
- Request data validation failed
- Solution: Check request body against endpoint schema

---

## 13. Environment Setup

### .env file for backend testing
```
DATABASE_URL="postgresql://user:password@localhost:5432/hiperf_db"
JWT_SECRET="your-jwt-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:3000"
```

### Quick db reset (development only)
```bash
cd backend
npx prisma migrate reset
npx prisma db seed  # if seed file exists
```
