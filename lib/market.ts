/**
 * Linear Bonding Curve Physics
 * Formula: Price = Slope * Supply
 * 
 * This physics module governs the "Market" simulation, determining the exchange rate
 * between SOL (reserve) and GRIT (supply) based on a linear curve.
 */

export interface MarketState {
    currentSupply: number;
    currentPrice: number; // SOL per GRIT
    reserveBalance: number; // SOL in curve
    slope: number;
}

export class LinearBondingCurve {
    private slope: number;
    private initialSupply: number;

    constructor(slope: number = 0.00001, initialSupply: number = 1_000_000) {
        this.slope = slope;
        this.initialSupply = initialSupply;
    }

    /**
     * Calculates the price for a single token at a specific supply point.
     * Price = m * x
     */
    getPrice(supply: number): number {
        return this.slope * supply;
    }

    /**
     * Calculates the cost to Mint (Buy) a specific amount of tokens.
     * Cost = Integral(Price) from S to S+Amount
     * Cost = (m * (S + A)^2 / 2) - (m * S^2 / 2)
     */
    getBuyPrice(currentSupply: number, amountToBuy: number): number {
        const startSupply = currentSupply;
        const endSupply = currentSupply + amountToBuy;
        const cost = (this.slope / 2) * (Math.pow(endSupply, 2) - Math.pow(startSupply, 2));
        return cost;
    }

    /**
     * Calculates the return for Burning (Sell) a specific amount of tokens.
     * Return = Integral(Price) from S-Amount to S
     * Return = (m * S^2 / 2) - (m * (S - A)^2 / 2)
     */
    getSellPrice(currentSupply: number, amountToSell: number): number {
        const startSupply = currentSupply;
        const endSupply = currentSupply - amountToSell;
        if (endSupply < 0) return 0; // Cannot sell below 0 supply
        const revenue = (this.slope / 2) * (Math.pow(startSupply, 2) - Math.pow(endSupply, 2));
        return revenue;
    }

    /**
     * Returns the simulated market state.
     */
    getSimulationState(currentSupply: number): MarketState {
        const price = this.getPrice(currentSupply);
        // Reserve is Integral from 0 to CurrentSupply
        const reserve = (this.slope / 2) * Math.pow(currentSupply, 2);

        return {
            currentSupply,
            currentPrice: price,
            reserveBalance: reserve,
            slope: this.slope
        };
    }
}

// Global Singleton for Simulation
export const BONDING_CURVE = new LinearBondingCurve(0.0000001, 5_000_000);
