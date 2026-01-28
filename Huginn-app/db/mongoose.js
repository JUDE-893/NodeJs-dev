// mongoose.js - DEBUG VERSION
import mongoose from 'mongoose';

// Get MongoDB connection parameters
const mongoUser = process.env.MONGO_USERNAME || 'huginn_api';
const mongoPass = process.env.MONGO_PASSWORD || 'pQ^E5%6dak@mN4!fG7B3€L19*&hJsT8ààà';
const mongoHost = process.env.MONGO_HOST || 'mongodb';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDB = process.env.MONGO_DATABASE || 'huginn';

// Helper to safely log password
const safeLogPassword = (pass) => {
  if (!pass) return '[EMPTY]';
  return `'${pass.substring(0,3)}...${pass.substring(pass.length-3)}' (length: ${pass.length})`;
};

export const connectDB = async () => {
  try {
    console.log('\n🔍 ========== MONGODB CONNECTION DEBUG ==========');
    console.log('📋 Environment Variables:');
    console.log(`   MONGO_USERNAME: '${mongoUser}'`);
    console.log(`   MONGO_PASSWORD: ${safeLogPassword(mongoPass)}`);
    console.log(`   MONGO_HOST: '${mongoHost}'`);
    console.log(`   MONGO_PORT: '${mongoPort}'`);
    console.log(`   MONGO_DATABASE: '${mongoDB}'`);
    console.log(`   DATABASE_LOCAL: ${process.env.DATABASE_LOCAL ? '[SET]' : '[NOT SET]'}`);
    
    // Check for Euro symbol in password
    if (mongoPass && mongoPass.includes('€')) {
      console.log(`   ⚠️  Password contains Euro symbol (€) at position: ${mongoPass.indexOf('€')}`);
      console.log(`   ⚠️  Euro symbol char code: ${mongoPass.charCodeAt(mongoPass.indexOf('€'))}`);
    }
    
    // Encode password for URL
    const encodedPass = encodeURIComponent(mongoPass);
    console.log('\n🔐 Password Encoding:');
    console.log(`   Original: ${safeLogPassword(mongoPass)}`);
    console.log(`   Encoded: '${encodedPass.substring(0,20)}...' (length: ${encodedPass.length})`);
    
    // Build connection string
    const DB = process.env.DATABASE_LOCAL || 
                `mongodb://${mongoUser}:${encodedPass}@${mongoHost}:${mongoPort}/${mongoDB}?authSource=${mongoDB}`;
    
    console.log('\n🔗 Connection String Analysis:');
    console.log(`   Full string (hidden): ${DB.replace(/:[^:@]+@/, ':*****@')}`);
    console.log(`   Total length: ${DB.length} characters`);
    
    // Test each part
    console.log('\n🧪 Testing Connection String Parts:');
    console.log(`   1. Protocol: mongodb:// ✓`);
    console.log(`   2. Username: ${mongoUser} ✓`);
    console.log(`   3. Password: ${mongoPass ? 'Present ✓' : 'Missing ✗'}`);
    console.log(`   4. Host:Port: ${mongoHost}:${mongoPort} ✓`);
    console.log(`   5. Database: ${mongoDB} ✓`);
    console.log(`   6. Auth Source: ${mongoDB} ✓`);
    
    console.log('\n🚀 Attempting MongoDB connection...');
    console.log(`   Time: ${new Date().toISOString()}`);
    
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };
    
    console.log('   Options:', JSON.stringify(connectionOptions, null, 2));
    
    // Add mongoose event listeners BEFORE connecting
    mongoose.connection.on('connecting', () => {
      console.log('   📡 Mongoose: Connecting...');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('   ✅ Mongoose: Connected successfully!');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('   ❌ Mongoose error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('   🔌 Mongoose: Disconnected');
    });
    
    // Attempt connection
    console.log('\n   Starting connection attempt...');
    const startTime = Date.now();
    
    await mongoose.connect(DB, connectionOptions);
    
    const endTime = Date.now();
    console.log(`\n✅ SUCCESS! MongoDB connected in ${endTime - startTime}ms`);
    console.log(`   Connection state: ${mongoose.connection.readyState}`);
    console.log(`   Database name: ${mongoose.connection.db?.databaseName || 'Unknown'}`);
    console.log(`   Host: ${mongoose.connection.host || 'Unknown'}`);
    console.log(`   Port: ${mongoose.connection.port || 'Unknown'}`);
    
    console.log('\n🎉 ========== CONNECTION SUCCESSFUL ==========\n');
    
  } catch (error) {
    console.error('\n❌ ========== CONNECTION FAILED ==========');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Check for specific error types
    if (error.name === 'MongoServerError') {
      console.error('   MongoDB Error Code:', error.code);
      console.error('   MongoDB Error CodeName:', error.codeName);
      console.error('   MongoDB Error Message:', error.errmsg);
    }
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('   Server Selection Error Details:');
      console.error('   - Reason:', error.reason);
      if (error.reason && error.reason.servers) {
        console.error('   - Available servers:', error.reason.servers);
      }
    }
    
    // Check for network errors
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   ⚠️  NETWORK ERROR: Connection refused');
      console.error('   ⚠️  Check if MongoDB is running and accessible');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.error('   ⚠️  AUTHENTICATION ERROR');
      console.error('   ⚠️  Check username/password and authSource');
    }
    
    console.error('\n🔧 Suggested fixes:');
    console.error('   1. Check if password contains special characters that need encoding');
    console.error('   2. Verify authSource matches the database where user was created');
    console.error('   3. Check network connectivity between containers');
    console.error('   4. Try using DATABASE_LOCAL environment variable');
    
    console.error('\n❌ ========== END ERROR ==========\n');
    
    // Re-throw the error
    throw error;
  }
};