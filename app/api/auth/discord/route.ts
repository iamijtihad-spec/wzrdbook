import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_APP_ID || "1449490953256566837";
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "T4cUiaWxS-wqwOsQJ6mN2i5k1Hxiz2VE";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/auth/discord`;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "";
    const isFromRegistration = searchParams.get("from_registration") === "true" || state.includes("from_registration=true");

    if (!code) {
        // Redirect to Discord OAuth (for manual triggers or non-registration flows)
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: "code",
            scope: "identify guilds.join",
            state: state || "",
        });
        return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
    }

    // Exchange Code for Token
    try {
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error("Failed to get access token");

        // Get User ID
        const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();

        // Redirect back to dashboard or registration
        if (isFromRegistration) {
            return NextResponse.redirect(new URL(`/register?discord_linked=true&discord_id=${userData.id}&discord_username=${userData.username}`, req.url));
        }

        return NextResponse.redirect(new URL(`/?discord_linked=true&discord_id=${userData.id}`, req.url));

    } catch (error) {
        console.error("Discord Auth Error:", error);
        return NextResponse.json({ error: "Auth failed" }, { status: 500 });
    }
}
