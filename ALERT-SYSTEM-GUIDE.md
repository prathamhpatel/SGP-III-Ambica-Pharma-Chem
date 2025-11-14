# 🚨 Automated Alert System Guide

## Overview
Your inventory management system now has a **fully automated alert system** that monitors chemical stock levels and automatically generates alerts based on real-time inventory status.

---

## 🎯 Alert Severity Mapping

### Stock Management Status → Alert Severity

| Stock Status | Alert Type | Severity | Priority | Description |
|--------------|------------|----------|----------|-------------|
| **Out of Stock** (Quantity = 0) | `out_of_stock` | 🔴 **CRITICAL** | Critical Alerts | Chemical is completely depleted. Immediate action required. |
| **Expired** (Past expiry date) | `expiry_warning` | 🔴 **CRITICAL** | Critical Alerts | Chemical has expired. Remove from inventory immediately. |
| **Low Stock** (≤ Reorder Threshold) | `low_stock` | 🟠 **HIGH** | High Priority | Stock is below threshold. Reorder recommended. |
| **Expiring Soon** (1-7 days) | `expiry_warning` | 🟠 **HIGH** | High Priority | Chemical will expire within a week. Plan usage or disposal. |
| **Expiring Soon** (8-30 days) | `expiry_warning` | 🟡 **MEDIUM** | Medium Priority | Chemical will expire within a month. Monitor closely. |
| **Active** (Normal stock) | None | - | - | No alerts generated. |

---

## 🔄 Automatic Alert Generation

### How It Works

1. **On Page Load:**
   - When you open the Stock Management page, alerts are **automatically synced** in the background
   - No manual action needed!

2. **Manual Sync:**
   - Go to Alerts page → Click "Sync Alerts" button
   - Scans all chemicals in inventory
   - Creates new alerts for any issues found
   - Updates alert counts by severity

3. **Smart Detection:**
   - **Prevents duplicates**: Won't create multiple alerts for the same issue
   - **Real-time**: Based on current database state
   - **Comprehensive**: Checks all chemicals in one go

### What Gets Checked

```javascript
For each chemical:
  ✓ Quantity (out of stock, low stock)
  ✓ Expiry date (expired, expiring soon)
  ✓ Reorder threshold
  ✓ Batch numbers
  ✓ Location
```

---

## 📊 Alert Categories

### 🔴 Critical Alerts
- **Out of Stock**: Immediate reorder required
- **Expired Chemicals**: Must be removed from inventory
- **Action Required**: Yes
- **Auto-Read**: No

### 🟠 High Priority
- **Low Stock**: Below reorder threshold
- **Expiring in 1-7 days**: Urgent planning needed
- **Action Required**: Yes
- **Auto-Read**: No

### 🟡 Medium Priority
- **Expiring in 8-30 days**: Monitor and plan
- **Action Required**: Optional
- **Auto-Read**: No

### 🔵 Low Priority
- **General warnings**: Informational
- **Action Required**: No
- **Auto-Read**: Optional

---

## 🎮 How to Use

### View Alerts

1. **Navigate to Alerts Page:**
   ```
   http://localhost:3000/alerts
   ```

2. **Quick Stats Dashboard:**
   - Critical Alerts (Red)
   - High Priority (Orange)
   - Medium Priority (Yellow)
   - Low Priority (Blue)

3. **Filter Alerts:**
   - By Type: Low Stock, Expiry Warning, Out of Stock, System
   - By Severity: Critical, High, Medium, Low
   - Show/Hide Read Alerts

### Sync Alerts

**Automatic:**
- Opens Stock Management → Syncs automatically ✅

**Manual:**
1. Go to Alerts page
2. Click "Sync Alerts" button
3. Wait for sync to complete
4. See count of new alerts created

### Manage Alerts

**Mark as Read:**
- Click on an alert card
- Click "Mark as Read" button

**Mark All as Read:**
- Click "Mark All Read" button in header

**Take Action:**
- **Trigger Reorder**: (Coming soon)
- **Notify Manager**: (Coming soon)
- **Add Note**: (Coming soon)

---

## 🔗 API Endpoints

### Get All Alerts
```bash
GET /api/alerts
Query params: ?type=low_stock&severity=high&isRead=false
```

### Get Single Alert
```bash
GET /api/alerts/:id
```

### Create Alert
```bash
POST /api/alerts
Body: {
  type: 'low_stock',
  title: 'Low Stock Alert',
  message: 'Chemical XYZ is running low',
  severity: 'high',
  chemicalId: '...',
  actionRequired: true
}
```

