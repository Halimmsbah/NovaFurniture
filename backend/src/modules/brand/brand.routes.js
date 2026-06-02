import { validation } from "../../middleware/validation.js";
import { addBrand, deleteBrand, getAllBrand, getSingleBrand, updateBrand } from "./brand.controller.js";
import express from 'express'
import { addBrandVal, paramsIdVal, updateBrandVal } from "./brand.validation.js";
import { uploadSingleFile } from "../../services/fileUpload/fileUpload.js";
import { protectedRoutes } from "../auth/auth.controller.js";

const brandRouter=express.Router()

/**
 * @swagger
 * /api/v1/brands:
 *   post:
 *     summary: Create a brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, logo]
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Brand created successfully
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Brands fetched successfully
 */
brandRouter

.route('/')
.post(protectedRoutes,uploadSingleFile('logo'),validation(addBrandVal),addBrand)//
.get(getAllBrand)

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Get brand by id
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand fetched successfully
 *       404:
 *         description: Brand not found
 *   put:
 *     summary: Update brand by id
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Brand not found
 *   delete:
 *     summary: Delete brand by id
 *     tags: [Brands]
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
 *         description: Brand deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Brand not found
 */
brandRouter

.route('/:id')
.get(validation(paramsIdVal),getSingleBrand)
.put(protectedRoutes,uploadSingleFile('logo'),validation(updateBrandVal),updateBrand)
.delete(protectedRoutes,validation(paramsIdVal),deleteBrand)

export default brandRouter
