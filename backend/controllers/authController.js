import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
} from "../utils/emailService.js";
import jwt from "jsonwebtoken";

// Register User API endpoints
export const registerUser = async (req, res) => {
  try {
    const { name, email, otp, password } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    role = userRole || "user";

    // generate 6 digit OTP and save to DB (for email verification)
    const verificationOTP = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      verificationOTP,
      verificationOTPExpiry: verificationOTPExpires,
      isVerified: false,
    });
    // send verification email with OTP (using nodemailer or any email service)
    try {
      await sendVerificationEmail(email, name, verificationOTP);
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
    await newUser.save();
    res.status(201).json({
      success: true,
      message:
        "User registered successfully, please verify your email with the OTP sent to your email address",
      newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User API endpoints
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, existUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (!existUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // GENERATE JSON TOKEN FOR AUTHENTICATION
    const token = jwt.sign({ userId: existUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      success: true,
      token,
      message: "User logged in successfully",
      user: existUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Email verification API endpoints
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
    const user = await User.findOne({
      email,
      verificationOTP: otp,
      verificationOTPExpiry: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// forgot password API endpoints
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    user.resetPasswordOTP = resetOTP;
    user.resetPasswordOTPExpiry = resetOTPExpires;
    await user.save();
    // send reset password email with OTP
    try {
      await sendForgotPasswordEmail(email, user.name, resetOTP);
    } catch (error) {
      console.error("Error sending reset password email:", error);
    }
    res.status(200).json({
      success: true,
      message: "Reset password OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// reset password API endpoints
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }
    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message:
        "Password reset successfully, Now you can login with your new password",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
