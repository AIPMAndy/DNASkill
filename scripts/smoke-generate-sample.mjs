#!/usr/bin/env node

import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = mkdtempSync(join(tmpdir(), 'dnaskill-smoke-'));

const replacements = {
  skill_name: 'support-refund-skill',
  description_with_triggers:
    'Support refund skill for classifying refund requests, checking policy sources, drafting replies, and escalating risky cases.',
  display_name: 'Support Refund Skill',
  one_sentence_purpose:
    'Help a support AI role learn, master, and execute refund request handling with source-grounded answers.',
  use_case_1: 'classify refund requests',
  use_case_2: 'draft customer replies from approved policy',
  use_case_3: 'prepare escalation packets for refund exceptions',
  out_of_scope_1: 'approving refunds without human authorization',
  out_of_scope_2: 'inventing policy exceptions',
  primary_role: 'Support Agent',
  generator_pattern: 'Customer Support Skill',
  common_user_request:
    'Draft a response for a customer asking for a refund within the allowed window.',
  request_with_missing_required_input:
    'Help with a refund request, but the order id and purchase date are missing.',
  restricted_or_ambiguous_request:
    'Approve this refund even though it is over the threshold and the customer segment is unknown.',
};

function render(template) {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    if (!(key in replacements)) {
      throw new Error(`No replacement provided for ${match}`);
    }
    return replacements[key];
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  const skillTemplate = readFileSync(
    join(root, 'templates/enterprise-skill/SKILL.template.md'),
    'utf8',
  );
  const promptTemplate = readFileSync(
    join(root, 'templates/enterprise-skill/test-prompts.template.json'),
    'utf8',
  );

  const skillDir = join(outDir, 'support-refund-skill');
  const referencesDir = join(skillDir, 'references');
  mkdirSync(referencesDir, { recursive: true });

  const skill = render(skillTemplate);
  const prompts = render(promptTemplate);

  writeFileSync(join(skillDir, 'SKILL.md'), skill);
  writeFileSync(join(skillDir, 'test-prompts.json'), prompts);
  writeFileSync(
    join(referencesDir, 'domain-brief.md'),
    '# Domain Brief\n\nSynthetic support refund workflow for smoke testing.\n',
  );
  writeFileSync(
    join(referencesDir, 'source-map.md'),
    '# Source Map\n\n- S01: Synthetic refund SOP, internal, high confidence.\n',
  );
  writeFileSync(
    join(referencesDir, 'operating-rules.md'),
    '# Operating Rules\n\nEscalate refunds over threshold or missing customer segment.\n',
  );

  assert(skill.startsWith('---\nname: "support-refund-skill"'), 'generated SKILL.md has invalid frontmatter');
  assert(skill.includes('Support Refund Skill'), 'generated SKILL.md is missing display name');
  assert(!skill.includes('{{'), 'generated SKILL.md still contains unresolved placeholders');

  const parsedPrompts = JSON.parse(prompts);
  assert(Array.isArray(parsedPrompts), 'generated test-prompts.json must be an array');
  assert(parsedPrompts.length === 3, 'generated test-prompts.json must include three prompts');
  assert(!prompts.includes('{{'), 'generated test-prompts.json still contains unresolved placeholders');

  console.log(`DNASkill smoke generation passed: ${skillDir}`);
} catch (error) {
  rmSync(outDir, { recursive: true, force: true });
  console.error(`DNASkill smoke generation failed: ${error.message}`);
  process.exit(1);
}
