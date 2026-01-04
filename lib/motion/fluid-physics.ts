export const calculateFluidDynamics = (balance: number, frequencyData: Uint8Array) => {
    // Average frequency for movement intensity
    const sum = frequencyData.reduce((a, b) => a + b, 0);
    const avgFreq = sum / frequencyData.length;

    // Balance affects the "Mass" and "Glow" of the ink cloud
    // 1000 GRIT = Max Expansion
    const expansion = Math.min(balance / 1000, 2);

    return {
        scale: 1 + (avgFreq / 255) * (0.5 + expansion), // More balance = more reactive expansion
        opacity: 0.3 + (avgFreq / 255) * 0.7,
        blur: Math.max(10, 40 - (balance / 100)), // More balance = "sharper" focus
        rotation: avgFreq * 0.2
    };
};
