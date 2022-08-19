import { createClient, dedupExchange, cacheExchange, fetchExchange } from 'urql';
import { refocusExchange } from '@urql/exchange-refocus';

export const client = createClient({
  // TODO: Add env variables for this
  url: 'http://localhost:8080/v1/graphql',
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
