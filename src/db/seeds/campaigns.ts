import { db } from '@/db';
import { campaigns } from '@/db/schema';

async function main() {
    const sampleCampaigns = [
        {
            userId: 'demo-user-1',
            name: 'Diwali Festive Sale 2024',
            templateId: 1,
            status: 'completed',
            scheduledAt: new Date('2024-10-15T10:00:00Z').toISOString(),
            targetCount: 180,
            sentCount: 180,
            deliveredCount: 168,
            readCount: 115,
            createdAt: new Date('2024-10-10T09:00:00Z').toISOString(),
            updatedAt: new Date('2024-10-16T18:30:00Z').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'Winter Collection Launch',
            templateId: 2,
            status: 'running',
            scheduledAt: new Date('2024-11-01T08:00:00Z').toISOString(),
            targetCount: 120,
            sentCount: 85,
            deliveredCount: 78,
            readCount: 52,
            createdAt: new Date('2024-10-25T14:00:00Z').toISOString(),
            updatedAt: new Date('2024-11-05T16:45:00Z').toISOString(),
        },
        {
            userId: 'demo-user-1',
            name: 'Weekend Special Offers',
            templateId: 3,
            status: 'scheduled',
            scheduledAt: new Date('2024-11-15T07:00:00Z').toISOString(),
            targetCount: 150,
            sentCount: 0,
            deliveredCount: 0,
            readCount: 0,
            createdAt: new Date('2024-11-08T11:30:00Z').toISOString(),
            updatedAt: new Date('2024-11-08T11:30:00Z').toISOString(),
        }
    ];

    await db.insert(campaigns).values(sampleCampaigns);
    
    console.log('✅ Campaigns seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});