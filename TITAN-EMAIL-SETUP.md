# 📧 GoDaddy Titan Email Setup Guide

## ✅ Configuration Already Done!

I've configured your `.env.local` file with the correct GoDaddy Titan Email SMTP settings.

---

## 🔑 What You Need to Do (2 Steps)

### **Step 1: Get Your Titan Email Password**

You just need your regular Titan email password (the one you use to login to webmail).

**Where to find it:**
- This is the password you use to login at: https://titan.email
- Or your GoDaddy Workspace Email password
- If you forgot it, reset it in your GoDaddy account

### **Step 2: Update .env.local**

Open `.env.local` file and update this line:
```env
EMAIL_PASSWORD=your-titan-email-password
```

Replace `your-titan-email-password` with your actual Titan email password for `info@ambicapharmachem.in`

---

## 📝 Current Configuration

Your `.env.local` is already configured with:

```env
# Email Configuration (GoDaddy Titan Email)
EMAIL_HOST=smtp.titan.email
EMAIL_PORT=587
EMAIL_USER=info@ambicapharmachem.in
EMAIL_PASSWORD=your-titan-email-password  ← UPDATE THIS!
```

---

## 🚀 How to Complete Setup

### **Option A: Edit .env.local File Directly**

1. Open `.env.local` in your code editor
2. Find the line: `EMAIL_PASSWORD=your-titan-email-password`
3. Replace with: `EMAIL_PASSWORD=YourActualPassword123`
4. Save the file
5. Restart the server:
   ```bash
   # Press Ctrl+C in terminal
   npm run dev
   ```

### **Option B: Use Terminal Command**

```bash
cd "/Users/prathampatel/Desktop/Desktop/inventory ambica project"

# Replace YOUR_PASSWORD_HERE with your actual password
sed -i '' 's/EMAIL_PASSWORD=your-titan-email-password/EMAIL_PASSWORD=YOUR_PASSWORD_HERE/' .env.local

# Restart server
npm run dev
```

---

## 🔧 GoDaddy Titan Email SMTP Settings

These are already configured for you:

| Setting | Value |
|---------|-------|
| **SMTP Host** | `smtp.titan.email` |
| **SMTP Port** | `587` (TLS/STARTTLS) |
| **Email Address** | `info@ambicapharmachem.in` |
| **Password** | Your Titan email password |
| **Encryption** | TLS/STARTTLS (Port 587) |

**Alternative Port:**
- Port `465` (SSL) - Also works if you prefer

---

## ✅ Test After Setup

1. **Save your password** in `.env.local`
2. **Restart the server:**
   ```bash
   npm run dev
   ```
3. **Go to:** http://localhost:3000/forgot-password
4. **Enter:** `info@ambicapharmachem.in`
5. **Click:** "Send Reset Link"
6. **Check your inbox** at info@ambicapharmachem.in

---

## 🔍 Where to Find Your Titan Password

### **If You Know Your Password:**
- It's the password you use to login to Titan webmail
- Same password for: https://titan.email

### **If You Forgot Your Password:**

1. **Go to GoDaddy:**
   - Login at: https://www.godaddy.com
   - Go to: My Products → Workspace Email
   
2. **Reset Password:**
   - Click on your email account
   - Click "Reset Password"
   - Follow the instructions
   
3. **Or Contact GoDaddy Support:**
   - Phone: 1-480-505-8877
   - They can help reset your Titan email password

---

## 🎯 Quick Steps Summary

1. ✅ Configuration already done (I updated `.env.local`)
2. 🔑 Get your Titan email password
3. ✏️ Edit `.env.local` and add password
4. 🔄 Restart server: `npm run dev`
5. ✅ Test forgot password feature!

---

## 🛠️ Troubleshooting

### "Authentication failed"
- **Check:** Password is correct (no typos)
- **Check:** Using password for `info@ambicapharmachem.in`
- **Try:** Resetting your Titan email password

### "Connection timeout"
- **Check:** Internet connection is working
- **Check:** Port 587 is not blocked by firewall
- **Try:** Using port 465 instead (change `EMAIL_PORT=465` in .env.local)

### "Email not sending"
- **Check:** Password is correct in `.env.local`
- **Check:** Server was restarted after updating `.env.local`
- **Check:** Spam folder in your email
- **Check:** GoDaddy account is active and email service is working

### "Invalid email address"
- **Verify:** Email address in `.env.local` is exactly: `info@ambicapharmachem.in`
- **Check:** No extra spaces before or after email

---

## 📞 Need Help?

**GoDaddy Support:**
- Phone: 1-480-505-8877 (US)
- Help: https://www.godaddy.com/help
- Titan Email Help: https://titan.email/help

**Check Email Status:**
- Login to: https://www.godaddy.com
- Go to: My Products → Workspace Email
- Verify email account is active

---

## 💡 Alternative: Quick Password Reset (No Email Setup Needed)

If you want to test the system now without email setup:

```bash
# Reset password to default: Ambica@123
npm run seed-user
```

Or use direct reset API (see `EMAIL-SETUP.md` for details).

---

## ✅ Once Configured

After you update the password in `.env.local` and restart:

- ✅ Forgot password will work perfectly
- ✅ Email will be sent from: info@ambicapharmachem.in
- ✅ Professional email template with your company name
- ✅ Reset links will work for 1 hour

---

**Just update the password in `.env.local` and you're all set!** 🚀

