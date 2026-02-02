# API Services Documentation

Complete API service layer for the Inventory Management System client application.

## Overview

This service layer provides a clean, organized interface to communicate with the backend API. All services are built on top of Axios and include comprehensive error handling, authentication, and request/response interceptors.

## Base Configuration

**Base URL:** `http://localhost:5000/api`

All services use a centralized Axios instance configured in `api.js` with:
- JWT token authentication (automatic from localStorage)
- Request/response interceptors
- Standardized error handling
- Automatic 401 redirect to login
- 15-second timeout

## Installation

Ensure axios is installed:

```bash
npm install axios
```

## Services

### 1. api.js - Core Axios Instance

The foundation of all API calls with built-in interceptors.

**Features:**
- Automatic JWT token attachment from localStorage
- Response data extraction
- Error formatting and handling
- 401/403/429/500 error handling
- Network error detection

**Helper Functions:**
```javascript
import { setAuthToken, getAuthToken, isAuthenticated } from './services/api';

// Set authentication token
setAuthToken(token);

// Get current token
const token = getAuthToken();

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}
```

---

### 2. authService.js - Authentication

Handles user authentication and session management.

**Methods:**

#### login(username, password)
Login user and store token/user data.
```javascript
import { authService } from './services';

const response = await authService.login('admin', 'Admin@123');
// Automatically stores token and user data in localStorage
```

#### logout()
Logout user and clear session.
```javascript
await authService.logout();
// Clears token and user data from localStorage
```

#### getMe()
Get current user information.
```javascript
const response = await authService.getMe();
const user = response.data.user;
```

#### changePassword(currentPassword, newPassword)
Change authenticated user's password.
```javascript
await authService.changePassword('OldPass@123', 'NewPass@123');
```

#### getCurrentUser()
Get user from localStorage (no API call).
```javascript
const user = authService.getCurrentUser();
```

#### isAuthenticated()
Check if user is logged in.
```javascript
if (authService.isAuthenticated()) {
  // User is authenticated
}
```

#### isAdmin() / isEmployee()
Check user role.
```javascript
if (authService.isAdmin()) {
  // User has admin privileges
}
```

---

### 3. inventoryService.js - Inventory Management

Handles all inventory-related operations.

**Methods:**

#### getAll(params)
Get all inventory items with pagination and filters.
```javascript
import { inventoryService } from './services';

const response = await inventoryService.getAll({
  page: 1,
  limit: 20,
  category: 'Electronics',
  search: 'laptop',
  lowStock: false
});

const { items, pagination } = response.data;
```

#### getById(id)
Get single inventory item.
```javascript
const response = await inventoryService.getById('507f1f77bcf86cd799439013');
const item = response.data.item;
```

#### create(itemData)
Create new inventory item (Admin only).
```javascript
const newItem = await inventoryService.create({
  itemName: 'Wireless Mouse',
  skuCode: 'MOUSE-WIRELESS-001',
  description: 'Ergonomic wireless mouse',
  category: 'Electronics',
  tags: ['mouse', 'wireless'],
  quantity: {
    current: 50,
    minimum: 10,
    unit: 'pieces'
  },
  pricing: {
    purchasePrice: 15.00,
    sellingPrice: 29.99,
    currency: 'USD'
  },
  supplier: {
    name: 'Office Supplies Co',
    contactPerson: 'Sarah Williams',
    email: 'sarah@officesupplies.com',
    phone: '+1-555-0456',
    address: '456 Commerce Ave, New York, NY 10001',
    leadTime: 3,
    reorderPoint: 15,
    minimumOrderQuantity: 10
  }
});
```

#### update(id, itemData)
Update inventory item (Admin only).
```javascript
await inventoryService.update(id, {
  itemName: 'Updated Name',
  pricing: {
    purchasePrice: 16.00,
    sellingPrice: 31.99
  }
});
```

#### delete(id)
Soft delete inventory item (Admin only).
```javascript
await inventoryService.delete(id);
```

#### updateStock(id, stockData)
Update stock quantity.
```javascript
await inventoryService.updateStock(id, {
  quantity: 10,
  action: 'add', // 'add', 'remove', or 'set'
  reason: 'New shipment received'
});
```

#### getHistory(id, limit)
Get stock change history.
```javascript
const response = await inventoryService.getHistory(id, 20);
const history = response.data.history;
```

#### getLowStock()
Get all low stock items.
```javascript
const response = await inventoryService.getLowStock();
const lowStockItems = response.data.items;
```

#### getCategories()
Get all unique categories.
```javascript
const response = await inventoryService.getCategories();
const categories = response.data.categories;
```

