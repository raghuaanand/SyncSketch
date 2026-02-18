import Razorpay from "razorpay";
import crypto from "crypto";

// Lazy initialization to avoid build-time errors when credentials aren't available
let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay credentials not configured");
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
}

// Legacy export for backward compatibility (use getRazorpay() instead)
export const razorpay = {
    get orders() {
        return getRazorpay().orders;
    },
    get payments() {
        return getRazorpay().payments;
    },
    get subscriptions() {
        return getRazorpay().subscriptions;
    },
} as unknown as Razorpay;

export function formatAmountForRazorpay(amountInPaisa: number): number {
    // Razorpay expects amount in smallest currency unit (paisa for INR)
    return amountInPaisa;
}

export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(body)
        .digest("hex");

    return expectedSignature === signature;
}

export function verifyWebhookSignature(
    body: string,
    signature: string
): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
        .update(body)
        .digest("hex");

    return expectedSignature === signature;
}
