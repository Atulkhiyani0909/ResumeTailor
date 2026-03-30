import express from 'express'
import cors from 'cors'
import 'dotenv/config';
import { Db_connect } from './db.js'
import { v2 as cloudinary } from 'cloudinary';

const app = express();
Db_connect();

app.use(express.urlencoded({extended:true}))
app.use(cors("*"))
app.use(express.json())



import jobsRouters from './routers/job.routers.js'
import atsRoutes from './routers/ats.route.js'
import jdRoutes from './routers/jdmatch.routes.js'
import userRoutes from './routers/user.route.js'
import emailRoutes from './routers/email.router.js'

app.use('/api/jobs',jobsRouters);
app.use('/api/ats', atsRoutes);
app.use('/api/jd-matcher', jdRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email',emailRoutes);

app.listen(3000,()=>{
    console.log('app is running on port 3000');
})