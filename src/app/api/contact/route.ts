import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check if Resend API key is configured
        const hasResendKey = !!process.env.RESEND_API_KEY;

        if (hasResendKey) {
            try {
                // Dynamic import of Resend to avoid errors if not configured
                const { Resend } = await import('resend');
                const resend = new Resend(process.env.RESEND_API_KEY);

                // Send email to company
                const { data, error } = await resend.emails.send({
                    from: 'WaveGroww Contact <onboarding@resend.dev>',
                    to: ['WaveGroww@gmail.com'],
                    replyTo: email,
                    subject: `Contact Form: ${subject}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">
                                New Contact Form Submission
                            </h2>
                            
                            <div style="margin: 20px 0;">
                                <p style="margin: 10px 0;">
                                    <strong>Name:</strong> ${name}
                                </p>
                                <p style="margin: 10px 0;">
                                    <strong>Email:</strong> ${email}
                                </p>
                                <p style="margin: 10px 0;">
                                    <strong>Subject:</strong> ${subject}
                                </p>
                            </div>
                            
                            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #555;">Message:</h3>
                                <p style="white-space: pre-wrap; color: #333;">${message}</p>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                            
                            <p style="color: #888; font-size: 12px;">
                                This email was sent from the WaveGroww contact form.
                            </p>
                        </div>
                    `,
                });

                if (error) {
                    console.error('Resend error:', error);
                    throw error;
                }

                // Send confirmation email to user
                await resend.emails.send({
                    from: 'WaveGroww <onboarding@resend.dev>',
                    to: [email],
                    subject: 'We received your message - WaveGroww',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #0ea5e9;">Thank you for contacting WaveGroww!</h2>
                            
                            <p>Hi ${name},</p>
                            
                            <p>We've received your message and our team will get back to you within 24 hours.</p>
                            
                            <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Your message:</strong></p>
                                <p style="margin: 10px 0 0 0; color: #555;">${message}</p>
                            </div>
                            
                            <p>In the meantime, feel free to explore our <a href="https://wavegroww.com/plans" style="color: #0ea5e9;">pricing plans</a> or check out our <a href="https://wavegroww.com/features" style="color: #0ea5e9;">features</a>.</p>
                            
                            <p style="margin-top: 30px;">
                                Best regards,<br>
                                <strong>The WaveGroww Team</strong>
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            
                            <p style="color: #888; font-size: 12px;">
                                WaveGroww - WhatsApp Automation for Indian Sellers<br>
                                Khaga, Fatehpur 212655, Uttar Pradesh, India
                            </p>
                        </div>
                    `,
                });

                console.log('✅ Contact form email sent successfully via Resend');
                return NextResponse.json(
                    {
                        success: true,
                        message: 'Email sent successfully',
                        emailId: data?.id
                    },
                    { status: 200 }
                );
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Fall through to logging
            }
        }

        // Fallback: Log the contact form submission
        console.log('\n📧 ========== NEW CONTACT FORM SUBMISSION ==========');
        console.log('📅 Date:', new Date().toISOString());
        console.log('👤 Name:', name);
        console.log('✉️  Email:', email);
        console.log('📋 Subject:', subject);
        console.log('💬 Message:', message);
        console.log('================================================\n');

        // You could also save this to a database here
        // await db.insert(contactSubmissions).values({ name, email, subject, message })

        return NextResponse.json(
            {
                success: true,
                message: 'Message received successfully. We\'ll get back to you soon!',
                note: hasResendKey ? 'Email delivery attempted' : 'Logged for manual review (Resend API key not configured)'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Failed to process your message. Please try again.' },
            { status: 500 }
        );
    }
}
