# Vercel Deployment Guide - Ambica Pharma Chem Inventory System

## 🚀 Quick Deploy to Vercel

This guide will help you deploy your inventory management system to Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub repository (already done!)
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ MongoDB Atlas database (or other hosted MongoDB)
- ✅ Environment variables ready

---

## 🎯 Step-by-Step Deployment

### **Step 1: Sign Up / Log In to Vercel**

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### **Step 2: Import Your Project**

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find your repository: **`SGP-III-Ambica-Pharma-Chem`**
3. Click **"Import"**

### **Step 3: Configure Project Settings**

#### **Framework Preset:**
- Vercel will auto-detect: **Next.js** ✅

#### **Root Directory:**
- Leave as: **`./`** (root)

#### **Build Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

### **Step 4: Add Environment Variables**

⚠️ **CRITICAL:** Add these environment variables before deploying!

Click **"Environment Variables"** and add:

#### **Required Variables:**

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ambica-inventory?retryWrites=true&w=majority

# JWT Secret (generate a random 64-character string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Next Auth URL (will be your Vercel deployment URL)
NEXTAUTH_URL=https://your-project-name.vercel.app

# Email Configuration (GoDaddy Titan Email)
EMAIL_HOST=smtp.titan.email
EMAIL_PORT=587
EMAIL_USER=info@ambicapharmachem.in
EMAIL_PASSWORD=your-titan-email-password
```

#### **How to Add Each Variable:**

1. **Key:** `MONGODB_URI`  
   **Value:** Your MongoDB connection string  
   **Environments:** Production, Preview, Development (check all)

2. **Key:** `JWT_SECRET`  
   **Value:** Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`  
   **Environments:** Production, Preview, Development (check all)

3. **Key:** `NEXTAUTH_URL`  
   **Value:** `https://your-project-name.vercel.app` (or your custom domain)  
   **Environments:** Production only (for now)

4. **Key:** `EMAIL_HOST`  
   **Value:** `smtp.titan.email`  
   **Environments:** Production, Preview, Development

5. **Key:** `EMAIL_PORT`  
   **Value:** `587`  
   **Environments:** Production, Preview, Development

6. **Key:** `EMAIL_USER`  
   **Value:** `info@ambicapharmachem.in`  
   **Environments:** Production, Preview, Development

7. **Key:** `EMAIL_PASSWORD`  
   **Value:** Your GoDaddy Titan Email password  
   **Environments:** Production, Preview, Development

### **Step 5: Deploy**

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-project-name.vercel.app`

---

## 🔧 Post-Deployment Configuration

### **Update NEXTAUTH_URL**

After first deployment:

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL`
4. Update its value to your actual Vercel URL: `https://your-actual-url.vercel.app`
5. Click **"Save"**
6. **Redeploy** the project (go to Deployments → click "..." → "Redeploy")

### **Seed Initial User**

After deployment, seed the admin user:

