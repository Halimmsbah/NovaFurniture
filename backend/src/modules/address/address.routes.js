import { validation } from "../../middleware/validation.js";
import express from 'express'
import { addAddressVal, paramsIdVal, updateAddressVal } from "./address.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import {addToAddress, getLoggedUserAddress, removeFromAddress } from "./address.controller.js" 

const addressRouter=express.Router()//كدا الاتنين هيبقوا شايفين الاي دي اللي بينهم

/**
 * @swagger
 * /api/v1/addresses:
 *   patch:
 *     summary: Add an address to logged user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, city, phone]
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address added successfully
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get logged user addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses fetched successfully
 *       401:
 *         description: Unauthorized
 */
addressRouter
.route('/')
.patch(protectedRoutes,allowedTo('user'),validation(addAddressVal),addToAddress)//
.get(protectedRoutes,allowedTo('user'),getLoggedUserAddress)

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete address from logged user
 *     tags: [Addresses]
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
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
addressRouter 
.route('/:id') 
.delete(protectedRoutes,allowedTo('user','admin'),validation(paramsIdVal),removeFromAddress)

export default addressRouter