import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Replace with your MongoDB Atlas connection string
const ATLAS_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.mongodb.net/nova?retryWrites=true&w=majority';
const BACKUP_DIR = './backup';
const DB_NAME = 'nova';

async function importAllData() {
  const client = new MongoClient(ATLAS_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    
    // Get all backup files
    const backupFiles = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
    console.log(`\n📦 Found ${backupFiles.length} backup files\n`);
    
    let totalDocuments = 0;
    
    // Import each collection
    for (const file of backupFiles) {
      const collectionName = path.basename(file, '.json');
      const filePath = path.join(BACKUP_DIR, file);
      
      // Read JSON data
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.length > 0) {
        // Drop collection if exists
        try {
          await db.collection(collectionName).drop();
          console.log(`🗑️  Dropped existing ${collectionName}`);
        } catch (e) {
          // Collection doesn't exist yet, that's fine
        }
        
        // Insert documents
        const result = await db.collection(collectionName).insertMany(data);
        console.log(`✅ Imported ${collectionName}: ${result.insertedCount} documents`);
        totalDocuments += result.insertedCount;
      } else {
        console.log(`⏭️  Skipped ${collectionName}: no data`);
      }
    }
    
    console.log(`\n🎉 IMPORT COMPLETE!`);
    console.log(`📊 Total Documents Imported: ${totalDocuments}`);
    console.log(`\n✅ Your data is now in MongoDB Atlas!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('   1. MONGODB_URI environment variable is set');
    console.error('   2. Your connection string is correct');
    console.error('   3. MongoDB Atlas cluster is accessible\n');
  } finally {
    await client.close();
    process.exit(0);
  }
}

importAllData();
