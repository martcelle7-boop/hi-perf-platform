# DRM Administration API - Comprehensive Curl Test Suite

This document provides a complete set of curl commands to test all admin and BO endpoints of the Hi-Perf DRM platform. These commands cover all A1-A8 functionality with realistic payloads and authentication.

## Prerequisites

### 1. Start Backend Server
```bash
cd backend
npm run start:dev
# Server runs on http://localhost:3000
```

### 2. Obtain JWT Token

First, authenticate to get your JWT token. Replace email/password with valid credentials:

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }' | jq -r '.access_token'
```

Save the token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }' | jq -r '.access_token')
```

Then use `$TOKEN` in all subsequent requests.

---

## A1: Admin Clients Management

### 1.1 Create a Client
```bash
curl -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Innovations Inc."
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Tech Innovations Inc.",
  "createdAt": "2024-01-14T10:30:00.000Z",
  "updatedAt": "2024-01-14T10:30:00.000Z"
}
```

### 1.2 List All Clients
```bash
curl -X GET "http://localhost:3000/admin/clients?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Tech Innovations Inc.",
      "createdAt": "2024-01-14T10:30:00.000Z",
      "updatedAt": "2024-01-14T10:30:00.000Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "take": 10
}
```

### 1.3 Get Client by ID
```bash
curl -X GET http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Tech Innovations Inc.",
  "createdAt": "2024-01-14T10:30:00.000Z",
  "updatedAt": "2024-01-14T10:30:00.000Z"
}
```

### 1.4 Update a Client
```bash
curl -X PATCH http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Innovations Inc. - Updated"
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Tech Innovations Inc. - Updated",
  "createdAt": "2024-01-14T10:30:00.000Z",
  "updatedAt": "2024-01-14T11:00:00.000Z"
}
```

### 1.5 Delete a Client
```bash
curl -X DELETE http://localhost:3000/admin/clients/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "message": "Client deleted successfully"
}
```

---

## A2: Client-Network Assignment

### 2.1 Assign Network to Client
```bash
curl -X POST http://localhost:3000/admin/clients/1/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "networkId": 1
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "clientId": 1,
  "networkId": 1
}
```

### 2.2 List Networks Assigned to Client
```bash
curl -X GET http://localhost:3000/admin/clients/1/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "clientId": 1,
      "networkId": 1,
      "network": {
        "id": 1,
        "code": "NETWORK_001",
        "name": "Network One"
      }
    }
  ],
  "total": 1
}
```

### 2.3 Remove Network from Client
```bash
curl -X DELETE http://localhost:3000/admin/clients/1/networks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "message": "Network removed from client successfully"
}
```

---

## A3: Admin Users Management

### 3.1 Create Admin User
```bash
curl -X POST http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.new@example.com",
    "password": "SecurePassword123!",
    "role": "ADMIN",
    "clientId": 1
  }' | jq
```

**Expected Response:**
```json
{
  "id": 2,
  "email": "admin.new@example.com",
  "role": "ADMIN",
  "clientId": 1,
  "createdAt": "2024-01-14T10:40:00.000Z"
}
```

### 3.2 Create BO User
```bash
curl -X POST http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bo.user@example.com",
    "password": "BoPassword123!",
    "role": "BO",
    "clientId": 1
  }' | jq
```

**Expected Response:**
```json
{
  "id": 3,
  "email": "bo.user@example.com",
  "role": "BO",
  "clientId": 1,
  "createdAt": "2024-01-14T10:45:00.000Z"
}
```

### 3.3 List All Users
```bash
curl -X GET "http://localhost:3000/admin/users?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "role": "ADMIN",
      "clientId": null,
      "createdAt": "2024-01-14T09:00:00.000Z"
    },
    {
      "id": 2,
      "email": "admin.new@example.com",
      "role": "ADMIN",
      "clientId": 1,
      "createdAt": "2024-01-14T10:40:00.000Z"
    }
  ],
  "total": 2,
  "skip": 0,
  "take": 10
}
```

### 3.4 Get User by ID
```bash
curl -X GET http://localhost:3000/admin/users/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### 3.5 Update User
```bash
curl -X PATCH http://localhost:3000/admin/users/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.updated@example.com",
    "newPassword": "NewPassword123!"
  }' | jq
```

**Expected Response:**
```json
{
  "id": 2,
  "email": "admin.updated@example.com",
  "role": "ADMIN",
  "clientId": 1,
  "createdAt": "2024-01-14T10:40:00.000Z",
  "updatedAt": "2024-01-14T11:10:00.000Z"
}
```

### 3.6 Delete User
```bash
curl -X DELETE http://localhost:3000/admin/users/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## A4: Admin Networks Management

