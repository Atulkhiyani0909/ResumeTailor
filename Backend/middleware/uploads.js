import multer from 'multer';


const storage = multer.memoryStorage();

console.log('Error is here ');

export const uploadResume = multer({ storage: storage }).single('resume');