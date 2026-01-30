# Stripe Subscriptions + Token Entitlements System

Complete implementation of Stripe subscriptions with token-based entitlements for Project Sapiens.

## Overview

This system implements a comprehensive subscription and entitlements architecture with:
- Stripe Checkout for monthly and yearly Pro subscriptions
- Token-based allowances that grant on subscription cycles
- Feature gating based on plan and entitlements
- Detailed token ledger for complete transaction history
- Stripe Billing Portal integration for self-service management

## Database Schema

### Tables Created

#### 1. `profiles`
Extends `auth.users` with Stripe customer information.

```sql
- id: uuid (primary key, references auth.users)
- stripe_customer_id: text (unique)
- created_at: timestamptz
- updated_at: timestamptz
```

#### 2. `subscriptions`
Tracks active Stripe subscription details.

```sql
- user_id: uuid (primary key)
- stripe_subscription_id: text (unique)
- stripe_price_id: text
- status: text (active, trialing, past_due, canceled, unpaid, incomplete)
- current_period_start: timestamptz
- current_period_end: timestamptz
- cancel_at_period_end: boolean
- canceled_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz
```

#### 3. `entitlements`
User's current plan, features, and token balance.

```sql
- user_id: uuid (primary key)
- plan: text (free, pro)
- features: jsonb { labs, exports, priority_support, network }
- monthly_token_allowance: bigint
- token_balance: bigint
- token_reset_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz
```

#### 4. `token_ledger`
Complete audit trail of all token transactions.

```sql
- id: uuid (primary key)
- user_id: uuid
- type: text (grant, spend, purchase, refund, adjustment)
- amount: bigint
- source: text
- ref_id: text
- metadata: jsonb
- created_at: timestamptz
```

### Triggers

**`on_auth_user_created`**
- Automatically creates profile and entitlements on signup
- Grants 25,000 starter tokens to all new users
- Logs initial token grant in ledger

### Migration

The system automatically migrates existing `billing_profiles` data to the new schema, preserving:
- Stripe customer IDs
- Pro plan status
- Granting 500K tokens to existing Pro users

## Token System

### Token Allowances

**Free Plan:**
- 0 monthly tokens
- 25,000 starter bonus on signup

**Pro Plan:**
- Monthly: 500,000 tokens/month
- Yearly: 6,500,000 tokens/year (541K/month average)

### Token Grants

Tokens are granted automatically on:
1. **Signup:** 25,000 tokens for all new users
2. **Subscription Start:** Full allowance on first payment
3. **Renewal:** Monthly/yearly allowance on each billing cycle
4. **Migration:** 500,000 tokens for existing Pro users

### Token Tracking

All token transactions are logged in `token_ledger`:
- **grant:** Tokens added (signup, renewal, purchase)
- **spend:** Tokens used for operations
- **purchase:** One-time token pack purchases
- **refund:** Tokens returned
- **adjustment:** Admin corrections

## Edge Functions

### 1. `create-checkout-session`
Creates Stripe Checkout sessions for subscriptions.

**Endpoint:** `POST /functions/v1/create-checkout-session`

**Request Body:**
```json
{
  "plan": "monthly" | "yearly"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "session_id": "cs_..."
}
```

**Features:**
- Creates or reuses Stripe customer
- Supports monthly and yearly plans
- Sets client_reference_id for webhook processing
- Redirects to success/cancel URLs

### 2. `stripe-webhook`
Processes Stripe webhook events.

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Signature Verification:** Uses HMAC SHA-256 with webhook secret

**Events Handled:**

#### `checkout.session.completed`
- Creates subscription record
- Upgrades user to Pro
- Grants initial token allowance
- Sets token reset date

#### `customer.subscription.updated`
- Updates subscription status
- Adjusts plan and features
- Updates token allowance based on price ID

#### `customer.subscription.deleted`
- Downgrades user to Free
- Removes Pro features
- Sets token allowance to 0

#### `invoice.paid`
- On renewal: Grants monthly/yearly tokens
- Logs grant in token_ledger
- Updates token_reset_at date

#### `invoice.payment_failed`
- Sets subscription to past_due
- Maintains Pro access (grace period)

### 3. `create-portal-session`
Creates Stripe Billing Portal sessions.

**Endpoint:** `POST /functions/v1/create-portal-session`

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

**Portal Features:**
- Update payment methods
- View invoices
- Cancel subscription
- Update billing details

### 4. `get-usage-status`
Returns comprehensive usage and entitlement data.

**Endpoint:** `GET /functions/v1/get-usage-status`

**Response:**
```json
{
  "plan": "pro",
  "limit": 120,
  "used": 45,
  "remaining": 75,
  "resets_at": "2026-01-31T00:00:00.000Z",
  "token_balance": 485000,
  "monthly_token_allowance": 500000,
  "token_reset_at": "2026-02-15T00:00:00.000Z",
  "features": {
    "labs": true,
    "exports": true,
    "priority_support": true,
    "network": true
  },
  "subscription_status": "active",
  "current_period_end": "2026-02-15T00:00:00.000Z",
  "cancel_at_period_end": false
}
```

## Frontend Components

### Utilities

**`src/utils/entitlements.ts`**
- `getEntitlements(userId)`: Fetch user entitlements
- `getTokenHistory(userId)`: Fetch token transaction history
- `hasFeature(entitlement, feature)`: Check feature access
- `isPro(entitlement)`: Check Pro status
- `formatTokens(tokens)`: Format token numbers (e.g., "500K", "1.5M")

