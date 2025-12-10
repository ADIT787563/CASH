"use client"
import { createAuthClient } from "better-auth/react"
import { useEffect, useState, useCallback } from "react"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
   fetchOptions: {
      headers: {
         Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : ""}`,
      },
      onSuccess: async (ctx) => {
         let authToken = ctx.response.headers.get("set-auth-token");

         // Fallback: Check if token is in the response body
         if (!authToken && ctx.data) {
            const data = ctx.data as any;
            if (data.token) authToken = data.token;
            else if (data.session?.token) authToken = data.session.token;
         }

         // Store the token securely (e.g., in localStorage)
         if (authToken) {
            // Split token at "." and take only the first part
            const tokenPart = authToken.includes('.') ? authToken.split('.')[0] : authToken;
            localStorage.setItem("bearer_token", tokenPart);
         }
      }
   }
});

type SessionData = ReturnType<typeof authClient.useSession>

// Session cache with 30 second TTL
let sessionCache: { data: any; timestamp: number } | null = null;
const SESSION_CACHE_TTL = 30000; // 30 seconds

export function useSession(): SessionData {
   const [session, setSession] = useState<any>(null);
   const [isPending, setIsPending] = useState(true);
   const [error, setError] = useState<any>(null);

   const fetchSession = useCallback(async () => {
      try {
         // Check cache first
         const now = Date.now();
         if (sessionCache && (now - sessionCache.timestamp) < SESSION_CACHE_TTL) {
            setSession(sessionCache.data);
            setError(null);
            setIsPending(false);
            return;
         }

         const res = await authClient.getSession({
            fetchOptions: {
               auth: {
                  type: "Bearer",
                  token: typeof window !== 'undefined' ? localStorage.getItem("bearer_token") || "" : "",
               },
            },
         });

         // Update cache
         sessionCache = {
            data: res.data,
            timestamp: now
         };

         setSession(res.data);
         setError(null);
      } catch (err) {
         setSession(null);
         setError(err);
         sessionCache = null;
      } finally {
         setIsPending(false);
      }
   }, []);

   const refetch = useCallback(async () => {
      setIsPending(true);
      setError(null);
      sessionCache = null; // Clear cache on manual refetch
      await fetchSession();
   }, [fetchSession]);

   useEffect(() => {
      fetchSession();
   }, []); // Empty dependency - only fetch once per mount

   return { data: session, isPending, isRefetching: false, error, refetch };
}