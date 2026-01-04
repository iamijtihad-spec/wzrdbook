import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';

async function checkEndpoint(name: string, url: string, method: 'GET' | 'POST' = 'GET', body = {}) {
    try {
        console.log(`[?] Checking ${name} (${url})...`);
        if (method === 'GET') {
            await axios.get(url);
        } else {
            await axios.post(url, body);
        }
        console.log(`[✔] ${name} is reachable.`);
        return true;
    } catch (e: any) {
        if (e.response && (e.response.status === 400 || e.response.status === 200)) {
            // 400 is often "Bad Request" which means the endpoint IS reachable but logic rejected mock data.
            // We accept this as "reachable" for a health check unless it's a 404/500.
            console.log(`[✔] ${name} responded (Status: ${e.response.status}).`);
            return true;
        }
        console.error(`[X] ${name} FAILED: ${e.message}`);
        return false;
    }
}

async function checkSmartContract() {
    console.log(`[?] Checking Smart Contract...`);
    const programId = "DkGgmgd3RNGjDQ3oLsSmi7z4PUN7sJf4hCRLac7pfzFw";
    const soPath = path.join(process.cwd(), 'contracts/grit_program/target/deploy/grit_program.so');

    if (fs.existsSync(soPath)) {
        const stats = fs.statSync(soPath);
        console.log(`[✔] Binary found: ${soPath}`);
        console.log(`    Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`    Program ID: ${programId}`);
        return true;
    } else {
        console.error(`[X] Smart Contract binary NOT found at ${soPath}`);
        return false;
    }
}

async function verify() {
    console.log(`
    =========================================
       GRIT PROTOCOL: SYSTEM DIAGNOSTIC
    =========================================
    `);

    // 1. Check API Routes
    await checkEndpoint("Config API", `${BASE_URL}/api/config`);

    // We expect a specific response or error for NFC, but 404 means it's missing.
    // 405 Method Not Allowed is also a good sign it exists if we GET a POST route.
    await checkEndpoint("NFC Bridge API", `${BASE_URL}/api/verify-nfc`, 'POST', { chipId: "HEALTH_CHECK" });

    // 2. Check Smart Contract
    await checkSmartContract();

    // 3. Check Discord Bot (Mock check)
    // We assume it's running on port 3001 based on previous context
    await checkEndpoint("Discord Bot", `http://localhost:3001/health`, 'GET').catch(() => {
        console.log("[!] Discord Bot (Port 3001) might be offline or not exposing /health.");
    });

    console.log(`
    =========================================
       DIAGNOSTIC COMPLETE.
    =========================================
    `);
}

verify();
