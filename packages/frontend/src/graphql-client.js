import { createClient, dedupExchange, cacheExchange, fetchExchange } from 'urql';
import { refocusExchange } from '@urql/exchange-refocus';

export const client = createClient({
  url: 'http://192.168.1.47:8080/v1/graphql',
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
