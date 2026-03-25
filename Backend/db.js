import mongoose  from "mongoose";


export const Db_connect = async () =>{
    try {
         await mongoose.connect('')
         console.log('Connected Successfully to DB');
        
        
    } catch (error) {
        console.log(error);
    }
}