**Option 1: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run seed script
vercel env pull .env.local
node scripts/seed-user.js
```

**Option 2: Manual MongoDB Insert**

Connect to your MongoDB Atlas and insert:

```javascript
// Use MongoDB Compass or Shell
db.users.insertOne({
  name: "Himanshu Patel",
  email: "info@ambicapharmachem.in",
  password: "$2a$10$[bcrypt-hashed-password]", // You'll need to hash "Ambica@123"
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## 🌐 Custom Domain (Optional)

### **Add Custom Domain:**

1. Go to your Vercel project
2. Go to **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain (e.g., `inventory.ambicapharmachem.in`)
5. Follow DNS configuration instructions
6. Update `NEXTAUTH_URL` environment variable to use custom domain
7. Redeploy

---

## 🔍 Troubleshooting

### **Build Fails**

**Error:** `Cannot find module...`
- **Fix:** Make sure all dependencies are in `package.json`
- **Run locally:** `npm install && npm run build`

**Error:** `Type error...`
- **Fix:** Check TypeScript errors
- **Run locally:** `npm run build`

### **Runtime Errors**

**Error:** `MONGODB_URI is not defined`
- **Fix:** Double-check environment variables are added in Vercel
- **Verify:** All environments (Production, Preview, Development) are checked

**Error:** `JWT must be provided`
- **Fix:** Ensure `JWT_SECRET` is set in environment variables

**Error:** `Cannot connect to MongoDB`
- **Fix:** 
  - Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
  - Or whitelist Vercel's IP addresses
  - Check MongoDB connection string is correct

### **Email Not Working**

**Error:** `Error sending email`
- **Fix:** Verify GoDaddy Titan Email credentials
- **Test:** Ensure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD are correct
- **Note:** Email might not work in preview deployments

---

## 📊 Monitoring

### **View Logs:**

1. Go to your Vercel project
2. Click on **"Deployments"**
3. Click on the latest deployment
4. View **"Build Logs"** and **"Function Logs"**

### **Check Performance:**

1. Go to **"Analytics"** in Vercel dashboard
2. Monitor:
   - Page load times
   - API response times
   - Error rates
   - Traffic

---

## 🔐 Security Checklist

Before going live:

- ✅ All environment variables are set
- ✅ MongoDB connection string is secure
- ✅ JWT_SECRET is strong (32+ characters)
- ✅ Email credentials are correct
- ✅ NEXTAUTH_URL matches your deployment URL
- ✅ MongoDB Atlas has proper access controls
- ✅ Test login functionality
- ✅ Test forgot password flow
- ✅ Test all CRUD operations

---

## 🚀 Deployment Commands

### **Redeploy Project:**

```bash
# From Vercel dashboard
Deployments → ... → Redeploy

# Or using Vercel CLI
vercel --prod
```

### **View Deployment URL:**

```bash
vercel ls
```

### **View Environment Variables:**

```bash
vercel env ls
```

### **Pull Environment Variables Locally:**

```bash
vercel env pull .env.local
```

---

## 📝 Important Notes

### **MongoDB Atlas Configuration:**

1. **Whitelist IPs:**
   - Go to MongoDB Atlas
   - Network Access → Add IP Address
   - Add: `0.0.0.0/0` (allow from anywhere)
   - Or add Vercel-specific IPs

2. **Database User:**
   - Ensure database user has read/write permissions
   - Password should not contain special characters that need URL encoding

### **Environment-Specific URLs:**

- **Production:** `https://your-project.vercel.app`
- **Preview:** `https://your-project-git-branch.vercel.app`
- **Development:** `http://localhost:3000`

### **Automatic Deployments:**

- Every push to `main` branch → Production deployment
- Every pull request → Preview deployment
- You can disable this in Settings → Git

---

## 🎯 Testing Your Deployment

### **1. Check Home Page:**
```
https://your-project.vercel.app
```

### **2. Test Login:**
```
https://your-project.vercel.app/login
Email: info@ambicapharmachem.in
Password: Ambica@123
```

### **3. Test API Endpoints:**
```bash
# Test health check
curl https://your-project.vercel.app/api/chemicals

# Should return JSON response
```

### **4. Test All Features:**
- ✅ Login/Logout
- ✅ Stock Management (CRUD)
- ✅ Suppliers (CRUD)
- ✅ Purchase Orders (CRUD)
- ✅ Alerts (view, sync, cleanup)
- ✅ Activity Logs (view)
- ✅ Analytics Dashboard

---

## 🆘 Common Issues & Fixes

### **Issue: "This page could not be found"**

**Cause:** Next.js routing issue or build error

**Fix:**
1. Check Vercel build logs
2. Ensure all pages are in `app/` directory
3. Verify `next.config.js` is correct
4. Redeploy

### **Issue: API routes return 404**

**Cause:** API routes not building correctly

**Fix:**
1. Ensure API routes are in `app/api/` directory
2. Check route file naming (route.ts, not page.tsx)
3. Verify Next.js 13+ App Router structure
4. Redeploy

### **Issue: Environment variables not working**

**Cause:** Variables not properly set or not redeployed

**Fix:**
1. Go to Settings → Environment Variables
2. Verify all variables are present
3. Check they're enabled for the right environments
4. **Important:** Redeploy after adding/changing variables

---

## 📚 Additional Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Vercel CLI:** https://vercel.com/docs/cli

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Website loads correctly
- [ ] Login works with credentials
- [ ] All pages are accessible
- [ ] Stock Management CRUD works
- [ ] Suppliers CRUD works
- [ ] Purchase Orders CRUD works
- [ ] Alerts display correctly
- [ ] Activity Logs show entries
- [ ] Analytics dashboard loads
- [ ] No console errors
- [ ] MongoDB connection successful
- [ ] Email system works (forgot password)

---

## 🔄 Updating Your Deployment

To update your live site:

1. Make changes locally
2. Commit to Git: `git add -A && git commit -m "Update message"`
3. Push to GitHub: `git push origin main`
4. Vercel automatically deploys! 🚀

Or manually:
```bash
vercel --prod
```

---

## 🎊 You're Done!

Your Inventory Management System is now live on Vercel!

**Share your deployment URL:** `https://your-project.vercel.app`

---

**Last Updated:** November 14, 2025  
**Version:** 1.0.0

