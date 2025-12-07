"use client";

import { authClient } from "@/lib/auth-client";
import { createContext, useContext, ReactNode, useEffect } from "react";
import { getOrCreateDeviceId, getDeviceName } from "@/lib/device";

type AuthContextType = {
    session: typeof authClient.$Infer.Session.session | null | undefined;
    user: typeof authClient.$Infer.Session.user | null | undefined;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: undefined,
    user: undefined,
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data, isPending } = authClient.useSession();

    // "undefined" means loading in the user's pattern
    // "null" means not logged in
    // object means logged in

    const session = isPending ? undefined : (data?.session ?? null);
    const user = isPending ? undefined : (data?.user ?? null);

    useEffect(() => {
        if (user?.id) {
            const trackDevice = async () => {
                const deviceId = getOrCreateDeviceId();
                const deviceName = getDeviceName();
                try {
                    await fetch('/api/user/devices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceId, deviceName })
                    });
                } catch (e) {
                    console.error("Failed to track device", e);
                }
            };
            trackDevice();
        }
    }, [user?.id]);

    return (
        <AuthContext.Provider value={{ session, user, loading: isPending }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
