import express,{Request, Response, NextFunction} from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose';

import userRouter from './router/userRouter'
import imageRouter from './router/ImageRouter'



const app = express()
dotenv.config()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

app.use(bodyParser.json())
app.use((req: Request, res:Response, next:NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true")
  next()
})

app.use('/user', userRouter)
app.use('/api', imageRouter)

const connect = () => {
  const mongoUrl = process.env.MONGODB_URL;
  if(!mongoUrl){
    console.error("MONGODB_URL environment variable is not defined")
    process.exit(1);
  }
  mongoose.connect(mongoUrl)
    .then(()=>{
      console.log("Connected to MongoDB...")
    })
    .catch((err)=>{
      console.error("Error connecting to MongoDB", err)
    })
}


app.listen(process.env.PORT || 5000, () => {
  connect();
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
})
