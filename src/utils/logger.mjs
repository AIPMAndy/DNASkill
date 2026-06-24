import chalk from 'chalk';

export const logger = {
  success(message) {
    console.log(chalk.green('✓'), message);
  },

  error(message) {
    console.error(chalk.red('✗'), message);
  },

  warn(message) {
    console.warn(chalk.yellow('⚠'), message);
  },

  info(message) {
    console.log(chalk.blue('ℹ'), message);
  },

  debug(message) {
    if (process.env.DEBUG) {
      console.log(chalk.gray('→'), message);
    }
  },

  section(title) {
    console.log('\n' + chalk.bold.cyan(title));
  },

  score(label, value, maxValue) {
    const percentage = (value / maxValue) * 100;
    const color = percentage >= 85 ? chalk.green : percentage >= 75 ? chalk.yellow : chalk.red;
    console.log(`  ${label}: ${color(value)}/${maxValue} (${color(percentage.toFixed(0) + '%')})`);
  }
};
