import { Command } from 'commander';
import { resolve } from 'node:path';
import { fileExists } from '../../utils/file-reader.mjs';
import { logger } from '../../utils/logger.mjs';

export const validateCommand = new Command('validate')
  .description('Validate skill package structure')
  .argument('<skill-path>', 'Path to SKILL.md or skill directory')
  .action(async (skillPath) => {
    try {
      const absolutePath = resolve(skillPath);

      logger.section('Validating Skill Package Structure');

      const requiredFiles = [
        'SKILL.md',
        'references/domain-brief.md',
        'references/source-map.md',
        'references/operating-rules.md',
        'test-prompts.json'
      ];

      let allPassed = true;

      for (const file of requiredFiles) {
        const filePath = skillPath.endsWith('SKILL.md')
          ? resolve(skillPath, '..', file)
          : resolve(skillPath, file);

        if (fileExists(filePath)) {
          logger.success(`${file}`);
        } else {
          logger.error(`${file} - NOT FOUND`);
          allPassed = false;
        }
      }

      console.log('');

      if (allPassed) {
        logger.success('All required files present');
      } else {
        logger.error('Some required files are missing');
        logger.info('Run "dnaskill generate" to create a complete skill package');
        process.exit(1);
      }

    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });
