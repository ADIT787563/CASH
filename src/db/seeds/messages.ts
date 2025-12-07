import { db } from '@/db';
import { messages } from '@/db/schema';

async function main() {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const getRandomDate = () => {
        const timestamp = sixtyDaysAgo.getTime() + Math.random() * (now.getTime() - sixtyDaysAgo.getTime());
        return new Date(timestamp).toISOString();
    };

    const getRandomPhone = () => {
        const numbers = ['9876543210', '9123456789', '8765432109', '7890123456', '9988776655',
            '8877665544', '7766554433', '9955443322', '8844332211', '7733221100',
            '9876512345', '8765498765', '9012345678', '8901234567', '7789012345',
            '9567890123', '8456789012', '9345678901', '8234567890', '7123456789'];
        return `+91${numbers[Math.floor(Math.random() * numbers.length)]}`;
    };

    const getRandomStatus = () => {
        const rand = Math.random();
        if (rand < 0.45) return 'read';
        if (rand < 0.75) return 'delivered';
        if (rand < 0.95) return 'sent';
        return 'failed';
    };

    const inboundMessages = [
        'Hello, mujhe aapke products ke baare mein jaanna hai',
        'Kya ye product available hai?',
        'Price kya hai iska?',
        'Delivery kitne din mein hogi?',
        'COD available hai kya?',
        'Discount mil sakta hai?',
        'Product ka size kya hai?',
        'Colors available hain kaun se?',
        'Quality kaisi hai product ki?',
        'Return policy kya hai?',
        'Warranty milti hai kya?',
        'Shipping charges kitne hain?',
        'Bulk order par discount milega?',
        'Product genuine hai na?',
        'Aur photos bhej sakte ho?',
        'Video call par dikha sakte ho product?',
        'Stock mein hai abhi?',
        'Order kaise place karun?',
        'Payment method kya kya hai?',
        'Track kar sakte hain order?',
        'Exchange kar sakte hain?',
        'Packing kaisi hoti hai?',
        'Reviews kaise hain product ke?',
        'Dusre colors available hain?',
        'Size chart bhej do please',
        'Material kya hai?',
        'Wholesale rate kya hai?',
        'Minimum order quantity?',
        'Customization ho sakta hai?',
        'Gift wrapping available hai?',
        'Same day delivery possible hai?',
        'Product original hai?',
        'Kab tak delivery hogi?',
        'Order cancel kar sakte hain?',
        'Refund kab milega?',
        'Customer care number do',
        'Installation service hai?',
        'Demo available hai?',
        'Comparison karo is product se',
        'Better option suggest karo',
        'Budget mein kuch aur hai?',
        'Offer kab tak valid hai?',
        'New stock kab aayega?',
        'Pre-order kar sakte hain?',
        'EMI facility hai?',
        'Credit card accept karte ho?',
        'UPI se payment ho sakta hai?',
        'Invoice milega kya?',
        'GST bill milega?',
        'Combo offer hai kya?',
        'Free delivery hai?',
        'Festive offer chal raha hai?',
        'Loyalty points milte hain?',
        'Referral bonus hai?',
        'WhatsApp se order ho sakta hai?'
    ];

    const outboundMessages = [
        'Namaste! Kaise help kar sakte hain aapki?',
        'Ji haan, ye product available hai',
        'Price Rs. 1,299 hai, special offer chal raha hai',
        'Delivery 3-5 business days mein ho jayegi',
        'Ji haan, COD available hai',
        '10% discount available hai is product par',
        'Multiple sizes available hain - S, M, L, XL',
        'Blue, Black, Red aur White colors hain',
        'Premium quality hai, 100% genuine product',
        '7 days return policy hai',
        '1 year manufacturer warranty hai',
        'Free shipping above Rs. 500',
        'Bulk orders par special discount milega',
        'Haan bilkul, original product hai',
        'Photos WhatsApp par bhej di hain',
        'Video call schedule kar sakte hain',
        'Ji haan, stock mein hai',
        'Website se ya WhatsApp se order kar sakte ho',
        'Cash on Delivery, UPI, Cards sab accept karte hain',
        'Haan, tracking details mil jayenge',
        'Ji haan, exchange possible hai',
        'Secure packaging karte hain hum',
        '4.5 star rating hai is product ki',
        'Haan, aur colors bhi available hain',
        'Size chart send kar di hai',
        'Premium cotton material hai',
        'Wholesale rate ka WhatsApp karo details ke liye',
        'Minimum 10 pieces order karna hoga',
        'Customization possible hai, charges alag se',
        'Gift wrapping Rs. 50 extra',
        'Same day delivery select cities mein available',
        'Authorized dealer hain hum',
        'Order placed hai, 2-3 din mein milega',
        'Order cancellation 24 hours mein possible',
        'Refund 5-7 business days mein process hoga',
        'Customer care: +91-1800-XXX-XXXX',
        'Installation charges Rs. 200',
        'Demo video send kar di hai',
        'Comparison chart send kiya hai',
        'Budget option bhi available hai',
        'Rs. 899 se products start hote hain',
        'Offer 31st December tak valid hai',
        'New stock next week aa raha hai',
        'Pre-order available hai 20% discount ke saath',
        'EMI available hai credit card par',
        'All major credit cards accept karte hain',
        'UPI payment accepted hai',
        'Invoice email kar denge',
        'GST invoice milega pakka',
        'Combo offer 2+1 free chal raha hai',
        'Free delivery orders above Rs. 500',
        'Diwali special 25% off',
        'Loyalty points milte hain har purchase par',
        'Refer karke 100 points earn karo',
        'WhatsApp se seedha order place kar sakte ho'
    ];

    const sampleMessages = [];

    for (let i = 0; i < 55; i++) {
        const hasLeadId = Math.random() < 0.8;
        const isInbound = Math.random() < 0.55;

        const phoneNumber = getRandomPhone();
        const createdAt = getRandomDate();

        sampleMessages.push({
            userId: 'demo-user-1',
            leadId: hasLeadId ? Math.floor(Math.random() * 25) + 1 : null,
            direction: isInbound ? 'inbound' : 'outbound',
            content: isInbound
                ? inboundMessages[Math.floor(Math.random() * inboundMessages.length)]
                : outboundMessages[Math.floor(Math.random() * outboundMessages.length)],
            status: getRandomStatus(),
            phoneNumber: phoneNumber,
            fromNumber: isInbound ? phoneNumber : '15550234567', // Mock business number
            toNumber: isInbound ? '15550234567' : phoneNumber,
            messageType: 'text',
            timestamp: createdAt,
            createdAt: createdAt,
        });
    }

    sampleMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    await db.insert(messages).values(sampleMessages);

    console.log('✅ Messages seeder completed successfully - 55 messages inserted');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});