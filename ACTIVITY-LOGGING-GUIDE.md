# Activity Logging System - Complete Guide

## 🎯 Overview

The Activity Logging system automatically tracks **all changes** made during Purchase Order deliveries, including stock updates, price changes, expiry extensions, status changes, and alert modifications.

## ✨ What's Been Implemented

### 📦 **New Components Created**

1. **`models/ActivityLog.ts`** - Database schema for activity logs
2. **`app/api/activity-logs/route.ts`** - API endpoints for fetching/creating logs
3. **`lib/activityLogger.ts`** - Utility functions for logging activities
4. **Updated `app/api/purchase-orders/[id]/route.ts`** - Added logging on manual delivery
5. **Updated `app/api/purchase-orders/auto-update-status/route.ts`** - Added logging on auto-delivery
6. **Updated `app/logs/page.tsx`** - Now fetches and displays real logs from database
7. **Updated `lib/api.ts`** - Added activity log API methods

---

## 📝 What Gets Logged?

When a Purchase Order is delivered (manually or automatically), the system logs:

### 1. **Purchase Order Delivered**
- ✅ PO number
- ✅ Number of items in the order
- ✅ User (System or System (Auto))
- ✅ Timestamp

**Example Log:**
```
Action: Purchase Order Delivered
Category: purchase_order
Severity: success
User: System
Details: PO PO-20251114-001 marked as delivered with 3 item(s)
```

### 2. **Stock Increased**
For **each chemical** in the PO:
- ✅ Chemical name
- ✅ Old quantity
- ✅ New quantity
- ✅ Quantity added
- ✅ Reason (e.g., "PO PO-20251114-001 delivered")

**Example Log:**
```
Action: Stock Increased
Category: stock_update
Severity: success
User: System
Details: Sodium Chloride: Stock increased from 50 to 250 (PO PO-20251114-001 delivered)
Metadata: {
  chemicalId: "507f1f77bcf86cd799439011",
  chemicalName: "Sodium Chloride",
  oldValue: 50,
  newValue: 250,
  quantityChange: 200,
  reason: "PO PO-20251114-001 delivered"
}
```

### 3. **Price Updated**
If the price changed:
- ✅ Chemical name
- ✅ Old price
- ✅ New price

**Example Log:**
```
Action: Price Updated
Category: stock_update
Severity: info
User: System
Details: Sodium Chloride: Price updated from ₹45 to ₹50
Metadata: {
  chemicalId: "507f1f77bcf86cd799439011",
  chemicalName: "Sodium Chloride",
  oldValue: 45,
  newValue: 50
}
```

### 4. **Expiry Date Extended**
Always logged (expiry is always extended by 2 months):
- ✅ Chemical name
- ✅ Old expiry date
- ✅ New expiry date

**Example Log:**
```
Action: Expiry Date Extended
Category: stock_update
Severity: info
User: System
Details: Sodium Chloride: Expiry extended from 12/31/2025 to 2/28/2026
Metadata: {
  chemicalId: "507f1f77bcf86cd799439011",
  chemicalName: "Sodium Chloride",
  oldValue: "2025-12-31T00:00:00.000Z",
  newValue: "2026-02-28T00:00:00.000Z"
}
```

### 5. **Chemical Status Changed**
If the status changed after delivery:
- ✅ Chemical name
- ✅ Old status
- ✅ New status

**Example Log:**
```
Action: Chemical Status Changed
Category: stock_update
Severity: success
User: System
Details: Sodium Chloride: Status changed from "low_stock" to "active"
Metadata: {
  chemicalId: "507f1f77bcf86cd799439011",
  chemicalName: "Sodium Chloride",
  oldValue: "low_stock",
  newValue: "active"
}
```

---

## 🎨 Activity Log Page Features

The Activity Logs page (`/logs`) now displays all real-time logs from the database:

### **Filters Available:**
1. **Category Filter**:
   - All
   - Stock Update
   - Purchase Order
   - Supplier
   - Alert
   - User
   - System

2. **Severity Filter**:
   - All
   - Info
   - Success
   - Warning
   - Error

3. **User Filter**:
   - All
   - System
   - System (Auto)
   - (Any other users)

