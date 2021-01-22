import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import cookieParser from 'cookie-parser'


import authRoutes from './routes/auth'
import trim from './middleware/trim'


const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())
// use middleware trim
app.use(trim)

app.get("/", (_, res) => {
  res.send('Hello world')
});

app.use('/api/auth', authRoutes)


app.listen(5000, async () => {
  try {
    await createConnection();
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
});
