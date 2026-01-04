/**
 * 🎷 GRIT MOTION SYSTEM — "BREATH"
 * 
 * Defines the easing, timing, and variants for the Liminal Interface.
 * Used by framer-motion components.
 * 
 * "Make it feel like air moving, not pixels shifting."
 */

export const BREATH_TRANSITION = {
    duration: 0.8,
    ease: [0.25, 1, 0.5, 1], // Soft cubic bezier (Exhale)
};

export const INHALE_TRANSITION = {
    duration: 1.2,
    ease: [0.25, 0.1, 0.25, 1], // Slow start, smooth end
};

export const MOTION_VARIANTS = {
    container: {
        hidden: { opacity: 0, scale: 0.98 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.1,
                ...BREATH_TRANSITION
            }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    },
    item: {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: BREATH_TRANSITION
        }
    },
    breathButton: {
        idle: { scale: 1 },
        hover: { scale: 1.02, transition: { duration: 0.4, ease: "easeOut" } },
        tap: { scale: 0.98 },
        inhale: {
            scale: 0.95,
            borderColor: "rgba(255,255,255,0.8)",
            boxShadow: "0 0 15px rgba(255,255,255,0.1) inset",
            transition: { duration: 1.5, ease: "easeInOut" }
        },
        release: {
            scale: 1.05,
            borderColor: "rgba(255, 215, 0, 0.6)", // Gold release
            boxShadow: "0 0 30px rgba(255, 215, 0, 0.2)",
            transition: { duration: 0.6, ease: "easeOut" }
        }
    }
};
