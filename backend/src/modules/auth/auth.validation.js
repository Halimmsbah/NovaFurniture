import Joi from 'joi'

export const signupVal = Joi.object({
	name: Joi.string().min(2).max(30).required(),
	email: Joi.string().email().required(),
	// optional phone: accept digits, optional leading +, 7-15 chars
	phone: Joi.string().pattern(/^\+?[0-9\s\-]{7,15}$/).optional(),
	password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/).required(),
	rePassword: Joi.valid(Joi.ref('password')).required(),
})

export const signinVal = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/).required(),
})

export const changePasswordVal = Joi.object({
	password: Joi.string().required(),
	newPassword: Joi.string().required(),
})

export const verifyEmailVal = Joi.object({
	email: Joi.string().email().required(),
	otp: Joi.string().pattern(/^\d{6}$/).required(),
})

export const resendVerificationVal = Joi.object({
	email: Joi.string().email().required(),
})


