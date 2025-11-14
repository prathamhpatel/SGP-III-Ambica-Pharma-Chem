# Purchase Order System - Complete Guide

## 🎯 Overview

The Purchase Order (PO) System is a comprehensive inventory management solution that automatically updates stock levels when orders are delivered. It features automatic status updates based on delivery dates and seamlessly integrates with the stock management and alert systems.

## ✨ Key Features

### 1. **Automated Delivery Updates**
- **Auto-Status Updates**: PO statuses automatically change to "delivered" when the expected delivery date is reached
- **Stock Updates**: When marked as delivered, chemical quantities are automatically increased
- **Price Updates**: Chemical prices are updated with the latest purchase prices
- **Alert Re-sync**: Alerts are automatically re-evaluated after stock updates

### 2. **Manual Delivery Control**
- **Mark as Delivered Button**: Manually mark orders as delivered at any time
- **Confirmation Dialog**: Shows what will be updated before confirming
- **Success Feedback**: Displays detailed information about stock updates after delivery

### 3. **Real-Time Data**
- All data is fetched from and stored in MongoDB
- UI updates immediately after changes
- Full CRUD operations supported

## 📊 How It Works

### Creating a Purchase Order

1. **Click "Create PO"** button on the Purchase Orders page
2. **Fill in the form**:
   - PO Number (auto-generated)
   - Supplier (dropdown from database)
   - Order Date (defaults to today)
   - Expected Delivery Date (required)
   - Priority (low, medium, high, urgent)
   - Notes (optional)
3. **Add Chemicals**:
   - Select chemical from dropdown
   - Enter quantity
   - Enter unit price
   - Total is calculated automatically
   - Add multiple chemicals as needed
4. **Save**: Order is created with "pending" status

### Delivery Flow

#### **Option 1: Automatic Delivery (Recommended)**

The system automatically checks for orders that should be delivered:

1. **On Page Load**: Auto-update runs automatically when you visit the PO page
2. **Manual Trigger**: Click "Auto-Update" button in the page header
3. **Process**:
   - Finds all orders where `expectedDelivery` date ≤ today
   - Updates status to "delivered"
   - Sets `actualDelivery` to today's date
   - Updates stock for all chemicals in the order
   - Re-syncs alerts

#### **Option 2: Manual Delivery**

Mark specific orders as delivered manually:

1. **Click the green checkmark** button in the Actions column
2. **Review the confirmation**:
   ```
   Mark PO [PO-20251114-001] as delivered?
   
   This will:
   - Update order status to 'delivered'
   - Update stock quantities for all chemicals
   - Update chemical prices
   - Re-sync alerts
   ```
3. **Confirm**: Click OK
4. **Success Message**:
   ```
   ✅ Purchase Order PO-20251114-001 marked as delivered!
   
   📦 Stock Updated:
   • Sodium Chloride: +100 (Total: 450)
   • Potassium Nitrate: +50 (Total: 200)
   ```

### Stock Update Details

When a PO is marked as delivered, for each chemical:

1. **Quantity Update**: 
   - `newQuantity = currentQuantity + orderedQuantity`
   - Example: 350kg + 100kg = 450kg

2. **Price Update**:
   - `costPerUnit = unitPriceFromPO`
   - Updates to the latest purchase price

3. **Expiry Date Extension**:
   - `newExpiryDate = currentExpiryDate + 2 months`
   - Automatically extends expiry by 2 months for fresh stock
   - Example: If expiring on Jan 15, 2026 → new expiry: Mar 15, 2026
   - This helps clear "Expiring Soon" alerts for replenished stock

4. **Status Recalculation**:
   - Chemical status is automatically recalculated based on:
     - New quantity (checks against reorder threshold)
     - New expiry date (checks days until expiry)
   - Status priorities (evaluated in this order):
     - `out_of_stock`: quantity = 0
     - `expired`: days until expiry ≤ 0
     - `low_stock`: quantity ≤ reorder threshold
     - `expiring_soon`: days until expiry ≤ 30
     - `active`: normal operating conditions
   - This ensures the chemical's status badge updates correctly in Stock Management

