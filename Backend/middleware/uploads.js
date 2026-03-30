import multer from 'multer';


const storage = multer.memoryStorage();



export const uploadResume = multer({ storage: storage }).single('resume');