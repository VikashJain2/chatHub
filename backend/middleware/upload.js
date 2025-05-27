import multer from 'multer'
import path from 'path'
import fs from 'fs'

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