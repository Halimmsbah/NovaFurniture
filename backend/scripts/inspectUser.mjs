import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import mongoose from 'mongoose'
import { userModel } from '../database/models/user.model.js'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/halim'
await mongoose.connect(uri)
const email = process.argv[2] || 'halimsbah2@gmail.com'
const u = await userModel.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}$`, 'i') })
console.log(JSON.stringify(u, null, 2))
await mongoose.disconnect()
