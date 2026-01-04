import { Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";

const SECRET_PATH = path.join(process.cwd(), "secrets/staking-wallet.json");

if (fs.existsSync(SECRET_PATH)) {
    console.log("Treasury already exists at:", SECRET_PATH);
    const secret = JSON.parse(fs.readFileSync(SECRET_PATH, "utf-8"));
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
    console.log("Public Key:", keypair.publicKey.toBase58());
} else {
    console.log("Generating new Treasury...");
    const keypair = Keypair.generate();
    fs.writeFileSync(SECRET_PATH, JSON.stringify(Array.from(keypair.secretKey)));
    console.log("✅ Treasury Created!");
    console.log("Public Key:", keypair.publicKey.toBase58());
    console.log("Saved to:", SECRET_PATH);
}
