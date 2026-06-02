# Data Migration Guide: Local MongoDB → MongoDB Atlas

Your data has been **exported and backed up** in `backend/backup/`.

## 📊 What Was Backed Up

```
✅ Users: 49 accounts
✅ Products: 20 items  
✅ Orders: 5 orders
✅ Carts: 6 carts
✅ Brands: 5 brands
✅ Categories: 7 categories
✅ Subcategories: 20 subcategories
✅ Coupons: 2 coupons
```

**Total: 114 documents**

---

## 🚀 How to Restore Your Data to MongoDB Atlas

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free M0 tier)
3. Create cluster
4. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nova`

### Step 2: Set Environment Variable
```bash
# Set the MongoDB Atlas connection string
# On Windows PowerShell:
$env:MONGODB_URI = "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nova?retryWrites=true&w=majority"

# On Mac/Linux:
export MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nova?retryWrites=true&w=majority"
```

### Step 3: Run Import Script
```bash
cd backend
node import-data.mjs
```

Expected output:
```
✅ Connected to MongoDB Atlas
✅ Imported users: 49 documents
✅ Imported products: 20 documents
✅ Imported orders: 5 documents
... and so on
🎉 IMPORT COMPLETE!
```

---

## 📁 Backup Files Location
```
backend/backup/
├── users.json (49 documents)
├── products.json (20 documents)
├── orders.json (5 documents)
├── carts.json (6 documents)
├── brands.json (5 documents)
├── categories.json (7 documents)
├── subcategories.json (20 documents)
├── coupons.json (2 documents)
└── reviews.json (0 documents)
```

---

## ✅ Verification Steps

After import, verify data in MongoDB Atlas:

1. Go to MongoDB Atlas Dashboard
2. Click **"Browse Collections"**
3. Check each collection has correct document count:
   - users: 49 ✓
   - products: 20 ✓
   - orders: 5 ✓
   - carts: 6 ✓
   - brands: 5 ✓
   - categories: 7 ✓
   - subcategories: 20 ✓
   - coupons: 2 ✓

---

## 🔄 Timeline

```
TODAY:
1. ✅ Export local data → backend/backup/

WHEN READY TO DEPLOY:
2. Create MongoDB Atlas account
3. Copy connection string
4. Run: node import-data.mjs
5. Verify data in Atlas
6. Deploy backend & frontend
```

---

## 🆘 Troubleshooting

### Import fails with "Connection refused"
- Check MongoDB Atlas cluster is running
- Verify connection string is correct
- Whitelist your IP in Atlas Security settings

### Import fails with "Permission denied"
- Verify user has admin privileges in Atlas
- Check password has no special characters (or encode them)

### Some collections not imported
- They may be empty (like reviews)
- Check backup files exist in backend/backup/

---

## 📌 Important Notes

- Backup files are **safe** and won't be deleted
- You can import multiple times (collections are replaced)
- Keep backup files as safety copy
- Git ignores backup folder (won't be uploaded to GitHub)

---

**Ready? → Create MongoDB Atlas account when you're ready to deploy!**
