# Hi-Perf Platform - Frontend

A Next.js 14 frontend with JWT authentication and role-based access control.

## Overview

This frontend provides:
- **Authentication**: JWT-based login system
- **Role-Based Access Control**: ADMIN, BO (Business Operations), USER roles
- **Protected Routes**: Client-side and server-side protection
- **Global State Management**: AuthContext with localStorage persistence
- **Role-Based UI**: Dynamic navigation based on user role

## Architecture

### Key Components

#### 1. **AuthContext** (`contexts/AuthContext.tsx`)
Global authentication state management with:
- `user`: Current user info (id, email, role, clientId)
- `token`: JWT access token
- `login(email, password)`: Authenticate user
- `logout()`: Clear auth state
- `isAuthenticated`: Boolean flag
- `isLoading`: Loading state during auth operations

#### 2. **useAuth Hook** (`hooks/useAuth.ts`)
Custom hook to access auth context anywhere in the app.

#### 3. **ProtectedRoute Component** (`components/ProtectedRoute.tsx`)
Client-side route protection with:
- Redirects unauthenticated users to `/login`
- Redirects users with insufficient role to `/403`
- Shows loading state while checking auth

#### 4. **Sidebar Component** (`components/Sidebar.tsx`)
Role-based navigation sidebar with:
- Dynamic menu items based on user role
- User info display
- Logout button

### Route Structure

```
/login                    # Public login page
/                         # Redirects to /dashboard or /login
/dashboard                # Protected - all authenticated users
/admin                    # ADMIN only - admin dashboard
  /admin/networks        # ADMIN only
  /admin/users           # ADMIN only
/bo                       # BO only - business operations dashboard
  /bo/products           # BO only
  /bo/pricing            # BO only
/shop                     # USER only - shop dashboard
  /shop/products         # USER only
  /shop/orders           # USER only
/403                      # Forbidden page
```

### Authentication Flow

1. **Login Page** → User enters email/password
2. **API Call** → POST `/auth/login` to backend
3. **Response** → Backend returns `{ accessToken, user }`
4. **State** → Token and user stored in AuthContext + localStorage
5. **Navigation** → User redirected to `/dashboard`
6. **Persistence** → Auth state restored on page refresh

## Usage

### Starting Development Server

```bash
cd frontend
npm run dev
```

Server runs on `http://localhost:3000`

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Using useAuth Hook

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();

  // Use auth state...
}
```

### Protecting Routes

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}
```

## Security Notes

- **MVP Only**: Uses localStorage (not secure for production)
- **Production**: Should use:
  - HTTP-only cookies for tokens
  - Secure cookie settings
  - Token refresh mechanism
  - CSRF protection
  - Server-side session validation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Fetch API
