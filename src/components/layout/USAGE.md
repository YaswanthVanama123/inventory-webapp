# Layout Components Usage Guide

## Overview

Two main layout components have been created:
1. **DashboardLayout** - For authenticated pages with sidebar navigation
2. **AppLayout** - For public/unauthenticated pages with header/footer only

## File Locations

- `/Users/yaswanthgandhi/Documents/seo/client/src/components/layout/DashboardLayout.jsx`
- `/Users/yaswanthgandhi/Documents/seo/client/src/components/layout/AppLayout.jsx`
- `/Users/yaswanthgandhi/Documents/seo/client/src/components/layout/index.js`

## DashboardLayout Features

### Structure
- **Fixed Navbar** at top with:
  - Logo
  - Mobile menu toggle
  - Search bar (desktop only)
  - Notifications bell
  - User menu dropdown with logout

- **Sidebar** on left with:
  - Navigation items (Dashboard, Content, Analytics, Settings)
  - Active route highlighting
  - Upgrade to Pro call-to-action
  - Smooth transitions

- **Main Content Area** with:
  - React Router Outlet for nested routes
  - Responsive padding
  - Max-width container

- **Footer** with:
  - Copyright info
  - Links to Terms, Privacy, Support

### Responsive Behavior
- **Desktop (lg+)**: Fixed sidebar visible
- **Mobile**: Sidebar as overlay/drawer with backdrop
- Breakpoint: 1024px (Tailwind's `lg`)

### Mobile Features
- Hamburger menu button
- Overlay backdrop when sidebar is open
- Click outside to close sidebar
- Auto-close on route change
- Smooth slide transitions

### State Management
- `sidebarOpen` - Controls mobile sidebar visibility
- `isMobile` - Tracks screen size
- `userMenuOpen` - Controls user dropdown menu

## AppLayout Features

### Structure
- **Sticky Header** with:
  - Logo
  - Navigation links (Features, Pricing, About, Contact)
  - Login/Get Started buttons
  - Mobile menu toggle

- **Main Content** with:
  - React Router Outlet
  - Full-width content area

- **Rich Footer** with:
  - Brand info with social links
  - Four-column layout (Product, Company, Legal)
  - Responsive grid
  - Copyright info

### Responsive Behavior
- Desktop: Horizontal navigation
- Mobile: Collapsible menu with full links

## Usage Examples

### Setting up Routes

\`\`\`jsx
// App.jsx or Routes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout, AppLayout } from './components/layout';

// Import your page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ContentPage from './pages/dashboard/ContentPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Protected routes with DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/content" element={<ContentPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
\`\`\`

### Creating a Protected Route Component

\`\`\`jsx
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
\`\`\`

### Using with Protected Routes

\`\`\`jsx
import ProtectedRoute from './components/ProtectedRoute';

// In your Routes
<Route element={
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
}>
  <Route path="/dashboard" element={<DashboardPage />} />
  {/* ... other protected routes */}
</Route>
\`\`\`

### Sample Dashboard Page

\`\`\`jsx
// pages/dashboard/DashboardPage.jsx
const DashboardPage = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">24,532</p>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>
        {/* More cards... */}
      </div>
    </div>
  );
};

export default DashboardPage;
\`\`\`

### Sample Public Page

\`\`\`jsx
// pages/HomePage.jsx
const HomePage = () => {
  return (
    <div>
      {/* Hero section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Boost Your SEO Performance
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The all-in-one platform for managing your SEO content and analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg">
              Get Started Free
            </button>
            <button className="px-8 py-3 border border-gray-300 rounded-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>
      {/* More sections... */}
    </div>
  );
};

export default HomePage;
\`\`\`

## Customization

### Updating Navigation Items

Edit the `navItems` array in DashboardLayout.jsx:

\`\`\`jsx
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Content', path: '/dashboard/content' },
  { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  // Add more items here
];
\`\`\`

### Changing Colors

The layouts use Tailwind CSS. Main color scheme:
- Primary: `blue-600` (can be changed to any Tailwind color)
- Background: `gray-50`
- Border: `gray-200`
- Text: `gray-900`, `gray-700`, `gray-600`

### Updating User Info

Replace the hardcoded user info in DashboardLayout.jsx with real data:

\`\`\`jsx
// Import user context or fetch user data
const { user } = useAuth(); // Your auth context

// In the user menu section
<p className="text-sm font-medium text-gray-900">{user.name}</p>
<p className="text-xs text-gray-500">{user.role}</p>
\`\`\`

## Dependencies

These components use:
- `react-router-dom` - For routing (Outlet, Link, useNavigate, useLocation)
- `lucide-react` - For icons
- Tailwind CSS - For styling

Make sure these are installed:

\`\`\`bash
npm install react-router-dom lucide-react
\`\`\`

## Tailwind Configuration

Ensure your `tailwind.config.js` includes:

\`\`\`js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

## Tips

1. **Z-index Layering**:
   - Navbar: z-30
   - Sidebar: z-20
   - Mobile overlay: z-20

2. **Breakpoints**:
   - Mobile: < 768px
   - Tablet: 768px - 1023px
   - Desktop: >= 1024px

3. **Logout Functionality**:
   The `handleLogout` function clears the token and redirects. Update it to match your auth system.

4. **Active Route Detection**:
   Uses `location.pathname` to highlight active nav items. Adjust the `isActiveRoute` function if needed.

5. **Smooth Transitions**:
   All transitions use Tailwind's `transition-*` utilities with durations of 200-300ms.
