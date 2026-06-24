import { Command } from 'commander';
import { resolve } from 'node:path';
import ora from 'ora';
import { scoreSkill } from '../../validators/rubric-scorer.mjs';
import { logger } from '../../utils/logger.mjs';

export const scoreCommand = new Command('score')
  .description('Score a skill package using the Enterprise Quality Rubric')
  .argument('<skill-path>', 'Path to SKILL.md file')
  .option('-v, --verbose', 'Show detailed breakdown')
  .option('--json', 'Output as JSON')
  .action(async (skillPath, options) => {
    const spinner = ora('Scoring skill package...').start();

    try {
      const absolutePath = resolve(skillPath);
      const result = await scoreSkill(absolutePath);

      spinner.succeed('Scoring complete');

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Display results
      logger.section('Enterprise Quality Rubric Score');

      console.log(`\n  Total Score: ${result.passed ? '✅' : '❌'} ${result.total}/${result.maxPoints} (${result.percentage}%)`);
      console.log(`  Status: ${result.recommendation}\n`);

      // Show breakdown
      logger.section('Score Breakdown');
      for (const [dimension, score] of Object.entries(result.breakdown)) {
        const dimensionLabel = dimension
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        logger.score(dimensionLabel, score.points, score.maxPoints);
      }

      // Show issues if any
      if (result.issues.length > 0) {
        logger.section('Issues Found');
        for (const { dimension, issue } of result.issues) {
          logger.warn(`[${dimension}] ${issue}`);
        }
      }

      // Show recommendation
      console.log(`\n${result.passed ? '✅' : '❌'} ${result.recommendation}\n`);

      if (!result.passed) {
        logger.info('Tip: Address the issues above to reach the 85-point threshold.');
        process.exit(1);
      }

    } catch (error) {
      spinner.fail('Scoring failed');
      logger.error(error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });
