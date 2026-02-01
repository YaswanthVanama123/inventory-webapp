# Sidebar Component Documentation

## Overview

A fully responsive sidebar navigation component with role-based menu items, smooth animations, and mobile-first design.

## Location

`/Users/yaswanthgandhi/Documents/seo/client/src/components/layout/Sidebar.jsx`

## Features

- **Responsive Design**: Mobile-first approach with different behaviors for mobile and desktop
- **Role-Based Navigation**: Different menu items for Admin and Employee roles
- **Collapsible on Desktop**: Can collapse to icon-only mode to save space
- **Mobile Drawer**: Slides out from left on mobile with overlay backdrop
- **Active State Highlighting**: Visual indication of current route
- **Smooth Animations**: Transitions for collapse, slide, and hover states
- **Tailwind CSS Styling**: Uses theme colors with gradient accents
- **React Router Integration**: NavLink components for navigation

## Menu Items by Role

### Admin Menu
- Dashboard (`/dashboard`)
- Inventory (`/inventory`)
- Invoices (`/invoices`)
- Users (`/users`)
- Reports (`/reports`)

### Employee Menu
- Dashboard (`/dashboard`)
- Inventory (`/inventory`)
- Stock Update (`/stock-update`)

## Components

### 1. Sidebar (Default Export)

Main sidebar component.

**Props:**
- `isOpen` (boolean): Controls mobile menu visibility
- `onClose` (function): Callback to close mobile menu

**Example:**
```jsx
import Sidebar from './components/layout/Sidebar';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Sidebar
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
    />
  );
}
```

### 2. MobileMenuButton (Named Export)

Toggle button for mobile menu.

**Props:**
- `onClick` (function): Callback when button is clicked
- `isOpen` (boolean): Current state of mobile menu

**Example:**
```jsx
import { MobileMenuButton } from './components/layout/Sidebar';

<MobileMenuButton
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  isOpen={isMobileMenuOpen}
/>
```

## Usage with MainLayout

The easiest way to use the Sidebar is with the included MainLayout component:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          {/* Add more routes */}
        </Routes>
      </MainLayout>
    </Router>
  );
}
```

## Desktop Behavior

- **Width**: 256px (expanded) / 80px (collapsed)
- **Position**: Fixed on left side
- **Collapse**: Click the chevron button in the header to toggle
- **Hover**: Menu items show hover effects
- **Active**: Current route is highlighted with gradient background

## Mobile Behavior (< 768px)

- **Width**: 256px
- **Position**: Fixed, hidden by default
- **Overlay**: Dark backdrop when menu is open
- **Slide**: Slides in from left when opened
- **Auto-close**: Closes automatically when route changes
- **Toggle**: Use MobileMenuButton to open/close

## Styling

The component uses Tailwind CSS with the following color scheme:

- **Background**: Slate gradient (900 → 800 → 900)
- **Text**: White primary, slate-400 secondary
- **Active**: Blue to purple gradient
- **Hover**: Slate-700 with 50% opacity
- **Borders**: Slate-700 with 50% opacity
- **Shadows**: 2xl shadow, blue glow on active items

## Dependencies

Required packages (add to package.json):

```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^6.x.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x.x",
    "autoprefixer": "^10.x.x",
    "postcss": "^8.x.x"
  }
}
```

## Tailwind Configuration

Ensure your `tailwind.config.js` includes the component path:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## CSS Setup

Create or update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar for sidebar */
@layer utilities {
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
}
```

## AuthContext Integration

The Sidebar uses AuthContext to:
- Get current user information
- Determine user role (admin vs employee)
- Display user avatar and name

Make sure AuthContext is provided in your app:

```jsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app content */}
    </AuthProvider>
  );
}
```

## Customization

### Adding New Menu Items

Edit the menu item arrays in Sidebar.jsx:

```jsx
const adminMenuItems = [
  { label: 'Your Page', path: '/your-path', icon: YourIcon },
  // ... existing items
];
```

### Creating Custom Icons

Follow the SVG component pattern:

```jsx
const YourIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
  </svg>
);
```

### Changing Colors

Modify the Tailwind classes in the component:

```jsx
// Example: Change background gradient
className="bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900"

// Example: Change active state
className="bg-gradient-to-r from-emerald-600 to-teal-600"
```

### Adjusting Breakpoints

Change the mobile breakpoint (default is 768px):

```jsx
const mobile = window.innerWidth < 1024; // Now mobile is < 1024px
```

Also update the Tailwind classes:
```jsx
className="lg:hidden" // Instead of md:hidden
className="lg:ml-64"  // Instead of md:ml-64
```

## Accessibility

The component includes:
- ARIA labels for buttons
- Semantic HTML structure
- Keyboard navigation support (via NavLink)
- Focus states on interactive elements
- Screen reader friendly text

## Performance

- Icons are inline SVG components (no external requests)
- Smooth CSS transitions (GPU accelerated)
- Event listener cleanup in useEffect
- Conditional rendering based on state

## Browser Support

Compatible with all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Sidebar not showing
- Check that AuthProvider wraps your app
- Verify React Router is set up correctly
- Ensure Tailwind CSS is properly configured

### Menu items not highlighting
- Verify routes match the path in menuItems
- Check that NavLink is imported from react-router-dom
- Ensure location.pathname is accessible

### Mobile menu not opening
- Check that isOpen prop is being updated
- Verify onClick handler is connected to state
- Check z-index conflicts with other elements

### Styles not applying
- Run `npm install tailwindcss`
- Ensure Tailwind directives are in CSS file
- Check that content paths in tailwind.config.js are correct
- Restart development server after config changes

## Examples

### Protected Routes with Layout

```jsx
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <MainLayout>{children}</MainLayout>;
}

// Usage
<Route
  path="/users"
  element={
    <ProtectedRoute requireAdmin>
      <Users />
    </ProtectedRoute>
  }
/>
```

### Custom Layout with Sidebar

```jsx
import { useState } from 'react';
import Sidebar, { MobileMenuButton } from './components/layout/Sidebar';

function CustomLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <MobileMenuButton
        onClick={() => setMenuOpen(!menuOpen)}
        isOpen={menuOpen}
      />
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 md:ml-64 overflow-auto">
        <header className="bg-white shadow p-4">
          <h1>Custom Header</h1>
        </header>
        <main className="p-6">
          {children}
        </main>
        <footer className="bg-white border-t p-4">
          <p>Custom Footer</p>
        </footer>
      </div>
    </div>
  );
}
```

## License

ISC
