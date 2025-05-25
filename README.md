# BarcodeApp - Restaurant Management System

A comprehensive restaurant management system with QR code-based digital menu and ordering capabilities. This application enables restaurant owners to create digital menus, generate QR codes for tables, manage orders, and streamline operations.

![Restaurant Management System Dashboard](/public/BarcodeApp.png)

## Features

### Customer Experience
- **QR Code Scanning**: Customers can scan table-specific QR codes to access the digital menu
- **Digital Menu**: Browse menu items with images, descriptions, and prices
- **Ordering System**: Place orders directly from their devices
- **Search & Filter**: Find menu items by name or filter by dietary preferences (vegetarian, vegan, gluten-free)
- **Real-time Updates**: View order status in real-time

### Restaurant Management
- **Dashboard**: Overview of restaurant performance and operations
- **Menu Management**: Add, edit, and remove menu items with images
- **Category Management**: Organize menu items by categories
- **Table Management**: Create and manage tables with unique QR codes
- **Order Tracking**: Monitor orders in real-time with status updates
- **Payment Tracking**: Mark orders as paid/unpaid
- **User Management**: Admin can create and manage staff accounts with different access levels
- **Global QR Code**: Generate a restaurant-wide QR code for the full menu

## Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **Material UI & Tailwind CSS**: Component libraries for styling
- **React Router**: For navigation and routing
- **Axios**: HTTP client for API requests
- **React Hot Toast**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication mechanism
- **Vercel Blob Storage**: For storing images and QR codes

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Vercel account (for Blob storage)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BarcodeApp/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   BARCODEAPP_READ_WRITE_TOKEN=<your-vercel-blob-token>
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd ../
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Configuration

### API Configuration
The application uses a configuration file located at `src/config/api.js` to manage API endpoints. You can modify this file to change the base URL for API calls.

### User Roles
The system supports different user roles:
- **Owner**: Full access to all features
- **Manager**: Access to menu, table, and order management
- **Staff**: Access to order management only

## Deployment

### Backend Deployment (Vercel)
1. Set up environment variables in Vercel dashboard
2. Connect your GitHub repository
3. Deploy using Vercel CLI or GitHub integration

### Frontend Deployment (Vercel)
1. Set up environment variables in Vercel dashboard
2. Connect your GitHub repository
3. Set the build command to `npm run build`
4. Set the output directory to `dist`

## Project Structure

```
BarcodeApp/
├── server/                # Backend code
│   ├── controllers/       # Request handlers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── src/                   # Frontend code
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── context/           # React context providers
│   ├── config/            # Configuration files
│   └── App.jsx            # Main component
├── public/                # Static assets
└── README.md              # Project documentation
```

## Usage

### Restaurant Owner/Manager
1. Log in to the dashboard using owner/manager credentials
2. Set up your menu by adding categories and items
3. Create tables and generate QR codes for each table
4. Print and place QR codes on respective tables
5. Monitor and manage orders through the dashboard

### Staff
1. Log in using staff credentials
2. View and manage incoming orders
3. Update order statuses (preparing, served, completed)
4. Mark payments as received

### Customers
1. Scan the QR code on their table using a smartphone
2. Browse the digital menu
3. Select items and place orders
4. View order status in real-time

## API Endpoints
Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration

Menu Management
- `GET /api/menu`: Get all menu items
- `POST /api/menu`: Create a new menu item
- `PUT /api/menu/:id`: Update a menu item

Table Management
- `GET /api/tables`: Get all tables
- `POST /api/tables`: Create a new table
- `PUT /api/tables/:id/qrcode`: Generate QR code for a table

Order Management
- `GET /api/orders`: Get all orders
- `POST /api/orders`: Create a new order
- `PUT /api/orders/:id/status`: Update an order status

## License
This project is licensed under the MIT License - see the LICENSE file for details.

##Contributors
- [🧑‍💻 dasjayadev](https://github.com/dasjayadev) - Initial work
- [🧑‍💻 Soumya3969](https://github.com/soumya3969/) - Application System design & Backend development
- [🧑‍💻 somnathsahoo07](https://github.com/somnathsahoo07) - Ui Improvements & Frontend Fixes
## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.