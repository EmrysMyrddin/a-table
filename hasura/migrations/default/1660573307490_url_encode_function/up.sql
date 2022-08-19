CREATE OR REPLACE FUNCTION url_encode(data bytea) RETURNS text LANGUAGE sql AS $$
    SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$ IMMUTABLE;

-- CREATE FUNCTION jwt_token(user_row users, password text)
-- RETURNS TEXT AS $$
--   select encode(current_setting('auth.jwt_secret'), "base64")
-- $$ LANGUAGE sql STABLE;