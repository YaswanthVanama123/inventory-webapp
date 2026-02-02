# Common UI Components

A comprehensive collection of reusable React components built with Tailwind CSS. All components are fully responsive, accessible, and support both light and dark modes.

## Installation

Import components individually or use the barrel export:

```jsx
// Individual import
import Button from './components/common/Button';

// Barrel export (recommended)
import { Button, Input, Card } from './components/common';
```

## Components

### 1. Button

Multi-variant button component with loading states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (default: false)
- `disabled`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `type`: 'button' | 'submit' | 'reset' (default: 'button')

**Example:**
```jsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>

<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

<Button variant="outline" fullWidth>
  Full Width Button
</Button>
```

---

### 2. Input

Text input with label, error messages, and icon support.

**Props:**
- `label`: string
- `type`: string (default: 'text')
- `name`: string (required)
- `value`: string | number
- `onChange`: function
- `placeholder`: string
- `error`: string
- `helperText`: string
- `icon`: React node
- `iconPosition`: 'left' | 'right' (default: 'left')
- `required`: boolean (default: false)
- `fullWidth`: boolean (default: false)

**Example:**
```jsx
import { Mail } from 'lucide-react';

<Input
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  error={errors.email}
  icon={<Mail size={20} />}
  required
/>
```

---

### 3. Select

Dropdown select component with label and error handling.

**Props:**
- `label`: string
- `name`: string (required)
- `value`: string | number
- `onChange`: function
- `options`: array of { value, label, disabled? }
- `placeholder`: string (default: 'Select an option')
- `error`: string
- `helperText`: string
- `required`: boolean (default: false)
- `fullWidth`: boolean (default: false)

**Example:**
```jsx
<Select
  label="Country"
  name="country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ]}
  required
/>
```

---

### 4. Card

Container component with optional header and footer.

**Props:**
- `title`: string
- `subtitle`: string
- `headerAction`: React node
- `footer`: React node
- `padding`: 'none' | 'sm' | 'normal' | 'lg' (default: 'normal')
- `hover`: boolean (default: false)

**Example:**
```jsx
<Card
  title="User Profile"
  subtitle="Manage your account settings"
  headerAction={<Button size="sm">Edit</Button>}
  footer={<Button fullWidth>Save Changes</Button>}
  hover
>
  <p>Card content goes here</p>
</Card>
```

---

### 5. Modal

Overlay modal dialog with close functionality.

**Props:**
- `isOpen`: boolean (required)
- `onClose`: function (required)
- `title`: string
- `footer`: React node
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `closeOnOverlayClick`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

**Example:**
```jsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

---

### 6. Table

Responsive table with sorting capabilities.

**Props:**
- `columns`: array of { key, label, sortable?, render? } (required)
- `data`: array of objects (required)
- `sortable`: boolean (default: false)
- `hoverable`: boolean (default: true)
- `striped`: boolean (default: false)
- `responsive`: boolean (default: true)
- `emptyMessage`: string (default: 'No data available')

**Example:**
```jsx
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <Badge variant={value}>{value}</Badge>
  },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'success' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'warning' },
];

<Table columns={columns} data={data} sortable hoverable />
```

---

### 7. Badge

Status badge component with multiple variants.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' (default: 'default')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `rounded`: boolean (default: true)
- `dot`: boolean (default: false)

**Example:**
```jsx
<Badge variant="success">Active</Badge>
<Badge variant="warning" dot>Pending</Badge>
<Badge variant="danger" size="lg">Error</Badge>
```

---

### 8. LoadingSpinner

Animated loading spinner with optional full-screen mode.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'blue' | 'gray' | 'white' | 'green' | 'red' (default: 'blue')
- `fullScreen`: boolean (default: false)
- `text`: string

**Example:**
```jsx
<LoadingSpinner size="lg" text="Loading..." />
<LoadingSpinner fullScreen text="Please wait..." />
```

---

### 9. EmptyState

Empty data placeholder component.

**Props:**
- `icon`: React node
- `title`: string
- `description`: string
- `action`: React node

**Example:**
```jsx
<EmptyState
  title="No results found"
  description="Try adjusting your search criteria"
  action={<Button onClick={handleReset}>Clear Filters</Button>}