4. **Date Range Filter**:
   - All Time
   - Last 24 Hours (1)
   - Last 7 Days (7)
   - Last 30 Days (30)
   - Last 90 Days (90)

5. **Search Bar**:
   - Search across action, details, user, category

### **Display Columns:**
- ⏰ **Timestamp**: When the action occurred
- 📊 **Category**: Type of action (with icon)
- ⚠️ **Severity**: Importance level (with color badge)
- 👤 **User**: Who performed the action
- 📝 **Action**: What was done
- 📄 **Details**: Detailed description

---

## 📊 Example: Complete Delivery Log Sequence

When you deliver a PO with 2 chemicals, here's what gets logged:

### **Scenario:**
- PO: PO-20251114-001
- Chemical 1: Sodium Chloride (50kg → 250kg, ₹45 → ₹50, low_stock → active)
- Chemical 2: Potassium Nitrate (100kg → 150kg, price same, active → active)

### **Logs Created (7 total):**

1. **PO Delivered Log**
   ```
   [11:30 AM] Purchase Order | SUCCESS | System
   Purchase Order Delivered
   PO PO-20251114-001 marked as delivered with 2 item(s)
   ```

2. **Sodium Chloride - Stock Increased**
   ```
   [11:30 AM] Stock Update | SUCCESS | System
   Stock Increased
   Sodium Chloride: Stock increased from 50 to 250 (PO PO-20251114-001 delivered)
   ```

3. **Sodium Chloride - Price Updated**
   ```
   [11:30 AM] Stock Update | INFO | System
   Price Updated
   Sodium Chloride: Price updated from ₹45 to ₹50
   ```

4. **Sodium Chloride - Expiry Extended**
   ```
   [11:30 AM] Stock Update | INFO | System
   Expiry Date Extended
   Sodium Chloride: Expiry extended from 12/31/2025 to 2/28/2026
   ```

5. **Sodium Chloride - Status Changed**
   ```
   [11:30 AM] Stock Update | SUCCESS | System
   Chemical Status Changed
   Sodium Chloride: Status changed from "low_stock" to "active"
   ```

6. **Potassium Nitrate - Stock Increased**
   ```
   [11:30 AM] Stock Update | SUCCESS | System
   Stock Increased
   Potassium Nitrate: Stock increased from 100 to 150 (PO PO-20251114-001 delivered)
   ```

7. **Potassium Nitrate - Expiry Extended**
   ```
   [11:30 AM] Stock Update | INFO | System
   Expiry Date Extended
   Potassium Nitrate: Expiry extended from 1/15/2026 to 3/15/2026
   ```

**Note:** Potassium Nitrate doesn't get a price change log (price stayed the same) or status change log (status remained "active").

---

## 🔍 How to View Logs

### **View All PO Delivery Logs:**
1. Go to **Activity Logs** page
2. Set **Category** filter to "Purchase Order"
3. All PO delivery events are shown

### **View All Stock Updates:**
1. Go to **Activity Logs** page
2. Set **Category** filter to "Stock Update"
3. All stock changes are shown

### **View Auto-Delivered Orders:**
1. Go to **Activity Logs** page
2. Set **User** filter to "System (Auto)"
3. All automatically delivered orders are shown

### **View Today's Activities:**
1. Go to **Activity Logs** page
2. Set **Date Range** to "Last 24 Hours"
3. All today's logs are shown

### **Search for Specific Chemical:**
1. Go to **Activity Logs** page
2. Type chemical name in search bar (e.g., "Sodium Chloride")
3. All logs related to that chemical are shown

---

## 🎯 Log Categories & Severity

### **Categories:**
- `stock_update`: Inventory changes (quantity, price, expiry, status)
- `purchase_order`: PO creation, delivery, cancellation
- `supplier`: Supplier additions, modifications
- `alert`: Alert creation, clearing
- `user`: User actions
- `system`: System operations

### **Severity Levels:**
- `success` 🟢: Positive actions (stock restored, PO delivered, alerts cleared)
- `info` 🔵: Informational updates (price changes, expiry extensions)
- `warning` 🟡: Cautionary events (alerts created, low stock)
- `error` 🔴: Failures or issues (API errors, validation failures)

---

## 📦 Database Schema

