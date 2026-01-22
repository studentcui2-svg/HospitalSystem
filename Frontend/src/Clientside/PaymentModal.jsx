import React, { useState } from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { FaDownload, FaCheck } from "react-icons/fa";

// Stripe public key (test mode) - MUST be loaded outside component to prevent recreation
const STRIPE_PUBLIC_KEY =
  "pk_test_51SpVCOCeyV1064pEn6ClNgfL7jEey2VADCzKnUt6thEBMjgHdptCaLfbQrqAz6WE2IvDgPNKPQ337JkwchfZWA5m00j1kZNfme";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// ==================== Styled Components ====================

const PaymentModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const PaymentModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

const PaymentHeader = styled.div`
  margin-bottom: 2rem;
`;

const PaymentTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const PaymentSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
`;

const PaymentSummary = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4f46e5;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;

  &:last-child {
    margin-bottom: 0;
    padding-top: 0.5rem;
    border-top: 1px solid #d1d5db;
    font-weight: 700;
    color: #1f2937;
  }
`;

const SummaryLabel = styled.span`
  color: #6b7280;
`;

const SummaryValue = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const CardElementWrapper = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: white;

  .StripeElement {
    width: 100%;
    padding: 0.5rem 0;
  }

  .StripeElement--focus {
    border-color: #4f46e5;
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PayButton = styled(Button)`
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
  }
`;

const CancelButton = styled(Button)`
  background: #f3f4f6;
  color: #6b7280;

  &:hover:not(:disabled) {
    background: #e5e7eb;
  }
`;

const ProcessingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Spinner = styled.div`
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const InvoiceContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  max-height: 80vh;
  overflow-y: auto;
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #4f46e5;
`;

const InvoiceTitle = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
`;

const InvoiceNumber = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
`;

const InvoiceSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #4f46e5;
  margin-bottom: 1rem;
  margin-top: 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const InvoiceFooter = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
`;

const DownloadButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
  }
`;

const CloseButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

// ==================== Stripe Payment Form ====================

const StripePaymentForm = ({
  appointmentId,
  appointmentData,
  amount,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [cardReady, setCardReady] = useState(false);

  const handleCardChange = (event) => {
    setCardReady(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe is not loaded. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found. Please refresh and try again.");
      console.error("CardElement is null - element may not be mounted");
      return;
    }
    console.log("CardElement found:", cardElement);

    setError(null);

    try {
      // Step 1: Create payment method FIRST (synchronously reads card data)
      // This must happen BEFORE any state updates that could cause re-renders
      console.log("Creating payment method from card...");
      const { paymentMethod, error: methodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: appointmentData.patientName,
            email: appointmentData.patientEmail,
          },
        });

      if (methodError) {
        setError(methodError.message);
        return;
      }

      console.log("Payment method created:", paymentMethod.id);

      // NOW we can safely set processing state - card data is already captured
      setIsProcessing(true);

      // Step 2: Create payment intent
      console.log("Creating payment intent with amount:", amount);
      const paymentPayload = {
        appointmentId,
        amount: parseFloat(amount),
        patientName: appointmentData.patientName,
        patientEmail: appointmentData.patientEmail,
        description: `Medical Appointment - ${appointmentData.department}`,
      };
      console.log("Payment payload:", paymentPayload);

      const intentResponse = await fetch(
        "/api/payments/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        }
      );

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }

      const { clientSecret } = await intentResponse.json();

      if (!clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      console.log(
        "Got clientSecret, confirming payment with existing payment method..."
      );

      // Step 3: Confirm payment with the already-created payment method (no CardElement needed)
      const { paymentIntent, error: stripeError } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

      if (stripeError) {
        setError(stripeError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Step 4: Confirm payment on backend
        const confirmResponse = await fetch("/api/payments/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            appointmentId,
          }),
        });

        const result = await confirmResponse.json();

        if (confirmResponse.ok) {
          // Store payment data for invoice
          setPaymentData({
            invoiceNumber: `INV-${Date.now()}`,
            paymentIntentId: paymentIntent.id,
            amount: amount,
            paymentMethod: "Credit/Debit Card",
            currency: "USD",
            paymentDate: new Date().toLocaleString(),
            bookingDate: new Date().toLocaleString(),
            ...appointmentData,
          });

          setSuccess(true);
          toast.success("Payment successful! Invoice generated.");
        } else {
          setError(result.error || "Failed to confirm payment");
          setIsProcessing(false);
        }
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (success && paymentData) {
    const handlePrintInvoice = () => {
      window.print();
    };

    const handleCloseInvoice = () => {
      onSuccess(paymentData);
    };

    return (
      <InvoiceContainer>
        <InvoiceHeader>
          <div>
            <InvoiceTitle>
              <FaCheck style={{ color: "#10b981", marginRight: "0.5rem" }} />
              PAYMENT INVOICE
            </InvoiceTitle>
            <InvoiceNumber>
              Invoice #: {paymentData.invoiceNumber}
            </InvoiceNumber>
          </div>
        </InvoiceHeader>

        <InvoiceSection>
          <SectionTitle>Patient Information</SectionTitle>
          <InfoRow>
            <InfoLabel>Full Name:</InfoLabel>
            <InfoValue>{paymentData.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Email:</InfoLabel>
            <InfoValue>{paymentData.patientEmail}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Phone:</InfoLabel>
            <InfoValue>{paymentData.phone || "N/A"}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>CNIC:</InfoLabel>
            <InfoValue>{paymentData.cnic || "N/A"}</InfoValue>
          </InfoRow>
        </InvoiceSection>

        <InvoiceSection>
          <SectionTitle>Appointment Details</SectionTitle>
          <InfoRow>
            <InfoLabel>Department:</InfoLabel>
            <InfoValue>{paymentData.department}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Doctor:</InfoLabel>
            <InfoValue>{paymentData.doctor}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Scheduled Appointment:</InfoLabel>
            <InfoValue>{new Date(paymentData.date).toLocaleString()}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Booked On:</InfoLabel>
            <InfoValue>{paymentData.bookingDate}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Duration:</InfoLabel>
            <InfoValue>{paymentData.notes || "N/A"}</InfoValue>
          </InfoRow>
        </InvoiceSection>

        <InvoiceSection>
          <SectionTitle>Payment Information</SectionTitle>
          <InfoRow>
            <InfoLabel>Payment Method:</InfoLabel>
            <InfoValue>{paymentData.paymentMethod}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Transaction ID:</InfoLabel>
            <InfoValue>{paymentData.paymentIntentId}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Payment Date & Time:</InfoLabel>
            <InfoValue>{paymentData.paymentDate}</InfoValue>
          </InfoRow>
        </InvoiceSection>

        <InvoiceSection>
          <SectionTitle>Amount Payable</SectionTitle>
          <InfoRow style={{ borderBottom: "2px solid #4f46e5" }}>
            <InfoLabel style={{ fontSize: "1.1rem" }}>Total Amount:</InfoLabel>
            <InfoValue style={{ fontSize: "1.3rem", color: "#10b981" }}>
              ${paymentData.amount.toFixed(2)} {paymentData.currency}
            </InfoValue>
          </InfoRow>
        </InvoiceSection>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#166534",
              margin: "0 0 0.5rem 0",
              fontWeight: "600",
            }}
          >
            ✅ Payment Successful
          </p>
          <p style={{ color: "#6b7280", margin: "0", fontSize: "0.9rem" }}>
            Your appointment has been confirmed. Check your email for details.
          </p>
        </div>

        <InvoiceFooter>
          <DownloadButton onClick={handlePrintInvoice}>
            <FaDownload /> Print / Download
          </DownloadButton>
          <CloseButton onClick={handleCloseInvoice}>Close Invoice</CloseButton>
        </InvoiceFooter>
      </InvoiceContainer>
    );
  }

  if (success) {
    return (
      <ProcessingIndicator>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h3 style={{ color: "#10b981", marginBottom: "0.5rem" }}>
          Payment Successful!
        </h3>
        <p style={{ color: "#6b7280" }}>
          Your appointment has been confirmed. Check your email for details.
        </p>
      </ProcessingIndicator>
    );
  }

  // IMPORTANT: Don't return early for isProcessing - keep CardElement mounted!
  // The CardElement must stay in the DOM while Stripe processes the payment

  return (
    <form onSubmit={handlePayment} style={{ position: "relative" }}>
      {/* Show processing overlay but keep form mounted */}
      {isProcessing && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            borderRadius: "12px",
          }}
        >
          <Spinner />
          <p style={{ color: "#6b7280" }}>Processing your payment...</p>
        </div>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <PaymentSummary>
        <SummaryRow>
          <SummaryLabel>Patient Name:</SummaryLabel>
          <SummaryValue>{appointmentData.patientName}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Department:</SummaryLabel>
          <SummaryValue>{appointmentData.department}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Doctor:</SummaryLabel>
          <SummaryValue>{appointmentData.doctor}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Amount to Pay:</SummaryLabel>
          <SummaryValue>${amount.toFixed(2)}</SummaryValue>
        </SummaryRow>
      </PaymentSummary>

      <label
        style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}
      >
        Card Details
      </label>
      <CardElementWrapper>
        <CardElement
          onChange={handleCardChange}
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#fa755a",
              },
            },
          }}
        />
      </CardElementWrapper>

      <ButtonGroup>
        <PayButton
          type="submit"
          disabled={isProcessing || !stripe || !cardReady}
        >
          Pay ${amount.toFixed(2)}
        </PayButton>
        <CancelButton type="button" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </CancelButton>
      </ButtonGroup>
    </form>
  );
};

// ==================== Payment Modal Wrapper ====================

export const PaymentModal = ({
  isOpen,
  appointmentId,
  appointmentData,
  amount,
  onSuccess,
  onCancel,
}) => {
  // Return null early if not open - stripe promise is now at module level
  if (!isOpen) return null;

  return (
    <PaymentModalOverlay>
      <PaymentModalContent>
        <PaymentHeader>
          <PaymentTitle>Secure Payment</PaymentTitle>
          <PaymentSubtitle>
            Complete your appointment booking with a secure payment
          </PaymentSubtitle>
        </PaymentHeader>

        <Elements stripe={stripePromise}>
          <StripePaymentForm
            appointmentId={appointmentId}
            appointmentData={appointmentData}
            amount={amount}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </PaymentModalContent>
    </PaymentModalOverlay>
  );
};

export default PaymentModal;
