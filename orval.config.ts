import { defineConfig } from 'orval';

export default defineConfig({
  sessions: {
    input: {
      target: './src/api/openapi.yaml',
    },
    output: {
      target: './src/generated/api/sessions.ts',
      client: 'react-query',
      mode: 'tags-split',
      mock: true,
      override: {
        mutator: {
          path: './src/common/api/fetcher.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
