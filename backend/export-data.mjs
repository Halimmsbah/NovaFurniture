import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const LOCAL_URI = 'mongodb://localhost:27017/halim';
const BACKUP_DIR = './backup';

async function exportAllData() {
  const client = new MongoClient(LOCAL_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to local MongoDB');
    
    const db = client.db('halim');
    
    // Create backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections\n`);
    
    let totalDocuments = 0;
    
    // Export each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      // Get documents
      const documents = await collection.find({}).toArray();
      
      // Save to JSON file
      const filePath = path.join(BACKUP_DIR, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
      
      console.log(`✅ Exported ${collectionName}: ${documents.length} documents`);
      totalDocuments += documents.length;
    }
    
    console.log(`\n🎉 BACKUP COMPLETE!`);
    console.log(`📊 Total Documents: ${totalDocuments}`);
    console.log(`📁 Backup Location: ${path.resolve(BACKUP_DIR)}\n`);
    console.log('📋 Backup files:');
    fs.readdirSync(BACKUP_DIR).forEach(file => {
      console.log(`   - ${file}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

exportAllData();
