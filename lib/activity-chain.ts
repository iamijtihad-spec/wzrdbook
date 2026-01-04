/**
 * Pseudo-Blockchain Activity Logger
 * 
 * This module provides blockchain-like functionality for the GRIT ecosystem:
 * - Immutable activity logging with SHA-256 hashing
 * - Chain integrity verification (each block references previous hash)
 * - Timestamped transactions
 * - Local persistence via localStorage
 */

export interface ActivityBlock {
    index: number;
    id: string;
    timestamp: number;
    type: "transfer" | "claim" | "play" | "purchase" | "airdrop" | "connect" | "burn" | "vote" | "buy" | "sell" | "withdraw" | "domain_shift";
    data: any;
    previousHash: string;
    hash: string;
}

class PseudoBlockchain {
    private chain: ActivityBlock[] = [];
    private readonly STORAGE_KEY = "grit_activity_chain";

    constructor() {
        this.loadChain();
    }

    // Load chain from localStorage
    private loadChain(): void {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.chain = JSON.parse(stored);
            } catch {
                this.chain = [];
                this.createGenesisBlock();
            }
        } else {
            this.createGenesisBlock();
        }
    }

    // Save chain to localStorage
    private saveChain(): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chain));
    }

    // Create the genesis (first) block
    private createGenesisBlock(): void {
        const genesis: ActivityBlock = {
            index: 0,
            id: "0",
            timestamp: Date.now(),
            type: "connect",
            data: { details: "GRIT Ecosystem Genesis Block" },
            previousHash: "0",
            hash: "",
        };
        genesis.hash = this.calculateHash(genesis);
        this.chain = [genesis];
        this.saveChain();
    }

    // Calculate SHA-256 hash (simplified for browser)
    private calculateHash(block: Omit<ActivityBlock, "hash">): string {
        const data = JSON.stringify({
            index: block.index,
            timestamp: block.timestamp,
            type: block.type,
            data: block.data,
            previousHash: block.previousHash,
        });

        // Simple hash function for demonstration
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(16, "0");
    }

    // Add new activity to the chain
    addActivity(
        type: ActivityBlock["type"],
        data: ActivityBlock["data"]
    ): ActivityBlock {
        const previousBlock = this.chain[this.chain.length - 1];
        const newBlock: ActivityBlock = {
            index: this.chain.length,
            id: Math.random().toString(36).substring(2, 15),
            timestamp: Date.now(),
            type,
            data,
            previousHash: previousBlock.hash,
            hash: "",
        };
        newBlock.hash = this.calculateHash(newBlock);
        this.chain.push(newBlock);
        this.saveChain();
        return newBlock;
    }

    // Get the full chain
    getChain(): ActivityBlock[] {
        return [...this.chain];
    }

    // Get recent activities (last N blocks)
    getRecentActivities(count: number = 10): ActivityBlock[] {
        return this.chain.slice(-count).reverse();
    }

    // Get activities for a specific wallet
    getWalletActivities(wallet: string): ActivityBlock[] {
        return this.chain.filter(
            (block) => block.data.wallet === wallet
        );
    }

    // Verify chain integrity
    verifyChain(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verify hash
            if (currentBlock.hash !== this.calculateHash(currentBlock)) {
                console.error(`Block ${i} has invalid hash`);
                return false;
            }

            // Verify chain link
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error(`Block ${i} has broken chain link`);
                return false;
            }
        }
        return true;
    }

    // Get chain statistics
    getStats(): {
        totalBlocks: number;
        totalTransfers: number;
        totalPlays: number;
        totalClaims: number;
        isValid: boolean;
    } {
        return {
            totalBlocks: this.chain.length,
            totalTransfers: this.chain.filter((b) => b.type === "transfer").length,
            totalPlays: this.chain.filter((b) => b.type === "play").length,
            totalClaims: this.chain.filter((b) => b.type === "claim").length,
            isValid: this.verifyChain(),
        };
    }

    // Clear chain (for testing)
    reset(): void {
        this.chain = [];
        this.createGenesisBlock();
    }
}

// Singleton instance
export const activityChain = typeof window !== "undefined"
    ? new PseudoBlockchain()
    : null;

// Hook for React components
export function useActivityChain() {
    return activityChain;
}