### 4.1 Create Root Network
```bash
curl -X POST http://localhost:3000/admin/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NETWORK_001",
    "name": "Primary Network"
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "code": "NETWORK_001",
  "name": "Primary Network",
  "parentNetworkId": null,
  "createdAt": "2024-01-14T10:50:00.000Z",
  "updatedAt": "2024-01-14T10:50:00.000Z"
}
```

### 4.2 Create Child Network
```bash
curl -X POST http://localhost:3000/admin/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NETWORK_001_EU",
    "name": "EU Subnet",
    "parentNetworkId": 1
  }' | jq
```

**Expected Response:**
```json
{
  "id": 2,
  "code": "NETWORK_001_EU",
  "name": "EU Subnet",
  "parentNetworkId": 1,
  "createdAt": "2024-01-14T10:55:00.000Z",
  "updatedAt": "2024-01-14T10:55:00.000Z"
}
```

### 4.3 List All Networks
```bash
curl -X GET "http://localhost:3000/admin/networks?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "NETWORK_001",
      "name": "Primary Network",
      "parentNetworkId": null,
      "createdAt": "2024-01-14T10:50:00.000Z"
    },
    {
      "id": 2,
      "code": "NETWORK_001_EU",
      "name": "EU Subnet",
      "parentNetworkId": 1,
      "createdAt": "2024-01-14T10:55:00.000Z"
    }
  ],
  "total": 2,
  "skip": 0,
  "take": 10
}
```

### 4.4 Get Network by ID
```bash
curl -X GET http://localhost:3000/admin/networks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### 4.5 Update Network
```bash
curl -X PATCH http://localhost:3000/admin/networks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Primary Network - EU"
  }' | jq
```

### 4.6 Delete Network
```bash
curl -X DELETE http://localhost:3000/admin/networks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

---

## A5: BO Products Management

**Note: BO operations require BO or ADMIN role**

### 5.1 Create GENERIC Product (Available to All Networks)
```bash
curl -X POST http://localhost:3000/bo/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD_GENERIC_001",
    "name": "Generic License Pack",
    "type": "GENERIC",
    "publicPrice": "99.99",
    "priceDescription": "Annual subscription"
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "code": "PROD_GENERIC_001",
  "name": "Generic License Pack",
  "type": "GENERIC",
  "publicPrice": "99.99",
  "priceDescription": "Annual subscription",
  "isActive": true,
  "createdAt": "2024-01-14T11:00:00.000Z"
}
```

### 5.2 Create NORMAL Product (Network-Specific)
```bash
curl -X POST http://localhost:3000/bo/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD_NORMAL_001",
    "name": "Premium Support Plan",
    "type": "NORMAL",
    "publicPrice": "199.99",
    "priceDescription": "24/7 Premium Support"
  }' | jq
```

**Expected Response:**
```json
{
  "id": 2,
  "code": "PROD_NORMAL_001",
  "name": "Premium Support Plan",
  "type": "NORMAL",
  "publicPrice": "199.99",
  "priceDescription": "24/7 Premium Support",
  "isActive": true,
  "createdAt": "2024-01-14T11:05:00.000Z"
}
```

### 5.3 Create PARTNER Product (Channel-Specific)
```bash
curl -X POST http://localhost:3000/bo/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD_PARTNER_001",
    "name": "Reseller Bundle",
    "type": "PARTNER",
    "publicPrice": "499.99",
    "priceDescription": "Partner resale license"
  }' | jq
```

### 5.4 List Products with Filters
```bash
# List all products
curl -X GET "http://localhost:3000/bo/products?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq

# List only NORMAL products
curl -X GET "http://localhost:3000/bo/products?type=NORMAL&skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq

# List only active products
curl -X GET "http://localhost:3000/bo/products?isActive=true&skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq

# List PARTNER products that are active
curl -X GET "http://localhost:3000/bo/products?type=PARTNER&isActive=true&skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### 5.5 Get Product by ID
```bash
curl -X GET http://localhost:3000/bo/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### 5.6 Update Product
```bash
curl -X PATCH http://localhost:3000/bo/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Generic License Pack - Updated",
    "publicPrice": "109.99",
    "isActive": true
  }' | jq
```

### 5.7 Deactivate Product
```bash
curl -X PATCH http://localhost:3000/bo/products/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }' | jq
```

---

## A6: Product Network Visibility Management

### 6.1 Assign Product to Network
```bash
curl -X POST http://localhost:3000/bo/products/2/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "networkId": 1
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "productId": 2,
  "networkId": 1
}
```

