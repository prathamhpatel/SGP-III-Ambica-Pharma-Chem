# 📧 Email Setup Guide for Password Reset

## ⚠️ Current Status: Email Not Configured

The password reset feature requires Gmail configuration to send reset links via email.

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Get Gmail App Password**

1. **Visit Google Account Security:**
   ```
   https://myaccount.google.com/security
   ```

2. **Enable 2-Step Verification:**
   - Click "2-Step Verification"
   - Follow setup (if not already enabled)

3. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Or Google Account → Security → 2-Step Verification → App passwords
   
4. **Generate Password:**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **Ambica Inventory System**
   - Click **Generate**
   
5. **Copy the 16-character password:**
   ```
   Example: abcd efgh ijkl mnop
   ```
   ⚠️ Save this password - you won't see it again!

---

### **Step 2: Configure .env.local File**

1. **Open `.env.local` file** in your project root

2. **Add these lines** (or update if they exist):
   ```env
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```

3. **Replace with your details:**
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: The 16-character app password from Step 1

4. **Save the file**

---

### **Step 3: Restart Server**

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## ✅ Test Email Configuration

1. Go to: http://localhost:3000/forgot-password
2. Enter: `info@ambicapharmachem.in`
3. Click "Send Reset Link"
4. Check your Gmail inbox for the reset email

---

## 📝 Example .env.local File

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ambica-pharma-inventory

# JWT Authentication
JWT_SECRET=ambica-pharma-super-secret-jwt-key-production-2024
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (UPDATE THESE!)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# n8n Configuration
NEXT_PUBLIC_N8N_BASE_URL=http://localhost:5678

# Dashboard Configuration
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME="Ambica Pharma Chem"
```

---

## 🔧 Troubleshooting

### "Email not sending"

**Check:**
1. ✅ 2-Factor Authentication enabled on Gmail
2. ✅ App password created (not regular Gmail password)
3. ✅ Correct email and app password in `.env.local`
4. ✅ Server restarted after updating `.env.local`
5. ✅ Check spam folder

### "Invalid credentials"

- Make sure you're using **App Password**, not your regular Gmail password
- App password should be 16 characters (with or without spaces)
- Gmail address should be complete (e.g., `user@gmail.com`)

### "Less secure app access"

- Google has deprecated "Less secure apps"
- **You MUST use App Passwords** (requires 2FA)
- Regular Gmail password won't work

---

## 🎯 Alternative: Use Another Email Service

If you don't want to use Gmail, you can configure other SMTP services:

### **Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

### **Yahoo Mail:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### **Custom SMTP:**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

---

## 💡 Quick Commands

```bash
# Check if .env.local exists
ls -la .env.local

# Create from template
cp env.local.example .env.local

# Edit with nano
nano .env.local

# Edit with VSCode
code .env.local

# Restart server
npm run dev
```

---

## 📞 Need Help?

If you're still having issues:

1. Check server logs for detailed error messages
2. Verify Gmail settings at: https://myaccount.google.com/security
3. Make sure `.env.local` file is in the project root
4. Ensure no typos in email configuration

---

**Once configured, password reset will work perfectly!** ✅

