# Grit Protocol "Reality Engine" API Stats
**Version**: 1.0.0
**Base URL**: `http://localhost:3000`

## Overview
This documentation covers the backend endpoints exposed by the Grit "White-Label OS". These endpoints are designed to be consumed by the frontend for dynamic configuration, physical asset verification, and system status.

---

## 1. Configuration
Drives the entire frontend aesthetic and logic parameters.

### `GET /api/config`
**Description**: Returns the contents of `artist.config.json`.
**Response**:
```json
{
  "artistName": "The Artist",
  "projectDescription": "A sovereign digital territory.",
  "currency": "GRIT",
  "governance": {
    "proposalFee": 100,
    "votingDelay": 0,
    "votingPeriod": 259200
  },
  "socials": {
    "discord": "",
    "twitter": ""
  }
}
```

---

## 2. Physical Bridge
Interfaces with the Physical Verification system.

### `POST /api/verify-nfc`
**Description**: Verifies a physical chip ID and mints a digital twin (POAP) if valid.
**Body**:
```json
{
  "chipId": "string",
  "walletAddress": "string (optional)"
}
```
**Response (Success)**:
```json
{
  "success": true,
  "drop": "Genesis Artifact",
  "message": "Physical Asset Verified. Digital Twin Minted."
}
```
**Response (Already Claimed)**:
```json
{
  "success": false,
  "error": "Asset already claimed by this wallet."
}
```

---

## 3. CLI Tools
Utilities for system management.

### `create-grit-app`
**Usage**: `npm run create-grit-app` (via scripts)
**Description**: Scaffolds a new artist instance by generating a fresh configuration and owner keypair.
**Prompts**:
- Artist Name
- Project Description
- Keypair Generation (Y/N)

---

## 4. Discord Integration
Interfaces with the dedicated discord bot.

### `POST /api/verify` (Bot Port: 3001)
**Description**: Links a Discord User ID to a Solana Wallet via signature verification.
**Body**:
```json
{
  "discordId": "string",
  "walletAddress": "string",
  "signature": "base64_string",
  "message": "string"
}
```
**Response**:
```json
{
  "success": true,
  "tier": "SOVEREIGN | ASCESIS | HERITAGE",
  "wallet": "..."
}
```