### Update Alert
```bash
PUT /api/alerts/:id
Body: { isRead: true }
```

### Sync Alerts
```bash
POST /api/alerts/sync
Returns: { newAlerts: 4, summary: { critical: 0, high: 4, medium: 0, low: 0 } }
```

---

## 🧪 Testing the System

### Step 1: Add a Low Stock Chemical
1. Go to Stock Management
2. Add a chemical with:
   - Quantity: 10 kg
   - Reorder Threshold: 20 kg
3. Save
4. Alert is automatically synced ✅

### Step 2: View the Alert
1. Go to Alerts page
2. See new HIGH priority alert: "Low Stock: [Chemical Name]"
3. Alert shows current quantity vs threshold

### Step 3: Add an Expired Chemical
1. Go to Stock Management
2. Add a chemical with:
   - Expiry Date: Yesterday
3. Save
4. Auto-sync creates CRITICAL alert ✅

### Step 4: Test Manual Sync
1. Go to Alerts page
2. Click "Sync Alerts"
3. See confirmation: "Alert sync completed! X new alerts created."
4. Alerts appear in their severity categories

---

## 💡 Best Practices

### Daily Workflow

**Morning:**
1. Open Alerts page
2. Check Critical Alerts (Red) → Take immediate action
3. Check High Priority (Orange) → Plan reorders
4. Mark read as you handle them

**Weekly:**
1. Review Medium Priority alerts
2. Plan for chemicals expiring within 30 days
3. Update reorder thresholds if needed

**Monthly:**
1. Review all alerts
2. Analyze patterns (which chemicals frequently low?)
3. Adjust reorder thresholds

### Alert Management Tips

✅ **DO:**
- Check alerts daily
- Mark alerts as read after taking action
- Use Sync Alerts if you made bulk changes
- Keep track of critical alerts

❌ **DON'T:**
- Ignore critical alerts
- Mark alerts as read without action
- Disable important alert types
- Let unread alerts accumulate

---

## 🎨 Alert Display

### In Alerts Page
- **Color-coded borders** by severity
- **Unread indicator** (blue dot)
- **Timestamp** of when alert was created
- **Type badge** (LOW_STOCK, EXPIRY_WARNING, etc.)
- **Severity badge** (CRITICAL, HIGH, MEDIUM, LOW)
- **Full message** with details

### In Dashboard (Coming Soon)
- Quick stats widget
- Recent alerts
- Alert trends

---

## 🔧 Customization

### Change Alert Thresholds

Edit `/app/api/alerts/sync/route.ts`:

```typescript
// Expiring soon - HIGH (currently 1-7 days)
if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
  severity = 'high';
}

// Expiring soon - MEDIUM (currently 8-30 days)
else if (daysUntilExpiry > 7 && daysUntilExpiry <= 30) {
  severity = 'medium';
}
```

### Add Custom Alert Types

1. Update Alert model: `models/Alert.ts`
2. Add new type to enum: `'custom_type'`
3. Update sync logic in: `app/api/alerts/sync/route.ts`

---

## 📈 Alert Statistics

After syncing, you get:

```json
{
  "newAlerts": 4,
  "summary": {
    "critical": 0,
    "high": 4,
    "medium": 0,
    "low": 0,
    "total": 4
  }
}
```

---

## 🚀 Next Steps

### Planned Features
- [ ] Email notifications for critical alerts
- [ ] SMS alerts for out of stock
- [ ] Auto-reorder triggered from alerts
- [ ] Alert history and analytics
- [ ] Custom alert rules
- [ ] Webhook integrations

---

## 📞 Quick Reference

| Action | How To |
|--------|--------|
| View all alerts | Go to `/alerts` |
| Sync alerts | Stock page (auto) or Alerts page (manual) |
| Filter by severity | Use dropdown in Alerts page |
| Mark as read | Click alert, then "Mark as Read" |
| Create manual alert | Click "Create Alert" button |

---

## ✅ System Status

- ✅ Alert API endpoints created
- ✅ Auto-sync on stock page load
- ✅ Manual sync button in alerts page
- ✅ Real-time alert generation
- ✅ Severity-based categorization
- ✅ Alert filtering and search
- ✅ Mark as read functionality
- ✅ Duplicate prevention
- ✅ Database persistence

---

**🎉 Your automated alert system is fully operational!**

