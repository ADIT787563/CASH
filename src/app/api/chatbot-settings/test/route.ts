import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatbotSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { message } = body;

    // Validate required field
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ 
        error: "Message is required and must be a non-empty string",
        code: "MISSING_MESSAGE" 
      }, { status: 400 });
    }

    // Fetch user's chatbot settings
    const settings = await db.select()
      .from(chatbotSettings)
      .where(eq(chatbotSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ 
        error: 'Chatbot not configured or disabled',
        code: "CHATBOT_NOT_CONFIGURED" 
      }, { status: 400 });
    }

    const userSettings = settings[0];

    // Check if chatbot is enabled
    if (!userSettings.enabled) {
      return NextResponse.json({ 
        error: 'Chatbot not configured or disabled',
        code: "CHATBOT_DISABLED" 
      }, { status: 400 });
    }

    // Generate mock response based on tone and language
    const toneResponses: Record<string, string> = {
      friendly: "Thanks for your message! I'm here to help you with a friendly and warm approach. How can I assist you today?",
      professional: "Thank you for contacting us. We appreciate your inquiry and are ready to assist you with your needs in a professional manner.",
      casual: "Hey there! Got your message. What can I do for you?",
      formal: "We acknowledge receipt of your message. We shall attend to your inquiry with due diligence and professionalism.",
    };

    const languageGreetings: Record<string, string> = {
      en: "Hello!",
      hi: "नमस्ते!",
      es: "¡Hola!",
      fr: "Bonjour!",
      de: "Hallo!",
    };

    const tone = userSettings.tone || 'friendly';
    const language = userSettings.language || 'en';
    
    const baseResponse = toneResponses[tone] || toneResponses['friendly'];
    const greeting = languageGreetings[language] || languageGreetings['en'];
    
    const generatedResponse = `${greeting} ${baseResponse}`;

    // Check for keyword triggers
    let triggeredResponse = null;
    if (userSettings.keywordTriggers && Array.isArray(userSettings.keywordTriggers)) {
      const lowerMessage = message.toLowerCase();
      for (const trigger of userSettings.keywordTriggers) {
        if (trigger.keyword && lowerMessage.includes(trigger.keyword.toLowerCase())) {
          triggeredResponse = trigger.response;
          break;
        }
      }
    }

    // Use welcome message if configured
    let finalResponse = triggeredResponse || generatedResponse;
    if (userSettings.welcomeMessage && !triggeredResponse) {
      finalResponse = userSettings.welcomeMessage;
    }

    // Return successful test response
    return NextResponse.json({
      success: true,
      response: finalResponse,
      settings: {
        tone: userSettings.tone,
        language: userSettings.language,
        enabled: userSettings.enabled,
        autoReply: userSettings.autoReply,
        typingDelay: userSettings.typingDelay,
      },
      message: 'This is a simulated response',
      userMessage: message,
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}