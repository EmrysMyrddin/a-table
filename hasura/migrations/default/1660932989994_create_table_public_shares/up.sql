CREATE TABLE "public"."shares" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "by" uuid NOT NULL, "to" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("by") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("to") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade);
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_shares_updated_at"
BEFORE UPDATE ON "public"."shares"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_shares_updated_at" ON "public"."shares" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