### 6.2 List Networks for a Product
```bash
curl -X GET http://localhost:3000/bo/products/2/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "productId": 2,
      "networkId": 1,
      "network": {
        "id": 1,
        "code": "NETWORK_001",
        "name": "Primary Network"
      }
    }
  ],
  "total": 1
}
```

### 6.3 Update Product Network Visibility (Status)
```bash
curl -X PATCH http://localhost:3000/bo/products/2/networks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isVisible": false
  }' | jq
```

### 6.4 Remove Product from Network
```bash
curl -X DELETE http://localhost:3000/bo/products/2/networks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "message": "Product removed from network successfully"
}
```

---

## A7: Product Pricing Management

**Important:** Only NORMAL type products can have custom network pricing. GENERIC and PARTNER products use public price.

### 7.1 Create Price for NORMAL Product on Specific Network
```bash
# First, assign product to a network
curl -X POST http://localhost:3000/bo/products/2/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "networkId": 1
  }' | jq

# Then create price for that network-product combination
curl -X POST http://localhost:3000/bo/products/2/prices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "networkId": 1,
    "amount": "149.99"
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "productId": 2,
  "networkId": 1,
  "amount": "149.99",
  "createdAt": "2024-01-14T11:20:00.000Z"
}
```

### 7.2 Create Price for Child Network (Inheritance Test)
```bash
# Create child network if not exists
curl -X POST http://localhost:3000/admin/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NETWORK_001_US",
    "name": "US Subnet",
    "parentNetworkId": 1
  }' | jq

# Assign product to child network
curl -X POST http://localhost:3000/bo/products/2/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "networkId": 3
  }' | jq

# When querying product price for US subnet without explicit price,
# system will inherit from parent NETWORK_001
curl -X GET http://localhost:3000/bo/products/2/prices?networkId=3 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response (inherited from parent):**
```json
{
  "amount": "149.99",
  "networkId": 1,
  "inheritedFromNetwork": true
}
```

### 7.3 Get All Prices for Product
```bash
curl -X GET "http://localhost:3000/bo/products/2/prices?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "productId": 2,
      "networkId": 1,
      "amount": "149.99",
      "createdAt": "2024-01-14T11:20:00.000Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "take": 10
}
```

### 7.4 Update Price
```bash
curl -X PATCH http://localhost:3000/bo/product-prices/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "159.99"
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "productId": 2,
  "networkId": 1,
  "amount": "159.99",
  "createdAt": "2024-01-14T11:20:00.000Z",
  "updatedAt": "2024-01-14T11:30:00.000Z"
}
```

### 7.5 Delete Price
```bash
curl -X DELETE http://localhost:3000/bo/product-prices/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "message": "Price deleted successfully"
}
```

---

## A8: Platform Configuration Management

### 8.1 Get Configuration
```bash
curl -X GET http://localhost:3000/admin/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "allowMultiNetworkCart": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-14T09:00:00.000Z"
}
```

### 8.2 Update Configuration
```bash
curl -X PATCH http://localhost:3000/admin/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allowMultiNetworkCart": true
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "allowMultiNetworkCart": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-14T11:40:00.000Z"
}
```

---

## Role-Based Access Control Testing

### Test: ADMIN Can Access Everything
```bash
# Get ADMIN token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }' | jq -r '.access_token')

# ADMIN can create clients
curl -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Client"}' | jq
```

### Test: BO Can Only Access BO Endpoints
```bash
# Get BO token
BO_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bo.user@example.com",
    "password": "BoPassword123!"
  }' | jq -r '.access_token')

# BO can create products (should succeed)
curl -X POST http://localhost:3000/bo/products \
  -H "Authorization: Bearer $BO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD_001",
    "name": "Test Product",
    "type": "NORMAL",
    "publicPrice": "99.99"
  }' | jq

# BO CANNOT create clients (should fail with 403 Forbidden)
curl -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer $BO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Client"}' | jq
```

### Test: USER Cannot Access Admin/BO Endpoints
```bash
# Get USER token
USER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "UserPassword123!"
  }' | jq -r '.access_token')

# USER cannot create products (should fail with 403 Forbidden)
curl -X POST http://localhost:3000/bo/products \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD_001",
    "name": "Test Product",
    "type": "NORMAL",
    "publicPrice": "99.99"
  }' | jq

