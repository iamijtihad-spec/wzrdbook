import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Perform a raw JSON-RPC request to the Solana node.
 * Bypasses web3.js schema validation to allow "StructError" prone responses.
 */
async function rpcRequest(connection: Connection, method: string, params: any[]) {
    // Hack: access private/protected rpcEndpoint if public API doesn't expose it easily,
    // or just assume we can get it from the connection object string representation or similar.
    // Actually, connection.rpcEndpoint is public.
    const endpoint = connection.rpcEndpoint;

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "raw-solana-" + Date.now(),
            method,
            params,
        }),
    });

    const json = await response.json();
    if (json.error) {
        throw new Error(`RPC Error: ${json.error.message}`);
    }
    return json.result;
}

/**
 * Raw fetching of account info.
 * Returns { data: Buffer, ... } style object or null.
 */
export async function getAccountInfoRaw(connection: Connection, pubkey: PublicKey) {
    const result = await rpcRequest(connection, "getAccountInfo", [
        pubkey.toBase58(),
        { encoding: "base64" }
    ]);

    if (!result || !result.value) return null;

    const val = result.value;
    return {
        ...val,
        data: Buffer.from(val.data[0], "base64"),
        owner: new PublicKey(val.owner),
    };
}

/**
 * Raw fetching of program accounts.
 */
export async function getProgramAccountsRaw(connection: Connection, programId: PublicKey) {
    const result = await rpcRequest(connection, "getProgramAccounts", [
        programId.toBase58(),
        { encoding: "base64" }
    ]);

    if (!Array.isArray(result)) return [];

    return result.map((item: any) => ({
        pubkey: new PublicKey(item.pubkey),
        account: {
            ...item.account,
            data: Buffer.from(item.account.data[0], "base64"),
            owner: new PublicKey(item.account.owner),
        }
    }));
}

/**
 * Raw fetching of latest blockhash.
 */
export async function getLatestBlockhashRaw(connection: Connection) {
    const result = await rpcRequest(connection, "getLatestBlockhash", [
        { commitment: "confirmed" }
    ]);

    if (!result || !result.value) throw new Error("Failed to get blockhash");

    return {
        blockhash: result.value.blockhash,
        lastValidBlockHeight: result.value.lastValidBlockHeight
    };
}
