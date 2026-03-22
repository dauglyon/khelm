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
        // Zod schema generation: produces runtime validation schemas alongside
        // the react-query client. Requires zod (already a dependency).
        // strict enables strict validation for all schema categories.
        zod: {
          strict: {
            param: true,
            query: true,
            header: true,
            body: true,
            response: true,
          },
        },
      },
    },
  },
});
