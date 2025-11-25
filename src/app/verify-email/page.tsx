"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState<string | null>(emailParam);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error checking auth status:", error);
          setIsCheckingAuth(false);
          return;
        }

        if (user) {
          // User is logged in, check if email is verified
          if (user.email_confirmed_at) {
            // Email is already verified, redirect to dashboard
            router.push("/dashboard");
            return;
          }

          // User exists but email not verified - set email for display
          if (user.email && !email) {
            setEmail(user.email);
          }
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Unexpected error checking auth:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router, email]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendError("Email address not found. Please try signing up again.");
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const supabase = createClient();

      // Resend verification email using Supabase's resend method
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        console.error("Resend verification error:", error);

        // Handle specific error cases
        if (error.message.includes("rate limit")) {
          setResendError(
            "Too many requests. Please wait a few minutes before trying again.",
          );
        } else if (error.message.includes("already confirmed")) {
          setResendError(
            "This email is already verified. Please try signing in.",
          );
        } else if (error.message.includes("not found")) {
          setResendError("Account not found. Please sign up first.");
        } else {
          setResendError(
            error.message ||
              "Failed to resend verification email. Please try again.",
          );
        }
      } else {
        setResendSuccess(true);
        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setResendSuccess(false);
        }, 10000);
      }
    } catch (error) {
      console.error("Unexpected error resending verification:", error);
      setResendError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground">
            We sent you a verification link to complete your registration
          </p>
        </div>

        {/* Success Alert - Resend */}
        {resendSuccess && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-500">
              Verification Email Sent!
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-600">
              Please check your email inbox (and spam folder) for the
              verification link.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert - Resend */}
        {resendError && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Failed to Resend Email</AlertTitle>
            <AlertDescription>{resendError}</AlertDescription>
          </Alert>
        )}

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              Follow the instructions to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Display */}
            {email && (
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Verification email sent to:
                </p>
                <p className="font-medium text-foreground break-all">{email}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <div className="h-5 w-5 flex items-center justify-center text-primary font-semibold text-xs">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Check your email inbox for a message from Project 2052
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <div className="h-5 w-5 flex items-center justify-center text-primary font-semibold text-xs">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Click the verification link in the email
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <div className="h-5 w-5 flex items-center justify-center text-primary font-semibold text-xs">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    You will be automatically redirected to sign in
                  </p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-300">
                  <strong>Tip:</strong> If you don&apos;t see the email, check
                  your spam or junk folder. Make sure to mark it as &quot;not
                  spam&quot; to receive future emails.
                </p>
              </div>
            </div>

            {/* Resend Button */}
            <div className="pt-2">
              <Button
                onClick={handleResendVerification}
                disabled={isResending || !email}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <div className="w-full">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              <p>
                Need help?{" "}
                <a
                  href="mailto:support@project2052.com"
                  className="text-primary hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Information */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            The verification link will expire in 24 hours. After that,
            you&apos;ll need to request a new one.
          </p>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
