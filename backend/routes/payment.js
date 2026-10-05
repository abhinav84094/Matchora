import express from "express";
import crypto from "crypto";
import { createOrder, PLANS } from "../services/razorpayService.js";
import User from "../models/User.js";
import PaymentOrder from "../models/PaymentOrder.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/payment/create-order
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate plan
    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const selectedPlan = PLANS[plan];

    // Create Razorpay order
    const order = await createOrder(selectedPlan.amount);

    // Save payment order in MongoDB
    const paymentOrder = await PaymentOrder.create({
      user: req.user._id,
      orderId: order.id,
      plan,
      amount: order.amount,
      currency: order.currency,
      status: "created",
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      paymentOrderId: paymentOrder._id,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (err) {
    console.error("Create payment order error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create payment order.",
    });
  }
});

// POST /api/payment/verify
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Validate payment details
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
    }

    // Find the order created by Matchora
    const paymentOrder = await PaymentOrder.findOne({
      orderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!paymentOrder) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found.",
      });
    }

    // Prevent duplicate payment processing
    if (paymentOrder.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been processed.",
      });
    }

    // Get plan from database
    const plan = paymentOrder.plan;

    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment plan.",
      });
    }

    // Verify Razorpay signature
    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      paymentOrder.status = "failed";
      await paymentOrder.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    // Calculate subscription expiry
    const duration = PLANS[plan].duration;

    const now = new Date();

    let expiresAt = new Date(now);

    // Extend existing active Pro subscription
    // instead of replacing the remaining time.
    if (
      req.user.plan === "pro" &&
      req.user.planExpiresAt &&
      new Date(req.user.planExpiresAt) > now
    ) {
      expiresAt = new Date(req.user.planExpiresAt);
    }

    expiresAt.setDate(expiresAt.getDate() + duration);

    // Update PaymentOrder
    paymentOrder.paymentId = razorpay_payment_id;
    paymentOrder.signature = razorpay_signature;
    paymentOrder.status = "paid";
    paymentOrder.paidAt = now;
    paymentOrder.expiresAt = expiresAt;

    await paymentOrder.save();

    // Update User subscription
    await User.findByIdAndUpdate(req.user._id, {
      plan: "pro",
      planExpiresAt: expiresAt,
    });

    res.json({
      success: true,
      message: "Pro plan activated successfully!",
      expiresAt,
    });
  } catch (err) {
    console.error("Payment verification error:", err);

    res.status(500).json({
      success: false,
      message: "Payment verification failed.",
    });
  }
});

// GET /api/payment/status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const isPro =
      req.user.plan === "pro" &&
      req.user.planExpiresAt &&
      new Date(req.user.planExpiresAt) > new Date();

    res.json({
      success: true,
      plan: req.user.plan,
      isPro,
      planExpiresAt: req.user.planExpiresAt,
    });
  } catch (err) {
    console.error("Payment status error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to get payment status.",
    });
  }
});

export default router;