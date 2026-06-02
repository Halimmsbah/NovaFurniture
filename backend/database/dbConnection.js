import mongoose from "mongoose"

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/halim'

export const dbConnection = () => {
    const mongoUri = process.env.MONGODB_URI || process.env.DB_STRING || DEFAULT_MONGODB_URI

    mongoose.connect(mongoUri)
    .then(() => console.log("db is connected successfully"))
    .catch((err) => console.log('db failed', err))
}
