import { db } from '@/db';
import { analytics } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleAnalytics = [];

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isCampaignPeriod = i >= 14 && i <= 21;
        
        let totalMessages, newLeads, convertedLeads;
        
        if (isCampaignPeriod) {
            totalMessages = Math.floor(Math.random() * 21) + 50;
            newLeads = Math.floor(Math.random() * 4) + 4;
            convertedLeads = Math.floor(Math.random() * 3) + 2;
        } else if (isWeekend) {
            totalMessages = Math.floor(Math.random() * 16) + 15;
            newLeads = Math.floor(Math.random() * 3) + 1;
            convertedLeads = Math.floor(Math.random() * 3);
        } else {
            totalMessages = Math.floor(Math.random() * 21) + 25;
            newLeads = Math.floor(Math.random() * 4) + 2;
            convertedLeads = Math.floor(Math.random() * 3) + 1;
        }
        
        const inboundRatio = 0.6;
        const inboundMessages = Math.floor(totalMessages * inboundRatio);
        const outboundMessages = totalMessages - inboundMessages;
        
        const productClicks = Math.floor(totalMessages * 0.3);
        const templateSends = Math.floor(outboundMessages * 0.4);
        
        sampleAnalytics.push({
            userId: 'demo-user-1',
            date: dateStr,
            totalMessages: totalMessages,
            inboundMessages: inboundMessages,
            outboundMessages: outboundMessages,
            newLeads: newLeads,
            convertedLeads: convertedLeads,
            productClicks: productClicks,
            templateSends: templateSends,
            createdAt: date.toISOString(),
        });
    }

    await db.insert(analytics).values(sampleAnalytics);
    
    console.log('✅ Analytics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});