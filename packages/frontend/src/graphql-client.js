import { createClient } from 'urql';

export const client = createClient({
  url: 'https://a-table.caprover.cocaud.dev/v1/graphql',
  fetchOptions: {
    headers: {
      "x-hasura-admin-secret": "kM1hJlZ89F5CI5DHrxUYYoZq0Y51vCFMZOgH8YMWxx7UhuYtyW"
    }
  }
});
