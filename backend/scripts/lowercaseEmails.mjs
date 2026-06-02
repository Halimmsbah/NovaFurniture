import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import mongoose from 'mongoose'
import { userModel } from '../database/models/user.model.js'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/halim'
await mongoose.connect(uri)
const users = await userModel.find({})
let updated = 0
for (const u of users) {
  const lower = (u.email || '').toLowerCase()
  if (u.email !== lower) {
    try {
      await userModel.findByIdAndUpdate(u._id, { email: lower })
      updated++
      console.log(`Updated ${u._id} -> ${lower}`)
    } catch (err) {
      console.error(`Failed to update ${u._id}:`, err.message)
    }
  }
}
console.log(`Done. Updated ${updated} users.`)
await mongoose.disconnect()
