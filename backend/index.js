import express from 'express'
import { dbConnection } from './database/dbConnection.js'
import { bootstrap } from './src/modules/index.routes.js'
import dotenv from "dotenv"
import cors from 'cors'
import morgan from 'morgan'


dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 3000
const baseURL = process.env.baseURL || process.env.BASE_URL || `http://localhost:${port}/`

process.env.baseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(morgan('dev'))

bootstrap(app)
dbConnection()

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`)
  console.log(`Frontend API base URL should be http://localhost:${port}/api/v1`)
})
