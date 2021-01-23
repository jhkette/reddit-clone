import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

dotenv.config()


import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import subRoutes from './routes/subs'
import trim from './middleware/trim'


const app = express();
const PORT = process.env.PORT 
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())
// use middleware trim
app.use(trim)

app.get("/", (_, res) => {
  res.send('Hello world')
});

// router for authentication routes ie login logout register etc
app.use('/api/auth', authRoutes)

// post routes
app.use('/api/post', postRoutes)

// post routes
app.use('/api/subs', subRoutes)


app.listen(PORT, async () => {
  try {
    await createConnection();
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
});
