const { Connection, PublicKey } = require("@solana/web3.js");
const { BorshCoder } = require("@coral-xyz/anchor");
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Load Configs
    const configPath = path.join(__dirname, "../lib/bonding-config.json");
    const idlPath = path.join(__dirname, "../lib/idl/grit_bonding.json");

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

    // 2. Setup Connection (Try localhost first, or user env if set)
    const rpcUrl = "http://127.0.0.1:8899";
    const connection = new Connection(rpcUrl, "confirmed");

    const curveConfigPubkey = new PublicKey(config.curveConfig);

    console.log(`Inspecting Curve Config: ${curveConfigPubkey.toBase58()}`);

    // 3. Fetch Account
    const info = await connection.getAccountInfo(curveConfigPubkey);
    if (!info) {
        console.error("Account not found! It might not be initialized.");
        return;
    }

    // 4. Decode
    // Manually decode if Coder is complex to setup in raw JS script, 
    // but Coder is best. We need IDL.
    // Minimal decoder based on layout:
    // Pubkey (32), u64 (8), u64 (8), u64 (8), u64 (8) = 64 bytes + discriminator (8) = 72 bytes.

    const data = info.data;
    // Skip 8 byte discriminator
    const buffer = data.subarray(8);

    // Helper to read u64 LE
    const readU64 = (buf, offset) => {
        const lo = buf.readUInt32LE(offset);
        const hi = buf.readUInt32LE(offset + 4);
        return BigInt(lo) + (BigInt(hi) << 32n);
    };

    const authority = new PublicKey(buffer.subarray(0, 32)).toBase58();
    const slope = readU64(buffer, 32);
    const basePrice = readU64(buffer, 40);
    const totalSupply = readU64(buffer, 48);
    const reserveBalance = readU64(buffer, 56);

    console.log({
        authority,
        slope: slope.toString(),
        basePrice: basePrice.toString(),
        totalSupply: totalSupply.toString(),
        reserveBalance: reserveBalance.toString()
    });
}

main().catch(console.error);
