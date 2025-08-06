# n8n Setup Instructions for Ambica Pharma Chem Inventory System

## 📋 Prerequisites

1. **Docker installed** on your system
2. **n8n running** via Docker
3. **Email service configured** (Gmail, Outlook, or SMTP)
4. **Optional**: Telegram, Slack, WhatsApp API access

## 🚀 Quick Start with n8n Docker

### 1. Start n8n with Docker

```bash
# Create a directory for n8n data
mkdir n8n-data

# Run n8n with Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v $(pwd)/n8n-data:/home/node/.n8n \
  n8nio/n8n
```

### 2. Access n8n Interface

- Open: http://localhost:5678
- Create your admin account
- Complete the initial setup

## 📁 Import Workflows

### Step 1: Import JSON Files

1. **Go to n8n Dashboard** (http://localhost:5678)
2. **Click "Import from file"** or use the import menu
3. **Import each workflow file** in this order:
   - `1-reorder-trigger-workflow.json`
   - `2-purchase-order-processing.json`
   - `3-multi-channel-notifications.json`

### Step 2: Configure Credentials

For each workflow, you'll need to set up credentials:

#### Email Credentials
1. Go to **Credentials** → **Add Credential**
2. Select **Email (SMTP)**
3. Configure your email settings:
   ```
   Host: smtp.gmail.com (for Gmail)
   Port: 587
   User: your-email@gmail.com
   Password: your-app-password
   ```

#### Telegram Bot (Optional)
1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Add **Telegram** credential in n8n
4. Update chat IDs in workflows

#### Slack Integration (Optional)
1. Create a Slack app at api.slack.com
2. Get webhook URL or bot token
3. Add **Slack** credential in n8n

## 🔗 Connect Dashboard to n8n

### 1. Update Dashboard Environment

Create `.env.local` in your dashboard root:

```env
NEXT_PUBLIC_N8N_BASE_URL=http://localhost:5678
```

### 2. Start Both Services

```bash
# Terminal 1: Start n8n
docker run -it --rm --name n8n -p 5678:5678 -v $(pwd)/n8n-data:/home/node/.n8n n8nio/n8n

# Terminal 2: Start Dashboard
cd your-dashboard-directory
npm run dev
```

### 3. Test Integration

1. **Open Dashboard**: http://localhost:3001
2. **Login** with demo credentials
3. **Go to Stock Management**
4. **Click "Trigger Reorder"** on any low stock item
5. **Check n8n executions** at http://localhost:5678

## ⚙️ Workflow Configuration

### Webhook URLs

Your workflows will be available at:
- **Reorder Trigger**: `http://localhost:5678/webhook/reorder-trigger`
- **Send PO**: `http://localhost:5678/webhook/send-purchase-order`
- **Notifications**: `http://localhost:5678/webhook/notify-manager`

### Customize Workflows

#### 1. Update Email Recipients

In each workflow, update email addresses:
- Find **Email Send** nodes
- Update `toEmail` field with your actual emails
- Update `fromEmail` with your company email

#### 2. Configure Supplier Contacts

In **Reorder Trigger** workflow:
- Update the `supplierContacts` object in the **Process Reorder Data** node
- Add real supplier email addresses and contact info

#### 3. Customize Company Information

In **Purchase Order Processing**:
- Update company details in the **Generate PO Document** node
- Modify company address, phone, email, GSTIN

## 📧 Email Service Setup

### Gmail Setup
1. **Enable 2-factor authentication**
2. **Generate app password**: Google Account → Security → App passwords
3. **Use app password** in n8n email credentials

### Outlook/Office 365
```
Host: smtp-mail.outlook.com
Port: 587
Security: STARTTLS
```

### Custom SMTP
Use your company's SMTP settings

## 🔔 Notification Channels

### Telegram Setup
1. **Create bot**: Message @BotFather on Telegram
2. **Get bot token**: Save for n8n credentials
3. **Create channel/group**: For inventory alerts
4. **Get chat ID**: Add bot to channel, get ID

### Slack Setup
1. **Create Slack app**: https://api.slack.com/apps
2. **Enable webhooks**: Get webhook URL
3. **Create #inventory-alerts channel**
4. **Add webhook URL to n8n**

### WhatsApp Business API (Advanced)
- Requires WhatsApp Business API access
- Update workflow with your API credentials

## 🧪 Testing Workflows

### Test Reorder Trigger
```bash
curl -X POST http://localhost:5678/webhook/reorder-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "chemical": {
      "id": "test-1",
      "name": "Test Chemical",
      "currentStock": 5,
      "reorderThreshold": 10,
      "supplier": "Test Supplier",
      "category": "Test Category",
      "costPerUnit": 25.50,
      "unit": "kg"
    },
    "urgency": "normal"
  }'
```

### Test Notifications
```bash
curl -X POST http://localhost:5678/webhook/notify-manager \
  -H "Content-Type: application/json" \
  -d '{
    "alert": {
      "type": "low_stock",
      "title": "Test Alert",
      "message": "This is a test alert",
      "severity": "high",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "channels": ["email", "telegram"]
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Webhook not responding**
   - Check n8n is running on port 5678
   - Verify webhook URLs in dashboard
   - Check n8n execution logs

2. **Email not sending**
   - Verify SMTP credentials
   - Check spam folders
   - Test with simple SMTP test

3. **CORS Issues**
   - n8n runs on different port
   - Check browser network tab for errors
   - Verify n8n CORS settings

### Debug Steps

1. **Check n8n Executions**
   - Go to n8n → Executions
   - View failed/successful runs
   - Check error messages

2. **Dashboard Console**
   - Open browser dev tools
   - Check console for errors
   - Verify API calls in Network tab

3. **Test Individual Nodes**
   - Use n8n's test functionality
   - Test each node individually
   - Verify data flow between nodes

## 📈 Production Deployment

### Security Considerations
1. **Use HTTPS** for production webhooks
2. **Add webhook authentication** (webhook secrets)
3. **Restrict n8n access** (firewall, VPN)
4. **Use secure credentials storage**

### Scaling Options
1. **n8n Cloud**: Managed n8n service
2. **Self-hosted cluster**: Multiple n8n instances
3. **Database backend**: PostgreSQL for persistence

## 📞 Support

For issues with this integration:
1. Check n8n documentation: https://docs.n8n.io
2. Review workflow execution logs
3. Test individual components
4. Check environment variables

---

## 🎉 You're Ready!

Once configured, your inventory system will automatically:
- ✅ Trigger reorders when stock is low
- ✅ Send purchase orders to suppliers via email
- ✅ Notify managers across multiple channels
- ✅ Log all activities for audit trail
- ✅ Generate professional PO documents

**Test the integration and customize as needed for your specific requirements!**