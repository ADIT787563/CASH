export interface OnboardingState {
    currentStep: number;
    profile: any | null;
    whatsapp: any | null;
}

export const onboardingService = {
    async getState(): Promise<OnboardingState> {
        const res = await fetch('/api/onboarding/state');
        if (!res.ok) throw new Error('Failed to fetch onboarding state');
        return res.json();
    },

    async submitStep1(data: any): Promise<{ success: boolean; nextStep: number }> {
        const res = await fetch('/api/onboarding/step-1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to submit step 1');
        return res.json();
    },

    async submitStep2(data: any): Promise<{ success: boolean; nextStep: number }> {
        const res = await fetch('/api/onboarding/step-2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to submit step 2');
        return res.json();
    },

    async complete(): Promise<{ success: boolean; redirectTo: string }> {
        const res = await fetch('/api/onboarding/complete', {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to complete onboarding');
        return res.json();
    }
};
