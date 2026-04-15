const Stripe = require("stripe");
const createHttpError = require("http-errors");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ change this once, reuse everywhere
const FRONTEND_URL = "http://localhost:5173";

const createCheckoutSession = async (req, res, next) => {
  try {
    const { amount, description, customer } = req.body;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return next(createHttpError(400, "Invalid payment amount!"));
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return next(createHttpError(500, "Missing Stripe secret key!"));
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "php", // ✅ you can keep PHP
            product_data: {
              name: "Restaurant Order",
              description: description || "Restaurant POS Order",
            },
            unit_amount: Math.round(numericAmount * 100),
          },
          quantity: 1,
        },
      ],

      customer_email: customer?.email || undefined,

      // ✅ FIXED URLS
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/menu`,

      metadata: {
        customerName: customer?.name || "Customer",
        customerPhone: customer?.phone || "",
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.log("❌ Stripe Checkout Error:", error);

    return next(
      createHttpError(
        error?.statusCode || 500,
        error?.message || "Failed to create Stripe checkout session!"
      )
    );
  }
};

const getCheckoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return next(createHttpError(400, "Missing session ID!"));
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.log("❌ Stripe Session Retrieve Error:", error);

    return next(
      createHttpError(
        error?.statusCode || 500,
        error?.message || "Failed to retrieve Stripe checkout session!"
      )
    );
  }
};

module.exports = {
  createCheckoutSession,
  getCheckoutSession,
};