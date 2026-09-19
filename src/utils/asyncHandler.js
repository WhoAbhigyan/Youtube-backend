//try catch based async handler
// const asyncHandler=(fn)=> async (req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }catch(err){
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message,
//         })
//     }
// }

//Promise based async handler
// OUTER FUNCTION
//      ↓
// return middleware function
//      ↓
// ────────────────────
// LATER, REQUEST COMES
//      ↓
// middleware runs
//      ↓
// Promise.resolve(controller())
//      ↓
// catch errors
const asyncHandler=(requestHandler) => {
     return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=>next(err))
    }
}
export {asyncHandler}
