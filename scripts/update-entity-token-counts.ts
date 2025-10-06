import { pg_lite } from '../src/react-app/lib/db/database';
import { memory_entities } from '../src/react-app/lib/db/schema';
import { countTokens } from '../src/react-app/lib/tokenizer';
import { sql } from 'drizzle-orm';

/**
 * Update token costs for all existing memory entities
 */
async function updateEntityTokenCounts() {
  console.log('Updating token costs for all memory entities...');

  try {
    // Get all memory entities
    const entities = await pg_lite.select().from(memory_entities);
    console.log(`Found ${entities.length} memory entities`);

    // Update each entity with calculated token count (name + description)
    for (const entity of entities) {
      const tokens = countTokens(entity.name + ' ' + entity.description);

      await pg_lite
        .update(memory_entities)
        .set({
          token_cost: tokens,
          updated_at: new Date()
        })
        .where(sql`id = ${entity.id}`);

      console.log(`Updated entity "${entity.name}": ${tokens} tokens`);
    }

    console.log('✅ Successfully updated all entity token counts!');
  } catch (error) {
    console.error('❌ Error updating entity token counts:', error);
    process.exit(1);
  }
}

updateEntityTokenCounts();
