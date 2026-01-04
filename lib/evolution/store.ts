import fs from 'fs';
import path from 'path';
import { CosmicCreature } from './types';

// Simple JSON file store
const DATA_FILE = path.join(process.cwd(), 'data', 'creatures.json');

// Ensure directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

interface StoreData {
    creatures: Record<string, CosmicCreature>; // Keyed by ID/Mint
    userCreatures: Record<string, string[]>; // Wallet -> [CreatureIDs]
}

function loadStore(): StoreData {
    if (!fs.existsSync(DATA_FILE)) {
        return { creatures: {}, userCreatures: {} };
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load creature store", e);
        return { creatures: {}, userCreatures: {} };
    }
}

function saveStore(data: StoreData) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Store API
export function getCreaturesForWallet(wallet: string): CosmicCreature[] {
    const data = loadStore();
    const ids = data.userCreatures[wallet] || [];
    return ids.map(id => data.creatures[id]).filter(Boolean);
}

export function getCreature(id: string): CosmicCreature | null {
    const data = loadStore();
    return data.creatures[id] || null;
}

export function saveCreature(creature: CosmicCreature, wallet: string) {
    const data = loadStore();

    // Save Creature
    data.creatures[creature.mint] = creature;

    // Link to Wallet if new
    const userList = data.userCreatures[wallet] || [];
    if (!userList.includes(creature.mint)) {
        userList.push(creature.mint);
        data.userCreatures[wallet] = userList;
    }

    saveStore(data);
}

export function updateCreature(id: string, updates: Partial<CosmicCreature>) {
    const data = loadStore();
    const creature = data.creatures[id];
    if (creature) {
        Object.assign(creature, updates);
        if (updates.state) {
            Object.assign(creature.state, updates.state);
        }
        data.creatures[id] = creature;
        saveStore(data);
        return creature;
    }
    return null;
}
