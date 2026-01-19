const express = require("express");
const Stripe = require("stripe");
const Appointment = require("../models/Appointment");
const messageController = require("../controllers/messageController");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for appointment
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { appointmentId, amount, patientName, patientEmail, description } =
      req.body;

    console.log("Payment Intent Request:", {
      amount,
      patientName,
      patientEmail,
      description,
    });

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    if (typeof amount !== "number" || amount < 1) {
      return res
        .status(400)
        .json({ error: "Amount must be a number and at least $1" });
    }

    if (!patientName || !patientEmail) {
      return res
        .status(400)
        .json({ error: "Patient name and email are required" });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      description: description || `Appointment - ${patientName}`,
      metadata: {
        appointmentId: appointmentId || "pending",
        patientName,
        patientEmail,
      },
      receipt_email: patientEmail,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment and save appointment
router.post("/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId, appointmentData, appointmentId } = req.body;

    console.log("[CONFIRM PAYMENT] Request received:", {
      paymentIntentId,
      appointmentId,
      hasAppointmentData: !!appointmentData,
    });

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment Intent ID is required" });
    }

    // Retrieve payment intent to confirm success
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Payment not successful",
        status: paymentIntent.status,
      });
    }

    // If an appointmentId was provided, update that appointment's payment info
    if (appointmentId) {
      console.log(
        "[CONFIRM PAYMENT] Updating existing appointment:",
        appointmentId,
      );

      const appt = await Appointment.findById(appointmentId);
      if (!appt) {
        console.error(
          "[CONFIRM PAYMENT] Appointment not found:",
          appointmentId,
        );
        return res.status(404).json({ error: "Appointment not found" });
      }

      console.log("[CONFIRM PAYMENT] Found appointment, updating payment info");

      appt.payment = {
        status: "completed",
        paymentIntentId: paymentIntentId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paidAt: new Date(),
        receipt: paymentIntent.receipt_email,
      };

      // If an invoice object exists, mark it paid and clear amountDue
      try {
        if (appt.invoice) {
          appt.invoice.status = "paid";
          appt.invoice.amountDue = 0;
          appt.invoice.paidAt = new Date();
        }
      } catch (e) {
        console.warn(
          "[CONFIRM PAYMENT] could not update invoice fields",
          e && e.message,
        );
      }

      // ensure appointment status is at least Pending so it can be processed by staff
      if (!appt.status || appt.status === "") appt.status = "Pending";

      await appt.save();

      console.log("[CONFIRM PAYMENT] Appointment updated successfully");

      // emit payment update so connected clients (doctors, admins, patient UIs) refresh
      try {
        if (
          messageController &&
          typeof messageController.emitPaymentUpdated === "function"
        ) {
          messageController.emitPaymentUpdated(appt);
        }
      } catch (e) {
        console.warn(
          "[CONFIRM PAYMENT] emitPaymentUpdated failed",
          e && e.message,
        );
      }

      return res.status(200).json({
        message: "Payment recorded and appointment updated",
        appointment: appt,
      });
    }

    // Fallback: create appointment with payment info (backwards compatibility)
    console.log(
      "[CONFIRM PAYMENT] No appointmentId provided, attempting to create new appointment",
    );

    if (!appointmentData) {
      console.error(
        "[CONFIRM PAYMENT] No appointmentData provided for new appointment creation",
      );
      return res.status(400).json({
        error: "Either appointmentId or complete appointmentData is required",
      });
    }

    const appointment = new Appointment({
      ...appointmentData,
      payment: {
        status: "completed",
        paymentIntentId: paymentIntentId,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
        paidAt: new Date(),
        receipt: paymentIntent.receipt_email,
      },
    });

    const savedAppointment = await appointment.save();

    // emit payment update for newly created appointment
    try {
      if (
        messageController &&
        typeof messageController.emitPaymentUpdated === "function"
      ) {
        messageController.emitPaymentUpdated(savedAppointment);
      }
    } catch (e) {
      console.warn(
        "[CONFIRM PAYMENT] emitPaymentUpdated failed for new appointment",
        e && e.message,
      );
    }

    res.status(201).json({
      message: "Appointment booked successfully with payment received",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("[CONFIRM PAYMENT] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Stripe events (optional - for production)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  },
);

// Refund payment for an appointment
router.post("/refund", async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if payment exists and is completed
    if (!appointment.payment || appointment.payment.status !== "completed") {
      return res.status(400).json({ error: "No completed payment to refund" });
    }

    if (!appointment.payment.paymentIntentId) {
      return res.status(400).json({ error: "No payment intent ID found" });
    }

    // Check if already refunded
    if (appointment.payment.status === "refunded") {
      return res.status(400).json({ error: "Payment already refunded" });
    }

    // Create refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: appointment.payment.paymentIntentId,
    });

    // Update appointment payment status
    appointment.payment.status = "refunded";
    appointment.payment.refundedAt = new Date();
    appointment.payment.refundId = refund.id;
    await appointment.save();

    console.log(
      `[REFUND] Appointment ${appointmentId} refunded. Refund ID: ${refund.id}`,
    );

    res.json({
      message: "Payment refunded successfully",
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency,
    });
  } catch (error) {
    console.error("Refund Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
