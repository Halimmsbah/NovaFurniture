import { validation } from "../../middleware/validation.js";
import { addCoupon, deleteCoupon, getAllCoupon, getSingleCoupon, updateCoupon } from "./coupon.controller.js";
import express from 'express'
import { addCouponVal, paramsIdVal, updateCouponVal } from "./coupon.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";


const couponRouter=express.Router()//كدا الاتنين هيبقوا شايفين الاي دي اللي بينهم

couponRouter.use(protectedRoutes,allowedTo('admin'))
.route('/')
.post(validation(addCouponVal),addCoupon)//
.get(getAllCoupon)

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   get:
 *     summary: Get coupon by id
 *     tags: [Coupons]
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
 *         description: Coupon fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 *   put:
 *     summary: Update coupon by id
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               expires:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 *   delete:
 *     summary: Delete coupon by id
 *     tags: [Coupons]
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
 *         description: Coupon deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 */
couponRouter
.route('/:id') 
.get(validation(paramsIdVal),getSingleCoupon)
.put(validation(updateCouponVal),updateCoupon)
.delete(validation(paramsIdVal),deleteCoupon)

export default couponRouter