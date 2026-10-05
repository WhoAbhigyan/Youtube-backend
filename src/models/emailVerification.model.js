import mongoose,{Schema} from 'mongoose'

const emailVerificationSchema=new Schema(
    {
        email:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
            unique:true
        },
        otpHash:{
            type:String,
            required:true
        },
        expiresAt:{
            type:Date,
            required:true
        },
        isVerified:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
)

export const EmailVerification=mongoose.model("EmailVerification",emailVerificationSchema);