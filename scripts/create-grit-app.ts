import prompts from 'prompts';
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log(`
    =========================================
       GRIT PROTOCOL: REALITY ENGINE v1.0
    =========================================
    `);

    const response = await prompts([
        {
            type: 'text',
            name: 'artistName',
            message: 'Enter Artist / Entity Name:',
            initial: 'The Artist'
        },
        {
            type: 'text',
            name: 'projectDescription',
            message: 'Enter Project Description (Manifesto):',
            initial: 'A sovereign digital territory.'
        },
        {
            type: 'confirm',
            name: 'generateKeypair',
            message: 'Generate a fresh Protocol Owner Keypair?',
            initial: true
        }
    ]);

    if (!response.artistName) {
        console.log("Aborted.");
        process.exit(0);
    }

    console.log("\n>> INITIALIZING REALITY...");

    // 1. Generate Config
    const config = {
        artistName: response.artistName,
        projectDescription: response.projectDescription,
        currency: "GRIT",
        governance: {
            proposalFee: 100,
            votingDelay: 0,
            votingPeriod: 3 * 24 * 60 * 60 // 3 days
        },
        socials: {
            discord: "",
            twitter: "",
            instagram: ""
        }
    };

    const configPath = path.join(process.cwd(), 'artist.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`[✔] Config generated: ${configPath}`);

    // 2. Generate Keypair
    if (response.generateKeypair) {
        const kp = Keypair.generate();
        const kpPath = path.join(process.cwd(), 'owner-keypair.json');
        fs.writeFileSync(kpPath, JSON.stringify(Array.from(kp.secretKey)));
        console.log(`[✔] Owner Keypair generated: ${kpPath}`);
        console.log(`    Public Key: ${kp.publicKey.toBase58()}`);
    }

    console.log(`
    =========================================
       SYSTEM READY.
       Run 'npm run dev' to launch.
    =========================================
    `);
}

main().catch(console.error);
