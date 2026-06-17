# 🎓 CampusConnect — College Club Event Management Platform

A production-ready full-stack web application for managing college club events, registrations, payments, and more.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS + React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Google OAuth 2.0 + Email OTP |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| PDF | PDFKit (Certificates) |
| QR Code | qrcode library |

## 📁 Folder Structure

```
campus-connect/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── passport.js
│   │   └── nodemailer.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── paymentController.js
│   │   ├── clubController.js
│   │   ├── notificationController.js
│   │   ├── certificateController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Club.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   ├── Payment.js
│   │   ├── Notification.js
│   │   └── Certificate.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── payments.js
│   │   ├── clubs.js
│   │   ├── notifications.js
│   │   ├── certificates.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── generateOTP.js
│   │   ├── generateCertificate.js
│   │   ├── generateQR.js
│   │   └── sendEmail.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── events/
│   │   │   ├── dashboard/
│   │   │   └── layout/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── coordinator/
│   │   │   └── admin/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── api-docs.md
│   ├── er-diagram.md
│   └── deployment-guide.md
└── README.md
```

## ⚙️ Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/campusconnect
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## 🏃 Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment

- **Frontend**: Vercel — connect GitHub repo, set env vars
- **Backend**: Render/Railway — connect GitHub repo, set env vars
- **Database**: MongoDB Atlas (free tier)

## 📋 User Roles

| Role | Capabilities |
|---|---|
| Student | View/Search/Register events, Pay, Download Certificates |
| Coordinator | Create/Edit/Delete events, View participants, Export reports |
| Admin | Manage clubs, Approve coordinators, View analytics |

## 📄 License

MIT License — Built for VIT AP College Club Management
