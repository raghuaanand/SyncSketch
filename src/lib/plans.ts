import { PlanType } from "@/generated/prisma/client";

export interface PlanConfig {
    type: PlanType;
    name: string;
    priceInPaisa: number;
    maxDiagrams: number;
    features: string[];
}

export const PLANS: Record<PlanType, PlanConfig> = {
    FREE: {
        type: "FREE",
        name: "Free",
        priceInPaisa: 0,
        maxDiagrams: 3,
        features: [
            "Up to 3 diagrams",
            "Basic export options",
            "Community support",
        ],
    },
    PRO: {
        type: "PRO",
        name: "Pro",
        priceInPaisa: 10000, // ₹100
        maxDiagrams: 20,
        features: [
            "Up to 20 diagrams",
            "Priority export options",
            "Email support",
            "Collaboration features",
        ],
    },
    PREMIUM: {
        type: "PREMIUM",
        name: "Premium",
        priceInPaisa: 25000, // ₹250
        maxDiagrams: 75,
        features: [
            "Up to 75 diagrams",
            "All export options",
            "Priority support",
            "Advanced collaboration",
            "Custom branding",
        ],
    },
};

export function getPlanByType(type: PlanType): PlanConfig {
    return PLANS[type];
}

export function formatPriceINR(priceInPaisa: number): string {
    return `₹${(priceInPaisa / 100).toFixed(0)}`;
}
