"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { getStakingProgram, getGovProgram, getBondingProgram } from "@/lib/solana-client";
import { activityChain, ActivityBlock } from "@/lib/activity-chain";
import { ECONOMIC_DATA } from "@/constants/economics";
import { TreasuryFlags } from "@/config/copy";
import {
    calculateAscesisCapacity,
    calculateHeritageEfficiency,
    checkEligibility,
    TREASURY_CONSTANTS
} from "@/lib/treasury";
import { Proposal, Vote, calculateVotingPower } from "@/lib/governance";
import { MarketState, BONDING_CURVE } from "@/lib/market";
import artistConfig from "@/config/artist.config.json";

// ... existing imports

/**
 * GRIT is not governed by activity.
 * It is governed by remainder.
 *
 * This contract does not reward participation.
 * It records consequence.
 *
 * What persists here has already endured subtraction.
 */

export const DOMAINS = {
    SOVEREIGN: "SOVEREIGN",
    ASCESIS: "ASCESIS",
    HERITAGE: "HERITAGE",
    MARKET: "MARKET"
};

export interface Track {
    id: string;
    mint: string;
    title: string;
    uri: string;
    artist: string;
    image: string;
    imageFile?: string; // Local fallback
    rarity?: "Common" | "Rare" | "Epic" | "Legendary";
    duration: number;
    price: number; // Required for reward claiming
    tier: "Common" | "Rare" | "Epic" | "Legendary";
    stems?: { name: string; url: string; domain: string }[];
    domainGates?: Record<string, string>;
    isLocal?: boolean;

    // 5-Stem Architecture (Phase 2)
    stem_vox1?: string;
    stem_inout?: string;
    stem_adlibs?: string;
    stem_bgvox?: string;
    stem_inst?: string;
}

export type ResonanceRank = "Initiate" | "Signal" | "Resonant" | "Ether";

export interface GritState {
    isConnected: boolean;
    walletAddress: string | null;
    solBalance: number;
    gritBalance: number;
    moxyBalance: number;
    chiBalance: number;
    stakedAmount: number; // MOXY Staked
    fiatBalance: number; // New: USD Balance
    stakingTier: "None" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Titan";
    ownedMints: Set<string>;
    hasAccess: boolean;
    tracks: Track[];
    currentTrack: Track | null;
    isPlaying: boolean;
    recentActivity: ActivityBlock[];
    refreshBalances: () => Promise<void>;
    playTrack: (track: Track) => void;
    stopTrack: () => void;
    logActivity: (type: ActivityBlock["type"], data: ActivityBlock["data"]) => void;
    discordUser: { username: string; id: string; avatar: string; roles: string[]; isBooster?: boolean } | null;
    setDiscordUser: (user: GritState["discordUser"]) => void;
    stakeStartTime: number | null; // Timestamp (ms)
    epochData: { epoch: number; name: string; progress: number; target: number; nextReward: string } | null;
    currentDomain: "SOVEREIGN" | "ASCESIS" | "HERITAGE" | "MARKET";
    setCurrentDomain: (domain: "SOVEREIGN" | "ASCESIS" | "HERITAGE" | "MARKET") => void;
    scars: { signature: string; amount: number; timestamp: number }[];
    resonance: number; // Accumulated listening value
    resonanceRank: ResonanceRank; // Rank derived from resonance
    addScar: (signature: string, amount: number) => void;
    addResonance: (amount: number) => void;
    stakeMoxy: (amount: number) => Promise<void>;
    unstakeMoxy: () => Promise<void>;

    claimHeritageRewards: () => Promise<void>;

    // Treasury Physics
    exitCapacity: number;
    efficiencyMultiplier: number;
    treasuryFlags: TreasuryFlags;

    // Governance (The Voice)
    proposals: Proposal[];
    userVotes: Vote[];
    votingPower: number;
    castVote: (proposalId: string, choice: "amplify" | "dampen") => void;

