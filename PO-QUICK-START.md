# Purchase Order System - Quick Start Guide

## 🎯 What's New?

The Purchase Order (PO) system now **automatically updates stock** when chemicals are delivered!

## ⚡ Quick Usage

### Create a Purchase Order

1. Go to **Purchase Orders** page
2. Click **"Create PO"** button
3. Fill in:
   - Select supplier
   - Set expected delivery date
   - Add chemicals:
     - Select chemical from dropdown
     - **Price auto-fills from stock** (read-only)
     - Enter quantity
     - Total calculates automatically
4. Click **"Save Purchase Order"**

### Deliver a Purchase Order

#### **Option 1: Automatic (Recommended)**
- Just wait! When the expected delivery date arrives, the system automatically:
  - Updates PO status to "delivered"
  - Increases stock quantities
  - Updates chemical prices
  - Re-syncs alerts

- Or click **"Auto-Update"** button in the page header to trigger it manually

#### **Option 2: Manual**
- Click the **green checkmark (✅)** button next to any order
- Confirm the action
- Stock is updated immediately!

## 📊 What Happens When Delivered?

### Automatic Updates:
1. ✅ **PO Status** → Changed to "delivered"
2. 📦 **Stock Quantities** → Increased by ordered amounts
3. 💰 **Chemical Prices** → Updated with purchase prices
4. ⏰ **Expiry Dates** → Extended by 2 months (for fresh stock)
5. 📊 **Chemical Status** → Recalculated (expired → active, low_stock → active)
6. 🔔 **Alerts** → Re-evaluated and synced with new status

### Example:
```
Before Delivery:
- Sodium Chloride: 350 kg
- Expiry: 2025-12-31
- Status: "low_stock"
- Alert: "Low Stock" (High Priority)

After Delivering PO (100 kg):
- Sodium Chloride: 450 kg (+100)
- Expiry: 2026-02-28 (+2 months)
- Status: "active" (recalculated!)
- Alert: Removed (stock restored)
```

## 🎨 Page Features

### Header Buttons:
- **Export CSV**: Download orders list
- **Auto-Update**: Manually trigger auto-delivery updates
- **Create PO**: Add new purchase order

### Order Actions:
- 👁️ **View**: See order details
- ✏️ **Edit**: Modify order
- 📤 **Send**: Send to supplier (pending orders)
- 🚚 **Track**: Track delivery (shipped orders)
- ✅ **Mark as Delivered**: Manually mark as delivered (all orders)

## 💡 Pro Tips

1. **Set Accurate Delivery Dates**: The system auto-delivers based on the expected delivery date
2. **Check Stock Management**: After delivery, verify:
   - Quantity increased ✅
   - Price updated ✅
   - Expiry extended by 2 months ✅
   - Status changed to "active" ✅
3. **Monitor Alerts**: 
   - Low stock alerts clear when stock is restored
   - Expired alerts clear when expiry is extended
   - All alerts re-sync automatically
4. **Use Auto-Update**: Click "Auto-Update" anytime to process pending deliveries
5. **Price Consistency**: Unit prices auto-fill from stock - ensures accurate ordering

## 🔗 Integration

The PO system seamlessly integrates with:
- **Stock Management**: Auto-updates quantities and prices
- **Alerts**: Re-evaluates and syncs alert priorities
- **Suppliers**: Pulls supplier list from database
- **Chemicals**: Pulls chemical list from database

## 📚 More Information

For detailed documentation, see:
- [PURCHASE-ORDER-SYSTEM-GUIDE.md](./PURCHASE-ORDER-SYSTEM-GUIDE.md) - Complete system guide

## 🎉 You're All Set!

The Purchase Order system is now fully functional and ready to use. Create your first PO and watch the magic happen! ✨

---

**Questions?** Check the full guide or contact support.

