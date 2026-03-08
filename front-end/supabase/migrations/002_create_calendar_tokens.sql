CREATE TABLE public.calendar_tokens (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL DEFAULT 'google',
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry  TIMESTAMPTZ NOT NULL,
  scopes      TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);
