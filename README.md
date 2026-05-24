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
- **Email Verification**: Secure user registration with email verification
- **Bidirectional Relationship Sync**: Automatic synchronization between patients, doctors, and caregivers
- **Auto-refresh Dashboards**: Real-time data updates across all interfaces
- **Emergency Contacts**: Quick access to emergency services (SAMU: 190, Civil Protection: 198)

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
- **Brevo** - Email service for verification
- **node-cache** - Caching layer for performance

## 📁 Project Structure

```
slouma-health-app/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── patient/   # Patient interface
│   │   │   ├── doctor/    # Doctor interface
│   │   │   ├── caregiver/ # Caregiver interface
│   │   │   └── admin/     # Admin interface
│   │   ├── services/      # API service functions
│   │   ├── shared/        # Shared utilities and translations
│   │   │   ├── translations.js # Multilingual support
│   │   │   ├── api.js          # API client
│   │   │   └── SettingsModal.jsx
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   ├── doctorController.js
│   │   │   ├── CaregiverController.js
│   │   │   ├── AdminController.js
│   │   │   └── NotificationController.js
│   │   ├── models/       # Database models
│   │   │   ├── Patient.js
│   │   │   ├── Doctor.js
│   │   │   ├── caregiver.js
│   │   │   ├── Admin.js
│   │   │   ├── PendingUser.js
│   │   │   └── VerificationCode.js
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic services
│   │   │   ├── linkingService.js    # Relationship sync
│   │   │   ├── emailService.js      # Email verification
│   │   │   └── userService.js       # User management
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration files
│   │   │   └── cache.js            # Caching layer
│   │   └── index.js      # Server entry point
│   ├── .env
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
NODE_ENV=development
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
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

### Patients
- View and update personal health information
- Track vital signs and medications
- Schedule appointments
- Communicate with healthcare providers
- Access medical records
- Quick access to emergency services (SAMU: 190, Civil Protection: 198)

### Doctors
- Manage patient profiles and records
- View vital signs history
- Create prescriptions
- Schedule appointments
- Generate health reports
- Monitor patient health trends

### Caregivers
- Monitor patient health status
- Record vital signs and medications
- Coordinate with medical team
- Receive alerts and notifications
- Auto-refreshing dashboard for real-time updates
- Schedule patient visits

### Administrators
- User management and permissions
- System monitoring and analytics
- Generate reports
- Manage platform settings
- Approve pending user registrations
- Broadcast notifications and messages
- Modify user relationships (patient-doctor, patient-caregiver)

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
- Email verification for user registration
- Encrypted sensitive fields (name, lastname, phone)

## 📊 API Endpoints

The API provides endpoints for:
- Authentication (`/api/auth`)
  - POST `/api/auth/register` - User registration
  - POST `/api/auth/login` - User login
  - POST `/api/auth/verify-code` - Email verification
  - POST `/api/auth/update-profile` - Update user profile
- User management (`/api/patients`, `/api/doctors`, `/api/caregivers`, `/api/admins`)
- Health data (`/api/vitals`, `/api/medications`)
- Messaging (`/api/messages`)
- Notifications (`/api/notifications`)
- Reports (`/api/reports`)
- Activities (`/api/activities`)
- Appointments (`/api/appointments`)

## 🌐 Deployment
Railways : https://unique-fulfillment-production-d456.up.railway.app

**Slouma Healthcare Platform** - Transforming healthcare management through technology.
