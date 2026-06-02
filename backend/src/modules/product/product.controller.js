import { productModel } from "../../../database/models/product.model.js"
import slugify from 'slugify'
import { catchAsyncError } from "../../middleware/catchError.js"
import { ApiFeatures } from "../../utils/apiFeatures.js"
import { invalidateCache } from "../../middleware/responseCache.js"

const addProduct=catchAsyncError(async(req,res,next)=>{
    req.body.slug=slugify(req.body.title)//عشان اللي تتضاف تاخد سلاج

    if (req.body.stock !== undefined && req.body.quantity === undefined) req.body.quantity = req.body.stock

    if(req.files?.imgCover?.[0]) req.body.imgCover=req.files.imgCover[0].filename//عشان الصوره اللي تتضاف تاخد اي دي للصوره
    
    if(req.files?.images?.length) req.body.images=req.files.images.map((img)=>img.filename)

    let product=new productModel(req.body)
    console.log(product)
    await product.save()
    const savedProduct = await productModel.findById(product._id)
    invalidateCache(['/api/v1/products'])
    res.json({message:"success",product:savedProduct ?? product})
})

const getAllProduct=catchAsyncError(async(req,res,next)=>{

    // default sort by order desc, then createdAt if not specified
    if(!req.query.sort) req.query.sort = '-order,createdAt'
    let apiFeatures = new ApiFeatures(productModel.find(),req.query).fields().search().sort().pagination().filter()
    let product = await apiFeatures.mongooseQuery
    res.json({message:"success",page:apiFeatures.pageNumber,product})
})

const getSingleProduct=catchAsyncError(async(req,res,next)=>{
    let product=await productModel.findById(req.params.id)
    !product && res.status(404).json({message:'product not found'})
    product && res.json({message:"success",product})
})

const updateProduct=catchAsyncError(async(req,res,next)=>{

    if(req.body.title) req.body.slug=slugify(req.body.title)//عشان لو عمل ابديت للصوره بس ميديش ايرور
    if (req.body.stock !== undefined && req.body.quantity === undefined) req.body.quantity = req.body.stock
    if (req.body.subCategory && !req.body.subcategory) req.body.subcategory = req.body.subCategory

    if(req.files?.imgCover?.length) req.body.imgCover=req.files.imgCover[0].filename//عشان الصوره اللي تتضاف تاخد اي دي للصوره
    if(req.files?.images?.length) req.body.images=req.files.images.map((img)=>img.filename)

    
    let product=await productModel.findByIdAndUpdate(req.params.id,req.body,{new:true})
    !product && res.status(404).json({message:'product not found'})
    const updatedProduct = product ? await productModel.findById(product._id) : null
    invalidateCache(['/api/v1/products'])
    updatedProduct && res.json({message:"success",product:updatedProduct})
})

const deleteProduct=catchAsyncError(async(req,res,next)=>{
    const product=await productModel.findByIdAndDelete(req.params.id)
    !product && res.status(404).json({message:'product not found'})
    if(product){
        invalidateCache(['/api/v1/products'])
        res.json({message:'success',product})
    }
})

const reorderProducts=catchAsyncError(async(req,res,next)=>{
    // expect body.ids = [id1, id2, ...] in new desired order (first = highest priority)
    const ids = req.body.ids
    if(!Array.isArray(ids)) return res.status(400).json({message:'ids array required'})
    const ops = ids.map((id, idx)=>({
        updateOne:{
            filter:{_id:id},
            update:{ $set: { order: ids.length - idx } }
        }
    }))
    if(ops.length) await productModel.bulkWrite(ops)
    res.json({message:'reordered'})
})

export {
    addProduct,getAllProduct,getSingleProduct,updateProduct,deleteProduct,reorderProducts
}