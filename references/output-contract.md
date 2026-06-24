# Output Contract

This contract defines what a generated enterprise skill must contain before it
is handed to a user.

## Required File Tree

```text
skill-name/
├── SKILL.md
├── references/
│   ├── domain-brief.md
│   ├── source-map.md
│   └── operating-rules.md
└── test-prompts.json
```

Add `scripts/` only when deterministic validation, parsing, or integration is
needed.

## SKILL.md Contract

Frontmatter:

```yaml
---
name: skill-name
description: "What this skill does, when to use it, and the trigger phrases."
---
```

Body sections:

1. Purpose
2. When To Use
3. Required Inputs
4. Source-Grounding Rules
5. Workflow
6. Output Format
7. Risk And Escalation Rules
8. Validation
9. Handoff Notes

Rules:

- use lowercase hyphen-case for `name`
- keep the description specific and triggerable
- keep core workflow under 500 lines
- use references for bulky policies, schemas, examples, and source maps
- never embed private raw enterprise data in an open-source example

## Reference Contract

`references/domain-brief.md`:

- department or business-unit mission
- primary roles
- top jobs to be done
- vocabulary
- output standards

`references/source-map.md`:

- source id
- title
- owner
- location
- freshness
- sensitivity
- confidence
- notes

`references/operating-rules.md`:

- permissions
- approval gates
- escalation triggers
- prohibited behavior
- fallback behavior

## Test Prompt Contract

`test-prompts.json` must contain at least three prompts:

```json
[
  {
    "id": "happy-path",
    "prompt": "Use the normal workflow for a common request.",
    "expected": "Skill follows the workflow and produces the expected output."
  },
  {
    "id": "missing-context",
    "prompt": "Ask for help with incomplete input.",
    "expected": "Skill asks only for the missing required fields."
  },
  {
    "id": "risky-request",
    "prompt": "Ask for something restricted or ambiguous.",
    "expected": "Skill refuses, escalates, or asks for authorization."
  }
]
```

## Enterprise Quality Rubric

| Dimension | Points | Checks |
|---|---:|---|
| Trigger clarity | 10 | Clear frontmatter, examples, no broad assistant wording |
| Source grounding | 15 | Facts cite sources or assumptions |
| Workflow specificity | 15 | Steps have inputs, outputs, and stop conditions |
| Department fit | 10 | Roles, tools, vocabulary, and approvals match the team |
| Risk controls | 15 | Permissions, compliance, and sensitive data rules are explicit |
| Progressive disclosure | 10 | Core instructions are lean; details live in references |
| Test coverage | 10 | Happy path, missing context, and risky request are covered |
| Reusability | 5 | Package can seed similar department skills |
| Evolution readiness | 10 | Practice tasks, feedback capture, reflection, and version promotion rules exist |

Report the score out of 100.

Score bands:

- 90-100: ready for enterprise pilot
- 85-89: ready with minor review
- 75-84: draft, needs targeted revision
- below 75: not ready

## Handoff Checklist

- The generated skill path is provided.
- The selected generator pattern is named.
- Source materials and assumptions are listed.
- Sensitive data handling is clear.
- Validation score is shown.
- Skill learning stage and next practice prompts are shown.
- Install or copy instructions are included.
- The next recommended skills are suggested.
