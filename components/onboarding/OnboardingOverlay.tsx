"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

const STEPS = [
    {
        title: "Welcome to Rehearsal",
        content: "You have entered a parallel space. The tokens here are instruments, not currency. Treat them with rhythm, not greed."
    },
    {
        title: "The Cycle of Breath",
        content: "Value flows like breath. Inhale to participate. Exhale to release. Do not force the flow; wait for the eligibility gate to open."
    },
    {
        title: "Scars are Key",
        content: "Your history is recorded. 'Scars'—your burn history—determine your standing. Without Scars, you cannot leave the Rehearsal."
    }
];

export default function OnboardingOverlay() {
    const [isOpen, setIsOpen] = useState(true);
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 bg-black shadow-2xl relative"
            >
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1 block">
                        First Contact Sequence {step + 1}/{STEPS.length}
                    </span>
                    <h2 className="text-2xl font-black text-white mb-4">{STEPS[step].title}</h2>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        {STEPS[step].content}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-white" : "bg-white/20"}`} />
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            if (step < STEPS.length - 1) {
                                setStep(s => s + 1);
                            } else {
                                setIsOpen(false);
                            }
                        }}
                        className="flex items-center gap-2 text-white font-bold uppercase text-xs tracking-widest hover:text-orange-500 transition-colors"
                    >
                        {step < STEPS.length - 1 ? "Proceed" : "Enter System"} <ArrowRight size={16} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
