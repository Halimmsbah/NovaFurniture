import  express  from 'express'
import { validation } from '../../middleware/validation.js'
import { changePasswordVal, resendVerificationVal, signinVal, signupVal, verifyEmailVal } from './auth.validation.js'
import { changePassword, protectedRoutes, resendVerificationCode, signin, signup, verifyEmail } from './auth.controller.js'
import { checkEmail } from '../../middleware/emailExist.js'
import { rateLimit } from '../../middleware/rateLimit.js'

const authRouter = express.Router()

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/signup', rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many signup attempts. Please try again later.' }), validation(signupVal),checkEmail,signup,)

authRouter.post('/verify-email', rateLimit({ windowMs: 10 * 60 * 1000, max: 10, message: 'Too many verification attempts. Please try again later.' }), validation(verifyEmailVal), verifyEmail)

authRouter.post('/resend-verification', rateLimit({ windowMs: 10 * 60 * 1000, max: 3, message: 'Too many resend attempts. Please try again later.' }), validation(resendVerificationVal), resendVerificationCode)

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/signin', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts. Please try again later.' }), validation(signinVal), signin)

/**
 * @swagger
 * /api/v1/auth/changePassword:
 *   patch:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token or old password
 */
authRouter.patch('/changePassword/',protectedRoutes, validation(changePasswordVal), changePassword)

export default authRouter
