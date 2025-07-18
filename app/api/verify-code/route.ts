import { NextResponse } from "next/server";
import { makeCode } from "@/lib/makeCode";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(req: Request) {
    const { code } = await req.json();
    const validCode = makeCode();

    if (code !== validCode) {
        await fetch(`${TG_API}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: `🚫 Wrong IELTS mock test code attempt: ${code}`,
            }),
        });

        return NextResponse.json(
            { success: false, message: "Invalid code" },
            { status: 401 },
        );
    }

    return NextResponse.json({ success: true });
}

export function GET() {
    return new Response("Method Not Allowed", { status: 405 });
}
