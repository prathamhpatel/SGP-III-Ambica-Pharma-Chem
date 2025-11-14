# ⚡ Quick Start - Authentication

## ✅ What's Been Implemented

Your Ambica Pharma Inventory System now has **real JWT authentication** with MongoDB storage!

---

## 🔑 Login Credentials

```
Email: info@ambicapharmachem.in
Password: Ambica@123
```

---

## 🚀 Quick Start (5 Steps)

### 1. **Ensure MongoDB is Running**

```bash
# Start MongoDB (if not already running)
brew services start mongodb-community

# OR on Linux
sudo systemctl start mongod
```

### 2. **Copy Environment File**

```bash
cp env.local.example .env.local
```

### 3. **Update Email Configuration** (Optional - for password reset)

Edit `.env.local`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

Get Gmail App Password: https://myaccount.google.com/apppasswords

### 4. **User Already Created!** ✅

The admin user has been created with:
- Email: `info@ambicapharmachem.in`
- Password: `Ambica@123`

To recreate/reset password:
```bash
npm run seed-user
```

### 5. **Start the Application**

```bash
npm run dev
```

Access at: http://localhost:3000

---

## 🌐 Pages

- **Login:** http://localhost:3000/login
- **Forgot Password:** http://localhost:3000/forgot-password
- **Dashboard:** http://localhost:3000 (requires login)

---

## 🎯 Features

✅ Real JWT authentication with MongoDB  
✅ Bcrypt password hashing  
✅ Email-based password reset  
✅ HTTP-only secure cookies  
✅ Token expiration (7 days)  
✅ Single admin user system

---

## 🔧 Common Commands

```bash
# Create/Reset user
npm run seed-user

# Start dev server
npm run dev

# View database
npm run view-db

# Check MongoDB status
brew services list | grep mongodb
```

---

## 📝 Testing Login

1. Go to: http://localhost:3000/login
2. Enter:
   - Email: `info@ambicapharmachem.in`
   - Password: `Ambica@123`
3. Click "Sign In"
4. You'll be redirected to dashboard ✅

---

## 🔐 Reset Password Test

1. Click "Forgot password?" on login
2. Enter email: `info@ambicapharmachem.in`
3. Check email for reset link
4. Click link and set new password
5. Login with new password

*Note: Requires email configuration in `.env.local`*

---

## 📚 Full Documentation

See `AUTHENTICATION-GUIDE.md` for complete details on:
- Architecture
- API endpoints
- Security features
- Troubleshooting
- Advanced configuration

---

## ✅ Verification

- [x] MongoDB running
- [x] User created
- [x] Login page functional
- [x] JWT tokens working
- [x] Password hashing active
- [x] Reset pages created

---

**🎉 You're all set! Login now at http://localhost:3000/login**

