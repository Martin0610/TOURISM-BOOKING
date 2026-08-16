# 🔐 Forgot Password Feature

## Overview
Complete password reset flow with email OTP verification for TourEase users who forgot their password.

## Implementation Details

### Database Changes
- **User Model** (Prisma Schema):
  - `resetOtp`: String? — Stores 6-digit OTP
  - `resetOtpExpiry`: DateTime? — OTP expiration time (10 minutes)

### API Routes Created

#### 1. `/api/auth/forgot-password` (POST)
- **Purpose**: Request password reset OTP
- **Input**: `{ email: string }`
- **Process**:
  - Validates user exists
  - Generates 6-digit OTP
  - Sets expiry to 10 minutes
  - Sends OTP via email
- **Response**: `{ message: "OTP sent to your email", success: true }`

#### 2. `/api/auth/verify-otp` (POST)
- **Purpose**: Verify the OTP entered by user
- **Input**: `{ email: string, otp: string }`
- **Process**:
  - Checks OTP exists and matches
  - Validates OTP not expired
- **Response**: `{ message: "OTP verified successfully", success: true }`

#### 3. `/api/auth/reset-password` (POST)
- **Purpose**: Reset password with verified OTP
- **Input**: `{ email: string, otp: string, newPassword: string }`
- **Process**:
  - Re-validates OTP and expiry
  - Hashes new password with bcrypt
  - Updates password
  - Clears OTP fields
- **Response**: `{ message: "Password reset successfully", success: true }`

### Frontend Page: `/forgot-password`

**3-Step Flow**:

1. **Step 1 - Email Entry**:
   - User enters registered email
   - Clicks "Send OTP"
   - OTP sent to email

2. **Step 2 - OTP Verification**:
   - User enters 6-digit OTP from email
   - 10-minute validity timer
   - Can go back to email step

3. **Step 3 - New Password**:
   - User enters new password (min 6 chars)
   - Confirms password
   - Password reset complete
   - Redirects to login

### Email Service
- **File**: `lib/email.service.ts`
- **Function**: `sendPasswordResetOTP(email, otp, userName)`
- **Template**: Professional HTML email with:
  - Large, centered OTP display
  - 10-minute validity notice
  - Security warning
  - TourEase branding

### Login Page Update
- Added "Forgot Password?" link next to password field
- Links to `/forgot-password` page

## Security Features

✅ **OTP Expiry**: 10-minute validity window
✅ **OTP Cleanup**: Cleared after successful password reset
✅ **Password Hashing**: bcrypt with salt rounds
✅ **Email Verification**: Only registered users can request OTP
✅ **Single-Use OTP**: OTP cleared after use

## User Flow Example

```
1. User clicks "Forgot Password?" on login page
   ↓
2. Enters email → Receives OTP (123456) via email
   ↓
3. Enters OTP → Verified
   ↓
4. Sets new password → Success
   ↓
5. Redirected to login → Can login with new password
```

## Testing Instructions

### Test Case 1: Successful Password Reset
1. Go to `/login`
2. Click "Forgot Password?"
3. Enter registered email (e.g., john@example.com)
4. Check email inbox for OTP
5. Enter OTP on next screen
6. Set new password and confirm
7. Try logging in with new password

### Test Case 2: OTP Expiry
1. Request OTP
2. Wait 11+ minutes
3. Try to verify OTP
4. Should show "OTP has expired" error

### Test Case 3: Invalid OTP
1. Request OTP
2. Enter wrong OTP (e.g., 999999)
3. Should show "Invalid OTP" error

### Test Case 4: Password Mismatch
1. Complete OTP verification
2. Enter different passwords in "New Password" and "Confirm Password"
3. Should show "Passwords do not match" error

### Test Case 5: Unregistered Email
1. Enter email not in database
2. Should show "User not found" error

## Email Configuration

Requires these environment variables in `.env`:
```env
EMAIL_USER=mjv3140@gmail.com
EMAIL_PASS=xlfnlsexpssbtevi
EMAIL_FROM=TourEase <mjv3140@gmail.com>
```

## Files Created/Modified

### New Files:
- ✅ `lib/email.service.ts` — Email sending utility
- ✅ `app/api/auth/forgot-password/route.ts` — Request OTP
- ✅ `app/api/auth/verify-otp/route.ts` — Verify OTP
- ✅ `app/api/auth/reset-password/route.ts` — Reset password
- ✅ `app/forgot-password/page.tsx` — Frontend UI

### Modified Files:
- ✅ `prisma/schema.prisma` — Added resetOtp, resetOtpExpiry to User model
- ✅ `app/login/page.tsx` — Added "Forgot Password?" link
- ✅ `prisma.config.ts` — Fixed datasource configuration

## Status: ✅ COMPLETE

All functionality implemented and database migrated. Ready for testing!

---

**Next Steps**: Test the complete flow with a real user account and verify OTP email delivery.
