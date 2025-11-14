# 🚀 Vercel Deployment - Quick Checklist

## Pre-Deployment

- [ ] **Code pushed to GitHub**
  ```bash
  git push origin main
  ```

- [ ] **MongoDB Atlas Setup**
  - [ ] Database created
  - [ ] User created with read/write permissions
  - [ ] Network access allows Vercel (0.0.0.0/0 or specific IPs)
  - [ ] Connection string copied

- [ ] **Environment Variables Ready**
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - [ ] EMAIL_HOST (smtp.titan.email)
  - [ ] EMAIL_PORT (587)
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASSWORD

## Deployment Steps

### 1. Import to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import: `SGP-III-Ambica-Pharma-Chem`

### 2. Configure Build Settings
- [ ] Framework: Next.js (auto-detected)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### 3. Add Environment Variables
- [ ] MONGODB_URI → All environments
- [ ] JWT_SECRET → All environments
- [ ] NEXTAUTH_URL → Production (use: `https://your-project.vercel.app`)
- [ ] EMAIL_HOST → All environments
- [ ] EMAIL_PORT → All environments
- [ ] EMAIL_USER → All environments
- [ ] EMAIL_PASSWORD → All environments

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-5 minutes)
- [ ] Note deployment URL

## Post-Deployment

### 5. Update Environment Variables
- [ ] Update NEXTAUTH_URL with actual Vercel URL
- [ ] Redeploy after updating

### 6. Seed Initial User
Choose one method:

**Method 1: Local Script**
- [ ] Pull env vars: `vercel env pull .env.local`
- [ ] Run seed: `node scripts/seed-user.js`

**Method 2: MongoDB Direct**
- [ ] Connect to MongoDB Atlas
- [ ] Insert user document manually

### 7. Testing
- [ ] Visit deployment URL
- [ ] Test login (info@ambicapharmachem.in / Ambica@123)
- [ ] Test Stock Management
- [ ] Test Suppliers
- [ ] Test Purchase Orders
- [ ] Test Alerts
- [ ] Test Activity Logs
- [ ] Test Analytics
- [ ] Test Forgot Password (if email configured)

## Verification

- [ ] No build errors
- [ ] No runtime errors in logs
- [ ] MongoDB connected successfully
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] CRUD operations work
- [ ] No console errors in browser
- [ ] Mobile responsive
- [ ] Email works (optional)

## Optional: Custom Domain

- [ ] Add domain in Vercel Settings → Domains
- [ ] Configure DNS (A/CNAME records)
- [ ] Update NEXTAUTH_URL to custom domain
- [ ] Redeploy
- [ ] Test with custom domain

## 🎉 Success!

Your inventory system is now live at:
**https://your-project.vercel.app**

---

## Quick Commands

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Deploy manually
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs
```

---

## Need Help?

Refer to: `VERCEL-DEPLOYMENT-GUIDE.md` for detailed instructions.

