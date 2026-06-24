#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const requiredFiles = [
  'SKILL.md',
  'README.md',
  'README_EN.md',
  'LICENSE',
  'package.json',
  'agents/openai.yaml',
  'references/enterprise-input-schema.md',
  'references/generator-catalog.md',
  'references/skill-learning-evolution.md',
  'references/output-contract.md',
  'templates/enterprise-skill/SKILL.template.md',
  'templates/enterprise-skill/test-prompts.template.json',
  'scripts/screenshot.mjs',
  'scripts/smoke-generate-sample.mjs',
];

const generatorNames = [
  'Department Knowledge Skill',
  'SOP Automation Skill',
  'Customer Support Skill',
  'Sales Enablement Skill',
  'Onboarding And Training Skill',
  'Compliance And Policy Skill',
  'Data Analysis Skill',
  'Workflow Integration Skill',
  'Meeting And Reporting Skill',
  'Decision Advisor Skill',
];

const failures = [];

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
}

if (failures.length === 0) {
  const skill = read('SKILL.md');
  const readme = read('README.md');
  const readmeEn = read('README_EN.md');
  const catalog = read('references/generator-catalog.md');
  const evolution = read('references/skill-learning-evolution.md');
  const outputContract = read('references/output-contract.md');
  const template = read('templates/enterprise-skill/SKILL.template.md');
  const openaiYaml = read('agents/openai.yaml');
  const prompts = JSON.parse(read('templates/enterprise-skill/test-prompts.template.json'));
  const screenshot = read('scripts/screenshot.mjs');
  const bannedTextCorpus = [
    skill,
    readme,
    readmeEn,
    catalog,
    evolution,
    outputContract,
    template,
    openaiYaml,
    read('showcase.html'),
    read('docs/index.html'),
    read('package.json'),
  ].join('\n');

  if (!/^---\nname: dna-skill\n/m.test(skill)) {
    failures.push('SKILL.md frontmatter must declare name: dna-skill');
  }

  if (!skill.includes('enterprise skill generator') || !skill.includes('Enterprise Quality Rubric')) {
    failures.push('SKILL.md must describe the enterprise generator and rubric');
  }

  if (!skill.includes('Learn -> Master -> Create -> Evolve')) {
    failures.push('SKILL.md must emphasize the learn-master-create-evolve system loop');
  }

  if (!readme.includes('像人一样学习技能') || !readme.includes('学习、掌握、创造、进化')) {
    failures.push('README.md must emphasize human-like skill learning and evolution');
  }

  if (!readme.includes('DNASkill') || !readme.includes('10 个企业级 Skill 生成器')) {
    failures.push('README.md must present the DNASkill brand and 10 generators');
  }

  if (!readmeEn.includes('learn skills like humans') || !readmeEn.includes('learn, master, create, and evolve')) {
    failures.push('README_EN.md must emphasize human-like skill learning and evolution');
  }

  if (!readmeEn.includes('DNASkill') || !readmeEn.includes('The 10 Enterprise Generators')) {
    failures.push('README_EN.md must present the English DNASkill positioning');
  }

  if (!openaiYaml.includes('display_name: "DNASkill"') || !openaiYaml.includes('$dna-skill')) {
    failures.push('agents/openai.yaml must expose the DNASkill UI metadata');
  }

  for (const name of generatorNames) {
    if (!catalog.includes(name) || !skill.includes(name)) {
      failures.push(`Generator missing from catalog or skill: ${name}`);
    }
  }

  if (!outputContract.includes('Enterprise Quality Rubric') || !outputContract.includes('test-prompts.json')) {
    failures.push('output-contract.md must include rubric and test prompt contract');
  }

  for (const phrase of ['Curriculum ladder', 'Skill library', 'Reflective memory', 'Deliberate practice']) {
    if (!evolution.includes(phrase)) {
      failures.push(`skill-learning-evolution.md must include strategy: ${phrase}`);
    }
  }

  if (!template.includes('{{skill_name}}') || !template.includes('{{generator_pattern}}')) {
    failures.push('Skill template must expose skill_name and generator_pattern placeholders');
  }

  if (!Array.isArray(prompts) || prompts.length < 3) {
    failures.push('test prompt template must contain at least three prompts');
  }

  if (screenshot.includes('/Users/alchain') || screenshot.includes('.npm-global/lib/node_modules')) {
    failures.push('screenshot script must not hard-code a personal Playwright path');
  }

  for (const banned of ['Darwin Skill', 'darwin-skill', '达尔文', 'alchaincyf/darwin-skill', 'alchaincyf']) {
    if (bannedTextCorpus.includes(banned)) {
      failures.push(`project text must not contain banned legacy reference: ${banned}`);
    }
  }
}

if (failures.length > 0) {
  console.error('DNASkill validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('DNASkill validation passed.');
