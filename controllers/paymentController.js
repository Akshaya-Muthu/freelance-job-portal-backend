// controllers/paymentController.js
import dotenv from "dotenv";
dotenv.config(); // ✅ must be at the very top

import Stripe from "stripe";
import Transaction from "../models/transactionModel.js";

// ✅ Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
export const createPaymentIntent = async (req, res) => {
  const { amount, jobId, milestone } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: "usd",
      metadata: { jobId, milestone, userId: req.user._id.toString() },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Webhook for Stripe events
export const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Save transaction to DB
    await Transaction.create({
      user: paymentIntent.metadata.userId,
      job: paymentIntent.metadata.jobId,
      amount: paymentIntent.amount,
      milestone: paymentIntent.metadata.milestone || "full",
      status: "succeeded",
      paymentId: paymentIntent.id,
    });
  }

  res.json({ received: true });
};

// Get transaction history
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).populate("job");
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
