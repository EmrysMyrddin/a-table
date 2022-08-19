import { createClient, dedupExchange, cacheExchange, fetchExchange } from 'urql';
import { refocusExchange } from '@urql/exchange-refocus';

export const client = createClient({
  // TODO: Add env variables for this
  url: 'https://a-table.caprover.cocaud.dev/v1/graphql',
  exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem('token');
    return ({
      headers: {
        ...token ? {authorization: `Bearer ${token}`} : undefined,
      }
    });
  }
});
