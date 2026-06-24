import { describe, it, expect, beforeAll } from 'vitest';
import { scoreSkill } from '../../src/validators/rubric-scorer.mjs';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

describe('RubricScorer', () => {
  const testDir = join(process.cwd(), 'tests', 'fixtures', 'test-skill');
  const skillPath = join(testDir, 'SKILL.md');

  beforeAll(() => {
    // Clean up if exists
    rmSync(testDir, { recursive: true, force: true });

    // Create test skill package
    mkdirSync(join(testDir, 'references'), { recursive: true });

    // Create minimal SKILL.md
    writeFileSync(skillPath, `---
name: test-skill
description: A test skill for validating the Rubric scorer
---

# Test Skill

## When To Use

Use when testing the Rubric scorer.

## Workflow

1. Read input
2. Process data
3. Return output

## Required Inputs

- input field

## Output Format

Returns structured data.

## Risk And Escalation Rules

Must escalate when threshold exceeded.

## Validation

Test with sample prompts.
`);

    // Create source-map.md
    writeFileSync(join(testDir, 'references', 'source-map.md'), `# Source Map

- id: S01
  title: Test Document
  owner: Test Team
  location: /test/path
  sensitivity: internal
`);

    // Create domain-brief.md
    writeFileSync(join(testDir, 'references', 'domain-brief.md'), `# Domain Brief

## Department

Test Department

## Roles

- Test Role
`);

    // Create operating-rules.md
    writeFileSync(join(testDir, 'references', 'operating-rules.md'), `# Operating Rules

## Permissions

Must check permissions.

## Escalation

Escalate when needed.

## Prohibited

Do not share sensitive data.
`);

    // Create test-prompts.json
    writeFileSync(join(testDir, 'test-prompts.json'), JSON.stringify([
      { id: 'happy-path', prompt: 'Test happy path', expected: 'Success' },
      { id: 'missing-context', prompt: 'Test missing', expected: 'Ask for input' },
      { id: 'risky-request', prompt: 'Test risk', expected: 'Escalate' }
    ], null, 2));
  });

  it('should score a complete skill package', async () => {
    const result = await scoreSkill(skillPath);

    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('maxPoints', 100);
    expect(result).toHaveProperty('breakdown');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('recommendation');
  });

  it('should pass a well-structured skill', async () => {
    const result = await scoreSkill(skillPath);

    expect(result.total).toBeGreaterThanOrEqual(85);
    expect(result.passed).toBe(true);
  });

  it('should have all 9 dimensions', async () => {
    const result = await scoreSkill(skillPath);

    const dimensions = [
      'triggerClarity',
      'sourceGrounding',
      'workflowSpecificity',
      'departmentFit',
      'riskControls',
      'progressiveDisclosure',
      'testCoverage',
      'reusability',
      'evolutionReadiness'
    ];

    for (const dimension of dimensions) {
      expect(result.breakdown).toHaveProperty(dimension);
      expect(result.breakdown[dimension]).toHaveProperty('points');
      expect(result.breakdown[dimension]).toHaveProperty('maxPoints');
      expect(result.breakdown[dimension]).toHaveProperty('issues');
    }
  });

  it('should identify missing files', async () => {
    // Remove source-map.md
    rmSync(join(testDir, 'references', 'source-map.md'));

    const result = await scoreSkill(skillPath);

    expect(result.breakdown.sourceGrounding.points).toBe(0);
    expect(result.breakdown.sourceGrounding.issues.length).toBeGreaterThan(0);
  });
});
