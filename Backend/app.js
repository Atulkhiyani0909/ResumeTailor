import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Db_connect } from './db.js'


const app = express();
Db_connect();

app.use(express.urlencoded({extended:true}))
app.use(cors("*"))

import jobsRouters from './routers/job.routers.js'

app.use('/api/jobs',jobsRouters)

app.listen(3000,()=>{
    console.log('app is running on port 3000');
})