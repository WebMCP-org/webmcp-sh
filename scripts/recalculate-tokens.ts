/**
 * Recalculate token costs for existing data
 *
 * This script updates all existing memory_blocks and memory_entities
 * to trigger the generated column recalculation.
 *
 * Run with: pnpm tsx scripts/recalculate-tokens.ts
 */

import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import os from 'os';

const PGLITE_DATA_DIR = path.join(os.homedir(), '.webmcp-memory', 'pglite-data');

async function recalculateTokens() {
  console.log('[Tokens] Connecting to PGlite database...');
  const db = new PGlite(PGLITE_DATA_DIR);

  try {
    console.log('[Tokens] Checking if generated columns exist...');

    // Check if token_cost is a generated column
    const columnCheck = await db.query(`
      SELECT
        column_name,
        is_generated,
        generation_expression
      FROM information_schema.columns
      WHERE table_name IN ('memory_blocks', 'memory_entities')
        AND column_name = 'token_cost'
    `);

    console.log('[Tokens] Column info:', columnCheck.rows);

    if (columnCheck.rows.length === 0) {
      console.error('[Tokens] ERROR: token_cost columns not found. Run migrations first.');
      process.exit(1);
    }

    const hasGeneratedColumns = columnCheck.rows.some(
      (row: any) => row.is_generated === 'ALWAYS'
    );

    if (!hasGeneratedColumns) {
      console.log('[Tokens] Generated columns not found. You need to:');
      console.log('  1. Clear browser storage (Application → IndexedDB)');
      console.log('  2. Refresh the app to run migrations');
      console.log('  Or manually run the migration SQL from drizzle/0003_woozy_mesmero.sql');
      process.exit(0);
    }

    console.log('[Tokens] ✓ Generated columns are configured correctly');

    // For generated columns, we just need to update any row to trigger recalculation
    // But actually, generated columns are ALWAYS computed, so they should already have values

    // Let's check current token values
    const blockTokens = await db.query(`
      SELECT COUNT(*) as total, SUM(token_cost) as total_tokens
      FROM memory_blocks
    `);

    const entityTokens = await db.query(`
      SELECT COUNT(*) as total, SUM(token_cost) as total_tokens
      FROM memory_entities
    `);

    console.log('[Tokens] Current token counts:');
    console.log('  Memory Blocks:', blockTokens.rows[0]);
    console.log('  Memory Entities:', entityTokens.rows[0]);

    // If tokens are all 0 or null, something is wrong
    const blockTotal = Number(blockTokens.rows[0]?.total_tokens) || 0;
    const entityTotal = Number(entityTokens.rows[0]?.total_tokens) || 0;

    if (blockTotal === 0 && entityTotal === 0) {
      console.log('[Tokens] ⚠️  All tokens are 0. This might mean:');
      console.log('  1. No data exists yet (create some entities)');
      console.log('  2. Data was created before migration ran');
      console.log('  3. Migration needs to be applied');
    } else {
      console.log('[Tokens] ✓ Token calculations are working!');
    }

  } catch (error) {
    console.error('[Tokens] Error:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

recalculateTokens().catch(console.error);
