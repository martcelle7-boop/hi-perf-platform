# Auth System - Quick Reference

## Files Created

```
src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
└── dto/
    └── login.dto.ts

src/prisma/
└── prisma.module.ts
```

## Installation

```bash
# Dependencies installed
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @types/bcrypt

# Test users seeded
npm run seed
```

## Test Endpoint

```bash
# Login as ADMIN
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Response contains:
# - accessToken: JWT token (use in Authorization header)
# - user: { id, email, role, clientId }
```

## Environment Setup

Add to `.env`:
```
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## JWT Token Expiry

- **Duration**: 24 hours
- **Decoded payload**:
  ```
  {
    sub: 1,                    // user.id
    email: "admin@test.com",
    role: "ADMIN",
    clientId: null,
    iat: 1768482557,           // issued at
    exp: 1768568957            // expires at (iat + 86400s)
  }
  ```

## Error Responses

| Status | Response |
|--------|----------|
| 200 | `{ accessToken, user }` |
| 401 | `{ message: "Invalid email or password", statusCode: 401 }` |
| 400 | DTO validation error (missing/invalid fields) |

## Next Steps

1. Create JWT Guard for protected routes:
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Get('profile')
   getProfile(@Request() req) {
     return req.user;
   }
   ```

2. Add role-based access control:
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('ADMIN')
   @Delete(':id')
   deleteUser(@Param('id') id: number) { ... }
   ```

3. Implement refresh tokens for better security

## Database Connection

- User model has: id, email, password (hashed), role, clientId
- Passwords are hashed with bcrypt (10 rounds)
- No plain-text passwords are ever stored or returned

## Production Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement refresh token rotation
- [ ] Add audit logging
- [ ] Monitor failed login attempts
