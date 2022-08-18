CREATE OR REPLACE FUNCTION login(username_input text, password_input text)
RETURNS jwt AS $$
  with 
    jwt as (
        select 
            url_encode('{
                "alg":"HS256",
                "typ":"JWT"
            }'::bytea) 
            || '.' || 
            url_encode(('{
                "sub": "'|| users.id ||'",
                "https://hasura.io/jwt/claims": {
                    "x-hasura-allowed-roles": ["user"],
                    "x-hasura-default-role": "user",
                    "x-hasura-user-id": "'|| users.id ||'"
                }
            }')::bytea)
            as data,
            users.id as user_id
        from users
        where 
            users.username = username_input and
            users.password = crypt(password_input, users.password)
    )
    select jwt.user_id, jwt.data || '.' || url_encode(hmac(jwt.data, current_setting('auth.jwt_secret'), 'sha256')) as token from jwt
$$ LANGUAGE sql STABLE;
