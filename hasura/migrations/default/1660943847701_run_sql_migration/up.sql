CREATE OR REPLACE FUNCTION public.me(session json)
 RETURNS users
 LANGUAGE sql
 STABLE
AS $function$
    select *
    from users
    where 
        users.id = (session->>'x-hasura-user-id')::uuid
$function$;
