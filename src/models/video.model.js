import mongoose ,{Schema}from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new Schema(
    {
        videoFile:{
            url:{
                type:String,
                required:true
            },
            public_id:{
                type:String,
                required:true
            }
        },
        thumbnail:{
            url:{type:String,//cloudinary url
            required:[true,"Thumbnail is required"]
            },
            public_id:{
                type:String,
                required:true
            }
        },
        title:{
            type:String,
            required:[true,"Title is required"],
            index:true
        },
        description:{
            type:String,
            trim:true,
        },
        duration:{
            type:Number,//cloudinary video
            required:true,
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },
    {
        timestamps:true
    }   
)
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema)
// export default Video