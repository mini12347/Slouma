# Slouma Healthcare Platform

A comprehensive healthcare management system that connects patients, doctors, caregivers, and administrators in one unified platform.

## 🏥 Features

- **Multi-role System**: Patient, Doctor, Caregiver, and Admin interfaces
- **Real-time Health Monitoring**: Track vital signs and medical data
- **Secure Communication**: Messaging system between healthcare providers
- **Appointment Management**: Schedule and manage medical appointments
- **Medication Tracking**: Monitor medication adherence and schedules
- **Multilingual Support**: English, French, Arabic, and Tunisian
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization
- **jsPDF** - PDF generation for reports

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
slouma-health-app/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── shared/        # Shared utilities and translations
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic services
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   └── package.json
├── .gitignore
├── package.json          # Root package.json for workspace management
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd slouma-health-app
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Environment Setup
Create `.env` files in both client and server directories:

**Server `.env`**:
```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-key
PORT=5000
```

**Client `.env`**:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Seed the database (optional)
```bash
npm run seed
```

## 🚦 Running the Application

### Development Mode
Start both client and server concurrently:
```bash
npm run dev
```

Or start individually:
```bash
# Frontend only
npm run dev:client

# Backend only  
npm run dev:server
```

### Production
```bash
# Build client
npm run build

# Start server
npm start
```

## 📱 Access Points

- **Frontend**: http://localhost:5173 (or next available port)
- **Backend API**: http://localhost:5000/api

## 👥 User Roles & Access

## 🔧 Available Scripts

- `npm run dev` - Start both client and server in development
- `npm run dev:client` - Start only the frontend
- `npm run dev:server` - Start only the backend
- `npm run build` - Build the frontend for production
- `npm run start` - Start the production server
- `npm run install:all` - Install all dependencies
- `npm run seed` - Seed database with sample data

## 🌐 Features by Role

### Patients
- View and update personal health information
- Track vital signs and medications
- Schedule appointments
- Communicate with healthcare providers
- Access medical records

### Doctors
- Manage patient profiles and records
- View vital signs history
- Create prescriptions
- Schedule appointments
- Generate health reports

### Caregivers
- Monitor patient health status
- Record vital signs and medications
- Coordinate with medical team
- Receive alerts and notifications

### Administrators
- User management and permissions
- System monitoring and analytics
- Generate reports
- Manage platform settings

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection

## 📊 API Endpoints

The API provides endpoints for:
- Authentication (`/api/auth`)
- User management (`/api/patients`, `/api/doctors`, `/api/caregivers`, `/api/admins`)
- Health data (`/api/vitals`, `/api/medications`)
- Messaging (`/api/messages`)
- Notifications (`/api/notifications`)
- Reports (`/api/reports`)


**Slouma Healthcare Platform** - Transforming healthcare management through technology.
