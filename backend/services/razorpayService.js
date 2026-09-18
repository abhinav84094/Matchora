import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PLANS = {
  monthly: { amount: process.env.PRO_monthly_rate,  duration: 30,  label: "Monthly" },
  yearly:  { amount: process.env.PRO_yearly_rate, duration: 365, label: "Yearly"  },
};

// Create order
export const createOrder = async (amount, currency = "INR") => {
  const order = await razorpay.orders.create({
    amount:   amount * 100,  // ← Razorpay needs paise
    currency,
    receipt:  `receipt_${Date.now()}`,
  });
  return order;
};