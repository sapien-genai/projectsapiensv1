# Admin Portal Setup Guide

This guide explains how to set up and use the Admin Portal for Project Sapiens.

## Overview

The Admin Portal provides comprehensive tools for managing users, support tickets, analytics, and system monitoring. It includes:

- **Dashboard**: Real-time overview of platform metrics
- **User Management**: View and manage all users with detailed analytics
- **Support Tickets**: Full ticketing system for customer support
- **Analytics**: Comprehensive platform metrics and visualizations
- **Audit Log**: Track all administrative actions and system events

## Database Tables

The admin portal uses the following database tables:

- `admin_roles` - Stores admin user roles and permissions
- `support_tickets` - Customer support ticket system
- `ticket_messages` - Messages/responses for tickets
- `user_analytics` - User activity tracking
- `platform_metrics` - Platform-wide metrics
- `system_audit_log` - Audit trail for all admin actions

## Setting Up Admin Access

### Step 1: Grant Admin Role

To grant a user admin access, run this SQL command in your Supabase SQL Editor:

```sql
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users
INSERT INTO admin_roles (user_id, role, permissions)
VALUES (
  'USER_ID_HERE',
  'super_admin',
  '{
    "manage_users": true,
    "manage_tickets": true,
    "view_analytics": true,
    "manage_admins": true
  }'::jsonb
)
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;
```

### Step 2: Find Your User ID

To find your user ID:

1. Sign in to your Supabase project
2. Navigate to Authentication > Users
3. Find your user and copy the UUID
4. Replace 'USER_ID_HERE' in the SQL above

### Step 3: Verify Access

After granting admin access:

1. Log out and log back into Project Sapiens
2. You should see an "ADMIN" button in the navigation bar
3. Click it to access the Admin Portal

## Admin Roles

The system supports four admin role levels:

- **super_admin**: Full system access, can manage other admins
- **admin**: Can manage users, tickets, and view analytics
- **support**: Limited to ticket management and user support
- **analyst**: View-only access to analytics and metrics

## Features

### User Management
- View all registered users
- Search and filter users
- Export user data to CSV
- View detailed user profiles
- Track user activity and progress

### Support Tickets
- View and manage all support tickets
- Assign tickets to admins
- Add responses and internal notes
- Update ticket status and priority
- Filter by status, priority, and category

### Analytics Dashboard
- Real-time platform metrics
- User growth charts
- Lesson completion tracking
- Top learning paths
- Engagement metrics
- Exportable data

### Audit Log
- Complete audit trail of admin actions
- Search and filter logs
- Export audit data
- Track security events
- Monitor system changes

## Security

The admin portal includes:

- Row Level Security (RLS) policies on all tables
- Role-based access control
- Complete audit logging
- IP address tracking
- Session management
- Secure authentication checks

## Creating Support Tickets (Users)

Users can create support tickets through the admin portal or by using this SQL:

```sql
INSERT INTO support_tickets (user_id, title, description, priority, category)
VALUES (
  'USER_ID',
  'Ticket Title',
  'Detailed description of the issue',
  'medium',
  'technical'
);
```

Priority levels: `low`, `medium`, `high`, `urgent`
Categories: `technical`, `billing`, `feature_request`, `bug`, `other`

## Viewing Analytics

The analytics dashboard automatically aggregates:

- Daily user registrations
- Active user counts
- Lesson completion rates
- Badge earnings
- Engagement metrics
- Top performing content

## Best Practices

1. **Regular Monitoring**: Check the dashboard daily for issues
2. **Ticket Response**: Respond to urgent tickets within 4 hours
3. **User Privacy**: Only access user data when necessary
4. **Audit Trail**: All actions are logged - be mindful
5. **Data Export**: Export analytics regularly for reports

## Troubleshooting

### "Access Denied" Error
- Verify your user has an entry in `admin_roles` table
- Check that the role is valid (super_admin, admin, support, analyst)
- Log out and log back in

### Admin Button Not Showing
- Clear browser cache
- Verify admin_roles entry exists
- Check browser console for errors

### Tickets Not Loading
- Verify RLS policies are enabled
- Check database permissions
- Ensure user is authenticated

## Support

For admin portal issues, contact the development team or check the system audit log for error details.
