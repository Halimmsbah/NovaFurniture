import { catchAsyncError } from "../../middleware/catchError.js"
import { cartModel } from "../../../database/models/cart.model.js"
import {productModel} from '../../../database/models/product.model.js'
import { couponModel } from '../../../database/models/coupon.model.js'
import { AppError } from "../../utils/AppError.js"

const calcTotalPrice =(cart)=>{
    let totalPrice=0
    cart.cartItems.forEach((item)=>{
        totalPrice += item.quantity * item.price
    })
    cart.totalPrice=totalPrice

    if(cart.discount){
        let totalPriceAfterDiscount = cart.totalPrice - (cart.totalPrice * cart.discount)/100
        cart.totalPriceAfterDiscount=totalPriceAfterDiscount
    }
}

const populateCartProducts = (cart) => cart?.populate('cartItems.product')

const addToCart=catchAsyncError(async(req,res,next)=>{
    let product = await productModel.findById(req.body.product)
    if(!product) return next(new AppError('product not found',404))
    if(req.body.quantity>product.quantity) return next(new AppError('sold out',404))
    req.body.price=product.price

    // req.body.totalPrice=(product.price*req.body.quantity)
    let existCart=await cartModel.findOne({user:req.user._id})//check if he had cart 
    if(!existCart){
        let cart =await cartModel({
            user:req.user._id,
            cartItems:[req.body]
        })
        calcTotalPrice(cart)
        await cart.save()
        await populateCartProducts(cart)
        !cart && res.status(404).json({message:'cart not found'})
        cart && res.json({message:"success",cart})
    } else {

        let item= existCart.cartItems.find((item)=>item.product==req.body.product)
        if(item) {
            if(item.quantity>=req.body.quantity)return next(new AppError('sold out',404))
            item.quantity+=req.body.quantity  || 1            
        }
        else existCart.cartItems.push(req.body)
        calcTotalPrice(existCart)
        await existCart.save()
        await populateCartProducts(existCart)

        res.json({message:"added to cart",cart:existCart})
    }
})

const removeItemFromCart=catchAsyncError(async(req,res,next)=>{
    let cart =await cartModel.findOne({user:req.user._id})
    if(!cart) return next(new AppError('cart not found',404))
    const beforeCount = cart.cartItems.length
    cart.cartItems = cart.cartItems.filter((item) => String(item._id) !== String(req.params.id) && String(item.product) !== String(req.params.id))
    if (cart.cartItems.length === beforeCount) return next(new AppError('item not found',404))
    calcTotalPrice(cart)
        await cart.save()
    await populateCartProducts(cart)
    cart && res.json({message:"success",cart})
    //pop => remove last element
    //pull => remove on e you select from array
})

const updateQTY=catchAsyncError(async(req,res,next)=>{
    let cart =await cartModel.findOne({user:req.user._id})
    if(!cart) return next(new AppError('cart not found',404))
    let item= cart.cartItems.find((item)=>String(item._id)===String(req.params.id) || String(item.product)===String(req.params.id))
    if(!item)  return next(new AppError('item not found',404))
    item.quantity=req.body.quantity            
    calcTotalPrice(cart)
    await cart.save()
    await populateCartProducts(cart)
    cart && res.json({message:"success",cart})
    //pop => remove last element
    //pull => remove on e you select from array
})

const getLoggedUserCart=catchAsyncError(async(req,res,next)=>{
    let cart =await cartModel.findOne({user:req.user._id}).populate('cartItems.product')
    !cart && res.status(404).json({message:'cart not found'})
    cart && res.json({message:"success",cart})
})

const clearUserCart=catchAsyncError(async(req,res,next)=>{
    let cart =await cartModel.findOneAndDelete({user:req.user._id})
    !cart && res.status(404).json({message:'cart not found'})
    cart && res.json({message:"success",cart})
})

const applyCoupon=catchAsyncError(async(req,res,next)=>{
    let coupon= await couponModel.findOne({code:req.body.code || req.body.coupon,expires:{$gte:Date.now()}})
    if(!coupon)  return next(new AppError('coupon invalid',401))
    let cart =await cartModel.findOne({user:req.user._id})
    if(!cart)  return next(new AppError('cart not found',404))
    cart.discount=coupon.discount
    calcTotalPrice(cart)
await cart.save()
await populateCartProducts(cart)
res.json({message:"success",cart})

})

export {
    addToCart,
    removeItemFromCart,
    updateQTY,
    getLoggedUserCart,
    clearUserCart,
    applyCoupon
}