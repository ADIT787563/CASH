import { db } from '@/db';
import { trafficSources } from '@/db/schema';

async function main() {
    const sources = ['campaign', 'direct', 'shared_link', 'social'] as const;
    const sourceDistribution = {
        campaign: 0.40,
        direct: 0.30,
        shared_link: 0.20,
        social: 0.10,
    };

    const sampleData = [];
    const today = new Date();
    
    // Generate data for last 90 days
    for (let dayIndex = 0; dayIndex < 90; dayIndex++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (89 - dayIndex));
        
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Base traffic: weekday 100-130, weekend 70-90
        const baseTraffic = isWeekend 
            ? Math.floor(70 + Math.random() * 20)
            : Math.floor(100 + Math.random() * 30);
        
        // Apply 15% growth over 90 days
        const growthMultiplier = 1 + (dayIndex / 90) * 0.15;
        const adjustedTraffic = Math.floor(baseTraffic * growthMultiplier);
        
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        
        // Generate records for each source
        for (const source of sources) {
            const sourcePercentage = sourceDistribution[source];
            const visits = Math.max(1, Math.floor(adjustedTraffic * sourcePercentage));
            
            sampleData.push({
                userId: 'demo-user-1',
                source,
                visits,
                date: dateStr,
                createdAt,
            });
        }
    }

    await db.insert(trafficSources).values(sampleData);
    
    console.log('✅ Traffic sources seeder completed successfully');
    console.log(`   Generated ${sampleData.length} records for 90 days`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});