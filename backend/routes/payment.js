import express from "express";
import crypto from "crypto";
import { razorpay, createOrder, PLANS } from "../services/razorpayService.js";
import User from "../models/User.js";
import  authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/payment/create-order
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const order = await createOrder(PLANS[plan].amount);

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
      plan,
      user: {
        name:  req.user.name,
        email: req.user.email,
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
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
      plan,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Calculate expiry
    const duration   = PLANS[plan].duration;
    const expiresAt  = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    // Update user plan
    await User.findByIdAndUpdate(req.user._id, {
      plan:          "pro",
      planExpiresAt: expiresAt,
    });

    res.json({
      success: true,
      message: "Pro plan activated successfully!",
      expiresAt,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/payment/status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const isPro = req.user.plan === "pro" && req.user.planExpiresAt > new Date();

    res.json({
      success:      true,
      plan:         req.user.plan,
      isPro,
      planExpiresAt:req.user.planExpiresAt,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;