5. **Timestamp Update**:
   - `lastUpdated = now()`
   - Tracks when the stock was last modified

6. **Alert Re-evaluation**:
   - Deletes old alerts for the chemical
   - Creates new alerts based on the updated status and quantity
   - Adjusts severity based on new conditions
   - "Expiring Soon" alerts are recalculated with new expiry date

## 🎨 User Interface

### Purchase Orders Page

#### **Header Section**
- **Title**: "Purchase Orders"
- **Buttons**:
  - "Export CSV": Export orders to CSV file
  - "Auto-Update": Manually trigger auto-delivery updates
  - "Create PO": Open the create PO modal

#### **Quick Stats Cards**
- Total Orders
- Pending Orders
- Approved Orders
- Delivered Orders
- Total Value (in ₹)

#### **Filters**
- Search (by PO number, supplier, or chemical)
- Status filter (all, pending, approved, shipped, delivered, cancelled)
- Priority filter (all, low, medium, high, urgent)

#### **Orders Table**
Columns:
- PO Number
- Supplier
- Total Items
- Total Amount
- Order Date
- Expected Delivery
- Priority
- Status
- Actions

**Action Buttons**:
- 👁️ **View**: View order details
- ✏️ **Edit**: Edit order (functionality placeholder)
- 📤 **Send** (for pending orders): Send PO to supplier
- 🚚 **Track** (for shipped/approved orders): Track delivery
- ✅ **Mark as Delivered** (green button): Manually mark as delivered

### Create PO Modal

#### **Order Information**
- PO Number (read-only, auto-generated)
- Supplier (dropdown)
- Order Date (date picker)
- Expected Delivery (date picker)
- Priority (dropdown: low, medium, high, urgent)

