// app/api/telegram-password/route.ts
import { NextResponse } from "next/server";
import { makeCode } from "@/lib/makeCode";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;     // your personal chat‑id
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/* ───────────────────────── POST  ───────────────────────── */
export async function POST(req: Request) {
    /* 1‑a.  Parse Telegram update */
    const update = await req.json();
    const msg     = update.message ?? update.edited_message;
    const text    = msg?.text?.trim();
    const chat_id = msg?.chat?.id?.toString();

    /* 1‑b.  Ignore anything that isn’t a plain text message */
    if (!text || !chat_id) {
        return NextResponse.json({ ok: true });
    }

    /* 2.  Respond to /password from the *admin* only            */
    if (text === "/password" && chat_id === ADMIN_CHAT_ID) {
        const code = makeCode();                        // 4‑digit rolling code

        await fetch(`${TG_API}/sendMessage`, {
            method : "POST",
            headers: { "Content-Type": "application/json" },
            body   : JSON.stringify({
                chat_id,
                text      : `🔐 Current IELTS Mock‑Test Code: *${code}*`,
                parse_mode: "Markdown",
            }),
        });
    }

    /* 3.  Always 200 so Telegram marks update as handled        */
    return NextResponse.json({ ok: true });
}

/* ───────────────────────── GET  ─────────────────────────── */
export function GET() {
    /* Browsers hit /api/telegram-password by mistake ⇒ 405 */
    return new Response("Method Not Allowed", { status: 405 });
}
