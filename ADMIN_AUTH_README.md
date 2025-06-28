# Admin Authentication System

This document explains how the admin authentication system works in the ChicBox application.

## Overview

The admin authentication system protects all admin routes and ensures only users with ADMIN role can access the admin panel.

## Components

### 1. Admin Login Page (`/admin/login`)
- **Location**: `src/app/admin/login/page.tsx`
- **Purpose**: Provides a secure login interface for admin users
- **Features**:
  - Uses the same API as regular login (`/api/v1/auth/login`)
  - Validates that the user has ADMIN role
  - Modern, responsive design with loading states
  - Toast notifications for error handling

### 2. Admin Authentication Guard (`AdminAuthGuard`)
- **Location**: `src/components/Admin/AdminAuthGuard.tsx`
- **Purpose**: Protects admin routes from unauthorized access
- **Features**:
  - Checks for valid token and ADMIN role in localStorage
  - Redirects to `/admin/login` if not authenticated
  - Shows loading screen during authentication check
  - Prevents rendering of protected content until authenticated

### 3. Admin Layout (`/admin/layout.tsx`)
- **Location**: `src/app/admin/layout.tsx`
- **Purpose**: Wraps all admin routes with authentication protection
- **Features**:
  - Applies AdminAuthGuard to all admin pages
  - Ensures consistent protection across all admin routes

### 4. Admin Layout Component (`AdminLayout`)
- **Location**: `src/components/Admin/AdminLayout.tsx`
- **Purpose**: Provides the admin dashboard layout and navigation
- **Features**:
  - Sidebar navigation with admin menu items
  - Logout functionality that clears localStorage
  - Responsive design with mobile support
  - Search bar and notifications area

## How It Works

1. **Accessing Admin Routes**: When a user tries to access any `/admin/*` route:
   - The layout automatically applies AdminAuthGuard
   - AdminAuthGuard checks localStorage for token and role
   - If not authenticated or not ADMIN role, redirects to `/admin/login`

2. **Login Process**: 
   - User enters credentials on `/admin/login`
   - API call to `/api/v1/auth/login` with username/email and password
   - If successful and role is ADMIN, stores token and user data in localStorage
   - Redirects to `/admin` dashboard

3. **Logout Process**:
   - User clicks logout button in admin sidebar
   - Clears all authentication data from localStorage
   - Redirects to `/admin/login`

## Protected Routes

All routes under `/admin/*` are automatically protected:
- `/admin` - Main dashboard
- `/admin/analytics` - Analytics page
- `/admin/add-product` - Add product page
- `/admin/manage-order` - Order management
- `/admin/manage-coupon` - Coupon management
- `/admin/dashboard` - Dashboard (if different from main)

## API Integration

The admin login uses the same authentication API as the regular login:
```javascript
POST /api/v1/auth/login
{
  "usernameOrEmail": "admin@example.com",
  "password": "password"
}
```

Response includes:
- `accessToken` - JWT token for authentication
- `username` - User's username
- `userId` - User's ID
- `role` - User's role (must be "ADMIN")

## Security Features

1. **Role-based Access**: Only users with ADMIN role can access admin panel
2. **Token Validation**: Checks for valid JWT token in localStorage
3. **Automatic Redirects**: Unauthorized users are automatically redirected to login
4. **Secure Logout**: Properly clears all authentication data
5. **Loading States**: Prevents UI flashing during authentication checks

## Usage

### For Developers

1. **Adding New Admin Pages**: Simply create pages under `/admin/` directory - they'll be automatically protected
2. **Customizing Admin Layout**: Modify `AdminLayout.tsx` to add new navigation items or features
3. **Extending Authentication**: Modify `AdminAuthGuard.tsx` to add additional security checks

### For Users

1. **Admin Login**: Navigate to `/admin/login` and enter admin credentials
2. **Access Admin Panel**: After successful login, access the dashboard at `/admin`
3. **Logout**: Click the logout button in the sidebar to securely log out

## Environment Variables

Make sure the following environment variable is set:
```
NEXT_PUBLIC_API_URL=your_api_base_url
```

## Troubleshooting

1. **Login Issues**: Check that the API endpoint is correct and the user has ADMIN role
2. **Redirect Loops**: Ensure the login page doesn't have AdminAuthGuard applied
3. **Token Issues**: Clear localStorage and try logging in again
4. **Role Issues**: Verify the user account has ADMIN role in the backend 