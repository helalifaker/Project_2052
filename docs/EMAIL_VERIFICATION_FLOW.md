# Email Verification Flow

This document describes the email verification process for Project 2052.

## Overview

The application uses Supabase Auth for email verification. After signing up, users must verify their email address before they can access the platform.

## Components

### 1. Registration Page (`/src/app/register/page.tsx`)

**Purpose**: User signup and account creation.

**Flow**:
1. User fills out registration form (name, email, password)
2. Form validation checks password strength and field requirements
3. Upon submission:
   - Creates Supabase Auth user with `supabase.auth.signUp()`
   - Creates database user record via `/api/auth/signup`
   - Supabase automatically sends verification email
4. If email confirmation is required:
   - Redirects to `/verify-email?email=user@example.com`
5. If email confirmation is disabled (for testing):
   - Redirects to `/dashboard` after 2 seconds

### 2. Verify Email Page (`/src/app/verify-email/page.tsx`)

**Purpose**: Instructs users to check their email and verify their account.

**Features**:
- Displays the email address where verification was sent
- Shows step-by-step instructions for verification
- Provides "Resend Verification Email" button
- Auto-redirects if email is already verified
- Links back to login page
- Success/error alerts for resend operations

**Key Functions**:
- `handleResendVerification()`: Resends verification email using `supabase.auth.resend({ type: 'signup', email })`
- Automatic auth status checking on mount
- Rate limiting error handling

### 3. Auth Callback Route (`/src/app/auth/callback/route.ts`)

**Purpose**: Handles authentication callbacks from Supabase.

**Flow**:
1. User clicks verification link in email
2. Supabase redirects to `/auth/callback?code=...`
3. Route handler:
   - Extracts authorization code from URL
   - Exchanges code for session using `supabase.auth.exchangeCodeForSession(code)`
   - Handles various error states (expired, invalid, already used)
   - Determines appropriate redirect destination
   - Redirects to `/login?verified=true` for successful verification

**Supported Callback Types**:
- Email verification (signup confirmation)
- Password reset (recovery flow)
- Magic link login
- OAuth provider callbacks

**Error Handling**:
- Expired links: "This verification link has expired"
- Invalid links: "This verification link is invalid"
- Already used: "This verification link has already been used"
- Generic errors redirect to login with error message

### 4. Login Page (`/src/app/login/page.tsx`)

**Purpose**: User authentication.

**Enhanced Features**:
- Shows success alert when `?verified=true` query param is present
- Displays error messages from auth callback failures
- Standard email/password authentication
- Links to forgot password and registration pages

## User Experience Flow

### Happy Path

```
1. User visits /register
2. User fills out registration form
3. User submits form
4. Registration successful → redirects to /verify-email
5. User checks email inbox
6. User clicks verification link in email
7. Link redirects to /auth/callback?code=xxx
8. Callback handler verifies code → redirects to /login?verified=true
9. Login page shows "Email Verified" success message
10. User logs in with credentials
11. User is redirected to /dashboard
```

### Email Not Received Path

```
1. User on /verify-email page
2. User doesn't see email (checks spam folder)
3. User clicks "Resend Verification Email"
4. System resends email via supabase.auth.resend()
5. Success message appears
6. User checks email again
7. Continues from step 6 of happy path
```

### Expired Link Path

```
1. User clicks old verification link (>24 hours)
2. Redirects to /auth/callback?code=xxx
3. Callback detects expired code
4. Redirects to /login?error=This+verification+link+has+expired
5. Login page shows error alert
6. User can request new verification via /verify-email resend button
```

## Supabase Configuration Requirements

### Email Templates

Configure these in Supabase Dashboard → Authentication → Email Templates:

1. **Confirm Signup**:
   - Subject: "Verify your email for Project 2052"
   - Redirect URL: `https://yourdomain.com/auth/callback`

2. **Magic Link**:
   - Redirect URL: `https://yourdomain.com/auth/callback`

3. **Change Email Address**:
   - Redirect URL: `https://yourdomain.com/auth/callback`

4. **Reset Password**:
   - Redirect URL: `https://yourdomain.com/auth/callback?type=recovery`

### Email Settings

