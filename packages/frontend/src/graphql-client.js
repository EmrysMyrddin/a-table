import { createClient, dedupExchange, cacheExchange, fetchExchange } from 'urql';
import { refocusExchange } from '@urql/exchange-refocus';

export const client = createClient({
  url: 'https://a-table.caprover.cocaud.dev/v1/graphql',
  exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
  fetchOptions: {
    headers: {
      "x-hasura-admin-secret": "kM1hJlZ89F5CI5DHrxUYYoZq0Y51vCFMZOgH8YMWxx7UhuYtyW"
    }
  }
});
