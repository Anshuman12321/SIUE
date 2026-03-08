CREATE TABLE public.user_availability (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  busy_start  TIMESTAMPTZ NOT NULL,
  busy_end    TIMESTAMPTZ NOT NULL,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, busy_start, busy_end)
);

CREATE INDEX idx_availability_user_range
  ON public.user_availability (user_id, busy_start, busy_end);
