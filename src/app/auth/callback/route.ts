/**
 * Auth Callback Route Handler
 *
 * Handles Supabase authentication callbacks for:
 * - Email verification (signup confirmation)
 * - Password reset
 * - Magic link login
 * - OAuth provider callbacks
 *
 * This route exchanges the authorization code from the URL for a session
 * and redirects the user to the appropriate page.
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle error states from Supabase
  if (error) {
    console.error("Auth callback error:", error, errorDescription);

    // Redirect to login with error message
    const errorUrl = new URL("/login", requestUrl.origin);

    // Provide user-friendly error messages
    let errorMessage = "Authentication failed. Please try again.";

    if (error === "access_denied") {
      errorMessage = "Access was denied. Please try again or contact support.";
    } else if (error === "server_error") {
      errorMessage = "A server error occurred. Please try again later.";
    } else if (error === "temporarily_unavailable") {
      errorMessage =
        "Service temporarily unavailable. Please try again in a few minutes.";
    } else if (errorDescription) {
      errorMessage = errorDescription;
    }

    errorUrl.searchParams.set("error", errorMessage);
    return NextResponse.redirect(errorUrl);
  }

  // Check if code is present
  if (!code) {
    console.error("No code provided in auth callback");
    const errorUrl = new URL("/login", requestUrl.origin);
    errorUrl.searchParams.set(
      "error",
      "Invalid authentication link. Please try again.",
    );
    return NextResponse.redirect(errorUrl);
  }

  try {
    const supabase = await createClient();

    // Exchange the code for a session
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);

      // Handle specific exchange errors
      let errorMessage =
        "Failed to verify your authentication. Please try again.";

      if (exchangeError.message.includes("expired")) {
        errorMessage =
          "This verification link has expired. Please request a new one.";
      } else if (exchangeError.message.includes("invalid")) {
        errorMessage =
          "This verification link is invalid. Please request a new one.";
      } else if (exchangeError.message.includes("already used")) {
        errorMessage =
          "This verification link has already been used. Please sign in.";
      }

      const errorUrl = new URL("/login", requestUrl.origin);
      errorUrl.searchParams.set("error", errorMessage);
      return NextResponse.redirect(errorUrl);
    }

    // Successfully authenticated
    const user = data.user;
    const session = data.session;

    if (!user || !session) {
      console.error("No user or session after code exchange");
      const errorUrl = new URL("/login", requestUrl.origin);
      errorUrl.searchParams.set(
        "error",
        "Authentication failed. Please try again.",
      );
      return NextResponse.redirect(errorUrl);
    }

    console.log("Successfully authenticated user:", user.id, user.email);

    // Determine where to redirect based on the context
    let redirectTo = next;

    // Check if this is an email verification (new signup)
    if (user.email_confirmed_at) {
      const confirmedDate = new Date(user.email_confirmed_at);
      const now = new Date();
      const timeDiff = now.getTime() - confirmedDate.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // If email was just confirmed (within last 5 minutes), show success message
      if (minutesDiff < 5) {
        redirectTo = "/login?verified=true";
      }
    }

    // Check if this is a password reset flow
    // Note: Password resets typically have a different flow and redirect
    // but we handle them here for completeness
    if (requestUrl.searchParams.get("type") === "recovery") {
      redirectTo = "/reset-password";
    }

    // Ensure the redirect URL is safe (same origin)
    const redirectUrl = new URL(redirectTo, requestUrl.origin);

    // Only allow redirects to the same origin for security
    if (redirectUrl.origin !== requestUrl.origin) {
      console.warn(
        "Attempted redirect to different origin, defaulting to dashboard",
      );
      redirectUrl.pathname = "/dashboard";
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);

    // Redirect to login with generic error
    const errorUrl = new URL("/login", requestUrl.origin);
    errorUrl.searchParams.set(
      "error",
      "An unexpected error occurred during authentication. Please try again.",
    );
    return NextResponse.redirect(errorUrl);
  }
}
