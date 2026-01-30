# Pricing and Usage Limits

This document describes the pricing plans, AI usage limits, and enforcement mechanisms for Project Sapiens.

## Plans

### Free Plan

- **Cost:** $0/month
- **AI Practice Sessions:** 15 per day
- **Features:**
  - Access to all learning paths
  - Interactive lab environments
  - Progress tracking
  - Badge system
  - Journal entries
  - Projects showcase

### Pro Plan

- **Cost:** Coming soon
- **AI Practice Sessions:** 120 per day (8x more than Free)
- **Features:**
  - All Free plan features
  - Priority access to new features
  - Advanced analytics and insights
  - Full network participation
  - Export your learning data

## AI Practice Sessions

### What Counts as a Session?

One AI practice session is counted each time you successfully interact with the AI in any lab environment:

- Writing lab conversations
- Analysis lab queries
- Creative brainstorming sessions
- Strategy lab interactions
- Code lab assistance

### What DOESN'T Count?

- Failed requests due to server errors
- Network timeouts
- Invalid requests
- System errors

## Daily Limits

### Reset Time

All daily limits reset at **midnight UTC** (00:00:00 UTC).

### Enforcement

Usage limits are enforced server-side in the `lab-ai-chat` edge function. The edge function is the **single source of truth** for:

1. Checking user's plan (free or pro)
2. Verifying daily usage count
3. Incrementing usage counter on successful AI interactions
4. Returning 429 errors when limits are reached

## Database Schema

### billing_profiles

Stores user plan and billing information:

```sql
- user_id (uuid, primary key)
- plan (text, 'free' or 'pro')
- plan_override (text, nullable, admin override)
- stripe_customer_id (text, nullable)
- subscription_status (text, nullable)
- current_period_end (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### ai_usage_daily

Tracks daily AI usage per user:

```sql
- user_id (uuid)
- day (date, UTC date)
- count (int, number of interactions)
- last_request_at (timestamptz)
- PRIMARY KEY (user_id, day)
```

## Admin Override

The `plan_override` field in `billing_profiles` allows administrators to manually grant Pro access to users without payment:

- Set `plan_override` to `'pro'` to grant Pro features
- Set to `NULL` to remove override
- Override takes precedence over regular `plan` field
- Useful for beta testers, team members, or promotional access

**Note:** Only admins with service role access can modify `plan_override`.

## Changing Limits

To modify the daily limits, update the `PLAN_LIMITS` constant in:

- `supabase/functions/lab-ai-chat/index.ts`
- `supabase/functions/get-usage-status/index.ts`

Example:

```typescript
const PLAN_LIMITS: Record<string, number> = {
  free: 15,  // Change this value
  pro: 120,  // Change this value
};
```

After making changes, redeploy the edge functions.

## Security

### Row Level Security (RLS)

Both tables have RLS enabled:

**billing_profiles:**
- Users can SELECT their own profile
- Users can INSERT their own profile (with plan='free' only)
- Service role can manage all profiles

**ai_usage_daily:**
- Users can SELECT their own usage
- Service role can INSERT/UPDATE all records
- Client cannot directly modify usage counts

### Token Safety

- API keys and tokens are NEVER exposed to the client
- All AI interactions go through authenticated edge functions
- Usage tracking happens server-side only
- Stripe Checkout sessions are created server-side in an edge function
- Stripe webhooks are verified with a signing secret before updating billing records

## Error Responses

### Limit Reached (429)

When a user reaches their daily limit:

```json
{
  "error": "limit_reached",
  "message": "You've reached today's AI practice limit.",
  "limit": 15,
  "used": 15,
  "resets_at": "2026-01-22T00:00:00.000Z",
  "plan": "free"
}
```

The frontend displays this as a user-friendly message with:
- Current usage information
- Reset time
- Upgrade CTA (for free users)

## Testing Limits Locally

To test the limits system:

1. Make multiple AI requests in labs until limit is reached
2. Verify 429 error appears in UI
3. Check `ai_usage_daily` table for accurate counts
4. Test admin override by setting `plan_override='pro'`

### Reset Usage for Testing

To manually reset a user's daily usage:

```sql
DELETE FROM ai_usage_daily
WHERE user_id = 'USER_ID'
AND day = CURRENT_DATE;
```

## Future Enhancements

Potential improvements for v2:

- [ ] Billing portal for upgrading, canceling, and updating payment methods
- [ ] Monthly/yearly billing cycles
- [ ] Team plans with shared limits
- [ ] Usage analytics dashboard
- [ ] Rollover unused sessions
- [ ] Temporary limit boosts for special events

## Stripe Checkout Integration

Stripe Checkout is used to upgrade from Free to Pro. The client calls an edge function to create a checkout session and redirects the user to Stripe. Webhooks update `billing_profiles` when the subscription becomes active or changes status.

### Edge Functions

- `POST /functions/v1/create-checkout-session`
- `POST /functions/v1/stripe-webhook`

### Required Environment Variables

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`
- `STRIPE_WEBHOOK_SECRET`
