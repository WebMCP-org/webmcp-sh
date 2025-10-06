import { pg_lite } from '../src/react-app/lib/db/database';
import { memory_blocks_table } from '../src/react-app/lib/db/schema';
import { countTokens } from '../src/react-app/lib/tokenizer';
import { sql } from 'drizzle-orm';

/**
 * Update token counts for all existing memory blocks
 */
async function updateTokenCounts() {
  console.log('Updating token counts for all memory blocks...');

  try {
    // Get all memory blocks
    const blocks = await pg_lite.select().from(memory_blocks_table);
    console.log(`Found ${blocks.length} memory blocks`);

    // Update each block with calculated token count
    for (const block of blocks) {
      const tokens = countTokens(block.value);

      await pg_lite
        .update(memory_blocks_table)
        .set({
          token_cost: tokens,
          updated_at: new Date()
        })
        .where(sql`id = ${block.id}`);

      console.log(`Updated block "${block.label}": ${tokens} tokens`);
    }

    console.log('✅ Successfully updated all token counts!');
  } catch (error) {
    console.error('❌ Error updating token counts:', error);
    process.exit(1);
  }
}

updateTokenCounts();
