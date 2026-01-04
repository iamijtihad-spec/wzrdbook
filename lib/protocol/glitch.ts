export interface TradeHistory {
    timestamp: number;
    supply: number;
    price: number;
}

export const GLITCH_THRESHOLD = 0.15; // 15% supply change

export function calculateSystemVolatility(history: TradeHistory[]): number {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentTrades = history.filter(t => t.timestamp > oneHourAgo);

    if (recentTrades.length < 2) return 0;

    const initialSupply = recentTrades[0].supply;
    const currentSupply = recentTrades[recentTrades.length - 1].supply;

    if (initialSupply === 0) return 0;

    return Math.abs((currentSupply - initialSupply) / initialSupply);
}

export const isSystemGlitching = (volatility: number) => volatility > GLITCH_THRESHOLD;