```typescript
ActivityLog {
  _id: ObjectId,
  action: String,                    // "Stock Increased", "PO Delivered", etc.
  category: String,                  // "stock_update", "purchase_order", etc.
  severity: String,                  // "info", "success", "warning", "error"
  user: String,                      // "System", "System (Auto)", user name
  details: String,                   // Human-readable description
  metadata: Object,                  // Additional structured data
  timestamp: Date,                   // When the action occurred
  createdAt: Date,                   // Auto-generated by Mongoose
  updatedAt: Date                    // Auto-generated by Mongoose
}
```

### **Metadata Examples:**

**Stock Increase:**
```json
{
  "chemicalId": "507f1f77bcf86cd799439011",
  "chemicalName": "Sodium Chloride",
  "oldValue": 50,
  "newValue": 250,
  "quantityChange": 200,
  "reason": "PO PO-20251114-001 delivered"
}
```

**PO Delivered:**
```json
{
  "poNumber": "PO-20251114-001",
  "itemCount": 3
}
```

---

## 🚀 API Endpoints

### **GET /api/activity-logs**
Fetch activity logs with filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 100)
- `category` (string): Filter by category
- `severity` (string): Filter by severity
- `user` (string): Filter by user
- `dateRange` (string): Filter by days (e.g., "7" for last 7 days)

**Response:**
```json
{
  "success": true,
  "data": [/* array of activity logs */],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 523,
    "pages": 6
  }
}
```

### **POST /api/activity-logs**
Create a new activity log.

**Body:**
```json
{
  "action": "Stock Increased",
  "category": "stock_update",
  "severity": "success",
  "user": "System",
  "details": "Sodium Chloride: Stock increased from 50 to 250 (PO delivered)",
  "metadata": {
    "chemicalId": "507f...",
    "chemicalName": "Sodium Chloride",
    "oldValue": 50,
    "newValue": 250
  }
}
```

---

## 💡 Benefits

1. **Complete Audit Trail**: Every change is tracked with timestamp and details
2. **Traceability**: See exactly what happened when a PO was delivered
3. **Debugging**: Quickly identify issues by reviewing logs
4. **Compliance**: Maintain records for regulatory requirements
5. **Analytics**: Analyze patterns in stock movements and deliveries
6. **Accountability**: Know who did what and when

---

## 🔧 Technical Implementation

### **Logging Utility (`lib/activityLogger.ts`)**

Provides helper functions for common log types:

```typescript
// Log PO delivery
await ActivityLogger.poDelivered(poNumber, itemCount, user);

// Log stock increase
await ActivityLogger.stockIncreased(
  chemicalName, 
  chemicalId, 
  oldQty, 
  newQty, 
  reason, 
  user
);

// Log price update
await ActivityLogger.priceUpdated(
  chemicalName, 
  chemicalId, 
  oldPrice, 
  newPrice, 
  user
);

// Log expiry extension
await ActivityLogger.expiryExtended(
  chemicalName, 
  chemicalId, 
  oldExpiry, 
  newExpiry, 
  user
);

// Log status change
await ActivityLogger.statusChanged(
  chemicalName, 
  chemicalId, 
  oldStatus, 
  newStatus, 
  user
);
```

### **Non-Blocking Logging**

Logging is designed to **never break** the main flow:
- Wrapped in try-catch blocks
- Errors are logged to console but not thrown
- Failed logs don't affect PO delivery

---

## 📈 Performance

- **Indexed Fields**: `timestamp`, `category`, `severity`, `user`
- **Compound Indexes**: For common query patterns
- **Optimized Queries**: Server-side filtering reduces data transfer
- **Pagination**: Handles large datasets efficiently

---

## 🎉 Summary

Your Activity Log system now provides:

✅ **Automatic logging** of all PO delivery changes  
✅ **Real-time display** of logs in the Activity Logs page  
✅ **Comprehensive details** including old/new values  
✅ **Flexible filtering** by category, severity, user, date  
✅ **Searchable records** across all log fields  
✅ **Complete audit trail** for compliance and debugging  
✅ **Non-blocking implementation** that doesn't affect performance  

**Every PO delivery is now fully tracked and visible in the Activity Logs!** 📊🎊

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0

