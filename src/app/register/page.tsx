"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  withTimeout,
  isTimeoutError,
  AUTH_TIMEOUT_MS,
  API_TIMEOUT_MS,
} from "@/lib/utils/timeout";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import {
  APP_NAME,
  NAME_VALIDATION,
  PASSWORD_VALIDATION,
} from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = NAME_VALIDATION.messages.required;
    } else if (formData.name.trim().length < NAME_VALIDATION.minLength) {
      newErrors.name = NAME_VALIDATION.messages.tooShort;
    } else if (formData.name.trim().length > NAME_VALIDATION.maxLength) {
      newErrors.name = NAME_VALIDATION.messages.tooLong;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = PASSWORD_VALIDATION.messages.required;
    } else if (formData.password.length < PASSWORD_VALIDATION.minLength) {
      newErrors.password = PASSWORD_VALIDATION.messages.tooShort;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must include uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = PASSWORD_VALIDATION.messages.mismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError("");
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Step 1: Sign up with Supabase Auth (with timeout protection)
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              name: formData.name.trim(),
            },
          },
        }),
        AUTH_TIMEOUT_MS,
        "Registration timed out. Please check your connection and try again.",
      );

      if (authError) {
        console.error("Supabase signup error:", authError);

        // Handle specific Supabase errors
        if (authError.message.includes("already registered")) {
          setGeneralError(
            "This email is already registered. Please sign in instead.",
          );
        } else if (authError.message.includes("password")) {
          setGeneralError(
            "Password does not meet requirements. Please use a stronger password.",
          );
        } else {
          setGeneralError(
            authError.message || "Failed to create account. Please try again.",
          );
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setGeneralError("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Create user in database via API (with timeout protection)
      try {
        const response = await withTimeout(
          fetch("/api/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email.trim(),
              name: formData.name.trim(),
              supabaseUserId: authData.user.id,
            }),
          }),
          API_TIMEOUT_MS,
          "Database registration timed out. Your account was created but may need support assistance.",
        );

        const result = await response.json();

        if (!response.ok) {
          console.error("Database user creation error:", result);

          // If database creation fails, we should ideally delete the Supabase user
          // but for now we'll just show an error
          if (result.error?.includes("already exists")) {
            setGeneralError("Account already exists. Please sign in instead.");
          } else {
            setGeneralError(
              result.error ||
                "Failed to complete registration. Please contact support.",
            );
          }
          setLoading(false);
          return;
        }

        // Success! Redirect to verify-email page
        setSuccess(true);
        setLoading(false);

        // Check if email confirmation is required
        // If user.email_confirmed_at is null, they need to verify email
        if (!authData.user.email_confirmed_at) {
          // Email confirmation is required - redirect to verify-email page
          setTimeout(() => {
            router.push(
              `/verify-email?email=${encodeURIComponent(formData.email.trim())}`,
            );
          }, 1500);
        } else {
          // No email confirmation required - redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (dbError) {
        console.error("Error creating database user:", dbError);
        setGeneralError(
          "Failed to complete registration. Please contact support.",
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
      if (isTimeoutError(error)) {
        setGeneralError(error.message);
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">
            Join {APP_NAME} to start managing lease proposals
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-success-500 bg-success-100 dark:bg-success-700/20">
            <CheckCircle2 className="h-5 w-5 text-success-700 dark:text-success-500" />
            <AlertTitle className="text-success-700 dark:text-success-500">
              Account Created Successfully!
            </AlertTitle>
            <AlertDescription className="text-success-700 dark:text-success-600">
              Please check your email to verify your account. You may need to
              check your spam folder. After verification, you can sign in to
              access the platform.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {generalError && !success && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={loading || success}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  autoComplete="name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={loading || success}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  autoComplete="email"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    disabled={loading || success}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : "password-hint"
                    }
                    autoComplete="new-password"
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || success}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password}
                  </p>
                ) : (
                  <p
                    id="password-hint"
                    className="text-xs text-muted-foreground"
                  >
                    At least 8 characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    disabled={loading || success}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    autoComplete="new-password"
                    className={
                      errors.confirmPassword
                        ? "border-destructive pr-10"
                        : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading || success}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="text-sm text-destructive"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || success}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Account Created
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help */}
        <div className="text-center text-sm text-muted-foreground">
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
      </div>
    </div>
  );
}