#### uploadImages(id, images, primaryIndex)
Upload images for inventory item (Admin only).
```javascript
const fileInput = document.getElementById('file-input');
const files = fileInput.files;

await inventoryService.uploadImages(id, files, 0);
```

#### deleteImage(id, imageUrl)
Delete an image (Admin only).
```javascript
await inventoryService.deleteImage(id, imageUrl);
```

#### setPrimaryImage(id, imageUrl)
Set primary image (Admin only).
```javascript
await inventoryService.setPrimaryImage(id, imageUrl);
```

#### generateInvoice(id, invoiceData)
Generate invoice for item (Admin only).
```javascript
const response = await inventoryService.generateInvoice(id, {
  type: 'sale',
  quantity: 5,
  customerName: 'ABC Corporation',
  customerEmail: 'contact@abccorp.com',
  customerAddress: '789 Business Blvd, City, State 12345',
  notes: 'Payment terms: Net 30',
  includeQRCode: true
});

const { invoice } = response.data;
// Access invoice.pdfUrl for the PDF file
```

---

### 4. userService.js - User Management

Handles user management operations (Admin only).

**Methods:**

#### getAll(params)
Get all users with pagination and filters.
```javascript
import { userService } from './services';

const response = await userService.getAll({
  page: 1,
  limit: 10,
  role: 'employee',
  isActive: true
});

const { users, pagination } = response.data;
```

#### getById(id)
Get user by ID.
```javascript
const response = await userService.getById(id);
const user = response.data.user;
```

#### create(userData)
Create new user.
```javascript
await userService.create({
  username: 'newemployee',
  email: 'newemployee@example.com',
  password: 'TempPassword@123',
  fullName: 'Jane Smith',
  role: 'employee'
});
```

#### update(id, userData)
Update user information.
```javascript
await userService.update(id, {
  email: 'updated@example.com',
  fullName: 'Jane Doe Smith',
  isActive: true
});
```

#### delete(id)
Delete user (soft delete).
```javascript
await userService.delete(id);
```

#### resetPassword(id, newPassword)
Reset user password.
```javascript
await userService.resetPassword(id, 'TempPassword@456');
```

#### Helper Methods
```javascript
// Get users by role
const admins = await userService.getByRole('admin');

// Get active users
const activeUsers = await userService.getActive();

// Get inactive users
const inactiveUsers = await userService.getInactive();
```

---

### 5. invoiceService.js - Invoice Management

Handles invoice operations.

**Methods:**

#### getAll(params)
Get all invoices with filters.
```javascript
import { invoiceService } from './services';

const response = await invoiceService.getAll({
  page: 1,
  limit: 10,
  type: 'sale',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  customerName: 'ABC Corp'
});
```

#### getById(id)
Get invoice by ID.
```javascript
const response = await invoiceService.getById(id);
const invoice = response.data.invoice;
```

#### getByNumber(number)
Get invoice by number.
```javascript
const response = await invoiceService.getByNumber('INV-2026-00123');
```

#### create(invoiceData)
Create new invoice.
```javascript
await invoiceService.create({
  itemId: '507f1f77bcf86cd799439013',
  type: 'sale',
  quantity: 5,
  customerName: 'ABC Corporation',
  customerEmail: 'contact@abccorp.com',
  customerAddress: '789 Business Blvd',
  notes: 'Payment terms: Net 30',
  includeQRCode: true
});
```

#### update(id, invoiceData)
Update invoice.
```javascript
await invoiceService.update(id, { notes: 'Updated notes' });
```

#### delete(id)
Delete invoice.
```javascript
await invoiceService.delete(id);
```

#### getPDF(id, download)
Get or download invoice PDF.
```javascript
// Download PDF
await invoiceService.getPDF(id, true);

// Get PDF Blob
const pdfBlob = await invoiceService.getPDF(id, false);
```

#### sendEmail(id, emailData)
Send invoice via email.
```javascript
await invoiceService.sendEmail(id, {
  to: 'customer@example.com',
  subject: 'Your Invoice',
  message: 'Thank you for your business'
});
```

#### Helper Methods
```javascript
// Get by type
const salesInvoices = await invoiceService.getByType('sale');

// Get by date range
const invoices = await invoiceService.getByDateRange('2026-01-01', '2026-01-31');

// Get recent invoices
const recent = await invoiceService.getRecent(10);

// Preview invoice
const preview = await invoiceService.preview(invoiceData);
```

---

### 6. reportService.js - Reports & Analytics

Handles reporting and analytics (Admin only).

**Methods:**

#### dashboard()
Get dashboard statistics.
```javascript
import { reportService } from './services';

const response = await reportService.dashboard();
const { summary, stockByCategory, topItems, recentChanges } = response.data;
```

