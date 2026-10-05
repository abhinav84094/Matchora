import mongoose from "mongoose";

const paymentOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    paymentId: {
      type: String,
      default: null,
      index: true,
    },

    signature: {
      type: String,
      default: null,
    },

    plan: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentOrder = mongoose.model("PaymentOrder", paymentOrderSchema);

export default PaymentOrder;