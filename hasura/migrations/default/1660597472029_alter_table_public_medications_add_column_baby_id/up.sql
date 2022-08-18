CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "public"."medications" add column "baby_id" uuid
 not null default 'b4a22cef-331b-4222-bdc2-508295f69206';
