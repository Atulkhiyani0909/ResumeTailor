import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Db_connect } from './db.js'
import { v2 as cloudinary } from 'cloudinary';

const app = express();
Db_connect();

app.use(express.urlencoded({extended:true}))
app.use(cors("*"))
app.use(express.json())



import jobsRouters from './routers/job.routers.js'
import atsRoutes from './routers/ats.route.js'

app.use('/api/jobs',jobsRouters);
app.use('/api/ats', atsRoutes);

app.listen(3000,()=>{
    console.log('app is running on port 3000');
})