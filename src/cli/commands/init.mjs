import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { logger } from '../../utils/logger.mjs';
import { scoreSkill } from '../../validators/rubric-scorer.mjs';

const GENERATOR_TYPES = [
  { name: '📞 Customer Support - 客服支持', value: 'customer-support' },
  { name: '💼 Sales Enablement - 销售赋能', value: 'sales-enablement' },
  { name: '🔄 SOP Automation - 流程自动化', value: 'sop-automation' },
  { name: '🎓 Training & Onboarding - 培训入职', value: 'training-onboarding' },
  { name: '📋 Compliance & Policy - 合规政策', value: 'compliance-policy' },
  { name: '📊 Data Analysis - 数据分析', value: 'data-analysis' },
  { name: '🔗 Workflow Integration - 工作流集成', value: 'workflow-integration' },
  { name: '📝 Meeting & Report - 会议报告', value: 'meeting-report' },
  { name: '💡 Decision Advisor - 决策顾问', value: 'decision-advisor' },
  { name: '📚 Department Knowledge - 部门知识库', value: 'department-knowledge' }
];

export const initCommand = new Command('init')
  .description('Initialize a new skill generation project')
  .option('-n, --name <name>', 'Skill name (lowercase-hyphen-case)')
  .option('-t, --type <type>', 'Generator type')
  .option('-o, --output <path>', 'Output directory')
  .action(async (options) => {
    try {
      logger.section('DNASkill - 企业技能生成向导');

      // Step 1: Collect basic info
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'skillName',
          message: '技能名称 (小写-连字符格式，如 customer-support-refund):',
          default: options.name,
          when: !options.name,
          validate: (input) => {
            if (!/^[a-z0-9-]+$/.test(input)) {
              return '请使用小写字母、数字和连字符';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'generatorType',
          message: '选择生成器类型:',
          choices: GENERATOR_TYPES,
          default: options.type,
          when: !options.type
        },
        {
          type: 'input',
          name: 'outputDir',
          message: '输出目录:',
          default: options.output || './generated-skills',
          when: !options.output
        },
        {
          type: 'input',
          name: 'department',
          message: '目标部门 (如：客服部、销售部):',
        },
        {
          type: 'input',
          name: 'docs',
          message: '企业文档路径 (多个用逗号分隔):',
          validate: (input) => input.trim().length > 0 || '请输入至少一个文档路径'
        }
      ]);

      const skillName = options.name || answers.skillName;
      const generatorType = options.type || answers.generatorType;
      const outputDir = options.output || answers.outputDir;
      const department = answers.department;
      const docPaths = answers.docs.split(',').map(p => p.trim());

      const skillDir = join(outputDir, skillName);

      // Check if directory exists
      if (existsSync(skillDir)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `目录 ${skillDir} 已存在，是否覆盖？`,
            default: false
          }
        ]);
        if (!overwrite) {
          logger.warn('已取消生成');
          return;
        }
      }

      // Step 2: Show generation plan
      logger.section('生成计划');
      console.log(`  技能名称: ${skillName}`);
      console.log(`  生成器类型: ${generatorType}`);
      console.log(`  目标部门: ${department}`);
      console.log(`  输入文档: ${docPaths.length} 个`);
      console.log(`  输出目录: ${skillDir}`);
      console.log('');

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '开始生成？',
          default: true
        }
      ]);

      if (!confirm) {
        logger.warn('已取消生成');
        return;
      }

      // Step 3: Create directory structure
      const spinner = ora('创建目录结构...').start();
      await mkdir(join(skillDir, 'references'), { recursive: true });
      await mkdir(join(skillDir, 'scripts'), { recursive: true });
      spinner.succeed('目录结构已创建');

      // Step 4: Generate guidance file
      spinner.start('生成指导文件...');

      const guidanceContent = `# ${skillName} 生成指导

## 下一步操作

**重要**: DNASkill 当前需要 Claude 辅助生成技能包。

### 方式1: 在 Claude Code 中生成（推荐）

\`\`\`bash
# 确保你在 Claude Code / Claude Desktop 环境中
# 然后输入以下指令：

@dna-skill 请帮我生成一个"${generatorType}"类型的技能包

## 企业信息
- 技能名称: ${skillName}
- 目标部门: ${department}
- 生成器类型: ${generatorType}

## 输入文档
${docPaths.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 要求
- 严格按照 references/generator-catalog.md 中"${generatorType}"的模式生成
- 生成完整的 SKILL.md + references/ + test-prompts.json
- 确保 Rubric 评分 ≥ 85 分
\`\`\`

### 方式2: 手动创建（高级用户）

按照以下结构手动创建文件：

\`\`\`
${skillName}/
├── SKILL.md                      # 核心技能定义
├── references/
│   ├── domain-brief.md           # 部门简介
│   ├── source-map.md             # 来源追溯
│   └── operating-rules.md        # 操作规则
└── test-prompts.json             # 测试用例
\`\`\`

参考模板：
- SKILL模板: ~/.claude/skills/dnaskill/templates/enterprise-skill/SKILL.template.md
- 测试模板: ~/.claude/skills/dnaskill/templates/enterprise-skill/test-prompts.template.json

### 验证质量

生成完成后，运行：

\`\`\`bash
# 验证文件结构
dnaskill validate ${skillDir}/SKILL.md

# 评分（需要 ≥ 85 分）
dnaskill score ${skillDir}/SKILL.md
\`\`\`

---

**生成时间**: ${new Date().toISOString()}
**DNASkill版本**: 0.2.0
`;

      await writeFile(join(skillDir, 'GENERATION_GUIDE.md'), guidanceContent);
      spinner.succeed('指导文件已生成');

      // Step 5: Create placeholder files
      spinner.start('创建占位符文件...');

      const skillPlaceholder = `---
name: ${skillName}
description: "TODO: 请使用 @dna-skill 生成完整的技能定义"
---

# ${skillName}

此文件需要使用 @dna-skill 或手动填写。

请参考 GENERATION_GUIDE.md 获取详细指导。
`;

      await writeFile(join(skillDir, 'SKILL.md'), skillPlaceholder);

      const testPromptsPlaceholder = [
        {
          id: 'happy-path',
          prompt: 'TODO: 添加正常流程测试用例',
          expected: 'TODO: 预期输出'
        },
        {
          id: 'missing-context',
          prompt: 'TODO: 添加缺失上下文测试用例',
          expected: 'TODO: 预期输出'
        },
        {
          id: 'risky-request',
          prompt: 'TODO: 添加风险请求测试用例',
          expected: 'TODO: 预期输出'
        }
      ];

      await writeFile(
        join(skillDir, 'test-prompts.json'),
        JSON.stringify(testPromptsPlaceholder, null, 2)
      );

      spinner.succeed('占位符文件已创建');

      // Success message
      console.log('');
      logger.success('技能项目初始化完成！');
      console.log('');
      console.log('📁 项目目录:', skillDir);
      console.log('📖 下一步指导:', join(skillDir, 'GENERATION_GUIDE.md'));
      console.log('');
      logger.info('请按照 GENERATION_GUIDE.md 中的说明完成技能生成');

    } catch (error) {
      logger.error(`初始化失败: ${error.message}`);
      process.exit(1);
    }
  });