#### **Order Items Section**
- Chemical (dropdown - from stock management)
- Quantity (number input - editable)
- Unit Price (auto-filled from chemical's Cost Per Unit - **read-only**)
- Total (calculated: quantity × unit price)
- Add/Remove item buttons

**Note**: The unit price is automatically fetched from the chemical's "Cost Per Unit" in stock management and cannot be changed. This ensures consistency with current stock pricing.

#### **Notes**
- Optional textarea for additional information

#### **Footer**
- Total Amount (displays sum of all items)
- Cancel button
- Save Purchase Order button

## 🔧 API Endpoints

### 1. Get All Purchase Orders
```http
GET /api/purchase-orders
Query Params:
  - page (default: 1)
  - limit (default: 50)
  - status (optional)
  - supplier (optional, partial match)

Response:
{
  "success": true,
  "data": [/* array of purchase orders */],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### 2. Get Single Purchase Order
```http
GET /api/purchase-orders/:id

Response:
{
  "success": true,
  "data": {/* purchase order object */}
}
```

### 3. Create Purchase Order
```http
POST /api/purchase-orders
Body:
{
  "poNumber": "PO-20251114-001",
  "supplier": "Acme Chemicals Ltd.",
  "chemicals": [
    {
      "chemicalId": "507f1f77bcf86cd799439011",
      "chemicalName": "Sodium Chloride",
      "quantity": 100,
      "unitPrice": 50,
      "total": 5000
    }
  ],
  "orderDate": "2025-11-14",
  "expectedDelivery": "2025-11-20",
  "status": "pending",
  "priority": "medium",
  "notes": "Urgent order"
}

Response:
{
  "success": true,
  "data": {/* created purchase order */},
  "message": "Purchase order created successfully"
}
```

### 4. Update Purchase Order (Mark as Delivered)
```http
PUT /api/purchase-orders/:id
Body:
{
  "status": "delivered",
  "actualDelivery": "2025-11-20"
}

Response:
{
  "success": true,
  "data": {/* updated purchase order */},
  "message": "Purchase order marked as delivered and stock updated",
  "stockUpdates": [
    {
      "chemicalId": "...",
      "chemicalName": "Sodium Chloride",
      "quantityAdded": 100,
      "newQuantity": 450
    }
  ]
}
```

### 5. Auto-Update PO Statuses
```http
POST /api/purchase-orders/auto-update-status

Response:
{
  "success": true,
  "message": "Auto-updated 2 purchase orders to delivered status",
  "data": {
    "ordersUpdated": 2,
    "updates": [
      {
        "poNumber": "PO-20251114-001",
        "supplier": "Acme Chemicals Ltd.",
        "status": "delivered"
      }
    ],
    "stockUpdates": [/* array of stock update details */]
  }
}
```

### 6. Delete Purchase Order
```http
DELETE /api/purchase-orders/:id

Response:
{
  "success": true,
  "message": "Purchase order deleted successfully"
}
```

## 🗄️ Database Schema

### PurchaseOrder Model

```typescript
{
  poNumber: String,           // Unique PO identifier
  supplier: String,            // Supplier name
  chemicals: [
    {
      chemicalId: String,      // Reference to Chemical._id
      chemicalName: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }
  ],
  totalAmount: Number,         // Sum of all item totals
  orderDate: Date,
  expectedDelivery: Date,
  actualDelivery?: Date,       // Set when delivered
  status: String,              // pending, approved, shipped, delivered, cancelled
  priority: String,            // low, medium, high, urgent
  notes?: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Integration with Other Systems

### Stock Management
- **On PO Delivery**: Chemical quantities are automatically increased
- **Price Updates**: Chemical `costPerUnit` is updated with PO price
- **Timestamp**: `lastUpdated` field is set to current date/time

### Alert System
- **Auto Re-evaluation**: Alerts are re-evaluated after stock updates
- **Status Changes**: 
  - "Out of Stock" alerts may be cleared if stock is restored
  - "Low Stock" alerts may be downgraded or removed
  - Severity is adjusted based on new quantities
- **New Alerts**: Created if new conditions are met (e.g., expiring soon)

## 🚀 Usage Examples

### Example 1: Create and Auto-Deliver PO

```javascript
// 1. Create a purchase order
const newPO = {
  supplier: "Acme Chemicals Ltd.",
  chemicals: [
    {
      chemicalId: "507f1f77bcf86cd799439011",
      chemicalName: "Sodium Chloride",
      quantity: 100,
      unitPrice: 50, // Auto-filled from stock's costPerUnit (read-only)
      total: 5000
    }
  ],
  expectedDelivery: "2025-11-14", // Today's date
  priority: "high"
};

// 2. On page load or manual trigger, auto-update runs:
// - Finds POs where expectedDelivery <= today
// - Updates status to "delivered"
// - Updates stock automatically

// 3. Result:
// - PO status: "delivered"
// - Sodium Chloride quantity: increased by 100 (350 → 450)
// - Sodium Chloride costPerUnit: updated to 50
// - Sodium Chloride expiryDate: extended by 2 months
// - Alerts: re-synced (expiring soon alerts recalculated)
```

### Example 2: Manual Delivery

```javascript
// 1. User clicks "Mark as Delivered" button
// 2. Confirmation dialog appears
// 3. On confirm:
PUT /api/purchase-orders/507f1f77bcf86cd799439011
{
  "status": "delivered",
  "actualDelivery": "2025-11-14"
}

// 4. Response shows stock updates:
{
  "stockUpdates": [
    {
      "chemicalName": "Sodium Chloride",
      "quantityAdded": 100,
      "oldQuantity": 350,
      "newQuantity": 450
    }
  ]
}
```

## ⚙️ Configuration

### Auto-Update Trigger Points

1. **Page Load**: 
   - Runs when Purchase Orders page is opened
   - Implemented in `useEffect` hook

2. **Manual Button**:
   - "Auto-Update" button in page header
   - Allows manual triggering at any time

3. **Future Enhancement** (Optional):
   - Can be configured as a scheduled task (e.g., cron job)
   - Run daily at a specific time

### Status Workflow

```
pending → approved → shipped → delivered
  ↓                              ↑
cancelled ←────────────────────────
```

- **pending**: Order created, awaiting approval
- **approved**: Order approved, ready to send to supplier
- **shipped**: Order shipped by supplier
- **delivered**: Order received and stock updated
- **cancelled**: Order cancelled (no stock update)

## 🧪 Testing

### Test Scenario 1: Create PO
1. Open Purchase Orders page
2. Click "Create PO"
3. Select supplier
4. Add chemical with quantity and price
5. Set expected delivery date to today or past date
6. Save
7. ✅ Verify PO appears in the list with "pending" status

### Test Scenario 2: Auto-Delivery
1. Create a PO with expected delivery = today
2. Refresh the page (auto-update runs)
3. ✅ Verify PO status changed to "delivered"
4. Navigate to Stock Management
5. ✅ Verify chemical quantity increased
6. ✅ Verify chemical price updated

### Test Scenario 3: Manual Delivery
1. Create a PO with expected delivery = future date
2. Click the green checkmark button
3. Confirm the dialog
4. ✅ Verify success message shows stock updates
5. ✅ Verify PO status changed to "delivered"
6. ✅ Verify stock was updated

### Test Scenario 4: Alert Re-sync
1. Create a chemical with low stock
2. ✅ Verify "Low Stock" alert exists
3. Create and deliver a PO with enough quantity
4. ✅ Verify "Low Stock" alert is removed or downgraded
5. Navigate to Alerts page
6. ✅ Verify alert list is updated

## 🎯 Benefits

1. **Automation**: Reduces manual work by auto-updating stock on delivery
2. **Accuracy**: Eliminates human error in stock updates
3. **Real-time**: Stock levels always reflect current inventory
4. **Traceability**: Complete audit trail of orders and deliveries
5. **Integration**: Seamlessly works with stock and alert systems
6. **User-Friendly**: Clear visual feedback and confirmations

## 🔐 Security

- All API routes are protected by authentication
- JWT tokens required for access
- Input validation on all fields
- MongoDB injection prevention
- Error handling for all operations

## 📝 Notes

- PO numbers are auto-generated in format: `PO-YYYYMMDD-XXX`
- Total amount is calculated automatically from order items
- Stock updates only occur when status changes to "delivered"
- Alerts are re-synced after every stock update
- Historical data is preserved (original order details remain intact)

## 🐛 Troubleshooting

### Issue: PO not auto-updating
- Check if expected delivery date ≤ today
- Ensure PO status is not already "delivered" or "cancelled"
- Try clicking "Auto-Update" button manually

### Issue: Stock not updating
- Verify chemical ID in PO matches existing chemical in database
- Check console for error messages
- Ensure chemical exists in stock management

### Issue: Alerts not syncing
- Check if Alert model is properly connected
- Verify alert sync logic in `/api/purchase-orders/[id]/route.ts`
- Check console logs for alert update errors

## 🚀 Future Enhancements

1. **Email Notifications**: Send email to supplier when PO is created
2. **PDF Generation**: Generate PDF invoices for purchase orders
3. **Approval Workflow**: Multi-step approval process
4. **Delivery Tracking**: Integration with courier APIs
5. **Scheduled Auto-Update**: Daily cron job for auto-delivery
6. **Return Orders**: Handle returns and stock adjustments
7. **Partial Deliveries**: Support for partial order fulfillment
8. **Supplier Portal**: Allow suppliers to view and update orders

---

## 📚 Related Documentation

- [ALERT-SYSTEM-GUIDE.md](./ALERT-SYSTEM-GUIDE.md) - Alert system integration
- [DATABASE-INTEGRATION-COMPLETE.md](./DATABASE-INTEGRATION-COMPLETE.md) - Database setup
- [AUTHENTICATION-GUIDE.md](./AUTHENTICATION-GUIDE.md) - Authentication system

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0

