"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import {
  withTimeout,
  isTimeoutError,
  AUTH_TIMEOUT_MS,
} from "@/lib/utils/timeout";
import {
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          "Session verification timed out. Please refresh and try again.",
        );

        if (!session) {
          setError(
            "Invalid or expired reset link. Please request a new password reset.",
          );
          setIsValidSession(false);
        } else {
          setIsValidSession(true);
        }
      } catch (err) {
        console.error("Session check error:", err);
        if (isTimeoutError(err)) {
          setError(err.message);
        } else {
          setError("Unable to verify reset link. Please try again.");
        }
        setIsValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Validate passwords
      if (!password || !confirmPassword) {
        throw new Error("Please fill in all fields");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const supabase = createClient();

      // Update password with timeout protection
      const { error: updateError } = await withTimeout(
        supabase.auth.updateUser({
          password: password,
        }),
        AUTH_TIMEOUT_MS,
        "Password update timed out. Please try again.",
      );

      if (updateError) {
        throw updateError;
      }

      // Success
      setSuccess(true);

      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Password reset error:", err);

      // Handle different error types
      if (isTimeoutError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        if (err.message.includes("session")) {
          setError(
            "Your session has expired. Please request a new password reset link.",
          );
        } else if (err.message.includes("network")) {
          setError(
            "Network error. Please check your connection and try again.",
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Verifying reset link...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        {/* Reset Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            {!isValidSession ? (
              // Invalid Session
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{error || "Invalid or expired reset link."}</p>
                    <p className="text-sm">
                      Please request a new password reset from the{" "}
                      <Link
                        href="/forgot-password"
                        className="font-medium underline"
                      >
                        forgot password
                      </Link>{" "}
                      page.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : success ? (
              // Success Message
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  <div className="space-y-2">
                    <p className="font-medium">Password reset successful!</p>
                    <p className="text-sm">
                      Your password has been updated. Redirecting to sign in...
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              // Form
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                      autoFocus
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and
                    numbers
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicators */}
                <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium">Password Requirements:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li
                      className={password.length >= 8 ? "text-green-500" : ""}
                    >
                      {password.length >= 8 ? "✓" : "○"} At least 8 characters
                    </li>
                    <li
                      className={/[A-Z]/.test(password) ? "text-green-500" : ""}
                    >
                      {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                    </li>
                    <li
                      className={/[a-z]/.test(password) ? "text-green-500" : ""}
                    >
                      {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter
                    </li>
                    <li
                      className={/[0-9]/.test(password) ? "text-green-500" : ""}
                    >
                      {/[0-9]/.test(password) ? "✓" : "○"} One number
                    </li>
                    <li
                      className={
                        password && password === confirmPassword
                          ? "text-green-500"
                          : ""
                      }
                    >
                      {password && password === confirmPassword ? "✓" : "○"}{" "}
                      Passwords match
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground w-full">
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            End-to-end proposal, negotiation, and financial modeling platform
          </p>
        </div>
      </div>
    </div>
  );
}
