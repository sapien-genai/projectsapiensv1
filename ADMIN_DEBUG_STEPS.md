# Admin Portal Access Debugging Steps

## Current Status
You're seeing the "ACCESS DENIED" screen when trying to access the admin portal.

## Enhanced Debugging Added

The following changes have been made to help diagnose the issue:

1. **Enhanced Console Logging** - The `useAdminStatus` hook now logs:
   - When the RPC function is called
   - The user ID being checked
   - The RPC response data
   - Any errors that occur

2. **Access Denied Screen Updates** - Now displays:
   - Your current user ID
   - Your email address
   - Any error messages from the admin check
   - Reminder to check browser console

## How to Debug

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for messages starting with `[admin]`
4. You should see:
   ```
   [admin] Calling is_admin RPC for user: <your-user-id>
   [admin] RPC response: { data: true/false, adminStatus: true/false, userId: <your-id> }
   ```

### Step 2: Compare User IDs
The database currently has these super admin users:
- `3a5b7de9-02f0-493a-b1e4-10177d8e8932`
- `7ecd3f28-3352-41a0-b9c8-40613c25134d`

Compare your User ID (shown on the ACCESS DENIED screen) with these IDs.

### Step 3: Test the RPC Function Directly
Run this SQL query in your Supabase dashboard to test the function:

```sql
-- Replace YOUR_USER_ID with your actual user ID
SELECT is_admin('YOUR_USER_ID'::uuid);
```

This should return `true` if you're an admin, `false` otherwise.

### Step 4: Check if You're Logged In as the Right User
If your User ID doesn't match the admin IDs above, you may need to:
1. Log out
2. Log in with the correct admin account
3. OR add your current user ID to the admin_roles table

## To Add Your Current User as Admin

If you need to add your current user ID to the admin_roles table, run this in Supabase SQL Editor:

```sql
-- Replace YOUR_USER_ID with your actual user ID from the access denied screen
INSERT INTO admin_roles (user_id, role, permissions)
VALUES (
  'YOUR_USER_ID'::uuid,
  'super_admin',
  '{}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
```

## Common Issues

### Issue 1: RPC Permission Error
If you see an error about permissions in the console, the RPC function might not be accessible. This would be a database configuration issue.

### Issue 2: Wrong User Logged In
If your User ID doesn't match any admin IDs, you're simply not logged in as an admin user.

### Issue 3: RLS Policy Blocking Access
The `is_admin` function uses `SECURITY DEFINER` which should bypass RLS, but if there's still an issue, we may need to check the RLS policies.

## Next Steps
After checking the console and the access denied screen:
1. Share your User ID from the screen
2. Share any console error messages
3. Let me know if your ID matches one of the admin IDs above

This will help identify whether:
- You need to be added as an admin
- There's a bug in the RPC function
- There's a permissions/RLS issue
