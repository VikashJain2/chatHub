import {v2 as cloudinary} from 'cloudinary';
import stream from 'stream';

const uploadToCloudinary = async(fileBuffer, folder = "chat_files",  resourceType = "auto") => {
    return new Promise((resolve, reject) =>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType
            },
            (error, result) => {
                if(error){
                    reject(error)
                }else{
                    resolve(result.secure_url)
                }
            }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);
        bufferStream.pipe(uploadStream)
    })
}
export {uploadToCloudinary}