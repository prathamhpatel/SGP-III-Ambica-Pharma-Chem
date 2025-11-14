const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/ambica-pharma-inventory';

// Define schemas directly here for seeding
const ChemicalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  formula: String,
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  batchNo: { type: String, required: true, unique: true },
  expiryDate: { type: Date, required: true },
  reorderThreshold: { type: Number, required: true },
  supplier: { type: String, required: true },
  costPerUnit: { type: Number, required: true },
  location: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, default: 0 },
  chemicals: [String],
  lastOrderDate: Date,
  totalOrders: { type: Number, default: 0 },
  status: { type: String, default: 'active' }
}, { timestamps: true });

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data to ensure fresh start
    console.log('Clearing existing data...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared');

    // Create models to ensure collections exist
    const Chemical = mongoose.model('Chemical', ChemicalSchema);
    const Supplier = mongoose.model('Supplier', SupplierSchema);

    // Create empty collections (no sample data)
    console.log('Initializing empty collections...');
    
    // Just ensure the collections are created (they'll be empty)
    await Chemical.createCollection();
    await Supplier.createCollection();
    
    console.log('Database initialization completed successfully!');
    console.log('Database is now ready with empty collections.');
    
    // Display summary
    const chemicalCount = await Chemical.countDocuments();
    const supplierCount = await Supplier.countDocuments();
    
    console.log('\n=== INITIALIZATION SUMMARY ===');
    console.log(`Chemicals: ${chemicalCount} (empty)`);
    console.log(`Suppliers: ${supplierCount} (empty)`);
    console.log('Database is ready for fresh data input.');
    console.log('===============================\n');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the database initialization
initializeDatabase();
