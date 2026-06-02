import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import mongoose from 'mongoose'
import { userModel } from '../database/models/user.model.js'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/halim'
await mongoose.connect(uri)

console.log('Scanning for duplicate emails (case-insensitive)...')
const pipeline = [
  { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 }, ids: { $push: '$_id' }, docs: { $push: '$$ROOT' } } },
  { $match: { count: { $gt: 1 } } },
]

const dupes = await userModel.aggregate(pipeline)
if (!dupes.length) {
  console.log('No duplicates found.')
  await mongoose.disconnect()
  process.exit(0)
}

for (const group of dupes) {
  const email = group._id
  console.log(`Found duplicate group for: ${email} (count=${group.count})`)
  const docs = group.docs
  // sort by createdAt ascending, keep the first
  docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const keep = docs[0]
  const remove = docs.slice(1)
  console.log(`Keeping ${keep._id} (${keep.email}, createdAt=${keep.createdAt})`)
  for (const r of remove) {
    try {
      await userModel.findByIdAndDelete(r._id)
      console.log(`Deleted duplicate ${r._id} (${r.email}, createdAt=${r.createdAt})`)
    } catch (err) {
      console.error(`Failed to delete ${r._id}:`, err.message)
    }
  }
}

console.log('Duplicate removal complete.')
await mongoose.disconnect()
