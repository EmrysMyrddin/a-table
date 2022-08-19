DROP FUNCTION IF EXISTS register_user(username text, password text);
CREATE OR REPLACE FUNCTION public.register_user(username text, password text)
 RETURNS jwt
 LANGUAGE sql
AS $function$
  insert into users(username, password) values(username, crypt(password, gen_salt('bf'))) returning id as user_id, NULL as token
$function$;
