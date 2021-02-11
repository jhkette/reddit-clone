import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()


import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import subRoutes from './routes/subs'
import miscRoutes from './routes/misc'
import userRoutes from './routes/users'

import trim from './middleware/trim'



const app = express();
const PORT = process.env.PORT 

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())
// public directory for static files
app.use(express.static('public'))


app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN ,
    optionsSuccessStatus: 200,
  })
)
// use middleware trim
app.use(trim)

app.get("/", (_, res) => {
  res.send('Hello world')
});

// router for authentication routes ie login logout register etc
app.use('/api/auth', authRoutes)

// post routes
app.use('/api/posts', postRoutes)

// post routes
app.use('/api/subs', subRoutes)

// post routes
app.use('/api/misc', miscRoutes)

// user routes
app.use('/api/users', userRoutes)


app.listen(PORT, async () => {
  try {
    await createConnection();
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
});
