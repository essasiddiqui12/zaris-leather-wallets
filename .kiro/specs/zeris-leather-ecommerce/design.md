# Design: Zeris Leather E-commerce Platform

## 1. System Overview

### 1.1 Architecture
The Zeris Leather platform follows a modern JAMstack architecture using Next.js with Firebase backend services:

- **Frontend**: Next.js 14+ (React 18+, TypeScript)
- **Backend**: Firebase (Authentication, Firestore, Storage, Cloud Functions)
- **Payment**: Stripe API
- **Email**: SendGrid API or Firebase Extensions
- **Hosting**: Vercel (recommended for Next.js) or Firebase Hosting
- **CDN**: Automatic via hosting provider

### 1.2 Design Principles
1. **Mobile-First**: Design responsive components starting from mobile viewport
2. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with it
3. **Security by Default**: Authentication, authorization, and data validation at all layers
4. **Performance**: Code splitting, lazy loading, image optimization, SSR/ISR where beneficial
5. **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers

## 2. System Architecture

### 2.1 Application Structure

```
zeris-leather/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (storefront)/       # Customer-facing routes
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── products/       # Product listing and details
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Checkout flow
│   │   │   └── account/        # User account pages
│   │   ├── admin/              # Admin dashboard routes
│   │   │   ├── dashboard/      # Analytics dashboard
│   │   │   ├── products/       # Product management
│   │   │   ├── orders/         # Order management
│   │   │   └── customers/      # Customer management
│   │   ├── api/                # API routes
│   │   │   ├── webhook/        # Payment webhooks
│   │   │   └── admin/          # Admin API endpoints
│   │   ├── auth/               # Authentication pages
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── storefront/         # Customer-facing components
│   │   ├── admin/              # Admin components
│   │   ├── shared/             # Shared UI components
│   │   └── layouts/            # Layout components
│   ├── lib/                    # Core libraries and utilities
│   │   ├── firebase/           # Firebase configuration and utilities
│   │   ├── stripe/             # Stripe integration
│   │   ├── email/              # Email service integration
│   │   ├── validation/         # Data validation schemas
│   │   └── utils/              # Helper functions
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React context providers
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Next.js middleware (auth, etc.)
├── public/                     # Static assets
├── firebase/                   # Firebase configuration
│   └── functions/              # Cloud Functions
└── tests/                      # Test files

### 2.2 Data Flow

#### Customer Flow
1. User browses products → Next.js SSR/ISR renders product pages
2. User adds to cart → Cart stored in localStorage (guest) or Firestore (authenticated)
3. User proceeds to checkout → Stripe payment intent created
4. Payment confirmed → Order created in Firestore, inventory updated
5. Order confirmation email sent via Cloud Function trigger

#### Admin Flow
1. Admin authenticates → Firebase Auth with custom claims for role verification
2. Admin manages products → Direct Firestore writes with validation
3. Admin updates order status → Firestore update triggers email notification
4. Analytics queries → Server-side aggregation from Firestore

### 2.3 Security Model

#### Authentication
- **Firebase Authentication** for user management
- **Custom claims** for role-based access (customer, admin)
- **Middleware** protects admin routes at edge (Next.js middleware)
- **Session management** via Firebase Auth tokens

#### Authorization Rules
- Customers can read their own orders and user data
- Customers can write to their own cart and profile
- Admins can read/write all products, orders, and customer data
- Unauthenticated users can read products only
- All writes validated server-side

#### Firestore Security Rules Pattern
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.get('role', '') == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Products - read by all, write by admin
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Orders - read/write own orders, admin reads all
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.customerId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
    }
    
    // Users - read/write own profile, admin reads all
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId);
    }
    
    // Carts - read/write own cart
    match /carts/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

## 3. Data Models

### 3.1 Firestore Collections

#### Products Collection (`/products`)
```typescript
interface Product {
  id: string;                    // Document ID
  name: string;                  // Product name
  description: string;           // Full description (supports markdown)
  price: number;                 // Price in cents (e.g., 5999 for $59.99)
  category: 'bags' | 'wallets' | 'belts' | 'accessories';
  colors: string[];              // Available colors
  stock: number;                 // Current stock quantity
  lowStockThreshold: number;     // Alert threshold (default: 5)
  images: string[];              // Array of image URLs (Firebase Storage)
  primaryImage: string;          // URL of main product image
  status: 'active' | 'inactive'; // Visibility status
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required:**
- Composite: `category` (ascending), `status` (ascending), `createdAt` (descending)
- Single: `status` (ascending) for filtering
- Single: `stock` (ascending) for low stock queries

#### Orders Collection (`/orders`)

```typescript
interface Order {
  id: string;                    // Document ID
  customerId: string;            // Firebase Auth UID
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  items: OrderItem[];
  subtotal: number;              // In cents
  tax: number;                   // In cents (if applicable)
  total: number;                 // In cents
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;         // e.g., "card", "paypal"
  paymentStatus: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OrderItem {
  productId: string;
  name: string;                  // Snapshot at order time
  price: number;                 // Snapshot at order time (in cents)
  quantity: number;
  color?: string;                // Selected color if applicable
}
```

**Indexes Required:**
- Composite: `customerId` (ascending), `createdAt` (descending)
- Composite: `status` (ascending), `createdAt` (descending)
- Single: `paymentStatus` (ascending)

#### Users Collection (`/users`)
```typescript
interface User {
  id: string;                    // Same as Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  accountStatus: 'active' | 'disabled';
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}
```

**Indexes Required:**
- Single: `email` (ascending) for search
- Single: `role` (ascending) for admin filtering

#### Carts Collection (`/carts`)

```typescript
interface Cart {
  id: string;                    // Same as user ID
  userId: string;                // Firebase Auth UID
  items: CartItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;         // Price at time added (in cents)
}
```

### 3.2 Client-Side State Management

#### Context Providers

1. **AuthContext**: Manages authentication state, user profile
2. **CartContext**: Manages cart state (syncs with Firestore or localStorage)
3. **ToastContext**: Global notifications and alerts

## 4. Component Architecture

### 4.1 Storefront Components

#### Product Components
- **ProductCard**: Displays product thumbnail, name, price, stock status
- **ProductGrid**: Grid layout of ProductCard components with filtering
- **ProductDetail**: Full product page with image gallery, description, add-to-cart
- **ProductFilter**: Filter controls (category, price range, color)
- **ProductSearch**: Search input with debounced queries

#### Cart Components
- **CartDrawer**: Sliding panel showing cart contents
- **CartItem**: Individual cart item with quantity controls and remove button
- **CartSummary**: Subtotal, tax, total calculation display

#### Checkout Components
- **CheckoutForm**: Multi-step form (shipping info, payment)
- **AddressForm**: Reusable address input fields with validation
- **PaymentForm**: Stripe Elements integration for card input
- **OrderSummary**: Review order before submission

#### Account Components
- **OrderHistory**: List of customer orders with status
- **OrderDetail**: Detailed view of single order
- **ProfileForm**: Edit user profile information
- **PasswordChange**: Secure password update form

### 4.2 Admin Components

#### Dashboard Components
- **StatCard**: Display key metrics (sales, orders, customers)
- **SalesChart**: Line/bar chart for sales trends
- **RecentOrders**: Table of recent orders
- **LowStockAlert**: List of products below threshold

#### Product Management Components
- **ProductTable**: Sortable, filterable table of all products
- **ProductForm**: Create/edit product with image upload
- **ImageUploader**: Drag-and-drop image upload with preview
- **StockManager**: Bulk update stock quantities

#### Order Management Components
- **OrderTable**: Admin view of all orders with filters
- **OrderActions**: Update status, add tracking, cancel order
- **OrderTimeline**: Visual timeline of order status changes
