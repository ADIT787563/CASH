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
            welcomeMessage: 'Namaste! 🙏 Welcome to our store. Hum aapki kaise madad kar sakte hain? \n\n✨ Humari popular products:\n👗 Kurtis & Sarees\n📱 Mobile Accessories\n👜 Fashion Items\n\nReply with your choice ya apna question poochiye! 😊',
            awayMessage: 'Thank you for your message! 🙏\n\nHum currently available nahi hain, but jald hi aapko reply karenge.\n\nBusiness Hours: 9 AM - 9 PM (Mon-Sat)\n\nUrgent queries ke liye: +919876543210\n\nDhanyavaad! 😊',
            createdAt: new Date('2024-10-25T08:00:00.000Z').toISOString(),
            updatedAt: new Date('2024-12-01T10:30:00.000Z').toISOString(),
        }
    ];

    await db.insert(chatbotSettings).values(sampleChatbotSettings);
    
    console.log('✅ Chatbot settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});