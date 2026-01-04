
import fetch from "node-fetch";

async function main() {
    const API_URL = "http://localhost:3000/api/admin/bounty/payout";
    const TARGET_WALLET = "63EEC9FfGyKsYAqaJ1aa33sH1H5K9tA1t9QhW9Jg2gH"; // Example User (or use dev wallet public key)
    const MINT = "GrTfDDmiqvVTq11nAMai2bfMPD3CwjjC6CXnsRfG2c8K"; // TOUR TICKET 2025

    console.log(`🎁 Requesting Bounty Payout...`);
    console.log(`   Recipient: ${TARGET_WALLET}`);
    console.log(`   Mint:      ${MINT}`);

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient: TARGET_WALLET,
                nftMint: MINT
            })
        });

        const data = await res.json();
        console.log("\nResponse:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

main();