#### stockSummary(params)
Get stock summary report.
```javascript
// JSON format
const response = await reportService.stockSummary({
  category: 'Electronics'
});

// Download PDF
await reportService.stockSummary({
  category: 'Electronics',
  format: 'pdf'
});

// Download CSV
await reportService.stockSummary({ format: 'csv' });

// Download Excel
await reportService.stockSummary({ format: 'excel' });
```

#### profitMargin(params)
Get profit margin analysis.
```javascript
const response = await reportService.profitMargin({
  minMargin: 20,
  sortBy: 'profit',
  order: 'desc'
});

// Download as PDF
await reportService.profitMargin({ format: 'pdf' });
```

#### reorderList(params)
Get items needing reorder.
```javascript
const response = await reportService.reorderList();
const { items, summary } = response.data;

// Download as Excel
await reportService.reorderList({ format: 'excel' });
```

#### auditLogs(params)
Get audit logs.
```javascript
const response = await reportService.auditLogs({
  page: 1,
  limit: 50,
  action: 'UPDATE',
  resource: 'INVENTORY',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});

const { logs, pagination } = response.data;
```

#### sales(params)
Get sales report.
```javascript
const response = await reportService.sales({
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  category: 'Electronics'
});

// Download as PDF
await reportService.sales({ format: 'pdf' });
```

#### valuation(params)
Get inventory valuation.
```javascript
const response = await reportService.valuation({
  category: 'Electronics',
  valuationType: 'selling'
});

// Download as Excel
await reportService.valuation({ format: 'excel' });
```

#### export(reportType, params)
Export any report.
```javascript
await reportService.export('stock-summary', { format: 'pdf' });
```

#### Helper Methods
```javascript
// Stock by category
const distribution = await reportService.stockByCategory();

// Top items
const topItems = await reportService.topItems(10);

// Recent activity
const activity = await reportService.recentActivity(20);
```

---

## Usage Examples

### Complete Login Flow
```javascript
import { authService, inventoryService } from './services';

// Login
try {
  const response = await authService.login('admin', 'Admin@123');
  console.log('Logged in:', response.data.user);

  // Token is automatically stored and will be used for all future requests

  // Fetch inventory
  const items = await inventoryService.getAll({ page: 1, limit: 10 });
  console.log('Inventory:', items.data.items);

} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Error Handling
```javascript
import { inventoryService } from './services';

try {
  await inventoryService.create(itemData);
} catch (error) {
  // Error is already formatted by the interceptor
  console.error('Error:', error.message);
  console.error('Code:', error.code);

  if (error.code === 'DUPLICATE_SKU') {
    alert('SKU code already exists');
  }
}
```

### Logout Flow
```javascript
import { authService } from './services';

const handleLogout = async () => {
  try {
    await authService.logout();
    // Redirect handled automatically by interceptor
  } catch (error) {
    console.error('Logout error:', error);
    // Still clears local data even on error
  }
};
```

---

## Error Codes

Common error codes returned by the API:

- `INVALID_CREDENTIALS` - Invalid username or password
- `TOKEN_EXPIRED` - JWT token has expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `DUPLICATE_SKU` - SKU code already exists
- `ITEM_NOT_FOUND` - Inventory item not found
- `USER_NOT_FOUND` - User not found
- `INSUFFICIENT_STOCK` - Not enough stock for operation
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `NETWORK_ERROR` - No response from server
- `REQUEST_ERROR` - Error in request setup

---

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication (auto-redirects to login)
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limiting

The API includes rate limiting:
- **General endpoints:** 100 requests per 15 minutes
- **Login endpoint:** 5 requests per 15 minutes
- **Password reset:** 3 requests per hour

Rate limit information is included in response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## File Structure

```
client/src/services/
├── index.js              # Central export point
├── api.js                # Axios instance with interceptors
├── authService.js        # Authentication API calls
├── inventoryService.js   # Inventory management API calls
├── userService.js        # User management API calls
├── invoiceService.js     # Invoice API calls
└── reportService.js      # Reporting & analytics API calls
```

---

## Notes

1. All services automatically attach JWT token from localStorage
2. 401 errors automatically redirect to /login
3. File downloads are handled automatically for PDF/CSV/Excel exports
4. All promises reject with formatted error objects
5. Response data is automatically extracted (no need to access response.data.data)
6. Services require the backend API to be running at http://localhost:5000

---

## Backend API Documentation

For complete API documentation, see:
`/Users/yaswanthgandhi/Documents/seo/server/API_DOCUMENTATION.md`

---

**Last Updated:** February 1, 2026
