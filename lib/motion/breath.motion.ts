import { Variants } from "framer-motion";

// Physics Config
const SPRING_SOFT = { type: "spring", stiffness: 50, damping: 20 };
const SPRING_SNAP = { type: "spring", stiffness: 300, damping: 30 };
const EASE_BREATH = "cubic-bezier(0.25, 0.1, 0.25, 1)" as any; // Bezier for organic breath

export const breathVariants: Variants = {
    idle: {
        scale: 1,
        opacity: 0.8,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: "linear" }
    },
    inhale: {
        scale: 1.15,
        opacity: 1,
        filter: "blur(0px) brightness(1.2)",
        transition: {
            duration: 2,
            ease: EASE_BREATH,
            repeat: Infinity,
            repeatType: "reverse"
        }
    },
    hold: {
        scale: 0.95,
        opacity: 0.9,
        filter: "blur(2px)",
        transition: { type: "spring", stiffness: 200, damping: 25 }
    },
    exhale: {
        scale: [1, 1.5, 0],
        opacity: [1, 0.8, 0],
        filter: "blur(10px)",
        transition: { duration: 0.8, ease: "easeOut" }
    },
    resolve: {
        scale: 0,
        opacity: 0,
        transition: { duration: 0 }
    }
};

export const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

// Accessibility: Reduce Motion
export const reduceMotionVariants: Variants = {
    idle: { opacity: 1, scale: 1 },
    inhale: { opacity: 0.8, transition: { duration: 2, repeat: Infinity, repeatType: "reverse" } },
    hold: { opacity: 0.6 },
    exhale: { opacity: 0, transition: { duration: 0.5 } }
};

export const getBreathIds = () => ({
    containerId: "breath-container",
    triggerId: "breath-trigger"
});