    // Market (Bonding Curve)
    marketState: MarketState;
    buyGrit: (amountInSol: number) => Promise<void>;
    sellGrit: (amountInGrit: number) => Promise<void>;
    wzrdHandle: string | null;
    creatureMint: string | null;
}

const GritContext = createContext<GritState | null>(null);

export function GritStateProvider({ children }: { children: ReactNode }) {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const walletAddress = wallet?.publicKey.toBase58() || null;
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ... existing state
    const [solBalance, setSolBalance] = useState(0);
    const [gritBalance, setGritBalance] = useState(0);
    const [moxyBalance, setMoxyBalance] = useState(0);
    const [chiBalance, setChiBalance] = useState(0);
    const [stakedAmount, setStakedAmount] = useState(0);
    const [fiatBalance, setFiatBalance] = useState(0);
    const [stakingTier, setStakingTier] = useState<GritState["stakingTier"]>("None");
    const [ownedMints, setOwnedMints] = useState<Set<string>>(new Set());
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recentActivity, setRecentActivity] = useState<ActivityBlock[]>([]);
    const [discordUser, setDiscordUser] = useState<GritState["discordUser"]>(null);
    const [stakeStartTime, setStakeStartTime] = useState<number | null>(null);
    const [epochData, setEpochData] = useState<GritState["epochData"]>(null);
    const [currentDomain, setCurrentDomain] = useState<"SOVEREIGN" | "ASCESIS" | "HERITAGE" | "MARKET">("SOVEREIGN");
    const [scars, setScars] = useState<GritState["scars"]>([]);
    const [resonance, setResonance] = useState(0);

    const [wzrdHandle, setWzrdHandle] = useState<string | null>(null);
    const [creatureMint, setCreatureMint] = useState<string | null>(null);

    // Treasury State
    const [exitCapacity, setExitCapacity] = useState(TREASURY_CONSTANTS.BASE_CAP_SOL);
    const [efficiencyMultiplier, setEfficiencyMultiplier] = useState(1.0);
    const [treasuryFlags, setTreasuryFlags] = useState<TreasuryFlags>({
        paused: false,
        capReached: false,
        rateLimited: false,
        insufficientScars: true, // Default safe
        insufficientTime: true, // Default safe
    });

    // ... logActivity, refreshBalances, playTrack, stopTrack hooks ...
    const logActivity = useCallback((
        type: ActivityBlock["type"],
        data: ActivityBlock["data"]
    ) => {
        if (activityChain) {
            activityChain.addActivity(type, data);
            setRecentActivity(activityChain.getRecentActivities(20));
        }
    }, []);

    const refreshMarket = useCallback(async () => {
        try {
            const provider = new AnchorProvider(connection, wallet || ({} as any), {});
            const program = getBondingProgram(provider);
            const [curvePDA] = await import("@solana/web3.js").then(web3 =>
                web3.PublicKey.findProgramAddressSync(
                    [Buffer.from("bonding_curve")],
                    program.programId
                )
            );
            const curveAccount = await program.account.curveConfig.fetchNullable(curvePDA) as any;
            if (curveAccount) {
                setMarketState({
                    currentSupply: curveAccount.totalSupply.toNumber() / 1_000_000_000,
                    currentPrice: curveAccount.basePrice.toNumber() / 1_000_000_000 +
                        (curveAccount.slope.toNumber() / 1_000_000_000) * (curveAccount.totalSupply.toNumber() / 1_000_000_000),
                    reserveBalance: curveAccount.reserveBalance.toNumber() / 1_000_000_000,
                    slope: curveAccount.slope.toNumber() / 1_000_000_000
                });
            }
        } catch (e) {
            console.error("Market Sync Error:", e);
        }
    }, [connection, wallet]);

    const refreshBalances = useCallback(async () => {
        if (!wallet) return;

        try {
            // ... (keep existing refresh logic including balances, discord, epoch, staking, etc.)
            // Fetch Discord Status (Unified Session)
            try {
                const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "http://localhost:3001";
                const statusRes = await fetch(`${botUrl}/api/status/${wallet.publicKey.toBase58()}`);
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    // ... (discord processing)
                    if (statusData.linked) {
                        setDiscordUser({
                            username: statusData.username,
                            id: statusData.discordId,
                            roles: statusData.roles,
                            avatar: statusData.avatar,
                            isBooster: statusData.isBooster
                        });
                        const roles = statusData.roles as string[];
                        if (roles.includes("Diamond")) setStakingTier("Diamond");
                        else if (roles.includes("Gold")) setStakingTier("Gold");
                        else if (roles.includes("Silver")) setStakingTier("Silver");
                        else if (roles.includes("Bronze")) setStakingTier("Bronze");
                    } else {
                        setDiscordUser(null);
                    }
                }
            } catch (e) { console.warn("Discord Bot Offline:", e); }

            // ... (standard fetches sol, grit, moxy, chi, nfts)
            const solRes = await fetch(`/api/sol/balance?wallet=${wallet.publicKey.toBase58()}`);
            if (solRes.ok) setSolBalance((await solRes.json()).balance || 0);

            const gritRes = await fetch(`/api/grit/balance?wallet=${wallet.publicKey.toBase58()}`);
            if (gritRes.ok) setGritBalance((await gritRes.json()).balance || 0);

            const moxyRes = await fetch(`/api/moxy/balance?wallet=${wallet.publicKey.toBase58()}`);
            if (moxyRes.ok) setMoxyBalance((await moxyRes.json()).balance || 0);

            const chiRes = await fetch(`/api/chi/balance?wallet=${wallet.publicKey.toBase58()}`);
            if (chiRes.ok) setChiBalance((await chiRes.json()).balance || 0);

            try {
                const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "http://localhost:3001";
                const epochRes = await fetch(`${botUrl}/api/epoch`);
                if (epochRes.ok) setEpochData(await epochRes.json());
            } catch (e) { }

            const nftRes = await fetch(`/api/nfts/owned?wallet=${wallet.publicKey.toBase58()}`);
            if (nftRes.ok) {
                const data = await nftRes.json();
                const nfts = data.ownedNFTs || [];
                const mints = nfts.map((nft: any) => nft.mint);
                setOwnedMints(new Set(mints));

                // Check for Progeny NFT
                const progeny = nfts.find((n: any) => n.name?.includes("Initiate") || n.name?.includes("Progeny"));
                if (progeny) setCreatureMint(progeny.mint);
            }

            // Staking & Fiat (CustodialNeo-Bank)
            try {
                // 1. Staking Stats
                const stakeRes = await fetch(`/api/staking/stats?wallet=${wallet.publicKey.toBase58()}`);
                if (stakeRes.ok) {
                    const stakeData = await stakeRes.json();
                    setStakedAmount(stakeData.stakedAmount || 0);
                }

                // 2. Fiat Balance
                let currentFiat = 0;
                const bankRes = await fetch(`/api/bank/balance?wallet=${wallet.publicKey.toBase58()}`);
                if (bankRes.ok) {
                    const bankData = await bankRes.json();
                    currentFiat = bankData.balance || 0;
                    setFiatBalance(currentFiat);
                }

                // 3. Capital Multiplier Logic
                // Base 1.0 + (Fiat / 100)
                const capitalMultiplier = 1.0 + (currentFiat / 100);
                setEfficiencyMultiplier(capitalMultiplier);

            } catch (e) {
                console.error("Bank/Staking Fetch Error", e);
            }

            // Market
            await refreshMarket();

        } catch (error) {
            console.error("Error refreshing balances:", error);
        }
    }, [wallet, connection, refreshMarket]);

    const saveUserProfile = useCallback(async () => {
        if (!walletAddress) return;
        try {
            const res = await fetch("/api/data/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet: walletAddress,
                    resonance: resonance, // Current resonance
                    scars: scars, // Current scars
                    currentDomain: currentDomain // Persist domain state
                })
            });
            if (!res.ok) console.warn("Failed to persist user profile:", res.statusText);
        } catch (e) {
            console.error("Failed to save profile (Network Error)", e);
        }
    }, [walletAddress, resonance, scars, currentDomain]);

    // Derive Creature from Owned Mints (Heuristic: Non-Track NFT)
    useEffect(() => {
        if (ownedMints.size > 0 && tracks.length > 0) {
            // Find an NFT that is NOT a music track
            const potentialCreature = Array.from(ownedMints).find(mint =>
                !tracks.some(t => t.mint === mint)
            );

            if (potentialCreature && potentialCreature !== creatureMint) {
                console.log("Progeny Detected:", potentialCreature);
                setCreatureMint(potentialCreature);
            }
        } else if (ownedMints.size > 0 && tracks.length === 0) {
            // Fallback if tracks haven't loaded but mints have? 
            // Risky, might be a track. Wait for tracks.
        }
    }, [ownedMints, tracks, creatureMint]);

    const playTrack = useCallback((track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        logActivity("play", {
            wallet: wallet?.publicKey.toBase58(),
            nftMint: track.mint,
            trackTitle: track.title,
        });
    }, [wallet, logActivity]);

    const stopTrack = useCallback(() => {
        setIsPlaying(false);
        saveUserProfile(); // Force save on stop
    }, [saveUserProfile]);

    useEffect(() => {
        fetch("/api/nfts/list")
            .then(res => {
                if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
                    throw new Error("Invalid NFT List Response");
                }
                return res.json();
            })
            .then(d => {
                let fetchedTracks = d.tracks || [];
                // Merge with Artist Config for Stems
                fetchedTracks = fetchedTracks.map((t: Track) => {
                    if (!t || !t.title) return t;

                    // Normalize for matching
                    const trackTitle = t.title.trim().toLowerCase();
                    const config = artistConfig.collection.find(c =>
                        c.title.trim().toLowerCase() === trackTitle ||
                        (t.id && c.id && t.id.includes(c.id))
                    );

                    // Debug Config Match
                    // console.log(`Config Match for ${t.title}:`, config ? "FOUND" : "MISSING");

                    if (config) {
                        const c = config as any;
                        return {
                            ...t,
                            stems: c.stems,
                            domainGates: c.domain_gates,
                            stem_vox1: c.stem_vox1,
                            stem_inout: c.stem_inout,
                            stem_adlibs: c.stem_adlibs,
                            stem_bgvox: c.stem_bgvox,
                            stem_inst: c.stem_inst
                        };
                    }
                    return t;
                });
                setTracks(fetchedTracks);
            })
            .catch(console.error);
    }, []);

    // Load Scars and Activity
    // Load Initial Activity
    useEffect(() => {
        if (activityChain) {
            setRecentActivity(activityChain.getRecentActivities(20));
        }
    }, []);

    // Derive Scars from Activity (Updates when wallet or activity changes)
    useEffect(() => {
        if (activityChain) {
            if (wallet) {
                const burns = activityChain.getChain().filter(b => b.type === "burn" && (b.data.wallet === wallet.publicKey.toBase58() || !b.data.wallet));
                const loadedScars = burns.map(b => ({
                    signature: b.data.signature || "legacy",
                    amount: b.data.amount || 0,
                    timestamp: b.timestamp
                })).reverse();
                setScars(loadedScars);
            } else {
                setScars([]);
            }
        }
    }, [wallet, recentActivity]);

    useEffect(() => {
        if (wallet) {
            refreshBalances();
            logActivity("connect", { wallet: wallet.publicKey.toBase58(), details: "Connected" });
        }
    }, [wallet, refreshBalances, logActivity]);

    // Staking Persistence (Removed Mock Fallback)
    // We now rely on refreshBalances() to fetch real chain state.

    // Load User Handle from Storage
    useEffect(() => {
        const stored = localStorage.getItem("wzrd_handle");
        if (stored) setWzrdHandle(stored);

        // THE FOUNDER'S OATH (One-time, Console Only)
        const hasSworn = localStorage.getItem("grit_oath_sworn");
        if (!hasSworn) {
            console.group("%c The Founder's Oath", "color: #d4af37; font-size: 14px; font-weight: bold; background: #000; padding: 4px;");
            console.log("%c I enter without entitlement.", "color: #888; font-style: italic;");
            console.log("%c I recognize accumulation as weight, not authority.", "color: #888; font-style: italic;");
            console.log("%c I accept that what I destroy will not return.", "color: #888; font-style: italic;");
            console.log("%c I acknowledge that loss precedes stewardship.", "color: #888; font-style: italic;");
            console.log("%c I will not act where I have not endured.", "color: #888; font-style: italic;");
            console.log("%c I understand that the system remembers longer than I do.", "color: #888; font-style: italic;");
            console.log("%c I remain.", "color: #d4af37; font-weight: bold;");
            console.groupEnd();
            localStorage.setItem("grit_oath_sworn", "true");
        }

        // Listen for storage changes (for same-origin sync)
        const handleStorageChange = () => {
            const current = localStorage.getItem("wzrd_handle");
            if (current !== wzrdHandle) setWzrdHandle(current);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [wzrdHandle]);

    const addScar = useCallback((signature: string, amount: number) => {
        const newScar = { signature, amount, timestamp: Date.now() };
        setScars(prev => [newScar, ...prev]);
        logActivity("burn", { amount, signature, domain: "ASCESIS", wallet: wallet?.publicKey.toBase58() });
    }, [logActivity, wallet]);

    const addResonance = useCallback((amount: number) => {
        setResonance((prev) => prev + amount);
    }, []);

    // Resonance Accumulation
    //
    // Listening generates weight.
    // Weight alone confers nothing.
    // Accumulation precedes discernment.
    useEffect(() => {
        let interval: NodeJS.Timeout;
        // DISABLED IN ASCESIS: Users must return to Sovereign or Heritage to earn
        if (isPlaying && currentTrack && currentDomain !== "ASCESIS") {
            interval = setInterval(() => {
                // Accumulate 1 Resonance per 5 seconds of listening
                addResonance(1);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTrack, addResonance, currentDomain]);

    // Resonance Threshold Gate (Automatic Domain Shift)
    useEffect(() => {
        const THRESHOLD = 144;
        if (resonance >= THRESHOLD && currentDomain === "SOVEREIGN") {
            setCurrentDomain("ASCESIS");
            logActivity("domain_shift", {
                from: "SOVEREIGN",
                to: "ASCESIS",
                resonance,
                wallet: wallet?.publicKey.toBase58()
            });
        }
    }, [resonance, currentDomain, setCurrentDomain, logActivity, wallet]);

    // --- HERITAGE LOGIC ---
    const claimHeritageRewards = useCallback(async () => {
        if (!wallet) return;

        // Calculate Multiplier (Same logic as Vault)
        let multiplier = 1.0;
        if (stakeStartTime) {
            const now = Date.now();
            const daysStaked = (now - stakeStartTime) / (1000 * 60 * 60 * 24);
            multiplier = 1.0 + (daysStaked / 30) * 0.1;
        }

        try {
            // Attempt Smart Contract Call
            const provider = new AnchorProvider(connection, wallet, {});
            const program = getStakingProgram(provider);
            const [userStakePDA] = await import("@solana/web3.js").then(web3 =>
                web3.PublicKey.findProgramAddressSync(
                    [Buffer.from("stake"), wallet.publicKey.toBuffer()],
                    program.programId
                )
            );

            await program.methods.claimReward()
                .accounts({
                    userStake: userStakePDA,
                    user: wallet.publicKey
                })
                .rpc();

            logActivity("claim", { multiplier, wallet: wallet.publicKey.toBase58() });
            await refreshBalances();
            alert("Rewards Claimed Successfully!");

        } catch (e: any) {
            console.error("Claim Failed:", e);
            if (e.message?.includes("User rejected") || e.toString().includes("User rejected")) {
                console.log("User cancelled transaction.");
                return;
            }
            alert(`Claim Transaction Failed: ${e.message || e.toString()}. Ensure you are eligible.`);
        }
    }, [wallet, connection, stakeStartTime, refreshBalances, logActivity]);

    // --- TREASURY PHYSICS ---
    useEffect(() => {
        const cap = calculateAscesisCapacity(scars);
        const eff = calculateHeritageEfficiency(stakeStartTime);
        const eligible = checkEligibility(stakeStartTime);

        setExitCapacity(cap);
        setEfficiencyMultiplier(eff);
        setTreasuryFlags({
            paused: false,
            capReached: false,
            rateLimited: false,
            insufficientScars: scars.length === 0,
            insufficientTime: !eligible,
        });
    }, [scars, stakeStartTime]);

    // --- GOVERNANCE LOGIC ---
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [userVotes, setUserVotes] = useState<Vote[]>([]);
    const [votingPower, setVotingPower] = useState(0);

    // Calculate Voting Power Live
    useEffect(() => {
        const multiplier = efficiencyMultiplier || 1.0;
        setVotingPower(calculateVotingPower(stakedAmount, multiplier));
    }, [stakedAmount, efficiencyMultiplier]);

    // --- PERSISTENCE & DATA ---
    const fetchProposals = useCallback(async () => {
        let proposalsLoaded = false;

        // Helper for API Fallback
        const triggerFallback = async () => {
            if (proposalsLoaded) return;
            try {
                const res = await fetch("/api/data/proposals");
                if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
                    const data = await res.json();
                    setProposals(data);
                    proposalsLoaded = true;
                }
            } catch (e) {
                console.error("Governance API Fallback Failed", e);
            }
        };

        try {
            // Priority 1: On-Chain Fetch with Timeout
            if (wallet && connection) {
                const fetchOnChain = async () => {
                    const provider = new AnchorProvider(connection, wallet, {});
                    const program = getGovProgram(provider);

                    // Race the fetch against a 30s timeout
                    const allProposals = await Promise.race([
                        program.account.proposal.all(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error("RPC Timeout")), 30000))
                    ]) as any[];

                    const mappedProposals: Proposal[] = allProposals.map(p => {
                        const acc = p.account as any;
                        return {
                            id: p.publicKey.toBase58(),
                            title: acc.title,
                            description: acc.description,
                            author: acc.author.toBase58(),
                            votesFor: acc.votesFor?.toNumber?.() || 0,
                            votesAgainst: acc.votesAgainst?.toNumber?.() || 0,
                            createdAt: (acc.createdAt?.toNumber?.() || Date.now() / 1000) * 1000,
                            status: "Active",
                            deadline: ((acc.createdAt?.toNumber?.() || Date.now() / 1000) * 1000) + (3 * 24 * 60 * 60 * 1000),
                            domain: "SOVEREIGN",
                            resonance: {
                                amplify: acc.votesFor?.toNumber?.() || 0,
                                dampen: acc.votesAgainst?.toNumber?.() || 0
                            }
                        };
                    });

                    setProposals(mappedProposals);
                    proposalsLoaded = true;
                };

                await fetchOnChain();
            }
        } catch (e) {
            console.error("Governance On-Chain Fetch Failed, pivoting to API...", e);
        } finally {
            // Priority 2: Guaranteed API Fallback if nothing loaded
            if (!proposalsLoaded) {
                await triggerFallback();
            }
        }
    }, [wallet, connection]);



    const loadUserProfile = useCallback(async (wallet: string) => {
        try {
            const res = await fetch(`/api/data/user?wallet=${wallet}`);
            if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
                const data = await res.json();
                // Merge remote data with state
                setResonance(prev => Math.max(prev, data.resonance || 0));
                // Only merge scars if needed, for now we trust remote if it exists
                if (data.scars?.length > 0) setScars(data.scars);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        }
    }, []);

    // Load on Connect
    useEffect(() => {
        if (walletAddress) {
            loadUserProfile(walletAddress);
        }
    }, [walletAddress, loadUserProfile]);

    // Save periodically (Debounced 30s) or on major events could be better
    // For now, simpler: Save on Unmount/Change? No, explicit save is safer.
    // Let's add an Auto-Save effect for specific high-value changes like Resonance triggers
    useEffect(() => {
        const timer = setTimeout(() => {
            if (walletAddress) saveUserProfile();
        }, 5000); // Auto-save 5s after changes settle
        return () => clearTimeout(timer);
    }, [resonance, scars, saveUserProfile, walletAddress]);

    // Fetch Governance
    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    const castVote = async (proposalId: string, choice: "amplify" | "dampen") => {
        if (!walletAddress) return; // Guard

        // Prevent double voting (moved from original)
        if (userVotes.some(v => v.proposalId === proposalId)) {
            alert("Resonance already established for this proposal.");
            return;
        }

        const power = calculateVotingPower(stakedAmount, efficiencyMultiplier); // Use efficiencyMultiplier from state
        if (power <= 0) {
            alert("Insufficient Resonance. Stake Heritage to amplify your voice.");
            return;
        }

        // Optimistic UI Update
        const newVote: Vote = {
            proposalId,
            wallet: walletAddress,
            choice,
            power,
            timestamp: Date.now()
        };

        setUserVotes(prev => [...prev, newVote]);

        // Update Local State Optimistically
        setProposals(prev => prev.map(p => {
            if (p.id === proposalId) {
                return {
                    ...p,
                    resonance: {
                        ...p.resonance,
                        [choice]: p.resonance[choice] + power
                    }
                }
            }
            return p;
        }));

        // Persist
        try {
            await fetch("/api/data/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "vote",
                    proposalId,
                    choice,
                    power,
                    wallet: walletAddress
                })
            });
            logActivity("vote", { proposal: proposalId, choice: choice.toUpperCase(), power, wallet: walletAddress });
        } catch (e) {
            console.error("Vote failed to persist", e);
            // Revert? For now, we assume success or refresh later.
            // A more robust solution would revert the optimistic update here.
        }
    };

    // --- MARKET LOGIC ---
    const [marketState, setMarketState] = useState<MarketState>(BONDING_CURVE.getSimulationState(5_000_000)); // Start at 5M Supply

    const buyGrit = useCallback(async (amountInSol: number) => {
        if (amountInSol <= 0) return;

        const S = marketState.currentSupply;
        const m = marketState.slope;
        const X = amountInSol;

        // Inverse Integral for Linear Curve
        const amountGrit = Math.sqrt((2 * X) / m + Math.pow(S, 2)) - S;

        setGritBalance(prev => prev + amountGrit);
        setSolBalance(prev => prev - amountInSol);
        setMarketState(BONDING_CURVE.getSimulationState(S + amountGrit));

        logActivity("buy", { amount: amountGrit, cost: amountInSol, wallet: wallet?.publicKey.toBase58() });
    }, [marketState, wallet, logActivity]);

    const sellGrit = useCallback(async (amountInGrit: number) => {
        if (amountInGrit <= 0 || amountInGrit > gritBalance) return;

        const solReturn = BONDING_CURVE.getSellPrice(marketState.currentSupply, amountInGrit);

        setGritBalance(prev => prev - amountInGrit);
        setSolBalance(prev => prev + solReturn);
        setMarketState(BONDING_CURVE.getSimulationState(marketState.currentSupply - amountInGrit));

        logActivity("sell", { amount: amountInGrit, ret: solReturn, wallet: wallet?.publicKey.toBase58() });
    }, [marketState, gritBalance, wallet, logActivity]);

    const value: GritState = {
        isConnected: !!wallet,
        walletAddress: wallet?.publicKey.toBase58() || null,
        solBalance,
        gritBalance,
        moxyBalance,
        chiBalance,
        stakedAmount,
        stakingTier,
        ownedMints,
        hasAccess: gritBalance > 0,
        tracks,
        currentTrack,
        isPlaying,
        recentActivity,
        refreshBalances,
        playTrack,
        stopTrack,
        logActivity,
        discordUser,
        setDiscordUser,
        stakeStartTime,
        epochData,
        currentDomain,
        setCurrentDomain,
        scars,
        addScar,

        resonance,
        resonanceRank: resonance < 10 ? "Initiate" : resonance < 50 ? "Signal" : resonance < 250 ? "Resonant" : "Ether",
        addResonance,

        stakeMoxy: async (amount: number) => {
            if (!wallet) return;
            try {
                // 1. Prepare Transfer
                const { PublicKey, Transaction } = await import("@solana/web3.js");
                const { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
                const { TOKEN_MINTS } = await import("@/constants/tokens");

                const TREASURY_PUBKEY = new PublicKey("3phNoeLCZKcyvktjzGkzptF8UFr3Aqq1s8E4CNaFEpBB");
                const mint = new PublicKey(TOKEN_MINTS.MOXY);

                const sourceAta = await getAssociatedTokenAddress(mint, wallet.publicKey);
                const destAta = await getAssociatedTokenAddress(mint, TREASURY_PUBKEY);

                const tx = new Transaction();

                const info = await connection.getAccountInfo(destAta);
                if (!info) {
                    tx.add(createAssociatedTokenAccountInstruction(wallet.publicKey, destAta, TREASURY_PUBKEY, mint));
                }

                const amountLamports = BigInt(Math.floor(amount * 1_000_000_000));
                tx.add(createTransferInstruction(sourceAta, destAta, wallet.publicKey, amountLamports));

                // 2. Sign & Send
                const signature = await wallet.signTransaction(tx).then(signed => connection.sendRawTransaction(signed.serialize()));
                await connection.confirmTransaction(signature, "confirmed");

                // 3. Notify Backend
                await fetch("/api/staking/deposit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        signature,
                        amount,
                        wallet: wallet.publicKey.toBase58(),
                        lockPeriod: 30 * 24 * 60 * 60 * 1000
                    })
                });

                await refreshBalances();

            } catch (e: any) {
                console.error("Stake Failed:", e);
                if (e.message?.includes("User rejected")) return;
                throw e;
            }
        },
        unstakeMoxy: async () => {
            if (!wallet) return;
            try {
                const res = await fetch("/api/staking/withdraw", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wallet: wallet.publicKey.toBase58() })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Withdraw failed");

                alert(`Unstaked! Recieved: ${data.amount} MOXY. (Penalty: ${data.penalty})`);
                await refreshBalances();
            } catch (e: any) {
                console.error("Unstake Failed:", e);
                alert(e.message);
            }
        },
        claimHeritageRewards,
        // Treasury
        exitCapacity,
        efficiencyMultiplier,
        treasuryFlags,
        // Governance
        proposals,
        userVotes,
        votingPower,
        castVote,
        // Market
        marketState,
        buyGrit,
        sellGrit,
        wzrdHandle,
        fiatBalance,
        creatureMint,
    };

    return <GritContext.Provider value={value}>{children}</GritContext.Provider>;
}

export function useGritState() {
    const context = useContext(GritContext);
    if (!context) {
        throw new Error("useGritState must be used within GritStateProvider");
    }
    return context;
}
