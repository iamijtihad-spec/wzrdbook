
import { Connection, PublicKey } from "@solana/web3.js";

const RPC = "https://api.devnet.solana.com";
const connection = new Connection(RPC, "confirmed");

import fs from "fs";
import path from "path";

// Read from config
const configPath = path.resolve(__dirname, "lib/bonding-config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const CURVE_CONFIG = new PublicKey(config.curveConfig);

async function check() {
    console.log("Checking Bonding Curve on Devnet...");
    const info = await connection.getAccountInfo(CURVE_CONFIG);

    if (info) {
        console.log(`Curve Config (${CURVE_CONFIG.toBase58()}): EXISTS`);
        console.log(`Owner: ${info.owner.toBase58()}`);
        console.log(`Data Length: ${info.data.length} bytes`);
    } else {
        console.log(`Curve Config (${CURVE_CONFIG.toBase58()}): MISSING`);
    }
}

check();
