# JWT Authentication System - NestJS Backend

## Overview

A production-ready JWT authentication system for the hi-perf platform backend. Implements secure password hashing with bcrypt and JWT token generation.

## ✅ What's Implemented

### Core Features
- **User Login** - Secure email/password authentication
- **JWT Tokens** - 24-hour expiring tokens with user claims
- **Password Hashing** - bcrypt hashing with 10 salt rounds
- **Error Handling** - Proper HTTP status codes and error messages
- **Role-Based Access** - Support for ADMIN, BO, and USER roles

### API Endpoint

```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "admin@test.com",
  "password": "password123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@test.com",
    "role": "ADMIN",
    "clientId": null
  }
}

Response (401 Unauthorized):
{
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## Test Users

Three pre-seeded users with hashed passwords:

| Email | Password | Role | Client ID |
|-------|----------|------|-----------|
| admin@test.com | password123 | ADMIN | null |
| bo@test.com | password123 | BO | null |
| user@test.com | password123 | USER | null |

## Architecture

### Module Structure

```
src/auth/
├── auth.module.ts       (DI container, JWT config)
├── auth.controller.ts   (REST endpoint)
├── auth.service.ts      (Login logic)
└── dto/
    └── login.dto.ts     (Request validation)
```

### Flow Diagram

```
POST /auth/login
       ↓
AuthController validates DTO
       ↓
AuthService.login() executes:
  1. Find user by email (Prisma)
  2. Compare password (bcrypt)
  3. Generate JWT (JwtService)
  4. Return token + user data
       ↓
200 OK with accessToken
```

## Dependencies

```json
{
  "dependencies": {
    "@nestjs/jwt": "^12.x",
    "@nestjs/passport": "^10.x",
    "passport": "^0.7.x",
    "passport-jwt": "^4.x",
    "bcrypt": "^5.x",
    "class-validator": "^0.14.x",
    "class-transformer": "^0.5.x"
  }
}
```

## Configuration

### Environment Variables

```env
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hiperf_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
```

### JWT Payload

```typescript
{
  sub: number;      // User ID
  email: string;    // User email
  role: UserRole;   // ADMIN | BO | USER
  clientId: number | null;  // Optional client assignment
  iat: number;      // Issued at
  exp: number;      // Expires at (24h from issue)
}
```

## Testing

### Run Tests with curl

```bash
# ADMIN login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# BO login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bo@test.com","password":"password123"}'

# USER login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Invalid password (401)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"wrongpassword"}'

# Non-existent user (401)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"unknown@test.com","password":"password123"}'
```

### Verify JWT Token

Decode and verify the JWT at https://jwt.io to inspect claims.

## Security Considerations

### ✅ Implemented
- **Password Hashing** - bcrypt with salt rounds
- **JWT Signing** - HMAC-SHA256 with secret key
- **Input Validation** - class-validator DTO validation
- **Error Messages** - Generic "Invalid email or password" (no info leakage)
- **No Logs** - Passwords never logged or exposed

### 🔄 Future Enhancements
- Refresh token rotation (separate token with longer TTL)
- Rate limiting on login endpoint
- Account lockout after failed attempts
- JWT revocation list (blacklist)
- Two-factor authentication (2FA)
- OAuth2 / Social login

## Seed Database

```bash
# Add test users to database
npm run seed

# Output:
# 🌱 Starting seed...
# ✓ Cleared existing users
# ✓ Created ADMIN user: admin@test.com
# ✓ Created BO user: bo@test.com
# ✓ Created USER user: user@test.com
# ✅ Seed completed successfully!
```

## Startup

```bash
# Development mode (with watch)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Server logs will show:
# [Nest] ... LOG [RoutesResolver] AuthController {/auth}: +0ms
# [Nest] ... LOG [RouterExplorer] Mapped {/auth/login, POST} route +1ms
# [Nest] ... LOG [NestApplication] Nest application successfully started +68ms
# ✓ Backend running on http://localhost:3001
```

## Integration with Frontend

The frontend (Next.js) expects this exact response format:

```typescript
// frontend/src/contexts/AuthContext.tsx
interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    clientId: number | null;
  };
}
```

The `AuthContext` automatically:
1. Stores `accessToken` in localStorage
2. Stores `user` data in state
3. Provides auth context to entire app

## File Manifest

| File | Purpose |
|------|---------|
| `src/auth/auth.module.ts` | Module definition + JWT config |
| `src/auth/auth.controller.ts` | POST /auth/login endpoint |
| `src/auth/auth.service.ts` | Login business logic |
| `src/auth/dto/login.dto.ts` | Request validation |
| `src/prisma/prisma.module.ts` | Prisma DI module |
| `src/prisma/prisma.service.ts` | Database connection (updated) |
| `prisma/seed.ts` | Database seeding script |
| `.env` | Environment variables (JWT_SECRET) |
| `package.json` | Dependencies + seed script |

## Next Steps

1. ✅ Basic login implemented
2. ⏳ Add JWT Guard for protected routes
3. ⏳ Add role-based access control (RBAC)
4. ⏳ Implement refresh token rotation
5. ⏳ Add rate limiting

## References

- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication)
- [Passport.js JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [bcrypt Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [JWT Standard (RFC 7519)](https://tools.ietf.org/html/rfc7519)
