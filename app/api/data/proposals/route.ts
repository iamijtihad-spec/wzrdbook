import { NextRequest, NextResponse } from "next/server";
import { StorageEngine } from "@/lib/server/storage";
import { Proposal } from "@/lib/governance";
import { D1Client } from "@/lib/d1";

const COLLECTION = "proposals";
const INITIAL_DATA: Proposal[] = [];

export async function GET() {
    const env = (process as any).env;
    try {
        // 1. D1 Mode
        if (env?.DB) {
            const results = await D1Client.query<any>("SELECT * FROM proposals", [], env);
            const proposals: Proposal[] = results.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                author: row.author,
                votesFor: row.votes_for,
                votesAgainst: row.votes_against,
                createdAt: row.created_at,
                deadline: row.deadline,
                domain: row.domain,
                status: row.status,
                resonance: {
                    amplify: row.votes_for,
                    dampen: row.votes_against
                }
            }));
            return NextResponse.json(proposals);
        }

        // 2. Local Fallback
        const proposals = await StorageEngine.read<Proposal[]>(COLLECTION, INITIAL_DATA, env);
        return NextResponse.json(proposals);
    } catch (error) {
        console.error("Proposals GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const env = (process as any).env;
    try {
        const body = await request.json();

        // Handling VOTE action
        if (body.action === "vote") {
            const { proposalId, choice, power, wallet } = body;

            // 1. D1 Mode
            if (env?.DB) {
                // Atomic Update in D1
                const field = choice === "amplify" ? "votes_for" : "votes_against";
                await D1Client.execute(
                    `UPDATE proposals SET ${field} = ${field} + ? WHERE id = ?`,
                    [power || 1, proposalId],
                    env
                );

                // Log the individual vote if wallet provided
                if (wallet) {
                    await D1Client.execute(
                        "INSERT OR IGNORE INTO votes (proposal_id, wallet, choice, power, timestamp) VALUES (?, ?, ?, ?, ?)",
                        [proposalId, wallet, choice, power || 1, Date.now()],
                        env
                    );
                }

                return NextResponse.json({ success: true });
            }

            // 2. Local Fallback
            await StorageEngine.update<Proposal[]>(COLLECTION, (proposals) => {
                return proposals.map(p => {
                    if (p.id === proposalId) {
                        return {
                            ...p,
                            resonance: {
                                ...p.resonance,
                                [choice]: p.resonance[choice as "amplify" | "dampen"] + (power || 1)
                            }
                        };
                    }
                    return p;
                });
            }, INITIAL_DATA, env);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Proposals POST Error:", error);
        return NextResponse.json({ error: "Request processed failed" }, { status: 500 });
    }
}


export const runtime = 'edge';