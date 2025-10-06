import { createDrizzle } from '@makisuo/pglite-drizzle/react';
import { PGliteProvider as BasePGliteProvider } from '@electric-sql/pglite-react';
import * as schema from './schema';

/**
 * Create typed Drizzle hooks for PGlite with live query support
 *
 * Usage:
 * const { data } = useDrizzleLive((db) => db.select().from(schema.memory_blocks));
 */
export const { useDrizzleLive, useDrizzleLiveIncremental, useDrizzlePGlite } = createDrizzle({ schema });

/**
 * PGlite Provider for the app - wrap your app with this
 */
export { BasePGliteProvider as PGliteProvider };
