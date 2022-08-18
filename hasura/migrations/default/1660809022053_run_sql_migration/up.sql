CREATE
OR REPLACE VIEW "public"."daily_stats" AS
SELECT
  COALESCE(
    get_day(meals.date),
    get_day(purees.date),
    get_day(poops.date),
    get_day(medications.date)
  ) AS day,
  sum(meals.quantity) AS meals_sum,
  sum(purees.quantity) AS purees_sum,
  avg(meals.quantity) AS meals_avg,
  avg(purees.quantity) AS purees_avg,
  count(get_day(meals.date)) AS meals_count,
  LEAST(
    min(meals.date),
    min(purees.date),
    min(poops.date),
    min(medications.date)
  ) AS start_date,
  GREATEST(
    max(meals.date),
    max(purees.date),
    max(poops.date),
    max(medications.date)
  ) AS end_date,
  count(get_day(purees.date)) AS purees_count,
  COALESCE(
    meals.baby_id,
    purees.baby_id,
    poops.baby_id,
    medications.baby_id
  ) AS baby_id
FROM
  public.meals
     FULL JOIN public.purees ON false
     FULL JOIN public.poops ON false
     FULL JOIN public.medications ON false
GROUP BY
  (COALESCE(
    meals.baby_id,
    purees.baby_id,
    poops.baby_id,
    medications.baby_id
  ),
  COALESCE(
    get_day(meals.date),
    get_day(purees.date),
    get_day(poops.date),
    get_day(medications.date)
  ))
ORDER BY
  COALESCE(
    get_day(meals.date),
    get_day(purees.date),
    get_day(poops.date),
    get_day(medications.date)
  );
