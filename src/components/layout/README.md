# Layout Components

Two main layout components for the SEO Platform application.

## Components

### 1. DashboardLayout.jsx
**Purpose**: Main wrapper for authenticated/protected pages

**Features**:
- Fixed navbar with search, notifications, and user menu
- Collapsible sidebar with navigation
- Mobile-responsive with drawer/overlay
- Footer with links
- Uses React Router Outlet for nested routes

**File**: `/Users/yaswanthgandhi/Documents/seo/client/src/components/layout/DashboardLayout.jsx`

### 2. AppLayout.jsx
**Purpose**: Wrapper for public/unauthenticated pages

**Features**:
- Sticky header with navigation
- Login/Register buttons
- Mobile-responsive menu
- Rich footer with multiple columns
- Uses React Router Outlet for nested routes

**File**: `/Users/yaswanthgandhi/Documents/seo/client/src/components/layout/AppLayout.jsx`

## Quick Start

```jsx
import { DashboardLayout, AppLayout } from './components/layout';

// Use in your routes
<Route element={<AppLayout />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
</Route>

<Route element={<DashboardLayout />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

See USAGE.md for detailed documentation.

## Dependencies

- react-router-dom
- lucide-react (for icons)
- Tailwind CSS

## Structure

```
client/src/components/layout/
├── DashboardLayout.jsx    # Authenticated pages layout
├── AppLayout.jsx          # Public pages layout
├── index.js              # Barrel exports
├── README.md             # This file
└── USAGE.md              # Detailed usage guide
```
