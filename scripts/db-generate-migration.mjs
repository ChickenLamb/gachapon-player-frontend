#!/usr/bin/env node

/**
 * Drizzle migration generator with context boundary naming enforcement
 *
 * This script wraps `drizzle-kit generate` to ensure all migrations follow
 * the context boundary naming convention: <context>_<action>_<detail>
 *
 * Example: auth_add_oauth_providers, user_update_profile_fields
 *
 * Usage: pnpm run db:generate
 */

import { execSync } from 'child_process';
import readline from 'readline';

// Context boundary naming pattern: <context>_<action>_<detail>
// Must have at least 3 parts: context, action, and detail (can have more underscores in detail)
const NAMING_PATTERN = /^[a-z]+_[a-z]+_[a-z_]+$/;

function validateNamingConvention(name) {
  if (!NAMING_PATTERN.test(name)) {
    return {
      valid: false,
      message: `Migration name must follow pattern: <context>_<action>_<detail>
Examples:
  - auth_add_oauth_providers
  - user_update_profile_fields
  - payment_create_stripe_integration

Got: ${name}

Rules:
  - Must have at least 3 parts separated by underscores
  - Only lowercase letters and underscores
  - Format: <context>_<action>_<detail>
  - Detail can have multiple underscores (e.g., better_auth_initial_setup)`
    };
  }
  return { valid: true };
}

function promptForName(rl) {
  return new Promise((resolve) => {
    console.log('💡 Pattern: <context>_<action>_<detail>');
    console.log('💡 Examples:');
    console.log('   - auth_add_oauth_providers');
    console.log('   - user_update_profile_fields');
    console.log('   - payment_create_stripe_integration\n');

    rl.question('✏️  Enter migration name (or press Ctrl+C to cancel): ', (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🔍 Drizzle Migration Generator with Context Boundary Naming\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let attempts = 0;
  const MAX_ATTEMPTS = 3;
  let migrationName = null;

  while (attempts < MAX_ATTEMPTS) {
    const name = await promptForName(rl);

    if (!name) {
      console.log('\n❌ Empty name provided');
      attempts++;
      continue;
    }

    const validation = validateNamingConvention(name);
    if (validation.valid) {
      migrationName = name;
      break;
    } else {
      console.log('\n❌ ' + validation.message + '\n');
      attempts++;
    }
  }

  rl.close();

  if (!migrationName) {
    console.log('\n❌ Maximum attempts reached. Migration cancelled.');
    process.exit(1);
  }

  console.log(`\n✅ Using migration name: ${migrationName}\n`);
  console.log('🔄 Generating migration...\n');

  // Run drizzle-kit generate with --name flag
  try {
    execSync(
      `npx drizzle-kit generate --config=drizzle.config.generate.ts --name=${migrationName}`,
      { stdio: 'inherit' }
    );
    console.log('\n✅ Migration generated successfully!');
  } catch (error) {
    console.error('\n❌ Failed to generate migration');
    process.exit(1);
  }
}

main();
