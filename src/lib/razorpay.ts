import Razorpay from 'razorpay';

const isProduction = process.env.NODE_ENV === 'production';

export const RAZORPAY_KEY_ID = isProduction
    ? process.env.RAZORPAY_KEY_ID_LIVE!
    : process.env.RAZORPAY_KEY_ID_TEST!;

export const RAZORPAY_KEY_SECRET = isProduction
    ? process.env.RAZORPAY_KEY_SECRET_LIVE!
    : process.env.RAZORPAY_KEY_SECRET_TEST!;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn("Razorpay keys are missing. Please check your .env file.");
}

export const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});
