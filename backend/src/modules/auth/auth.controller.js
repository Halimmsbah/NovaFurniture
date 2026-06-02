import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import { catchAsyncError } from "../../middleware/catchError.js";
import { userModel } from "../../../database/models/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { sendVerificationEmail } from "../../services/email/sendEmail.js";

const createVerificationCode = () => String(randomInt(100000, 1000000));

const issueAuthToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_KEY);

export const signup = catchAsyncError(async (req, res, next) => {
  const verificationCode = createVerificationCode();
  const verificationCodeHash = bcrypt.hashSync(verificationCode, 8);

  let user = new userModel({
    ...req.body,
    confirmEmail: false,
    emailVerificationCode: verificationCodeHash,
    emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await user.save();

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      otp: verificationCode,
    });
  } catch (error) {
    await userModel.findByIdAndDelete(user._id);
    return next(error);
  }

  return res.status(201).json({
    message: "Verification code sent",
    email: user.email,
  });
});

export const signin = catchAsyncError(async (req, res, next) => {
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const emailRegex = new RegExp(`^${escapeRegex(req.body.email)}$`, "i");
  let user = await userModel.findOne({ email: emailRegex });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    if (!user.confirmEmail) {
      return next(new AppError("Please verify your email first", 403));
    }
    let token = issueAuthToken(user);
    const safeUser = { _id: user._id, email: user.email, role: user.role };
    return res.json({ message: "Signed in successfully", token, user: safeUser });
  }
  return next(new AppError("Invalid credentials", 401));
});

export const verifyEmail = catchAsyncError(async (req, res, next) => {
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const emailRegex = new RegExp(`^${escapeRegex(req.body.email)}$`, "i");
  const user = await userModel.findOne({ email: emailRegex });

  if (!user) return next(new AppError("user not found", 404));
  if (user.confirmEmail) {
    const token = issueAuthToken(user);
    const safeUser = { _id: user._id, email: user.email, role: user.role };
    return res.json({ message: "Email already verified", token, user: safeUser });
  }

  if (!user.emailVerificationCode || !user.emailVerificationExpiresAt) {
    return next(new AppError("Verification code expired. Please request a new one.", 400));
  }

  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    return next(new AppError("Verification code expired. Please request a new one.", 400));
  }

  const isValid = bcrypt.compareSync(req.body.otp, user.emailVerificationCode);
  if (!isValid) return next(new AppError("Invalid verification code", 400));

  user.confirmEmail = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.emailVerifiedAt = new Date();
  await user.save();

  const token = issueAuthToken(user);
  const safeUser = { _id: user._id, email: user.email, role: user.role };
  return res.json({ message: "Email verified successfully", token, user: safeUser });
});

export const resendVerificationCode = catchAsyncError(async (req, res, next) => {
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const emailRegex = new RegExp(`^${escapeRegex(req.body.email)}$`, "i");
  const user = await userModel.findOne({ email: emailRegex });

  if (!user) return next(new AppError("user not found", 404));
  if (user.confirmEmail) return next(new AppError("Email already verified", 400));

  const verificationCode = createVerificationCode();
  user.emailVerificationCode = bcrypt.hashSync(verificationCode, 8);
  user.emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    otp: verificationCode,
  });

  return res.json({ message: "Verification code resent" });
});

export const protectedRoutes = catchAsyncError(async (req, res, next) => {
  let { token } = req.headers;

  //1- token exist or not
  if (!token) return next(new AppError("token not exist", 401));

  //2- verify token
  let decoded = jwt.verify(token, process.env.JWT_KEY);
  console.log(decoded);

  //3-userId -> exist or not
  let user = await userModel.findById(decoded.userId);
  if (!user) return next(new AppError("user not found", 401));

  if (user.passwordChanghedAt) {
    let time = parseInt(user?.passwordChanghedAt.getTime() / 1000);
    console.log(time + "|" + decoded.iat);
    if (time > decoded.iat)
      return next(new AppError("invaild token...login again", 404));
  }
  req.user = user;
  next();
});

export const IsAdmin = catchAsyncError(async (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else next(new AppError("you are not authorized as admin", 401));
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findById(req.user._id);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    await userModel.findByIdAndUpdate(req.user._id, {
      password: req.body.newPassword,
      passwordChanghedAt: Date.now(),
    });

    let token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_KEY,
    );

    const safeUser = { _id: user._id, email: user.email, role: user.role };
    return res.json({ message: "Password changed successfully", token, user: safeUser });
  }
  return next(new AppError("Invalid credentials", 401));
});

export const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("you are not authorized", 401));
    next();
  });
};
