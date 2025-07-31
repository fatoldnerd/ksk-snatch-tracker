# KSK Snatch Tracker - Testing Guide

## Prerequisites
- Development server is running on http://localhost:5174/
- Browser DevTools open to monitor console logs

## Test Scenarios

### 1. Landing Page & Initial Load
1. Open http://localhost:5174/ in a new incognito/private browser window
2. **Expected**: Landing page should display with "Get Started" and "Sign In" buttons
3. Check console for: `🔥 Firebase initialized successfully`

### 2. Guest User Flow (No Authentication)
1. From landing page, click "Skip for now" or the X button to close
2. Navigate to "Program Selection" tab
3. Select "KSK 2.0" program
4. Enter "10" as max reps
5. Go to "Today's Workout" tab
6. **Expected**: Should see workout prescription based on your selection

#### Log a Guest Workout:
1. Go to "Log Session" tab
2. Fill in:
   - Date: Today's date
   - Kettlebell Weight: 24kg
   - Left Hand Reps: 5
   - Right Hand Reps: 5
   - Sets/Rounds: 3
   - RPE: 7
   - Notes: "Test workout as guest"
3. Click "Log Workout"
4. **Expected**: Success message and redirect to Progress tab
5. Check Progress tab shows the logged workout

### 3. User Registration Flow
1. Refresh the page (workout data should persist in localStorage)
2. Click "Sign In" from header or landing page
3. Click "Sign up" link at bottom of form
4. Fill in:
   - Name: Test User
   - Email: test@example.com (use a real email you control)
   - Password: TestPass123!
5. Click "Sign Up"
6. **Expected**: 
   - Console shows: `✅ Signup successful`
   - Automatically logged in and redirected to app
   - Landing page closes
   - Data migration message in console

### 4. Test Data Migration
1. After registration, check console for migration logs:
   - `📦 App: Starting data migration`
   - `Starting localStorage to Firestore migration...`
   - `✅ App: Data migration completed`
2. Go to Progress tab
3. **Expected**: Guest workout should still be visible (now in Firestore)

### 5. Authenticated User Workflow
1. Go to "Program Selection" tab
2. Change program to "KSK 3.0"
3. Set target snatches to 100
4. Go to "Today's Workout" tab
5. Navigate through different days/weeks
6. **Expected**: Settings persist in real-time

#### Log an Authenticated Workout:
1. Go to "Log Session" tab
2. Fill in new workout data:
   - Date: Today's date
   - Kettlebell Weight: 28kg
   - Left Hand Reps: 25
   - Right Hand Reps: 25
   - Sets/Rounds: 1
   - RPE: 8
   - Notes: "Authenticated user test"
3. Click "Log Workout"
4. Check Progress tab for both workouts

### 6. Session Persistence Test
1. Refresh the browser page
2. **Expected**: 
   - User remains logged in
   - All settings preserved
   - Workout history intact
3. Check console for: `🔐 Auth state changed: User: test@example.com`

### 7. Logout and Login Test
1. Go to "Profile" tab
2. Click "Sign Out"
3. Confirm logout
4. **Expected**: Profile tab disappears, data switches to localStorage mode
5. Click "Sign In" again
6. Use same credentials to log back in
7. **Expected**: All data restored from Firestore

### 8. Google Sign-In Test
1. Sign out if logged in
2. Click "Sign In"
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. **Expected**: Same data persistence behavior as email auth

### 9. Edge Cases to Test
1. **Empty form submission**: Try logging workout without filling required fields
2. **Invalid data**: Enter negative numbers or text in number fields
3. **Network offline**: Disconnect internet and try to log workout
4. **Concurrent sessions**: Open app in two tabs, make changes in both

### 10. Security Verification
1. Open browser DevTools
2. Go to Application > Storage > Local Storage
3. **Expected**: No sensitive authentication tokens stored
4. Check Network tab during login
5. **Expected**: All Firebase calls use HTTPS

## Console Log Reference
Key logs to watch for:
- 🔥 Firebase initialized
- 🔐 Auth state changes
- 📦 Data migration
- ✅ Successful operations
- ❌ Errors

## Troubleshooting
- If login fails, check Firebase Console for user creation
- If data doesn't persist, check Firestore Database in Firebase Console
- Clear localStorage and cookies to reset to fresh state

## Test Data Cleanup
To reset for fresh testing:
1. Delete test users from Firebase Console > Authentication
2. Clear browser localStorage: `localStorage.clear()`
3. Delete test data from Firestore if needed