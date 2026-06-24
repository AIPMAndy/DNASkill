#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const htmlPath = resolve(process.argv[2] || `${root}/showcase.html`);
const outputPath = resolve(process.argv[3] || `${root}/templates/result-card.png`);

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    try {
      return await import('playwright-core');
    } catch {
      throw new Error('Install Playwright first: npm install');
    }
  }
}

async function screenshot() {
  if (!existsSync(htmlPath)) {
    throw new Error(`HTML file not found: ${htmlPath}`);
  }

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 1400 },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts?.ready ?? true);
    await page.waitForTimeout(500);

    const card = page.locator('.card').first();
    if (await card.count()) {
      await card.screenshot({ path: outputPath, type: 'png' });
    } else {
      await page.screenshot({ path: outputPath, type: 'png', fullPage: true });
    }
  } finally {
    await browser.close();
  }

  console.log(`Screenshot written: ${outputPath}`);

  if (process.platform === 'darwin' && process.env.CI !== 'true') {
    execFileSync('open', [outputPath], { stdio: 'ignore' });
  }
}

screenshot().catch((error) => {
  console.error(`Screenshot failed: ${error.message}`);
  process.exit(1);
});
