# Supabase Setup for Auth & Users

## 1. RLS policy for user insert

The app creates a row in `public.users` when a user signs up (no trigger). Ensure you have an RLS policy that allows users to insert their own row.

In the Supabase Dashboard, go to **SQL Editor** and run:

```sql
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

If you already have SELECT and UPDATE policies, you're good. The table must have an `id` column (UUID, references auth.users) and an `interests` column (JSONB, default `'{}'`).

## 2. Email confirmation redirect

To redirect users to `/onboarding` after they confirm their email:

1. Go to **Authentication → URL Configuration**
2. Add your app URLs to **Redirect URLs**:
   - `http://localhost:5173/onboarding` (local dev)
   - `https://yourdomain.com/onboarding` (production)
3. Set **Site URL** to your app root (e.g. `http://localhost:5173` or your production URL)

The signup flow passes `emailRedirectTo: ${origin}/onboarding`, so Supabase will send users to `/onboarding` after they click the confirmation link.

## 3. Email template (optional)

To customize the confirmation email text, go to **Authentication → Email Templates → Confirm signup**. The default template uses `{{ .ConfirmationURL }}` which already includes the redirect. No changes needed unless you want different copy.
