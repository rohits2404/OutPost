"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { PricingPlans } from "./PricingPlans";

type UpgradeReason = { title: string; description?: string };

const DEFAULT_REASON: UpgradeReason = {
    title: "Upgrade Your Plan",
    description:
        "Get More Agent Prompts, Unlimited Workspaces, Share Links And PDF Export.",
};

const UpgradeDialogContext = createContext<(reason?: UpgradeReason) => void>(
    () => {},
);

export function UpgradeDialogProvider({ children }: { children: ReactNode }) {
    const [reason, setReason] = useState<UpgradeReason | null>(null);
    const close = () => setReason(null);

    return (
        <UpgradeDialogContext.Provider
            value={(next) => setReason(next ?? DEFAULT_REASON)}
        >
            {children}
            <Dialog
                open={reason !== null}
                onOpenChange={(open) => !open && close()}
            >
                <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
                    <DialogHeader className="items-center text-center">
                        <DialogTitle className="text-2xl">
                            {reason?.title}
                        </DialogTitle>
                        {reason?.description && (
                            <DialogDescription>
                                {reason.description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    <PricingPlans onCheckoutStart={close} />
                </DialogContent>
            </Dialog>
        </UpgradeDialogContext.Provider>
    );
}

export function useUpgradeDialog() {
    return useContext(UpgradeDialogContext);
}
