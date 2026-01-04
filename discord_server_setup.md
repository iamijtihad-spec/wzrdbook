# WZRD Discord Server Blueprint

**Objective**: Create a server structure that mirrors your tokenomics hierarchy.

## 1. Roles & Permissions (Create in this order)
Go to **Server Settings > Roles** and create:

1.  **👑 WZRD KING** (Admin)
    *   Color: Gold/Yellow
    *   *Administrator* permission.
2.  **🤖 BOTS**
    *   Color: Gray
    *   *Administrator* permission (for Collab.Land later).
3.  **💎 DIAMOND HANDS** (Staking: Gold Tier)
    *   Color: Cyan/Neon Blue
    *   Display separately: ON
4.  **🪙 COIN HOLDER** (Staking: Silver Tier)
    *   Color: Silver/White
    *   Display separately: ON
5.  **🥉 INITIATE** (Staking: Bronze Tier)
    *   Color: Bronze/Orange
    *   Display separately: ON
6.  **✅ Verified** (General Holder)
    *   Color: Green

## 2. Categories & Channels

### 🟢 START HERE (Public)
*   `#👋-welcome`: Read-only. Rules + "Verify Here" button (Collab.Land setups go here).
*   `#📢-announcements`: Read-only. Official updates.
*   `#🔗-official-links`: Read-only. Links to Dashboard, Bonding Curve, Twitter.

### 🌊 THE PUBLIC SEA (Everyone)
*   `#💬-general`: Open chat.
*   `#🐸-memes`: Image only mode.
*   `#📈-bonding-curve`: Feed of buys/sells (Hook up a bot later).

### 🏰 THE CITADEL (Gated)
*   `#🧠-council`: **Visible only to Silver & Gold**. High-level governance chat.
*   `#🥂-backstage`: **Visible only to Gold**. Direct access to you (The Artist).

## 3. Bot Setup (Future Step)
Once the server is created:
1.  Add **Collab.Land** or **Matrica**.
2.  Configure Token Gating Rules:
    *   **Gold Tier**: Balance of `2FFh...` (MOXY) >= 10,000
    *   **Silver Tier**: Balance of `2FFh...` (MOXY) >= 1,000
    *   **Bronze Tier**: Balance of `2FFh...` (MOXY) >= 100
