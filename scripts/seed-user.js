const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ambica-pharma-inventory';

// User Schema (must match the TypeScript model)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator'],
    default: 'admin'
  },
  department: {
    type: String,
    required: true,
    default: 'Inventory Management'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUser() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'info@ambicapharmachem.in' });
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Ambica@123', salt);
      
      // Update user
      existingUser.password = hashedPassword;
      existingUser.name = 'Himanshu Patel';
      existingUser.role = 'admin';
      existingUser.department = 'Inventory Management';
      existingUser.isActive = true;
      existingUser.phone = '+91-9876543210';
      
      await existingUser.save();
      console.log('✅ User updated successfully!');
    } else {
      console.log('🔄 Creating new user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Ambica@123', salt);
      
      // Create new user
      const user = new User({
        name: 'Himanshu Patel',
        email: 'info@ambicapharmachem.in',
        password: hashedPassword,
        role: 'admin',
        department: 'Inventory Management',
        phone: '+91-9876543210',
        isActive: true
      });
      
      await user.save();
      console.log('✅ User created successfully!');
    }

    console.log('\n📋 Login Credentials:');
    console.log('   Email: info@ambicapharmachem.in');
    console.log('   Password: Ambica@123');
    console.log('   Role: Admin\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    process.exit(1);
  }
}

// Run the seed function
seedUser();

