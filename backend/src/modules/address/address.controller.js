import { catchAsyncError } from "../../middleware/catchError.js"
import { userModel } from "../../../database/models/user.model.js"


const addToAddress=catchAsyncError(async(req,res,next)=>{
    let user=await userModel.findByIdAndUpdate(req.user._id,{$addToSet:{addresses:req.body}},{new:true})
    if(!user) return res.status(404).json({message:'address not found'})
    const addressArray = user.addresses || []
    return res.json({message:"success",address:addressArray})
})

const removeFromAddress=catchAsyncError(async(req,res,next)=>{
    let user=await userModel.findByIdAndUpdate(req.user._id,{$pull:{addresses:{_id:req.params.id}}},{new:true})
    if(!user) return res.status(404).json({message:'address not found'})
    const addressArray = user.addresses || []
    return res.json({message:"success",address:addressArray})
    //pop => remove last element
    //pull => remove one you select from array
})

const getLoggedUserAddress=catchAsyncError(async(req,res,next)=>{
    let user = await userModel.findById(req.user._id)
    const addressArray = (user && user.addresses) ? user.addresses : []
    return res.json({message:"success",address:addressArray})
})

export {
    addToAddress,
    removeFromAddress,
    getLoggedUserAddress
}