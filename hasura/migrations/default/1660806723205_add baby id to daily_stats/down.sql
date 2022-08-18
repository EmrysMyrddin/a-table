-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."daily_stats" AS
--  SELECT COALESCE(get_day(meals.date), get_day(purees.date), get_day(poops.date), get_day(medications.date)) AS day,
--     sum(meals.quantity) AS meals_sum,
--     sum(purees.quantity) AS purees_sum,
--     avg(meals.quantity) AS meals_avg,
--     avg(purees.quantity) AS purees_avg,
--     count(get_day(meals.date)) AS meals_count,
--     LEAST(min(meals.date), min(purees.date), min(poops.date), min(medications.date)) AS start_date,
--     GREATEST(max(meals.date), max(purees.date), max(poops.date), max(medications.date)) AS end_date,
--     count(get_day(purees.date)) AS purees_count,
--     babies.id as baby_id
--    FROM babies
--      LEFT JOIN meals ON meals.baby_id = babies.id
--      LEFT JOIN purees ON purees.baby_id = babies.id
--      LEFT JOIN poops ON poops.baby_id = babies.id
--      LEFT JOIN medications ON medications.baby_id = babies.id
--   GROUP BY babies.id, COALESCE(get_day(meals.date), get_day(purees.date), get_day(poops.date), get_day(medications.date))
--   ORDER BY COALESCE(get_day(meals.date), get_day(purees.date), get_day(poops.date), get_day(medications.date));