/>
```

---

### 10. Alert

Alert/notification component with multiple variants.

**Props:**
- `variant`: 'success' | 'warning' | 'danger' | 'info' (default: 'info')
- `title`: string
- `dismissible`: boolean (default: false)
- `onDismiss`: function
- `icon`: React node (optional, uses default icons)

**Example:**
```jsx
<Alert variant="success" title="Success!" dismissible>
  Your changes have been saved successfully.
</Alert>

<Alert variant="danger" title="Error">
  Something went wrong. Please try again.
</Alert>
```

---

### 11. SearchBar

Search input component with clear functionality.

**Props:**
- `value`: string (required)
- `onChange`: function (required)
- `onSearch`: function
- `onClear`: function
- `placeholder`: string (default: 'Search...')
- `loading`: boolean (default: false)
- `disabled`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

**Example:**
```jsx
const [search, setSearch] = useState('');

<SearchBar
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onSearch={(value) => performSearch(value)}
  placeholder="Search users..."
  fullWidth
/>
```

---

### 12. Pagination

Page navigation component with customizable display.

**Props:**
- `currentPage`: number (required)
- `totalPages`: number (required)
- `onPageChange`: function (required)
- `showPageNumbers`: boolean (default: true)
- `maxPageNumbers`: number (default: 5)
- `showFirstLast`: boolean (default: true)

**Example:**
```jsx
const [page, setPage] = useState(1);

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  maxPageNumbers={5}
  showFirstLast
/>
```

---

## Features

### Responsive Design
All components are built mobile-first and include responsive breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Dark Mode Support
Every component includes dark mode variants using Tailwind's `dark:` prefix. Dark mode is automatically applied based on system preferences or can be toggled programmatically.

### Accessibility
- Proper ARIA labels and attributes
- Keyboard navigation support
- Focus states for interactive elements
- Screen reader friendly

### Consistent Styling
- Unified color palette
- Consistent spacing and sizing
- Smooth transitions and animations
- Professional shadows and borders

## Best Practices

1. **PropTypes**: All components include PropTypes for type checking during development.

2. **Default Props**: Sensible defaults are set for optional props.

3. **Composition**: Components are designed to work together seamlessly.

4. **Customization**: Use the `className` prop to add custom Tailwind classes when needed.

5. **Icons**: These components work great with icon libraries like:
   - [Heroicons](https://heroicons.com/)
   - [Lucide React](https://lucide.dev/)
   - [React Icons](https://react-icons.github.io/react-icons/)

## Usage Example

Here's a complete example combining multiple components:

```jsx
import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  SearchBar,
  Pagination,
  Badge,
  Modal,
  Alert,
  LoadingSpinner,
} from './components/common';

function UserManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
  ];

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <Alert variant="info" title="Welcome!" dismissible>
        Manage your users from this dashboard.
      </Alert>

      <Card
        title="Users"
        subtitle="Manage your team members"
        headerAction={
          <Button onClick={() => setIsModalOpen(true)}>
            Add User
          </Button>
        }
        className="mt-4"
      >
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          fullWidth
          className="mb-4"
        />

        {loading ? (
          <LoadingSpinner size="lg" text="Loading users..." />
        ) : (
          <>
            <Table columns={columns} data={users} sortable hoverable />
            <Pagination
              currentPage={page}
              totalPages={5}
              onPageChange={setPage}
              className="mt-4"
            />
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Add User</Button>
          </>
        }
      >
        <p>User form would go here...</p>
      </Modal>
    </div>
  );
}

export default UserManagement;
```

## Notes

- Ensure Tailwind CSS is properly configured in your project
- Install `prop-types` package: `npm install prop-types`
- Components use modern React hooks (requires React 16.8+)
- All components are standalone and have no external dependencies except React and PropTypes

## License

These components are part of your project and can be freely modified and extended to meet your specific needs.
