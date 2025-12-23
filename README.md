# 🛒 ShopFlow

ShopFlow is a Walmart-inspired product management and shopping platform built as a full-stack demo project.  
The system supports two types of users — **Admin** and **Regular Users** — with different authorization levels, and demonstrates a complete e-commerce workflow including authentication, product management, and cart operations.

This project is designed to showcase **real-world frontend architecture, reusable components, role-based UI, and integrated user flows**, following the provided Figma mock design and project requirements.

## Team Members

- **Chenyi Weng**
- **Bingchen Li**

## Project Goals

- Build a realistic e-commerce web application similar to Walmart
- Implement role-based access control (Admin vs Regular User)
- Demonstrate reusable component design and clean frontend architecture
- Support responsive design for both desktop and mobile devices
- Deliver a fully interactive demo-ready web application

## User Roles & Permissions

### Regular User
- Sign up / Sign in / Update password
- View product list and product details
- Add products to cart
- Modify cart quantity
- Apply promotion codes

### Admin User
- All regular user permissions
- Create new products
- Edit existing products
- Delete products
- Manage product inventory

## Core Features

### Phase I — Authentication Flow
- Sign In / Sign Up / Update Password
- Single reusable authentication form component
- Input validation with error messages
- Login state persistence (localStorage or API)
- Responsive authentication pages

### Phase II — Product Management
- Product list page (Home)
- Product detail page
- Create / Edit product (shared form component)
- Role-based UI rendering
- Pagination and search on product list
- Immediate UI update after create/edit/delete

### Phase III — Cart Flow
- Add products to cart from list and detail pages
- Cart quantity synchronization across pages
- Promotion code validation and price calculation
- Cart state persistence after page refresh
- Consistent cart data across sessions

### Error Handling
- Global error boundary
- User-friendly fallback UI for unexpected errors

## Tech Stack

### Frontend
- React
- TypeScript
- React Router
- Context API (Auth & Cart state)
- CSS / Responsive Design

### Backend (or Mock API)
- REST-style APIs (real or mocked)
- LocalStorage used for persistence when applicable

## Design Reference

This project follows the provided Figma mock design as the UI and flow reference, with additional improvements for responsiveness and user experience.

**Figma Mock Design:**  
https://www.figma.com/file/brgvADTppPXJdYkaOR5AmW/Management-Chuwa

## 📁 Project Structure

```bash
ShopFlow/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
└── README.md
````

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ShopFlow.git
```

### 2. Install dependencies

```bash
cd ShopFlow/frontend
npm install
```

### 3. Run the application

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

