import { db } from '@/db';
import { chatbotSettings } from '@/db/schema';

async function main() {
    const sampleChatbotSettings = [
        {
            userId: 'demo-user-1',
            enabled: true,
            autoReply: true,
            language: 'hi',
            tone: 'friendly',
            typingDelay: 2,
            businessHoursOnly: false,
            welcomeMessage: 'नमस्ते! 🙏 Welcome to our store! How can I help you today? कैसे मदद कर सकते हैं?',
            awayMessage: 'Thank you for contacting us! हमारे business hours: Mon-Sat 9AM-8PM. We will reply during business hours. धन्यवाद!',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        }
    ];

    await db.insert(chatbotSettings).values(sampleChatbotSettings);
    
    console.log('✅ Chatbot settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});