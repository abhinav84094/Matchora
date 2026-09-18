import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Zap } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const FREE_FEATURES = [
  "5 job recommendations",
  "2 resume uploads",
  "Basic application tracker",
  "Skill gap analysis",
  "1 platform",
];

const PRO_FEATURES = [
  "Unlimited job recommendations",
  "Unlimited resume uploads",
  "Basic application tracker",
  "Skill gap analysis",
  "All platforms",
  "Study support for skill gaps",
  "Priority support",
];

export default function Pricing() {
  const [billing, setBilling]   = useState("monthly");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Step 1 — Create order
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ plan: billing }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Step 2 — Open Razorpay checkout
      const options = {
        key:      data.keyId,
        amount:   data.amount,
        currency: data.currency,
        name:     "Matchora",
        description: `Pro Plan - ${billing === "monthly" ? "Monthly" : "Yearly"}`,
        order_id: data.orderId,
        prefill: {
          name:  data.user.name,
          email: data.user.email,
        },
        theme: { color: "#7C3AED" },

        handler: async (response) => {
          // Step 3 — Verify payment
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method:      "POST",
            credentials: "include",
            headers:     { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan:                billing,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            window.location.href = "/recommendations?upgraded=true";
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">
          Simple, honest pricing
        </h1>
        <p className="text-neutral-500 text-sm">
          Upgrade to Pro and get matched to unlimited jobs
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billing === "monthly"
              ? "bg-violet-600 text-white"
              : "bg-white border border-neutral-200 text-neutral-600"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billing === "yearly"
              ? "bg-violet-600 text-white"
              : "bg-white border border-neutral-200 text-neutral-600"
          }`}
        >
          Yearly
          <span className="ml-2 text-xs bg-green-100 text-green-700 
                           px-2 py-0.5 rounded-full font-semibold">
            Save 43%
          </span>
        </button>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Free Plan */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <h2 className="text-lg font-bold text-neutral-800 mb-1">Free</h2>
          <p className="text-neutral-500 text-sm mb-6">
            Get started for free
          </p>
          <div className="mb-8">
            <span className="text-4xl font-bold text-neutral-900">₹0</span>
            <span className="text-neutral-400 text-sm ml-1">/ forever</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-neutral-600">
                <Check size={16} className="text-neutral-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full py-2.5 rounded-xl border border-neutral-200 
                       text-neutral-400 text-sm font-medium cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-violet-600 rounded-2xl p-8 text-white relative overflow-hidden">

          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500 
                          rounded-full -translate-y-20 translate-x-20 opacity-50" />

          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">Pro</h2>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 
                             rounded-full font-semibold flex items-center gap-1">
              <Zap size={10} /> Popular
            </span>
          </div>

          <p className="text-violet-200 text-sm mb-6">
            Everything you need to land your dream job
          </p>

          <div className="mb-8">
            <span className="text-4xl font-bold">
              {billing === "monthly" ? "₹59" : "₹399"}
            </span>
            <span className="text-violet-200 text-sm ml-1">
              / {billing === "monthly" ? "month" : "year"}
            </span>
            {billing === "yearly" && (
              <p className="text-violet-300 text-xs mt-1">
                ₹33/month — save ₹309/year
              </p>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-violet-100">
                <div className="w-4 h-4 rounded-full bg-white/20 
                                flex items-center justify-center shrink-0">
                  <Check size={10} className="text-white" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-violet-600 
                       text-sm font-bold hover:bg-violet-50 
                       transition-colors disabled:opacity-70
                       flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            {loading ? "Processing..." : `Upgrade to Pro`}
          </button>

          <p className="text-violet-300 text-xs text-center mt-3">
            Secure payment via Razorpay
          </p>

        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-xl mx-auto mt-16 text-center">
        <p className="text-neutral-500 text-sm">
          Questions? Mail us at{" "}
          <a href="mailto:support@matchora.com" 
             className="text-violet-600 hover:underline">
            abhinav84094@gmail.com
          </a>
        </p>
      </div>

    </main>
  );
}