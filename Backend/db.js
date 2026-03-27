import mongoose  from "mongoose";


export const Db_connect = async () =>{
    try {
         await mongoose.connect('mongodb+srv://atulkhiyani09_db_user:b7WcM0z4R9zd9yY4@cluster0.hvemgsy.mongodb.net/ResumeTailor?appName=Cluster0')
         console.log('Connected Successfully to DB');
        
        
    } catch (error) {
        console.log(error);
    }
}
