SET check_function_bodies = false;
CREATE FUNCTION public.get_day(datetime timestamp with time zone) RETURNS date
    LANGUAGE sql STABLE
    AS $$
    SELECT (datetime at time zone 'Europe/Paris')::date
$$;
CREATE TABLE public.meals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    date timestamp with time zone NOT NULL,
    quantity integer NOT NULL
);
CREATE FUNCTION public.previous_meal(meal_row public.meals) RETURNS public.meals
    LANGUAGE sql STABLE
    AS $$
    SELECT * FROM meals 
    where meals.date < meal_row.date
    ORDER BY meals.date desc LIMIT 1 
$$;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.babies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);
CREATE TABLE public.medications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    medication text NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.poops (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL,
    quantity text NOT NULL
);
CREATE TABLE public.purees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    quantity integer NOT NULL,
    date timestamp with time zone NOT NULL
);
CREATE VIEW public.daily_stats AS
 SELECT COALESCE(public.get_day(meals.date), public.get_day(purees.date), public.get_day(poops.date), public.get_day(medications.date)) AS day,
    sum(meals.quantity) AS meals_sum,
    sum(purees.quantity) AS purees_sum,
    avg(meals.quantity) AS meals_avg,
    avg(purees.quantity) AS purees_avg,
    count(public.get_day(meals.date)) AS meals_count,
    LEAST(min(meals.date), min(purees.date), min(poops.date), min(medications.date)) AS start_date,
    GREATEST(max(meals.date), max(purees.date), max(poops.date), max(medications.date)) AS end_date,
    count(public.get_day(purees.date)) AS purees_count
   FROM (((public.meals
     FULL JOIN public.purees ON (false))
     FULL JOIN public.poops ON (false))
     FULL JOIN public.medications ON (false))
  GROUP BY COALESCE(public.get_day(meals.date), public.get_day(purees.date), public.get_day(poops.date), public.get_day(medications.date))
  ORDER BY COALESCE(public.get_day(meals.date), public.get_day(purees.date), public.get_day(poops.date), public.get_day(medications.date));
ALTER TABLE ONLY public.babies
    ADD CONSTRAINT babies_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.poops
    ADD CONSTRAINT poops_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.purees
    ADD CONSTRAINT puree_pkey PRIMARY KEY (id);
CREATE TRIGGER set_public_babies_updated_at BEFORE UPDATE ON public.babies FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_babies_updated_at ON public.babies IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_meals_updated_at BEFORE UPDATE ON public.meals FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_meals_updated_at ON public.meals IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_medications_updated_at ON public.medications IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_poops_updated_at BEFORE UPDATE ON public.poops FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_poops_updated_at ON public.poops IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_puree_updated_at BEFORE UPDATE ON public.purees FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_puree_updated_at ON public.purees IS 'trigger to set value of column "updated_at" to current timestamp on row update';
