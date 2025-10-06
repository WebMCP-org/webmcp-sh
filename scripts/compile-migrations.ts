import { readMigrationFiles } from 'drizzle-orm/migrator';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const migrations = readMigrationFiles({ migrationsFolder: './drizzle/' });

writeFileSync(
  join(process.cwd(), 'src/react-app/lib/db/migrations.json'),
  JSON.stringify(migrations, null, 2)
);

console.log('✅ Migrations compiled to JSON!');
