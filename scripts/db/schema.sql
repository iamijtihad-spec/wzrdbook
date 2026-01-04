-- Grit Dashboard: Production Schema (Cloudflare D1)

-- 1. Native Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'USER', -- 'USER' or 'ADMIN'
    created_at INTEGER
);

-- 2. Linked Identities (Wallets & Discord)
CREATE TABLE IF NOT EXISTS linked_identities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    provider TEXT NOT NULL, -- 'wallet' or 'discord'
    identifier TEXT NOT NULL, -- pubkey or discord id
    FOREIGN KEY(account_id) REFERENCES accounts(id),
    UNIQUE(provider, identifier)
);

-- 3. User Progress & States
CREATE TABLE IF NOT EXISTS users (
    account_id INTEGER PRIMARY KEY,
    resonance REAL DEFAULT 0,
    scars TEXT DEFAULT '[]', -- JSON string of scar objects
    current_domain TEXT DEFAULT 'SOVEREIGN',
    fiat_balance REAL DEFAULT 0,
    last_active INTEGER,
    FOREIGN KEY(account_id) REFERENCES accounts(id)
);

-- 2. Governance: Proposals
CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT NOT NULL,
    votes_for REAL DEFAULT 0,
    votes_against REAL DEFAULT 0,
    created_at INTEGER,
    deadline INTEGER,
    domain TEXT DEFAULT 'SOVEREIGN',
    status TEXT DEFAULT 'Active'
);

-- 3. Governance: Votes
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id TEXT NOT NULL,
    wallet TEXT NOT NULL,
    choice TEXT NOT NULL,
    power REAL NOT NULL,
    timestamp INTEGER,
    UNIQUE(proposal_id, wallet)
);

-- 4. Global Ledger (Bounties, Transfers, System)
CREATE TABLE IF NOT EXISTS ledger (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    actor TEXT,
    target TEXT,
    amount REAL,
    signature TEXT,
    meta TEXT -- JSON string
);

-- 5. Claims & Mining
CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    wallet TEXT NOT NULL,
    amount REAL NOT NULL,
    token TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    signature TEXT
);

-- 6. Evolutionary NFTs (Progeny)
CREATE TABLE IF NOT EXISTS creature_states (
    mint TEXT PRIMARY KEY,
    stage TEXT DEFAULT 'Egg',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    hunger INTEGER DEFAULT 50,
    stamina INTEGER DEFAULT 100,
    happiness INTEGER DEFAULT 50,
    last_interaction INTEGER,
    last_fed INTEGER,
    last_slept INTEGER
);

-- 7. Staking Pipeline (Custodial)
CREATE TABLE IF NOT EXISTS stakes (
    id TEXT PRIMARY KEY,
    wallet TEXT NOT NULL,
    amount REAL NOT NULL,
    start_time INTEGER NOT NULL,
    lock_period INTEGER NOT NULL, -- milliseconds
    status TEXT DEFAULT 'Active', -- 'Active', 'Withdrawn', 'Penalized'
    signature TEXT UNIQUE NOT NULL
);
