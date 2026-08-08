import {v2 as cloudinary} from "cloudinary"
import fs  from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath){
            throw new Error("File path is required")
        }
        //uploading file to cloudinary
          const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        //file has been uploaded successfully
        console.log("File has been uploaded successfully",
            response.url
        )
        return response
    }catch(error){
        fs.unlinkSync(localFilePath)//remove the locally saved temp file as the upload opearion got failed
        return null
    }finally{
        //remove the locally saved temp file as the upload opearion got completed
        if(localFilePath && fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath)
        }
    }
}
export {uploadOnCloudinary};
export default cloudinary;