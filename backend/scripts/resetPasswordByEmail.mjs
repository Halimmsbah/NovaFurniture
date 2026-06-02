import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import mongoose from 'mongoose'
import { userModel } from '../database/models/user.model.js'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/halim'
await mongoose.connect(uri)
const email = process.argv[2]
const newPassword = process.argv[3] || 'Password123'
if (!email) {
  console.error('Usage: node resetPasswordByEmail.mjs <email> [newPassword]')
  process.exit(1)
}

const user = await userModel.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}$`, 'i') })
if (!user) {
  console.error('User not found for', email)
  await mongoose.disconnect()
  process.exit(2)
}

await userModel.findByIdAndUpdate(user._id, { password: newPassword })
console.log(`Password for ${user.email} (id=${user._id}) reset to '${newPassword}'`)
await mongoose.disconnect()
