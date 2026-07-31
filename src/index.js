import mongoose from 'mongoose';
import {DB_NAME} from './constants.js';
import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
});
connectDB();








// import express from 'express';
// const app=express();
// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         app.on("error", (err) => {
//             console.log("ERR",err);
//             process.exit(1);
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     }
//     catch(err){
//         console.log("ERR",err);
//         process.exit(1);
//     }
// })