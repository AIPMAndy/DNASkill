#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

const program = new Command();

program
  .name('dnaskill')
  .description('Enterprise skill generator for turning company knowledge into Agent Skills')
  .version(packageJson.version);

// Import commands
import { scoreCommand } from './commands/score.mjs';
import { validateCommand } from './commands/validate.mjs';
import { generateCommand } from './commands/generate.mjs';
import { initCommand } from './commands/init.mjs';

// Register commands
program.addCommand(initCommand);
program.addCommand(scoreCommand);
program.addCommand(validateCommand);
program.addCommand(generateCommand);

// Parse arguments
program.parse(process.argv);
