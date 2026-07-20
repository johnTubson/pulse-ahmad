/**
 * CLI wrapper around the shared seed generator.
 *
 * Run with: npx tsx scripts/seedData.ts > scripts/seed-data.json
 */
import { generateSeedData } from '../src/lib/mock/seedData';

export {
  DEFAULT_CATEGORIES,
  generateSeedData,
  type SeedCategory,
  type SeedData,
  type SeedOptions,
} from '../src/lib/mock/seedData';

function main(): void {
  const data = generateSeedData();
  process.stderr.write(
    `Generated ${data.expenses.length} expenses and ${data.moods.length} moods across ${data.categories.length} categories.\n`,
  );
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

if (typeof require !== 'undefined' && (require as { main?: unknown }).main === module) {
  main();
}