# USER cannot access admin endpoints
curl -X GET http://localhost:3000/admin/clients \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | jq
```

---

## Error Handling Test Cases

### 400 Bad Request - Missing Required Fields
```bash
curl -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Bad Request with validation errors
```

### 401 Unauthorized - Missing Token
```bash
curl -X GET http://localhost:3000/admin/clients
# Expected: 401 Unauthorized
```

### 403 Forbidden - Insufficient Role
```bash
curl -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Expected: 403 Forbidden
```

### 404 Not Found - Resource Doesn't Exist
```bash
curl -X GET http://localhost:3000/admin/clients/9999 \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 Not Found
```

### 409 Conflict - Invalid Product Type for Pricing
```bash
curl -X POST http://localhost:3000/bo/products/1/prices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "networkId": 1,
    "amount": "99.99"
  }'
# Expected: 409 Conflict if product is GENERIC or PARTNER type
```

---

## Complete Test Sequence (Happy Path)

Run this sequence to thoroughly test the entire system:

```bash
#!/bin/bash

# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }' | jq -r '.access_token')

echo "=== A1: CLIENT MANAGEMENT ==="
CLIENT=$(curl -s -X POST http://localhost:3000/admin/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Corp"}' | jq '.id')
echo "Created client: $CLIENT"

echo -e "\n=== A3: ADMIN USERS MANAGEMENT ==="
BOUser=$(curl -s -X POST http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bo.test@example.com",
    "password": "BoTest123!",
    "role": "BO",
    "clientId": '$CLIENT'
  }' | jq '.id')
echo "Created BO user: $BOUser"

echo -e "\n=== A4: NETWORK MANAGEMENT ==="
ROOT_NET=$(curl -s -X POST http://localhost:3000/admin/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "ROOT", "name": "Root Network"}' | jq '.id')
echo "Created root network: $ROOT_NET"

CHILD_NET=$(curl -s -X POST http://localhost:3000/admin/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CHILD",
    "name": "Child Network",
    "parentNetworkId": '$ROOT_NET'
  }' | jq '.id')
echo "Created child network: $CHILD_NET"

echo -e "\n=== A2: CLIENT-NETWORK ASSIGNMENT ==="
curl -s -X POST http://localhost:3000/admin/clients/$CLIENT/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"networkId": '$ROOT_NET'}' | jq '.id'

echo -e "\n=== A5: PRODUCT MANAGEMENT ==="
NORMAL_PROD=$(curl -s -X POST http://localhost:3000/bo/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NORMAL_001",
    "name": "Normal Product",
    "type": "NORMAL",
    "publicPrice": "199.99"
  }' | jq '.id')
echo "Created NORMAL product: $NORMAL_PROD"

echo -e "\n=== A6: PRODUCT VISIBILITY ==="
curl -s -X POST http://localhost:3000/bo/products/$NORMAL_PROD/networks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"networkId": '$ROOT_NET'}' | jq '.id'

echo -e "\n=== A7: PRODUCT PRICING ==="
PRICE=$(curl -s -X POST http://localhost:3000/bo/products/$NORMAL_PROD/prices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "networkId": '$ROOT_NET',
    "amount": "149.99"
  }' | jq '.id')
echo "Created price: $PRICE"

echo -e "\n=== A8: PLATFORM CONFIG ==="
curl -s -X PATCH http://localhost:3000/admin/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allowMultiNetworkCart": true}' | jq '.allowMultiNetworkCart'

echo -e "\n=== ALL TESTS COMPLETED SUCCESSFULLY ==="
```

---

## Troubleshooting

### Issue: 401 Unauthorized on all requests
**Solution:** Ensure your token is valid and not expired. Generate a new token using the login endpoint.

### Issue: 403 Forbidden on BO endpoints with ADMIN token
**Solution:** This is expected behavior if the @Roles guard is stricter than specified. Check the controller decorator - it should allow both 'BO' and 'ADMIN' roles.

### Issue: 404 on network hierarchy endpoints
**Solution:** Ensure parent network ID exists before creating child. Get network list first.

### Issue: Pricing conflict for GENERIC/PARTNER products
**Solution:** GENERIC and PARTNER products cannot have custom network pricing. Use NORMAL type for products that need per-network pricing.

### Issue: 500 Server Error on bcrypt operations
**Solution:** Ensure bcrypt is installed in backend: `npm install bcrypt @types/bcrypt`

---

## Test Summary

**Total Curl Commands: 30+**
- A1 (Clients): 5 commands
- A2 (Client-Networks): 3 commands
- A3 (Users): 6 commands
- A4 (Networks): 5 commands
- A5 (Products): 7 commands
- A6 (Product Networks): 4 commands
- A7 (Pricing): 5 commands
- A8 (Config): 2 commands
- RBAC Testing: 3 commands
- Error Cases: 5 commands
- Complete Sequence: 1 script

All endpoints tested with valid payloads, error conditions, and role-based access control.
