const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/ambica-pharma-inventory';

async function viewDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get database stats
    const stats = await db.stats();
    console.log('📊 DATABASE OVERVIEW');
    console.log('==================');
    console.log(`Database: ${stats.db}`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Total Documents: ${stats.objects}`);
    console.log(`Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 COLLECTIONS');
    console.log('==============');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
    console.log();

    // Show chemicals data
    console.log('🧪 CHEMICALS COLLECTION');
    console.log('=======================');
    const chemicals = await db.collection('chemicals').find({}).limit(5).toArray();
    chemicals.forEach((chemical, index) => {
      console.log(`${index + 1}. ${chemical.name} (${chemical.formula})`);
      console.log(`   Category: ${chemical.category}`);
      console.log(`   Quantity: ${chemical.quantity} ${chemical.unit}`);
      console.log(`   Status: ${chemical.status}`);
      console.log(`   Supplier: ${chemical.supplier}`);
      console.log(`   Location: ${chemical.location}`);
      console.log(`   Batch: ${chemical.batchNo}`);
      console.log(`   Expiry: ${new Date(chemical.expiryDate).toLocaleDateString()}`);
      console.log('   ---');
    });

    // Show suppliers data
    console.log('\n👥 SUPPLIERS COLLECTION');
    console.log('=======================');
    const suppliers = await db.collection('suppliers').find({}).toArray();
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.name}`);
      console.log(`   Contact: ${supplier.contact}`);
      console.log(`   Email: ${supplier.email}`);
      console.log(`   Phone: ${supplier.phone}`);
      console.log(`   Rating: ${supplier.rating}/5`);
      console.log(`   Total Orders: ${supplier.totalOrders}`);
      console.log(`   Status: ${supplier.status}`);
      console.log(`   Chemicals: ${supplier.chemicals.join(', ')}`);
      console.log('   ---');
    });

    // Show low stock items
    console.log('\n⚠️  LOW STOCK ALERTS');
    console.log('===================');
    const lowStockItems = await db.collection('chemicals').find({
      $expr: { $lte: ['$quantity', '$reorderThreshold'] }
    }).toArray();
    
    if (lowStockItems.length > 0) {
      lowStockItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}: ${item.quantity} ${item.unit} (Threshold: ${item.reorderThreshold})`);
      });
    } else {
      console.log('No low stock items found.');
    }

    // Show expired items
    console.log('\n🚫 EXPIRED ITEMS');
    console.log('===============');
    const expiredItems = await db.collection('chemicals').find({
      expiryDate: { $lt: new Date() }
    }).toArray();
    
    if (expiredItems.length > 0) {
      expiredItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}: Expired on ${new Date(item.expiryDate).toLocaleDateString()}`);
      });
    } else {
      console.log('No expired items found.');
    }

    console.log('\n✨ Database viewing completed!');
    
  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Run the database viewer
viewDatabase();
