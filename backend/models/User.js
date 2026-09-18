import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    picture: {
      type: String,
      default: "",
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
      },

      planExpiresAt: {
        type: Date,
        default: null,
      },

      razorpayCustomerId: {
        type: String,
        default: null,
      },

    preferences: {
      preferredRoles: [
        {
          type: String,
          trim: true,
        },
      ],

      preferredLocations: [
        {
          type: String,
          trim: true,
        },
      ],

      workMode: {
        type: String,
        enum: ["Remote", "Hybrid", "Onsite"],
        default: "Onsite",
      },

      minimumCTC: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);