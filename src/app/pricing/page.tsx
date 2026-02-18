"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PLANS, formatPriceINR } from "@/lib/plans";
import { Palette, Check, Crown, Sparkles, ArrowLeft } from "lucide-react";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    prefill?: { email?: string; name?: string };
    theme?: { color: string };
}

interface RazorpayInstance {
    open: () => void;
}

export default function PricingPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planType: "PRO" | "PREMIUM") => {
        if (!session) {
            window.location.href = "/login?callbackUrl=/pricing";
            return;
        }

        setLoading(planType);

        try {
            // Create subscription order
            const res = await fetch("/api/subscription/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planType }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to create subscription");
                return;
            }

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error("Failed to load Razorpay"));
                    document.body.appendChild(script);
                });
            }

            // Open Razorpay checkout
            const razorpay = new window.Razorpay({
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "SyncSketch",
                description: `${data.planName} Subscription`,
                order_id: data.orderId,
                handler: async (response) => {
                    // Verify payment
                    const verifyRes = await fetch("/api/subscription/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response),
                    });

                    if (verifyRes.ok) {
                        alert("Subscription activated! Redirecting...");
                        window.location.href = "/dashboard";
                    } else {
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    email: session.user?.email || "",
                    name: session.user?.name || "",
                },
                theme: {
                    color: "#6366f1",
                },
            });

            razorpay.open();
        } catch (error) {
            console.error("Subscription error:", error);
            alert("Failed to process subscription");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Palette className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    SyncSketch
                                </h1>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4">
                            {session ? (
                                <Link href="/dashboard">
                                    <Button variant="outline">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button>Sign In</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 lg:px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        <span className="text-sm font-medium text-slate-600 bg-yellow-100 px-3 py-1 rounded-full">
                            Simple, transparent pricing
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                        Choose your{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            creative plan
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Start for free, upgrade when you need more. All plans include the
                        full Excalidraw experience.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-24">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* FREE Plan */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-slate-900">Free</h3>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-900">
                                        {formatPriceINR(PLANS.FREE.priceInPaisa)}
                                    </span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">
                                    Perfect for getting started
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {PLANS.FREE.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button variant="outline" className="w-full" disabled>
                                Current Plan
                            </Button>
                        </div>

                        {/* PRO Plan */}
                        <div className="bg-gradient-to-b from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                                    POPULAR
                                </span>
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold">Pro</h3>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">
                                        {formatPriceINR(PLANS.PRO.priceInPaisa)}
                                    </span>
                                    <span className="text-white/70">/month</span>
                                </div>
                                <p className="text-sm text-white/70 mt-2">
                                    For serious creators
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {PLANS.PRO.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-green-400 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full bg-white text-purple-600 hover:bg-white/90"
                                onClick={() => handleSubscribe("PRO")}
                                disabled={loading === "PRO"}
                            >
                                {loading === "PRO" ? "Processing..." : "Upgrade to Pro"}
                            </Button>
                        </div>

                        {/* PREMIUM Plan */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8">
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-2">
                                    <h3 className="text-xl font-bold text-slate-900">Premium</h3>
                                    <Crown className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-900">
                                        {formatPriceINR(PLANS.PREMIUM.priceInPaisa)}
                                    </span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">
                                    For power users & teams
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {PLANS.PREMIUM.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                onClick={() => handleSubscribe("PREMIUM")}
                                disabled={loading === "PREMIUM"}
                            >
                                {loading === "PREMIUM" ? "Processing..." : "Upgrade to Premium"}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
