import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/react-app/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  driver: 'pglite',
});
