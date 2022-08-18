CREATE OR REPLACE FUNCTION public.register_user(username text, password text)
 RETURNS jwt
 LANGUAGE sql
AS $function$
  insert into users(username, password) 
  values(username, crypt(password, gen_salt('bf'))) 
  returning id as user_id, jwt_token(users.id) as token
$function$;