In Supabase Dashboard → Authentication → Settings:

- **Enable email confirmations**: ON (required for verification flow)
- **Email confirmation expiry**: 24 hours (default)
- **Email rate limit**: Prevent abuse (recommended: 3-4 per hour per email)

### URL Configuration

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**:
  - `https://yourdomain.com/auth/callback`
  - `http://localhost:3000/auth/callback` (for local development)

## Testing

### Local Development

1. Set up Supabase email redirect for localhost:
   ```
   http://localhost:3000/auth/callback
   ```

2. For faster testing, you can disable email confirmation:
   - Supabase Dashboard → Authentication → Settings
   - Disable "Enable email confirmations"
   - Note: This should only be done in development

3. Monitor email sending:
   - Supabase Dashboard → Authentication → Logs
   - Check for email delivery status

### Email Testing Tools

- **Mailtrap**: For testing email delivery in development
- **Ethereal Email**: Free fake SMTP service for testing
- **Supabase Inbucket**: Built-in email testing (for local Supabase)

### Test Cases

1. **Successful Registration & Verification**
   - Register new user
   - Verify email received
   - Click verification link
   - Verify redirect to login with success message
   - Login successfully

2. **Resend Verification Email**
   - Register new user
   - Navigate to /verify-email
   - Click "Resend Verification Email"
   - Verify new email received
   - Complete verification

3. **Expired Link**
   - Generate verification link
   - Wait for expiration (or manually test with old link)
   - Verify appropriate error message
   - Test resend functionality

4. **Rate Limiting**
   - Click "Resend" multiple times rapidly
   - Verify rate limit error message appears
   - Wait and verify resend works again

5. **Already Verified**
   - Complete verification
   - Try clicking verification link again
   - Verify appropriate error message

## Security Considerations

1. **Code Exchange**: The callback route uses PKCE (Proof Key for Code Exchange) automatically through Supabase's `exchangeCodeForSession()` method.

2. **Rate Limiting**: Supabase enforces rate limits on email sending to prevent abuse.

3. **Link Expiration**: Verification links expire after 24 hours.

4. **Single Use**: Verification codes can only be used once.

5. **Same Origin Redirects**: The callback route validates that redirects are to the same origin to prevent open redirect vulnerabilities.

## Environment Variables

Required environment variables:

```env
# Client-side (public)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# Server-side (secret)
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_URL=your-project-url
```

## Troubleshooting

### User doesn't receive verification email

1. Check spam/junk folder
2. Verify email settings in Supabase Dashboard
3. Check Supabase logs for email delivery errors
4. Verify SMTP configuration is correct
5. Use resend functionality

### Verification link doesn't work

1. Check if link has expired (>24 hours)
2. Verify callback route is accessible
3. Check browser console for errors
4. Verify environment variables are set correctly
5. Check Supabase logs for auth errors

### "Already verified" error but can't login

1. User might have verified but not completed database user creation
2. Check database for user record
3. Verify Supabase Auth user exists
4. Check API logs for `/api/auth/signup` errors

### Rate limit errors

1. User is clicking resend too frequently
2. Wait a few minutes before retrying
3. Adjust rate limits in Supabase if needed for testing

## Related Files

- `/src/app/register/page.tsx` - Registration form
- `/src/app/verify-email/page.tsx` - Email verification instructions
- `/src/app/auth/callback/route.ts` - Auth callback handler
- `/src/app/login/page.tsx` - Login form with verification status
- `/src/lib/supabase/client.ts` - Client-side Supabase utilities
- `/src/lib/supabase/server.ts` - Server-side Supabase utilities

## Future Enhancements

Potential improvements for the verification flow:

1. **Auto-login after verification**: Automatically log users in after email verification instead of requiring manual login
2. **Email change verification**: Support for changing email addresses with re-verification
3. **Phone number verification**: Add SMS verification as an alternative
4. **Social auth integration**: OAuth providers (Google, GitHub, etc.)
5. **Verification reminders**: Send reminder emails if user hasn't verified after X days
6. **Custom email templates**: Branded, custom-designed verification emails
7. **Multi-factor authentication**: Add 2FA support after initial verification
