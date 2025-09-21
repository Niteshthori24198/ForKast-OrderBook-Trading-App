# OrderBook Trading System

A complete orderbook trading system with REST API backend (NestJS) and modern web interface (React , Next.js) featuring real-time order matching, self-trading prevention, and comprehensive market data.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+**
- **Git**

### Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd ForKast-Assignment
```

2. **Setup PostgreSQL Database**

```bash
# Create database
createdb orderbook
```

3. **Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env

# Edit .env file with your database settings
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password  # Leave empty if no password
DB_NAME=orderbook

# Build and start backend
npm run build
npm run start:dev
```

4. **Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env.local

# Start frontend
npm run dev
```

**Access Points:**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api

---

## 🔧 Features

### Core Functionality

- **📝 Order Placement** - Buy and sell orders with price and quantity
- **🔄 Automatic Matching** - Price-time priority matching algorithm
- **🚫 Self-Trading Prevention** - Robust mechanisms to prevent users from trading with themselves
- **📊 Real-time Orderbook** - Live order visualization with depth charts
- **📈 Trade History** - Complete history of executed trades
- **📋 Market Summary** - Comprehensive market statistics and metrics

### Technical Features

- **🔒 PostgreSQL Database** - Persistent data storage with proper schema
- **📚 API Documentation** - Swagger/OpenAPI documentation
- **📱 Mobile-First Design** - Responsive interface for all devices
- **🔄 Auto-Refresh** - Real-time data updates with user controls
- **⚡ Performance Optimized** - Efficient queries and minimal bundle size

---

## 🏗️ Architecture

### Backend (NestJS)

- **Orders Module** - Handle order placement and orderbook state
- **Trades Module** - Manage trade history and execution
- **Market Module** - Provide market summary and statistics
- **Database** - PostgreSQL with TypeORM
- **Matching Algorithm** - Price-time priority with self-trading prevention

### Frontend (Next.js)

- **Modern Dashboard** - Professional trading interface with market summary
- **Enhanced Orderbook** - Depth visualization and real-time updates
- **Improved Order Form** - Better UX with validation and feedback
- **Mobile Navigation** - Bottom tab navigation for mobile devices
- **Real-time Updates** - Live market data and trade execution

### Database Schema

#### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  type VARCHAR(10) CHECK (type IN ('buy', 'sell')),
  price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  filled_quantity DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Trades Table

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  buy_order_id UUID REFERENCES orders(id),
  sell_order_id UUID REFERENCES orders(id),
  buy_user_id VARCHAR(255) NOT NULL,
  sell_user_id VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:3001
```

---

## 📝 Orders API

### Place Order

**POST** `/orders`

Place a new buy or sell order in the orderbook.

#### Request Body

```json
{
  "type": "buy", // "buy" or "sell"
  "price": 100.5, // Order price (USD)
  "quantity": 1.5, // Order quantity
  "userId": "user123" // User identifier
}
```

#### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "buy",
  "price": 100.5,
  "quantity": 1.5,
  "filledQuantity": 0,
  "status": "open", // "open", "filled", "partially_filled"
  "userId": "user123",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

#### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Price must be greater than 0",
  "error": "Bad Request"
}
```

### Get Orderbook

**GET** `/orders/orderbook`

Retrieve current orderbook state with all open orders.

#### Response (200 OK)

```json
{
  "buyOrders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "type": "buy",
      "price": 100.25,
      "quantity": 1.0,
      "filledQuantity": 0,
      "status": "open",
      "userId": "user789",
      "createdAt": "2024-01-20T10:32:00.000Z"
    }
  ],
  "sellOrders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "type": "sell",
      "price": 100.75,
      "quantity": 0.5,
      "filledQuantity": 0,
      "status": "open",
      "userId": "user101",
      "createdAt": "2024-01-20T10:33:00.000Z"
    }
  ]
}
```

---

## 📊 Trades API

### Get Trade History

**GET** `/trades/history`

Retrieve complete history of executed trades.

#### Response (200 OK)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "buyOrderId": "550e8400-e29b-41d4-a716-446655440000",
    "sellOrderId": "550e8400-e29b-41d4-a716-446655440001",
    "buyUserId": "user123",
    "sellUserId": "user456",
    "price": 100.5,
    "quantity": 1.5,
    "executedAt": "2024-01-20T10:31:00.000Z"
  }
]
```

---

## 📈 Market API

### Get Market Summary

**GET** `/market/summary`

Retrieve comprehensive market statistics and metrics.

#### Response (200 OK)

```json
{
  "lastPrice": 100.5, // Current market price
  "priceChange24h": 2.25, // Price change in last 24h
  "priceChangePercent24h": 2.29, // Percentage change in 24h
  "volume24h": 15075.5, // Trading volume in last 24h (USD)
  "totalTrades": 25, // Total number of executed trades
  "openOrders": 8, // Current number of open orders
  "highPrice24h": 102.75, // Highest price in last 24h
  "lowPrice24h": 98.25 // Lowest price in last 24h
}
```

### Using Postman

Import the provided `collection.json` file into Postman for a complete API collection with sample requests and responses.

---

## 🔄 Matching Algorithm

The system uses **price-time priority** matching:

1. **Buy Orders** matched against sell orders with `price <= buy_price`
2. **Sell Orders** matched against buy orders with `price >= sell_price`
3. **Priority:** Best price first, then earliest timestamp (FIFO)
4. **Execution:** Supports partial fills, orders updated accordingly
5. **Self-Trading Prevention:** Users cannot trade with themselves

### Example Matching Flow

```
1. User A places: BUY 1.0 @ $100.00
2. User B places: SELL 0.5 @ $99.50
3. System matches: 0.5 quantity at $99.50
4. Result:
   - User A: BUY 0.5 remaining @ $100.00 (partially_filled)
   - User B: SELL order completely filled
   - Trade created: 0.5 @ $99.50
```

---


## 📱 Frontend Features

### Desktop Experience

- **Three-Panel Layout** - Order form, orderbook, and trade history
- **Real-time Updates** - All panels update automatically
- **Auto-refresh Controls** - User can pause/resume live updates
- **Depth Visualization** - Visual representation of order book depth

### Mobile Experience

- **Bottom Tab Navigation** - Easy thumb access
- **Single Panel Focus** - One component at a time
- **Touch Optimized** - Proper touch targets and spacing
- **Responsive Design** - Adapts to all screen sizes

### Key UI Components

- **🔄 Auto-refresh Toggle** - Control real-time updates
- **🗑️ Clear Form** - Reset order form
- **📈📉 Price Indicators** - Visual price change indicators
- **💰 Total Calculator** - Real-time order value calculation

---

## 📚 Additional Resources

- **API Documentation:** http://localhost:3001/api (Swagger UI)
- **Postman Collection:** Import `collection.json`


---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


**Happy Trading! 🚀📈**
