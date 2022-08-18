Create or replace function jwt_token(user_id uuid) returns text language sql volatile as $function$
    with 
        jwt as (
            select 
                url_encode('{
                    "alg":"HS256",
                    "typ":"JWT"
                }'::bytea) 
                || '.' || 
                url_encode(('{
                    "sub": "'|| user_id ||'",
                    "https://hasura.io/jwt/claims": {
                        "x-hasura-allowed-roles": ["user"],
                        "x-hasura-default-role": "user",
                        "x-hasura-user-id": "'|| user_id ||'"
                    }
                }')::bytea)
                as data
        )
    select jwt.data || '.' || url_encode(hmac(jwt.data, current_setting('auth.jwt_secret'), 'sha256')) from jwt
$function$;

CREATE OR REPLACE FUNCTION public.login(username_input text, password_input text)
 RETURNS jwt
 LANGUAGE sql
AS $function$
    select users.id as user_id, jwt_token(users.id) as token
    from users
    where 
        users.username = username_input and
        users.password = crypt(password_input, users.password)
$function$;
