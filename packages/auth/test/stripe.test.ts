import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env
vi.mock("@defied/env/server", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_mock_12345",
    STRIPE_WEBHOOK_SECRET: "whsec_test_mock_67890",
  },
}));

// Mock Stripe
const { mockCreateCheckoutSession, mockConstructEvent } = vi.hoisted(() => ({
  mockCreateCheckoutSession: vi.fn(),
  mockConstructEvent: vi.fn(),
}));

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: mockCreateCheckoutSession,
        },
      };
      webhooks = {
        constructEvent: mockConstructEvent,
      };
    },
  };
});

import {
  createCheckoutSession,
  createSubscriptionCheckout,
  constructWebhookEvent,
} from "../src/lib/stripe";

describe("Stripe Integration Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCheckoutSession", () => {
    it("should create a payment checkout session with valid parameters", async () => {
      mockCreateCheckoutSession.mockResolvedValueOnce({
        id: "cs_test_payment_1",
        url: "https://checkout.stripe.com/test_1",
      });

      const result = await createCheckoutSession({
        priceId: "price_123",
        successUrl: "https://defied.dev/success",
        cancelUrl: "https://defied.dev/cancel",
        customerId: "cus_abc",
        metadata: { userId: "user_1" },
      });

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price: "price_123",
            quantity: 1,
          },
        ],
        success_url: "https://defied.dev/success",
        cancel_url: "https://defied.dev/cancel",
        customer: "cus_abc",
        metadata: { userId: "user_1" },
      });
      expect(result).toEqual({
        id: "cs_test_payment_1",
        url: "https://checkout.stripe.com/test_1",
      });
    });
  });

  describe("createSubscriptionCheckout", () => {
    it("should create a subscription checkout session", async () => {
      mockCreateCheckoutSession.mockResolvedValueOnce({
        id: "cs_test_sub_1",
        url: "https://checkout.stripe.com/sub_1",
      });

      const result = await createSubscriptionCheckout({
        priceId: "price_monthly",
        successUrl: "https://defied.dev/success",
        cancelUrl: "https://defied.dev/cancel",
      });

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "subscription",
          line_items: [{ price: "price_monthly", quantity: 1 }],
        }),
      );
      expect(result.id).toBe("cs_test_sub_1");
    });
  });

  describe("constructWebhookEvent", () => {
    it("should construct and verify a valid Stripe webhook event", async () => {
      const mockEvent = {
        id: "evt_123",
        type: "checkout.session.completed",
        data: { object: { id: "cs_123", payment_status: "paid" } },
      };
      mockConstructEvent.mockReturnValueOnce(mockEvent);

      const payload = JSON.stringify(mockEvent);
      const signature = "t=123,v1=mock_signature";

      const event = await constructWebhookEvent(payload, signature);

      expect(mockConstructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        "whsec_test_mock_67890",
      );
      expect(event).toEqual(mockEvent);
    });

    it("should throw error if signature verification fails", async () => {
      mockConstructEvent.mockImplementationOnce(() => {
        throw new Error("Invalid signature");
      });

      await expect(
        constructWebhookEvent("invalid_payload", "bad_sig"),
      ).rejects.toThrow("Invalid signature");
    });
  });
});
