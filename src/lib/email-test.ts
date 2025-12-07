/**
 * Email Service Test
 * 
 * This file demonstrates how to test the email service.
 * You can run this from any API route or component.
 */

import {
    sendEmail,
    sendWelcomeEmail,
    sendTeamInvitationEmail,
    sendPasswordResetEmail,
    sendNotificationEmail
} from '@/lib/email';

/**
 * Test basic email sending
 */
export async function testBasicEmail(recipientEmail: string) {
    console.log('Testing basic email...');

    const result = await sendEmail({
        to: recipientEmail,
        subject: 'Test Email from Wavegroww',
        html: `
      <h1>🎉 Email Service is Working!</h1>
      <p>If you're reading this, your SendGrid integration is set up correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    `,
        text: 'Email Service is Working! If you\'re reading this, your SendGrid integration is set up correctly.',
    });

    console.log('Basic email result:', result ? 'Success ✅' : 'Failed ❌');
    return result;
}

/**
 * Test welcome email template
 */
export async function testWelcomeEmail(recipientEmail: string) {
    console.log('Testing welcome email...');

    const result = await sendWelcomeEmail(recipientEmail, 'Test User');

    console.log('Welcome email result:', result ? 'Success ✅' : 'Failed ❌');
    return result;
}

/**
 * Test team invitation email template
 */
export async function testTeamInvitationEmail(recipientEmail: string) {
    console.log('Testing team invitation email...');

    const result = await sendTeamInvitationEmail(
        recipientEmail,
        'John Doe',
        'Marketing Team',
        'https://example.com/invite/test-token-123'
    );

    console.log('Team invitation email result:', result ? 'Success ✅' : 'Failed ❌');
    return result;
}

/**
 * Test password reset email template
 */
export async function testPasswordResetEmail(recipientEmail: string) {
    console.log('Testing password reset email...');

    const result = await sendPasswordResetEmail(
        recipientEmail,
        'https://example.com/reset-password?token=test-token-123'
    );

    console.log('Password reset email result:', result ? 'Success ✅' : 'Failed ❌');
    return result;
}

/**
 * Test notification email template
 */
export async function testNotificationEmail(recipientEmail: string) {
    console.log('Testing notification email...');

    const result = await sendNotificationEmail(
        recipientEmail,
        'New Message Received 📬',
        'You have a new WhatsApp message from a customer. Click below to view the conversation.',
        'https://example.com/inbox/customer-123',
        'View Message'
    );

    console.log('Notification email result:', result ? 'Success ✅' : 'Failed ❌');
    return result;
}

/**
 * Run all email tests
 */
export async function runAllEmailTests(recipientEmail: string) {
    console.log('🧪 Starting Email Service Tests...\n');

    const results = {
        basic: await testBasicEmail(recipientEmail),
        welcome: await testWelcomeEmail(recipientEmail),
        teamInvitation: await testTeamInvitationEmail(recipientEmail),
        passwordReset: await testPasswordResetEmail(recipientEmail),
        notification: await testNotificationEmail(recipientEmail),
    };

    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Basic Email: ${results.basic ? '✅' : '❌'}`);
    console.log(`Welcome Email: ${results.welcome ? '✅' : '❌'}`);
    console.log(`Team Invitation: ${results.teamInvitation ? '✅' : '❌'}`);
    console.log(`Password Reset: ${results.passwordReset ? '✅' : '❌'}`);
    console.log(`Notification: ${results.notification ? '✅' : '❌'}`);

    const allPassed = Object.values(results).every(r => r === true);
    console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);

    return results;
}

// Example usage in an API route:
//
// import { runAllEmailTests } from '@/lib/email-test';
//
// export async function GET() {
//   const results = await runAllEmailTests('your-email@example.com');
//   return NextResponse.json(results);
// }
