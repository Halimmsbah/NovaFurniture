import { MongoClient } from 'mongodb';

const ATLAS_URI = 'mongodb+srv://NovaFurniture:L689akoRfLglzMaZ@cluster0.7errxoi.mongodb.net/?appName=Cluster0';

async function testConnection() {
  const client = new MongoClient(ATLAS_URI);
  
  try {
    console.log('🔄 Testing MongoDB Atlas connection...\n');
    await client.connect();
    
    const db = client.db('nova');
    const collections = await db.listCollections().toArray();
    
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    console.log(`📊 Current collections: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testConnection();
