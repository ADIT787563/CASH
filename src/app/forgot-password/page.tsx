"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, MessageCircle, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // @ts-ignore
      const { error } = await authClient.forgotPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (error?.code) {
        toast.error("Failed to send reset email. Please try again.");
        setIsLoading(false);
        return;
      }

      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">WaveGroww</h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Reset Your Password</h2>
          <p className="text-muted-foreground mt-2">
            {emailSent
              ? "Check your email for reset instructions"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {/* Form or Success Message */}
        <div className="glass-card rounded-2xl p-8 shadow-lg">
          {emailSent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-foreground mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-primary font-semibold">{email}</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>The link will expire in 1 hour.</p>
                <p>
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setIsLoading(false);
                    }}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Try again
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>

        {/* Made in India Badge */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Made in India 🇮🇳</p>
        </div>
      </div>
    </div>
  );
}
