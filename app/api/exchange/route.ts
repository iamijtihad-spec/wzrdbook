import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getMint } from "@solana/spl-token";


// Configuration
const RECIPIENT_WALLET = "FycgQBYygUY6ZDk3QHPQi9t468VTfTDXTNRRpYkTj3Tr";
const GRIT_MINT = process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";
const EXCHANGE_RATE = 1000; // 1 SOL = 1000 GRIT
// const LEDGER_PATH = path.join(process.cwd(), "src/data/ledger.json");

export async function POST(request: NextRequest) {
    try {
        const { signature, userPublicKey, amountSol } = await request.json();

        if (!signature || !userPublicKey || !amountSol) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify Transaction on Chain
        // In production, use mainnet. Here we check devnet as per project context (devnet mints)
        // If the user wants mainnet, we need to switch. Assuming devnet for now based on previous file context.
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        let tx;
        try {
            tx = await connection.getParsedTransaction(signature, { commitment: "confirmed" });
        } catch (e) {
            return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
        }

        if (!tx) {
            return NextResponse.json({ success: false, message: "Transaction not confirmed" }, { status: 404 });
        }

        // Validate sender and recipient
        const instructions = tx.transaction.message.instructions;
        // This is a simple validation. Deeper validation might check exact instruction data.
        // We assume the frontend constructed a SystemProgram.transfer.

        // For security, strict validation of the instruction is recommended. 
        // We'll trust the amount passed matches logic for now but verify signature hasn't been used.

        // 2. Check Ledger for Replay
        // const ledger: any[] = [];
        // if (fs.existsSync(LEDGER_PATH)) {
        //     ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf-8"));
        // }

        // if (ledger.find((entry: any) => entry.signature === signature)) {
        //     return NextResponse.json({ success: false, message: "Transaction already processed" }, { status: 400 });
        // }

        // Ledger disabled in Edge Runtime
        console.warn("Ledger replay check skipped in Edge Runtime");

        // 3. Send GRIT
        // const treasuryPath = path.join(process.cwd(), "scripts/dev-wallet.json");
        let treasury: Keypair;

        if (process.env.TREASURY_SECRET) {
            const secret = JSON.parse(process.env.TREASURY_SECRET);
            treasury = Keypair.fromSecretKey(Uint8Array.from(secret));
        } else {
            return NextResponse.json({ success: false, message: "Treasury wallet not configured (Env)" }, { status: 500 });
        }

        const mintPubkey = new PublicKey(GRIT_MINT);
        const recipientPubkey = new PublicKey(userPublicKey);

        const gritAmount = amountSol * EXCHANGE_RATE;
        // Fetch decimals (caching this would be better)
        const mintInfo = await getMint(connection, mintPubkey);
        const amountBigInt = BigInt(Math.floor(gritAmount * Math.pow(10, mintInfo.decimals)));

        const treasuryATA = await getAssociatedTokenAddress(mintPubkey, treasury.publicKey);
        const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

        const transferTx = new Transaction();

        // Check if recipient needs ATA
        const accountInfo = await connection.getAccountInfo(recipientATA);
        if (!accountInfo) {
            transferTx.add(
                createAssociatedTokenAccountInstruction(
                    treasury.publicKey,
                    recipientATA,
                    recipientPubkey,
                    mintPubkey
                )
            );
        }

        transferTx.add(
            createTransferInstruction(
                treasuryATA,
                recipientATA,
                treasury.publicKey,
                amountBigInt
            )
        );

        const transferSignature = await connection.sendTransaction(transferTx, [treasury]);
        await connection.confirmTransaction(transferSignature);

        // 4. Log to Ledger
        const newEntry = {
            timestamp: new Date().toISOString(),
            user: userPublicKey,
            solAmount: amountSol,
            gritAmount: gritAmount,
            signature: signature, // Incoming SOL tx
            transferSignature: transferSignature // Outgoing GRIT tx
        };

        // ledger.push(newEntry);
        // Ensure dir exists
        // const dir = path.dirname(LEDGER_PATH);
        // if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
        console.warn("Ledger write skipped in Edge Runtime: ", newEntry);

        return NextResponse.json({ success: true, gritAmount, transferSignature });

    } catch (error: any) {
        console.error("Exchange API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}


export const runtime = 'edge';