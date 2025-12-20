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
    items_summary?: string; // What the user wants to buy
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
5) Items/Product (Optional)

Extract the fields and output a JSON object with exactly these keys: name, phone, email, address, intent, items_summary. 
- intent: should be "order_confirmed".
- items_summary: Extract any mention of quantities or product names (e.g. "2 shirts"). If not mentioned, return empty string.
- Do NOT include any extra text, explanations, or markdown. 
- If any field is missing, set its value to an empty string.`;

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

/**
 * Generates a helpful, safe, and context-aware business response.
 * Uses conversation history and strict "FALLBACK_REQUIRED" protocol.
 */
export async function generateAIConversation(
    currentMessage: string,
    history: { role: 'user' | 'assistant' | 'system', content: string }[],
    productContext: string,
    businessContext: string
): Promise<string | null> {
    const systemPrompt = `You are a professional customer support AI for a business.
Your goal is to answer customer questions using ONLY the provided Business Context and Product Context.

STRICT RULES:
1. TRUTH: Use ONLY the context provided. Do NOT hallucinate policies, hours, or prices.
2. SAFETY: If the answer is not in the context, or if you are unsure, output EXACTLY "FALLBACK_REQUIRED".
3. TONE: Professional, concise, and helpful. Use 1-2 emojis max.
4. SALES: If products are discussed, mention price (₹) and stock status. If [Out of Stock], do not sell it.
5. LENGTH: Keep responses under 3 sentences for WhatsApp readability.

Business Context:
${businessContext}

Product Context:
${productContext}
`;

    // Construct message chain: System -> History -> Current User Message
    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
        { role: 'user', content: currentMessage } // Ensure current message is last
    ];

    try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.5, // Lower temperature for more factual responses
            max_tokens: 200,
        });

        const content = response.choices[0].message.content?.trim();

        if (content === "FALLBACK_REQUIRED") {
            return "FALLBACK_REQUIRED";
        }

        return content || null;
    } catch (error) {
        console.error('OpenAI conversation error:', error);
        return null;
    }
}

/**
 * Generates a smart reply suggestion based on the conversation history.
 */
export async function generateSmartReply(messages: { role: string, content: string }[], customerName: string): Promise<string | null> {
    const systemPrompt = `You are a helpful customer support agent for a business.
Your goal is to draft a professional, friendly, and concise reply to the customer.
- Customer Name: ${customerName}
- Tone: Helpful, Polite, Professional.
- Format: Plain text, ready to send.
- If the last message is a greeting, reply with a greeting.
- If the last message is a question, answer it if context allows, or ask for more info.
- Keep it under 2 sentences unless complex.
`;

    const chatMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 100,
        });
        return response.choices[0].message.content?.trim() || null;
    } catch (error) {
        console.error('OpenAI smart reply error:', error);
        return null;
    }
}
