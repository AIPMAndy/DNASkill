import { readMarkdownWithFrontmatter, readJSON, fileExists } from '../utils/file-reader.mjs';
import { join, dirname } from 'node:path';

/**
 * Enterprise Quality Rubric Scorer
 * Scores a generated skill package out of 100 points across 9 dimensions
 */

export class RubricScorer {
  constructor(skillPath) {
    this.skillPath = skillPath;
    this.skillDir = dirname(skillPath);
  }

  /**
   * Score the skill package
   * @returns {Object} { total, breakdown, passed, issues }
   */
  async score() {
    const breakdown = {
      triggerClarity: await this.scoreTriggerClarity(),
      sourceGrounding: await this.scoreSourceGrounding(),
      workflowSpecificity: await this.scoreWorkflowSpecificity(),
      departmentFit: await this.scoreDepartmentFit(),
      riskControls: await this.scoreRiskControls(),
      progressiveDisclosure: await this.scoreProgressiveDisclosure(),
      testCoverage: await this.scoreTestCoverage(),
      reusability: await this.scoreReusability(),
      evolutionReadiness: await this.scoreEvolutionReadiness()
    };

    const total = Object.values(breakdown).reduce((sum, score) => sum + score.points, 0);
    const maxPoints = Object.values(breakdown).reduce((sum, score) => sum + score.maxPoints, 0);
    const passed = total >= 85;

    const issues = Object.entries(breakdown)
      .filter(([_, score]) => score.issues.length > 0)
      .flatMap(([dimension, score]) =>
        score.issues.map(issue => ({ dimension, issue }))
      );

    return {
      total,
      maxPoints,
      percentage: Math.round((total / maxPoints) * 100),
      breakdown,
      passed,
      issues,
      recommendation: this.getRecommendation(total)
    };
  }

  /**
   * Dimension 1: Trigger Clarity (10 points)
   * Check if the skill has clear trigger conditions
   */
  async scoreTriggerClarity() {
    const issues = [];
    let points = 0;

    try {
      const { frontmatter, body } = readMarkdownWithFrontmatter(this.skillPath);

      // Check frontmatter name (2 points)
      if (frontmatter.name && /^[a-z0-9-]+$/.test(frontmatter.name)) {
        points += 2;
      } else {
        issues.push('Frontmatter name missing or not in lowercase-hyphen-case');
      }

      // Check frontmatter description (3 points)
      if (frontmatter.description && frontmatter.description.length > 20) {
        points += 3;
      } else {
        issues.push('Frontmatter description missing or too short (needs > 20 chars)');
      }

      // Check for "When To Use" section (3 points)
      if (body.includes('## When To Use') || body.includes('## When to use')) {
        points += 3;
      } else {
        issues.push('Missing "When To Use" section');
      }

      // Check for specific trigger examples (2 points)
      const hasTriggerExamples = body.match(/trigger/gi) && body.match(/when.*:/gi);
      if (hasTriggerExamples) {
        points += 2;
      } else {
        issues.push('Missing specific trigger examples');
      }

    } catch (error) {
      issues.push(`Failed to read SKILL.md: ${error.message}`);
    }

    return { points, maxPoints: 10, issues };
  }

  /**
   * Dimension 2: Source Grounding (15 points)
   * Check if facts trace back to sources
   */
  async scoreSourceGrounding() {
    const issues = [];
    let points = 0;

    try {
      const sourceMapPath = join(this.skillDir, 'references', 'source-map.md');

      // Check if source-map exists (5 points)
      if (fileExists(sourceMapPath)) {
        points += 5;

        const content = readMarkdownWithFrontmatter(sourceMapPath).body;

        // Check for source entries (5 points)
        const hasSourceEntries = content.includes('- id:') || content.includes('sources:');
        if (hasSourceEntries) {
          points += 5;
        } else {
          issues.push('source-map.md exists but contains no source entries');
        }

        // Check for required fields (5 points)
        const requiredFields = ['owner', 'location', 'sensitivity'];
        const hasAllFields = requiredFields.every(field => content.includes(field));
        if (hasAllFields) {
          points += 5;
        } else {
          const missing = requiredFields.filter(f => !content.includes(f));
          issues.push(`source-map.md missing fields: ${missing.join(', ')}`);
        }

      } else {
        issues.push('references/source-map.md does not exist');
      }

    } catch (error) {
      issues.push(`Source grounding check failed: ${error.message}`);
    }

    return { points, maxPoints: 15, issues };
  }

