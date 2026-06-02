import { validation } from "../../middleware/validation.js";
import express from 'express'
import { addWishlistVal, paramsIdVal, updateWishlistVal } from "./wishlist.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import {addToWishlist, getLoggedUserWishlist, removeFromWishlist} from "./wishlist.controller.js" 

const wishlistRouter=express.Router()//كدا الاتنين هيبقوا شايفين الاي دي اللي بينهم

/**
 * @swagger
 * /api/v1/wishlist:
 *   patch:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product]
 *             properties:
 *               product:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to wishlist
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get logged user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *       401:
 *         description: Unauthorized
 */
wishlistRouter
.route('/')
.patch(protectedRoutes,allowedTo('user','admin'),validation(addWishlistVal),addToWishlist)//
.get(protectedRoutes,allowedTo('user','admin'),getLoggedUserWishlist)

/**
 * @swagger
 * /api/v1/wishlist/{id}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in wishlist
 */
wishlistRouter
.route('/:id') 
.delete(protectedRoutes,allowedTo('user','admin'),validation(paramsIdVal),removeFromWishlist)

export default wishlistRouter