import { v2 as cloudinary } from "cloudinary";

const uploadToCloudinary = async (filePath, folder = "chatHub", resourceType = "auto", accessMode) => {
    console.log("resource_type =>", resourceType)
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: resourceType,
        type: "upload",
        access_mode: accessMode || "public",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
};

export { uploadToCloudinary };
