import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import session from 'express-session'
import passport from './src/config/passport.js'

import authRoutes from './src/routes/auth.routes.js'
import exhibitionRoutes from './src/routes/exhibition.routes.js'
import submissionRoutes from './src/routes/submission.routes.js'
import adminRoutes from './src/routes/admin.routes.js'
import photoRoutes from './src/routes/photo.routes.js'
import userRoutes from './src/routes/user.routes.js'
import errorHandler from './src/middleware/errorHandler.js'

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 10 * 60 * 1000 },
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRoutes)
app.use('/api/exhibitions', exhibitionRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/photos', photoRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

export default app
