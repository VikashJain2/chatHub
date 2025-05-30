import multer from 'multer'
import path,{ dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, "uploads/avatars")

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        if(!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir,{recursive: true})
        }

        cb(null, uploadDir)
    },

    filename: (req,file, cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random * 1e9)
        cb(null, uniqueSuffix+path.extname(file.originalname))
    }
})

const upload = multer({
    storage,
})

export {upload}