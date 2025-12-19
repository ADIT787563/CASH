import { db } from '@/db';
import { whatsappSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface WhatsAppMessage {
    messaging_product: 'whatsapp';
    to: string;
    type: 'text' | 'template';
    text?: { body: string };
    template?: {
        name: string;
        language: { code: string };
        components?: any[];
    };
}

export class WhatsAppClient {
    private phoneNumberId: string;
    private accessToken: string;

    constructor(phoneNumberId: string, accessToken: string) {
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
    }

    static async getClient(userId: string): Promise<WhatsAppClient | null> {
        const settings = await db.select().from(whatsappSettings).where(eq(whatsappSettings.userId, userId)).limit(1);

        if (!settings.length || !settings[0].isActive) {
            return null;
        }

        return new WhatsAppClient(settings[0].phoneNumberId, settings[0].accessToken);
    }

    static getSystemClient(): WhatsAppClient {
        const phoneId = process.env.WAVEGROWW_PHONE_ID;
        const token = process.env.WAVEGROWW_ACCESS_TOKEN;

        if (!phoneId || !token) {
            throw new Error("System WhatsApp credentials not configured. Please set WAVEGROWW_PHONE_ID and WAVEGROWW_ACCESS_TOKEN.");
        }

        return new WhatsAppClient(phoneId, token);
    }

    async sendMessage(to: string, message: any): Promise<any> {
        const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

        const payload: WhatsAppMessage = {
            messaging_product: 'whatsapp',
            to,
            ...message
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to send WhatsApp message');
        }

        return data;
    }

    async sendTextMessage(to: string, text: string) {
        return this.sendMessage(to, {
            type: 'text',
            text: { body: text }
        });
    }

    async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en', components: any[] = []) {
        return this.sendMessage(to, {
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components
            }
        });
    }

    async sendOrderDetailsTemplate(to: string) {
        const message = `To place your order, please reply in this format (you can copy–paste and fill):\\n\\n1) Full Name\\n2) Phone Number\\n3) Email Address\\n4) Delivery Address (with PIN)\\n\\nExample:\\n\\nRahul Verma\\n9876543210\\nrahul@example.com\\n221002, Gomti Nagar, Lucknow`;
        return this.sendTextMessage(to, message);
    }

    async sendOnboardingMessage(to: string) {
        const message = `Welcome to Wavegroww! 🎉\\n\\nTo help you set up your WhatsApp Business account, please provide the following details:\\n\\n1) Business Name\\n2) Business Category\\n3) Business Phone Number\\n4) Business Email\\n\\nReply with these details to complete your onboarding.`;
        return this.sendTextMessage(to, message);
    }

    async sendOrderConfirmation(to: string, orderDetails: { id: string; amount: number; items?: string }) {
        let message = `✅ *Order Confirmed!* 🎉\n\nOrder ID: ${orderDetails.id}\nAmount Paid: ₹${orderDetails.amount}\n\nWe have received your payment and your order is being processed. You will receive another update when it ships! 📦`;

        if (orderDetails.items) {
            message += `\n\nItems:\n${orderDetails.items}`;
        }

        return this.sendTextMessage(to, message);
    }

    async sendPaymentLink(to: string, orderDetails: { id: string; amount: number; paymentUrl: string }) {
        const message = `🛍️ *Order Placed!* \n\nYour order #${orderDetails.id} for *₹${orderDetails.amount}* has been received.\n\nTo complete your payment and confirm the order, please visit our secure payment portal:\n\n🔗 ${orderDetails.paymentUrl}\n\nNote: You can pay via UPI or Credit/Debit Cards there.`;
        return this.sendTextMessage(to, message);
    }
}