  /**
   * Dimension 3: Workflow Specificity (15 points)
   * Check if workflow steps are clear and executable
   */
  async scoreWorkflowSpecificity() {
    const issues = [];
    let points = 0;

    try {
      const { body } = readMarkdownWithFrontmatter(this.skillPath);

      // Check for Workflow section (5 points)
      if (body.includes('## Workflow') || body.includes('## Work Flow')) {
        points += 5;
      } else {
        issues.push('Missing "Workflow" section');
      }

      // Check for numbered or bulleted steps (5 points)
      const hasSteps = body.match(/^\d+\./gm) || body.match(/^-\s/gm);
      if (hasSteps && hasSteps.length >= 3) {
        points += 5;
      } else {
        issues.push('Workflow needs at least 3 clear steps');
      }

      // Check for input/output definitions (5 points)
      const hasInputs = body.toLowerCase().includes('input') || body.toLowerCase().includes('required');
      const hasOutputs = body.toLowerCase().includes('output') || body.toLowerCase().includes('return');
      if (hasInputs && hasOutputs) {
        points += 5;
      } else {
        if (!hasInputs) issues.push('Workflow missing input definitions');
        if (!hasOutputs) issues.push('Workflow missing output definitions');
      }

    } catch (error) {
      issues.push(`Workflow check failed: ${error.message}`);
    }

    return { points, maxPoints: 15, issues };
  }

  /**
   * Dimension 4: Department Fit (10 points)
   * Check if the skill matches department context
   */
  async scoreDepartmentFit() {
    const issues = [];
    let points = 0;

    try {
      const domainBriefPath = join(this.skillDir, 'references', 'domain-brief.md');

      if (fileExists(domainBriefPath)) {
        points += 5;

        const content = readMarkdownWithFrontmatter(domainBriefPath).body;

        // Check for department info (5 points)
        const hasDepartment = content.includes('department') || content.includes('Department');
        const hasRoles = content.includes('role') || content.includes('Role');

        if (hasDepartment && hasRoles) {
          points += 5;
        } else {
          if (!hasDepartment) issues.push('domain-brief.md missing department information');
          if (!hasRoles) issues.push('domain-brief.md missing role definitions');
        }
      } else {
        issues.push('references/domain-brief.md does not exist');
      }

    } catch (error) {
      issues.push(`Department fit check failed: ${error.message}`);
    }

    return { points, maxPoints: 10, issues };
  }

  /**
   * Dimension 5: Risk Controls (15 points)
   * Check for explicit risk and escalation rules
   */
  async scoreRiskControls() {
    const issues = [];
    let points = 0;

    try {
      const { body } = readMarkdownWithFrontmatter(this.skillPath);
      const operatingRulesPath = join(this.skillDir, 'references', 'operating-rules.md');

      // Check for risk section in SKILL.md (5 points)
      const hasRiskSection = body.includes('## Risk') || body.includes('## Escalation');
      if (hasRiskSection) {
        points += 5;
      } else {
        issues.push('Missing "Risk And Escalation Rules" section in SKILL.md');
      }

      // Check for operating-rules.md (5 points)
      if (fileExists(operatingRulesPath)) {
        points += 5;

        const content = readMarkdownWithFrontmatter(operatingRulesPath).body;

        // Check for key risk controls (5 points)
        const hasPermissions = content.toLowerCase().includes('permission');
        const hasEscalation = content.toLowerCase().includes('escalat');
        const hasProhibited = content.toLowerCase().includes('prohibit') || content.toLowerCase().includes('must not');

        if (hasPermissions && hasEscalation && hasProhibited) {
          points += 5;
        } else {
          const missing = [];
          if (!hasPermissions) missing.push('permissions');
          if (!hasEscalation) missing.push('escalation rules');
          if (!hasProhibited) missing.push('prohibited actions');
          issues.push(`operating-rules.md missing: ${missing.join(', ')}`);
        }
      } else {
        issues.push('references/operating-rules.md does not exist');
      }

    } catch (error) {
      issues.push(`Risk controls check failed: ${error.message}`);
    }

    return { points, maxPoints: 15, issues };
  }

  /**
   * Dimension 6: Progressive Disclosure (10 points)
   * Check if details are moved to references/
   */
  async scoreProgressiveDisclosure() {
    const issues = [];
    let points = 0;

    try {
      const { body } = readMarkdownWithFrontmatter(this.skillPath);
      const lines = body.split('\n').length;

      // Check SKILL.md length (5 points)
      if (lines <= 500) {
        points += 5;
      } else {
        issues.push(`SKILL.md is ${lines} lines (should be ≤ 500)`);
      }

      // Check references/ directory (5 points)
      const referencesDir = join(this.skillDir, 'references');
      if (fileExists(referencesDir)) {
        const hasMultipleRefs = ['domain-brief.md', 'source-map.md', 'operating-rules.md']
          .filter(file => fileExists(join(referencesDir, file))).length >= 2;

        if (hasMultipleRefs) {
          points += 5;
        } else {
          issues.push('references/ directory should contain at least 2 reference files');
        }
      } else {
        issues.push('references/ directory does not exist');
      }

    } catch (error) {
      issues.push(`Progressive disclosure check failed: ${error.message}`);
    }

    return { points, maxPoints: 10, issues };
  }

