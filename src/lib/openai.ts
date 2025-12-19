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
 * Generates a helpful sales response based on the user's message and available product context.
 */
export async function generateSalesReply(message: string, productContext: string): Promise<string | null> {
    const systemPrompt = `You are a helpful and friendly sales assistant on WhatsApp for a store.
Your goal is to answer customer questions about products using ONLY the provided context.
- Be concise and friendly.
- Use emojis 🛍️✨.
- If the user asks for a product mentioned in the context, give details (price, variants) and ask if they want to buy.
- If a product is marked as [Out of Stock] in the context, you MUST inform the customer that it is currently unavailable and suggest alternatives.
- Do NOT offer to add out-of-stock items to an order.
- Mention prices clearly in INR (₹).
- Don't invent products.
- End with a call to action like "Shall I add this to your order?" (only for in-stock items) or "Want to see our other available options?".

Context (Available Products):
${productContext}
`;

    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
    ];

    try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7, // Slightly creative but grounded
            max_tokens: 150,
        });
        return response.choices[0].message.content?.trim() || null;
    } catch (error) {
        console.error('OpenAI sales reply error:', error);
        return null;
    }
}
