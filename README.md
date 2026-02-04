# ShopFlow - MERN E-Commerce Platform

A production-ready e-commerce platform built with the MERN stack, demonstrating full-stack development capabilities with TypeScript, Redux state management, and secure session-based authentication.

## 🛍️ Product Catalog (ShopFlow Nexus)

<p align="center">
  <img src="./screenshots/products-desktop.png" width="60%" />
  <img src="./screenshots/products-mobile.png" width="31%" />
</p>

## 👨‍💻 Authors

- **Chenyi Weng**
- **Bingchen Li**

## 🚀 Tech Stacks

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)

### Database
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

### Architecture / Other
![REST API](https://img.shields.io/badge/REST-API-orange)
![MVC](https://img.shields.io/badge/Architecture-MVC-informational)
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

## 🚀 Live Demo

**Frontend**: http://localhost:5173  
**Backend API**: http://localhost:4000  
**Health Check**: http://localhost:4000/api/health

## 🔄 Data Flow Architecture

### Authentication Flow
```mermaid
graph LR
    A[User Input] --> B[AuthForm Component]
    B --> C[authSlice Thunks<br/>loginThunk/registerThunk]
    C --> D[authService API<br/>loginAPI/registerAPI]
    D --> E[Backend Controller<br/>auth.controller.ts]
    E --> F[bcrypt Hashing]
    F --> G[Session Creation<br/>req.session.userId]
    G --> H[Redux State Update<br/>authSlice]
    H --> I[UI Re-render]
```

### Cart Management Flow
```mermaid
graph LR
    A[Add to Cart] --> B{User Authenticated?}
    B -->|No| C[localStorage Guest Cart<br/>guestCart.ts utils]
    B -->|Yes| D[cartSlice Thunks<br/>addToCart/updateCart]
    C --> E[Guest Cart Utils<br/>addToGuestCart/updateGuestCart]
    D --> F[cartService API<br/>cartService.ts]
    E --> G[Cart Merge on Login<br/>loginThunk calls mergeCartAPI]
    F --> H[Backend Cart Service<br/>cart.controller.ts]
    G --> H
    H --> I[MongoDB Storage<br/>Cart.model.ts]
    I --> J[Redux State Update<br/>cartSlice]
```

### Product Management Flow
```mermaid
graph LR
    A[Product Form] --> B[productsSlice Thunks<br/>productsSlice.ts]
    B --> C[productService API<br/>productService.ts]
    C --> D[Zod Validation<br/>validate middleware]
    D --> E[Backend Controller<br/>product.controller.ts]
    E --> F[Product Service<br/>product.service.ts]
    F --> G[MongoDB Operations<br/>Product.model.ts]
    G --> H[Redux State Update<br/>productsSlice]
    H --> I[UI Re-render]
```

## 🛠️ Quick Setup
> This repository is a **Monorepo** containing separate frontend and backend
> applications. Each application manages its own dependencies.

### Install Prerequisites
```bash
# Install Node.js (v18 or higher)
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install MongoDB locally
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Create free cluster at: https://www.mongodb.com/atlas
```

### Project Setup
```bash
# Clone and setup project
git clone https://github.com/MONA100421/ShopFlow
cd ShopFlow

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Setup environment variables
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/your-db-name
PORT=4000
SESSION_SECRET=your-super-secret-session-key
EOF

# Start development servers
# From the project root
npm install
npm run dev:all
```

## 🐻‍❄️ Implemented Features

### User Authentication
- **Session-based authentication** with MongoDB store
- **User registration** with email validation and bcrypt password hashing
- **Automatic admin role assignment** for emails containing "admin"
- **Protected routes** with authentication middleware

### Product Management
- **Full CRUD operations** for products
- **Soft delete functionality** (sets `isActive` to false)
- **Product validation** with Zod schemas
- **Admin-only product management** with route protection

### Shopping Cart System
- **Guest cart support** using localStorage for non-authenticated users
- **Automatic cart merging** when guests log in
- **Real-time cart updates** with Redux state management
- **Stock validation** preventing over-ordering 

### Search & Discovery
- **Unicode-normalized search** supporting international characters
- **Multi-dimensional sorting**: Price (asc/desc), Latest first
- **Pagination** with 10 items per page

### Order Processing
- **Order creation** from cart items (in-memory storage only)
- **Order history** with GET endpoints
- **Cart summary** with tax calculation (10%) and discount support

## 🧱 Technical Architecture

### Frontend Stack
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Redux Toolkit** for state management
- **React Router DOM** for navigation
- **CSS Modules** for component styling

### Backend Stack
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **Express Session** with MongoDB store for persistence
- **bcrypt** for secure password hashing
- **Zod** for runtime validation

## 📁 Project Structure

```
ShopFlow/
├── frontend/                 # React frontend application  
│   ├── src/  
│   │   ├── components/      # Reusable UI components  
│   │   │   ├── AuthForm.tsx  
│   │   │   ├── CartDrawer.tsx  
│   │   │   ├── CartDrawerItem.tsx  
│   │   │   ├── Pagination.tsx  
│   │   │   ├── ProductCard.tsx  
│   │   │   ├── ProductForm.tsx  
│   │   │   ├── ProductImage.tsx  
│   │   │   ├── QuantityButton.tsx  
│   │   │   └── RequireAdmin.tsx  
│   │   ├── pages/          # Page components  
│   │   │   ├── AuthPage.tsx  
│   │   │   ├── NotFoundPage.tsx  
│   │   │   ├── ProductDetailPage.tsx  
│   │   │   ├── ProductFormPage.tsx  
│   │   │   └── ProductListPage.tsx  
│   │   ├── layouts/        # Layout components  
│   │   │   └── MainLayout.tsx  
│   │   ├── store/          # Redux store and slices  
│   │   │   ├── authSlice.ts  
│   │   │   ├── cartSlice.ts  
│   │   │   ├── productsSlice.ts  
│   │   │   └── store.ts  
│   │   ├── services/       # API service functions  
│   │   │   ├── authService.ts  
│   │   │   ├── cartService.ts  
│   │   │   └── productService.ts  
│   │   ├── hooks/          # Custom React hooks  
│   │   │   ├── useCartItem.ts  
│   │   │   └── useCartTotal.ts  
│   │   ├── types/          # TypeScript type definitions  
│   │   │   ├── CartItem.ts  
│   │   │   ├── CartProduct.ts  
│   │   │   ├── Product.ts  
│   │   │   ├── ProductFormData.ts  
│   │   │   └── User.ts  
│   │   ├── utils/          # Utility functions  
│   │   │   └── guestCart.ts  
│   │   ├── assets/         # Static assets (SVG icons)  
│   │   ├── App.tsx         # Root component  
│   │   └── main.tsx        # Application entry point  
│   ├── public/             # Public assets  
│   ├── package.json  
│   └── vite.config.ts      # Vite configuration  
└── backend/                 # Express backend API  
    ├── src/  
    │   ├── controllers/    # Route controller logic  
    │   │   ├── auth.controller.ts  
    │   │   ├── cart.controller.ts  
    │   │   └── product.controller.ts  
    │   ├── models/         # Mongoose data models  
    │   │   ├── Cart.model.ts  
    │   │   ├── Product.model.ts  
    │   │   └── User.model.ts  
    │   ├── routes/         # API route definitions  
    │   │   ├── auth.routes.ts  
    │   │   ├── cart.routes.ts  
    │   │   ├── order.routes.ts  
    │   │   └── product.routes.ts  
    │   ├── services/       # Business logic layer  
    │   │   ├── cart.service.ts  
    │   │   └── product.service.ts  
    │   ├── middlewares/    # Custom middleware  
    │   │   ├── auth.middleware.ts  
    │   │   └── validate.ts  
    │   ├── validations/    # Zod schemas  
    │   │   ├── common.validation.ts  
    │   │   └── product.validation.ts  
    │   ├── mappers/        # Data transformation  
    │   │   └── cart.mapper.ts  
    │   ├── types/          # TypeScript type definitions  
    │   │   └── express.d.ts  
    │   └── server.ts       # Server entry point  
    └── package.json 
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration 
- `POST /api/auth/login` - User login 
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all active products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Soft delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart 
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `POST /api/cart/merge` - Merge guest cart to user cart

### Orders
- `POST /api/orders` - Create order from cart 
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get order by ID 