  /**
   * Dimension 7: Test Coverage (10 points)
   * Check for comprehensive test prompts
   */
  async scoreTestCoverage() {
    const issues = [];
    let points = 0;

    try {
      const testPromptsPath = join(this.skillDir, 'test-prompts.json');

      if (fileExists(testPromptsPath)) {
        points += 3;

        const testPrompts = readJSON(testPromptsPath);

        // Check minimum 3 prompts (2 points)
        if (Array.isArray(testPrompts) && testPrompts.length >= 3) {
          points += 2;
        } else {
          issues.push('test-prompts.json should contain at least 3 test prompts');
        }

        // Check for required test types (5 points)
        const ids = testPrompts.map(p => p.id);
        const hasHappyPath = ids.some(id => id.includes('happy'));
        const hasMissingContext = ids.some(id => id.includes('missing'));
        const hasRisky = ids.some(id => id.includes('risk') || id.includes('restricted'));

        if (hasHappyPath) points += 2;
        else issues.push('Missing happy-path test prompt');

        if (hasMissingContext) points += 2;
        else issues.push('Missing missing-context test prompt');

        if (hasRisky) points += 1;
        else issues.push('Missing risky-request test prompt');

      } else {
        issues.push('test-prompts.json does not exist');
      }

    } catch (error) {
      issues.push(`Test coverage check failed: ${error.message}`);
    }

    return { points, maxPoints: 10, issues };
  }

  /**
   * Dimension 8: Reusability (5 points)
   * Check if the skill can be reused as a template
   */
  async scoreReusability() {
    const issues = [];
    let points = 0;

    try {
      const { body } = readMarkdownWithFrontmatter(this.skillPath);

      // Check for placeholders or generic patterns (3 points)
      const hasGenericPatterns = body.includes('{{') || body.match(/\[.*\]/g);
      if (hasGenericPatterns) {
        points += 3;
      } else {
        issues.push('Skill should use placeholders or generic patterns for reusability');
      }

      // Check for clear structure (2 points)
      const hasClearSections = (body.match(/^## /gm) || []).length >= 5;
      if (hasClearSections) {
        points += 2;
      } else {
        issues.push('Skill should have at least 5 clear sections for reusability');
      }

    } catch (error) {
      issues.push(`Reusability check failed: ${error.message}`);
    }

    return { points, maxPoints: 5, issues };
  }

  /**
   * Dimension 9: Evolution Readiness (10 points)
   * Check for feedback and improvement mechanisms
   */
  async scoreEvolutionReadiness() {
    const issues = [];
    let points = 0;

    try {
      const { body } = readMarkdownWithFrontmatter(this.skillPath);

      // Check for validation section (5 points)
      if (body.includes('## Validation')) {
        points += 5;
      } else {
        issues.push('Missing "Validation" section for evolution tracking');
      }

      // Check for feedback mechanisms (5 points)
      const hasFeedback = body.toLowerCase().includes('feedback') ||
                          body.toLowerCase().includes('improve') ||
                          body.toLowerCase().includes('evolve');
      if (hasFeedback) {
        points += 5;
      } else {
        issues.push('Missing feedback or improvement mechanisms');
      }

    } catch (error) {
      issues.push(`Evolution readiness check failed: ${error.message}`);
    }

    return { points, maxPoints: 10, issues };
  }

  /**
   * Get recommendation based on total score
   */
  getRecommendation(total) {
    if (total >= 90) {
      return 'Enterprise-ready. Ready for pilot deployment.';
    } else if (total >= 85) {
      return 'Ready with minor review. Address minor issues before deployment.';
    } else if (total >= 75) {
      return 'Draft quality. Needs targeted revision before deployment.';
    } else {
      return 'Not ready. Significant improvements needed.';
    }
  }
}

/**
 * Score a skill package
 * @param {string} skillPath - Path to SKILL.md
 * @returns {Promise<Object>} Score result
 */
export async function scoreSkill(skillPath) {
  const scorer = new RubricScorer(skillPath);
  return await scorer.score();
}
