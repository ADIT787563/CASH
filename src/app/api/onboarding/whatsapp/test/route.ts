import { NextRequest, NextResponse } from "next/server";
import { WhatsAppClient } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        // This is the "Test Connection"
        const systemClient = WhatsAppClient.getSystemClient();
        await systemClient.sendTextMessage(phone, "Hello from WaveGroww! Your bot connection is active. 🚀");

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to send test message" }, { status: 500 });
    }
}
