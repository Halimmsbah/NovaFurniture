import { validation } from "../../middleware/validation.js";
import { addReview, deleteReview, getAllReview, getSingleReview, updateReview } from "./review.controller.js";
import express from 'express'
import { addReviewVal, paramsIdVal, updateReviewVal } from "./review.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";


const reviewRouter=express.Router()//كدا الاتنين هيبقوا شايفين الاي دي اللي بينهم

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create review for a product
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, rate, product]
 *             properties:
 *               text:
 *                 type: string
 *               rate:
 *                 type: number
 *               product:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review created successfully
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 */
reviewRouter
.route('/')
.post(protectedRoutes,allowedTo('user'),validation(addReviewVal),addReview)//
.get(getAllReview)

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: Get review by id
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review fetched successfully
 *       404:
 *         description: Review not found
 *   put:
 *     summary: Update review by id
 *     tags: [Reviews]
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
 *               text:
 *                 type: string
 *               rate:
 *                 type: number
 *               product:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *   delete:
 *     summary: Delete review by id
 *     tags: [Reviews]
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
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
reviewRouter
.route('/:id') 
.get(validation(paramsIdVal),getSingleReview)
.put(protectedRoutes,allowedTo('user'),validation(updateReviewVal),updateReview)
.delete(protectedRoutes,allowedTo('user','admin'),validation(paramsIdVal),deleteReview)

export default reviewRouter