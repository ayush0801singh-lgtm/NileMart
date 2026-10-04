# NileMart — Multi-Vendor E-Commerce Platform

A production-ready, full-stack multi-vendor e-commerce platform with role-based access control, Redis caching, a 3-level referral wallet system, Prime membership, and separate dashboards for Customers, Vendors, and Admins.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2 + Django REST Framework |
| Auth | SimpleJWT (sliding refresh + token blacklist) |
| Database | MySQL |
| Cache | Redis (cache-aside with MySQL fallback) |
| Frontend | React 18 + Bootstrap 5 |
| HTTP Client | Axios (JWT interceptors + silent refresh) |

---

## Project Structure

```
NileMart/
├── backend/
│   ├── config/
│   │   ├── settings.py        # MySQL, Redis, JWT, CORS — all env-driven
│   │   ├── urls.py            # Root URL routing
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/          # Custom user model, JWT auth, RBAC
│   │   ├── products/          # Catalog + Redis cache-aside
│   │   ├── orders/            # Cart, Checkout, Dashboards
│   │   ├── wallets/           # Referral commission engine
│   │   └── memberships/       # Prime subscription tiers
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axiosInstance.js         # Bearer auth + 401 refresh
    │   │   └── services/                # authService, productService, orderService,
    │   │                                # walletService, membershipService, adminService
    │   ├── contexts/AuthContext.jsx     # JWT decode + role state
    │   ├── components/                  # Navbar, ProtectedRoute, ProductCard,
    │   │                                # LoadingSpinner, StatCard
    │   └── pages/
    │       ├── auth/                    # Login, Register
    │       ├── customer/                # Dashboard, Products, Cart, Checkout, Wallet, Membership
    │       ├── vendor/                  # Dashboard, Product CRUD, Orders
    │       └── admin/                   # Dashboard, User Management
    └── package.json
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Redis 7+

### Backend Setup

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials, Redis URL, and SECRET_KEY

# 4. Create MySQL database
mysql -u root -p -e "CREATE DATABASE nilemart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Run migrations
python manage.py makemigrations accounts products orders wallets memberships
python manage.py migrate

# 6. Create a superuser (Admin role)
python manage.py createsuperuser

# 7. Start the dev server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
# Opens at http://localhost:3000
```
