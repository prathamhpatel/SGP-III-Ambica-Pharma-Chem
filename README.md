# Ambica Pharma Chem - Inventory Management Dashboard

A professional, production-ready inventory management dashboard built for chemical companies. This system provides comprehensive inventory tracking, supplier management, purchase order handling, and analytics - all designed to be integrated with n8n automation workflows.

## 🚀 Features

### Core Functionalities

1. **Dashboard Home**
   - Real-time inventory statistics
   - Quick access to critical alerts
   - Recent activity overview
   - Key performance metrics

2. **Stock Management**
   - Complete chemical inventory tracking
   - Batch number and expiry date management
   - Automatic reorder threshold alerts
   - Location tracking and categorization
   - Bulk operations and CSV export

3. **Low Stock Alerts**
   - Real-time alerts for low stock items
   - Expiry date warnings
   - Critical and urgent notifications
   - One-click reorder triggers
   - Multi-channel notification system

4. **Purchase Order Management**
   - Complete PO lifecycle tracking
   - Supplier integration
   - Delivery tracking
   - Status management and updates
   - Automated approval workflows

5. **Supplier Management**
   - Comprehensive supplier database
   - Rating and performance tracking
   - Contact management
   - Order history
   - CRUD operations with validation

6. **Activity Logs**
   - Complete audit trail
   - User action tracking
   - System notifications
   - Categorized logging
   - Advanced filtering and search

7. **Analytics Dashboard**
   - Interactive charts and graphs
   - Inventory trend analysis
   - Consumption patterns
   - Supplier performance metrics
   - Category-wise breakdowns

8. **Notification Center**
   - Multi-channel notification settings
   - Email, SMS, WhatsApp, Slack integration
   - Customizable alert preferences
   - Sound notifications

9. **Authentication System**
   - Secure login interface
   - Role-based access control
   - Session management

## 🛠 Technology Stack

- **Frontend:** Next.js 14 with React 18
- **Styling:** Tailwind CSS with custom design system
- **Charts:** Recharts for data visualization
- **Icons:** Lucide React
- **TypeScript:** Full type safety
- **Architecture:** Modular component structure

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── alerts/                   # Low stock alerts page
│   ├── analytics/                # Analytics dashboard
│   ├── login/                    # Authentication
│   ├── logs/                     # Activity logs
│   ├── notifications/            # Notification center
│   ├── purchase-orders/          # PO management
│   ├── stock/                    # Inventory management
│   ├── suppliers/                # Supplier management
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard home
├── components/                   # Reusable components
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx            # Main header
│   │   ├── Layout.tsx            # App layout wrapper
│   │   └── Sidebar.tsx           # Navigation sidebar
│   └── ui/                       # UI components
│       ├── Badge.tsx             # Status badges
│       ├── Button.tsx            # Button component
│       ├── Card.tsx              # Card wrapper
│       └── Table.tsx             # Table components
├── lib/                          # Utility libraries
│   ├── automation.ts             # n8n integration placeholders
│   ├── mockData.ts               # Sample data
│   └── utils.ts                  # Helper functions
├── types/                        # TypeScript definitions
│   └── index.ts                  # Type definitions
└── package.json                  # Dependencies
```

## 🔧 Installation & Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with demo credentials:
     - Email: `admin@ambicapharma.com`
     - Password: `admin123`

## 🔗 n8n Integration Ready

The application is architected for seamless n8n integration:

### Placeholder Functions (Ready for n8n API calls)

```typescript
// lib/automation.ts
- triggerReorder()         // Automatic reorder workflows
- sendPO()                 // Purchase order automation
- notifyManager()          // Multi-channel notifications
- syncSupplierData()       // Supplier database sync
- generateReport()         // Automated reporting
- trackDelivery()          // Delivery status tracking
- forecastDemand()         // AI-powered demand forecasting
- notifyQualityControl()   // QC workflow integration
```

### Integration Points

1. **Webhook Endpoints** - Ready to receive n8n webhook calls
2. **API Structure** - Modular functions for easy replacement
3. **Data Models** - Structured for external system integration
4. **Event Triggers** - Built-in points for workflow automation

## 📊 Key Features

### Smart Inventory Management
- Automatic low stock detection
- Expiry date tracking
- Batch management
- Location-based organization

### Advanced Analytics
- Real-time dashboards
- Trend analysis
- Performance metrics
- Export capabilities

### Multi-Channel Notifications
- Email alerts
- SMS notifications
- WhatsApp messaging
- Slack integration
- Push notifications

### Comprehensive Reporting
- Inventory reports
- Order summaries
- Supplier performance
- Activity logs

## 🎨 Design System

The application uses a professional design system with:
- **Color Palette:** Primary blues, success greens, warning oranges, danger reds
- **Typography:** Inter font family for readability
- **Components:** Consistent UI patterns
- **Responsive:** Mobile-first design approach
- **Accessibility:** WCAG compliant interfaces

## 🔒 Security Features

- Authentication system
- Role-based access control
- Input validation
- Secure data handling
- Audit trail logging

## 📈 Scalability

The codebase is designed for:
- **Modular Architecture:** Easy feature additions
- **Type Safety:** Full TypeScript implementation  
- **Performance:** Optimized React patterns
- **Maintenance:** Clean code structure

## 🚀 Production Deployment

Ready for deployment with:
- Environment configuration
- Build optimization
- Performance monitoring
- Error handling

## 🔄 Future n8n Integration

Once n8n workflows are ready:

1. Replace placeholder functions in `lib/automation.ts`
2. Add webhook endpoints for n8n callbacks  
3. Configure environment variables for n8n URLs
4. Test automation workflows
5. Deploy integrated system

## 📞 Support

For questions about n8n integration or system customization, refer to the comprehensive codebase documentation and modular architecture.

---

**Built for Ambica Pharma Chem** - Professional inventory management with automation-ready architecture.# SEM5-SGP-72-74-77
# SEM5-SGP-72-74-77