### Hooks

**`src/hooks/useEntitlements.ts`**
React hook for accessing entitlements:
```typescript
const { entitlements, loading, error, refresh, isPro, hasFeature } = useEntitlements();
```

### Components

#### `ProGuard`
Feature gating component that shows upgrade prompts for Pro-only features.

**Usage:**
```tsx
<ProGuard feature="exports">
  <ExportButton />
</ProGuard>

<ProGuard feature="network" fallback={<NetworkTeaser />}>
  <NetworkContent />
</ProGuard>
```

**Props:**
- `feature?: 'labs' | 'exports' | 'priority_support' | 'network'`
- `fallback?: ReactNode` - Custom fallback content
- `showUpgrade?: boolean` - Show upgrade CTA (default: true)

#### `BillingPage`
Comprehensive billing dashboard showing:
- Current plan and status
- Daily AI session usage
- Token balance and allowance
- Subscription details
- Renewal/cancellation status
- Stripe portal access

#### `PricingSection`
Updated pricing display with:
- Monthly and yearly plan options
- Token allowances displayed
- Dynamic upgrade buttons
- Plan comparison

### Context Updates

**`BillingContext`**
Enhanced with entitlements data:
- `usageStatus` includes token balance, features, subscription
- `startCheckout(plan)` supports 'monthly' | 'yearly'
- All subscription management functions

## Environment Variables

Required environment variables (auto-configured):

```bash
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
STRIPE_SUCCESS_URL=https://yourdomain.com/billing/success
STRIPE_CANCEL_URL=https://yourdomain.com/billing
STRIPE_PORTAL_RETURN_URL=https://yourdomain.com/billing

# Supabase (auto-configured)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled:

**profiles, entitlements, subscriptions, token_ledger:**
- Users can SELECT own data (`auth.uid() = user_id`)
- Only service role can INSERT/UPDATE

### Webhook Security

- Signature verification using HMAC SHA-256
- Payload validation before processing
- Service role used for all database writes

### Token Safety

- Never exposed to client
- All operations server-side only
- Complete audit trail in ledger

## Feature Gating

### Feature Matrix

| Feature | Free | Pro |
|---------|------|-----|
| Labs | ✅ | ✅ |
| Exports | ❌ | ✅ |
| Priority Support | ❌ | ✅ |
| Network | ❌ | ✅ |
| Tokens/Month | 0 | 500K-541K |
| AI Sessions/Day | 15 | 120 |

### Implementation

Use `ProGuard` component or `useEntitlements` hook:

```tsx
// Component approach
<ProGuard feature="exports">
  <ExportButton />
</ProGuard>

// Hook approach
const { hasFeature } = useEntitlements();
if (hasFeature('exports')) {
  // Show export functionality
}
```

## Testing

### Test Stripe Integration

1. Use Stripe test mode keys
2. Test cards:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`

### Test Webhooks Locally

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

### Verify Token Grants

Check `token_ledger` after subscription events:
```sql
SELECT * FROM token_ledger
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;
```

## Admin Operations

### Grant Tokens Manually

```sql
-- Grant tokens
INSERT INTO token_ledger (user_id, type, amount, source, metadata)
VALUES (
  'USER_ID',
  'grant',
  100000,
  'admin_grant',
  '{"reason": "Customer support compensation"}'::jsonb
);

-- Update balance
UPDATE entitlements
SET token_balance = token_balance + 100000
WHERE user_id = 'USER_ID';
```

### Check User Entitlements

```sql
SELECT * FROM get_user_entitlements('USER_ID');
```

### View Subscription Status

```sql
SELECT
  e.plan,
  e.token_balance,
  s.status,
  s.current_period_end,
  s.cancel_at_period_end
FROM entitlements e
LEFT JOIN subscriptions s ON s.user_id = e.user_id
WHERE e.user_id = 'USER_ID';
```

## Pricing

**Free Plan:** $0/month
- 15 AI sessions/day
- 25K starter tokens
- Basic features

**Pro Plan:**
- Monthly: $29/month (500K tokens/month)
- Yearly: $279/year (6.5M tokens/year, ~20% savings)
- 120 AI sessions/day
- All features unlocked

## Migration Notes

The system automatically migrates existing users:
1. All `auth.users` → `profiles`
2. `billing_profiles` → `entitlements` + `subscriptions`
3. Existing Pro users get 500K token grant
4. Daily AI usage limits preserved

No manual intervention required!

## Future Enhancements

Potential v2 features:
- [ ] Token pack purchases (one-time)
- [ ] Token gifting between users
- [ ] Usage analytics dashboard
- [ ] Team plans with shared tokens
- [ ] Token rollover (unused tokens carry over)
- [ ] Dynamic pricing based on usage
- [ ] Enterprise plans

## Summary

You now have a complete, production-ready subscription system with:
- ✅ Stripe Checkout (monthly/yearly)
- ✅ Automatic token grants on billing cycles
- ✅ Feature gating with ProGuard
- ✅ Complete audit trail
- ✅ Self-service billing portal
- ✅ Comprehensive webhook handling
- ✅ Migration from old system
- ✅ Admin tools and queries

All secrets are automatically configured and never exposed to the client. The system is secure, scalable, and ready for production use.
