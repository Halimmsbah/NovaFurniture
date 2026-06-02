import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { userModel } from '../database/models/user.model.js'

const email = 'Halimsbah2@gmail.com'
const password = 'Halim1143@'

async function main() {
  await mongoose.connect('mongodb://localhost:27017/halim')

  const hashed = bcrypt.hashSync(password, 8)
  const user = await userModel.findOneAndUpdate(
    { email },
    {
      name: 'Halim Admin',
      email,
      password: hashed,
      role: 'admin',
      isActive: true,
      isBlocked: false,
      confirmEmail: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )

  console.log(
    'ADMIN_READY',
    user._id.toString(),
    user.email,
    user.role,
    user.isActive,
    user.isBlocked,
    user.confirmEmail,
  )

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('UPSERT_ADMIN_FAILED', err.message)
  try {
    await mongoose.disconnect()
  } catch {}
  process.exit(1)
})
