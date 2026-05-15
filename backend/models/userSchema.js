import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "user", "company"],
      default: "user",
    },
    resume: {
      type: String,
      default: "",
    },
    resumePublicId: {
      type: String,
      default: "",
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    savedInterviewQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewQuestion",
      },
    ],
    savedRoleQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoleQuestion",
      },
    ],
    profilePicture: {
      type: String,
      default: "",
    },
    profilePicturePublicId: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: String,
    verificationOTPExpiry: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
