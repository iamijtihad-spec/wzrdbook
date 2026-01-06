import { NextRequest, NextResponse } from "next/server";
import { D1Client } from "@/lib/d1";
import { StorageEngine } from "@/lib/server/storage";
import { CreatureStage } from "@/lib/evolution/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mint, action } = body;

        if (!mint || !action) {
            return NextResponse.json({ success: false, error: "Missing mint or action" }, { status: 400 });
        }

        const env = (process as any).env;

        // 1. Fetch Current State
        let currentState: any;
        if (env?.DB) {
            const results = await D1Client.query("SELECT * FROM creature_states WHERE mint = ?", [mint], env);
            if (results.length === 0) throw new Error("Creature not found");
            currentState = results[0];
        } else {
            const states = await StorageEngine.read<any>("creature_states", {}, env);
            currentState = states[mint];
            if (!currentState) throw new Error("Creature not found");
        }

        // 2. Process Action
        let updates: any = {
            last_interaction: Date.now()
        };

        switch (action) {
            case "FEED":
                updates.hunger = Math.min(100, (currentState.hunger || 0) + 20);
                updates.xp = (currentState.xp || 0) + 5;
                updates.last_fed = Date.now();
                break;
            case "PLAY":
                if ((currentState.stamina || 0) < 15) throw new Error("Insufficient stamina");
                updates.happiness = Math.min(100, (currentState.happiness || 0) + 20);
                updates.stamina = Math.max(0, (currentState.stamina || 0) - 15);
                updates.xp = (currentState.xp || 0) + 15;
                break;
            case "REST":
                updates.stamina = Math.min(100, (currentState.stamina || 0) + 40);
                updates.last_slept = Date.now();
                break;
            default:
                throw new Error("Unknown action");
        }

        // 3. Level Up & Evolution Logic
        let newXp = updates.xp !== undefined ? updates.xp : currentState.xp;
        let newLevel = Math.floor(newXp / 100) + 1;
        updates.level = newLevel;

        let newStage: CreatureStage = currentState.stage;
        if (newLevel >= 50) newStage = "Elder";
        else if (newLevel >= 30) newStage = "Adult";
        else if (newLevel >= 15) newStage = "Teen";
        else if (newLevel >= 5) newStage = "Baby";
        else newStage = "Egg";

        updates.stage = newStage;

        // 4. Persist Updates
        if (env?.DB) {
            const keys = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = keys.map(k => `${k} = ?`).join(", ");
            await D1Client.execute(
                `UPDATE creature_states SET ${setClause} WHERE mint = ?`,
                [...values, mint],
                env
            );
        } else {
            await StorageEngine.update<any>("creature_states", (states) => {
                return {
                    ...states,
                    [mint]: { ...currentState, ...updates }
                };
            }, {}, env);
        }

        return NextResponse.json({
            success: true,
            newState: { ...currentState, ...updates }
        });

    } catch (e: any) {
        console.error("Interaction Failed:", e);
        return NextResponse.json({ success: false, error: e.message || "Interaction failed" }, { status: 500 });
    }
}


export const runtime = 'edge';