import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { to, subject, html, text } = await req.json();

        // Validate required fields
        if (!to || !subject || (!html && !text)) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, and html/text are required' },
                { status: 400 }
            );
        }

        // Prepare email message
        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
                name: process.env.SENDGRID_FROM_NAME || 'Wavegroww',
            },
            subject,
            ...(html && { html }),
            ...(text && { text }),
        };

        // Send email
        await sgMail.send(msg);

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error: any) {
        console.error('SendGrid Error:', error);

        // Handle SendGrid specific errors
        if (error.response) {
            console.error('SendGrid Response Error:', error.response.body);
            return NextResponse.json(
                {
                    error: 'Failed to send email',
                    details: error.response.body
                },
                { status: error.code || 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        );
    }
}
