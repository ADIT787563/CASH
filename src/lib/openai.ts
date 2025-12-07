import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Lazy initialization - only create client when needed and API key is available
const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    return new OpenAI({ apiKey });
};

export interface OrderDetails {
    name: string;
    phone: string;
    email: string;
    address: string;
    intent?: string; // e.g., 'order_confirmed'
}

/**
 * Parses a free‑form WhatsApp message containing order details into a structured JSON object.
 * It uses a system prompt to instruct the model to output ONLY a JSON object matching OrderDetails.
 */
export async function parseOrderDetails(message: string): Promise<OrderDetails | null> {
    const systemPrompt = `You are a parser for WhatsApp order messages. The user will reply with their details in the following format (numbers are optional but the order of fields is consistent):

1) Full Name
2) Phone Number
3) Email Address
4) Delivery Address (with PIN)

Extract the fields and output a JSON object with exactly these keys: name, phone, email, address, intent. The intent should be the string "order_confirmed". Do NOT include any extra text, explanations, or markdown. If any field is missing, set its value to an empty string.
`;

    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
    ];

    try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // lightweight model for parsing
            messages,
            temperature: 0,
        });
        const raw = response.choices[0].message.content?.trim();
        if (!raw) return null;
        // The model should return pure JSON; attempt to parse it.
        return JSON.parse(raw) as OrderDetails;
    } catch (error) {
        console.error('OpenAI parsing error:', error);
        return null;
    }
}
