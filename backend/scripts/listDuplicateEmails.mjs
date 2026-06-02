import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import mongoose from 'mongoose'
import { userModel } from '../database/models/user.model.js'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/halim'
await mongoose.connect(uri)

const pipeline = [
  { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 }, ids: { $push: '$_id' }, docs: { $push: '$$ROOT' } } },
  { $match: { count: { $gt: 1 } } },
  { $project: { email: '$_id', count: 1, ids: 1, docs: { name: 1, email: 1, role: 1, createdAt: 1 } } },
]

const dupes = await userModel.aggregate(pipeline)
if (!dupes.length) {
  console.log('No duplicate emails found (case-insensitive).')
} else {
  console.log(`Found ${dupes.length} duplicate email groups:`)
  for (const d of dupes) {
    console.log('---')
    console.log(`email: ${d.email}  count: ${d.count}`)
    for (const doc of d.docs) console.log(JSON.stringify(doc))
  }
}

await mongoose.disconnect()
