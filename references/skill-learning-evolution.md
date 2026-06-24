# Skill Learning And Evolution

DNASkill treats a skill as something an AI role can learn, master, create, and
evolve. The goal is to make skills behave like professional capabilities, not
static prompts.

```text
Learn -> Master -> Create -> Evolve
```

## Research Signals

These research directions inform the strategy:

- Curriculum learning shows the value of presenting learning examples in a
  meaningful order, from simpler concepts toward more complex ones.
  Source: https://ronan.collobert.com/pub/matos/2009_curriculum_icml.pdf
- Voyager demonstrates an agent architecture with an automatic curriculum, an
  expanding skill library, and iterative improvement from feedback.
  Source: https://arxiv.org/abs/2305.16291
- Reflexion shows how language agents can improve by converting feedback into
  verbal reflection memory for later attempts.
  Source: https://arxiv.org/abs/2303.11366
- Deliberate practice research emphasizes targeted effort, feedback, and
  activities designed to improve specific weaknesses.
  Source: https://doi.org/10.1037/0033-295X.100.3.363

## The Four Strategy Layer

### 1. Curriculum ladder

Build a learning ladder for every generated enterprise skill.

```yaml
curriculum:
  novice:
    - "Identify request type"
    - "Find the authoritative source"
  practitioner:
    - "Run the standard workflow"
    - "Produce the department output format"
  expert:
    - "Handle ambiguous cases"
    - "Escalate risky requests with a complete handoff packet"
```

Rules:

- start with low-risk, common tasks
- add one complexity dimension at a time
- keep restricted or regulated cases for advanced stages
- attach a test prompt to each stage

### 2. Skill library

Store successful skills and reusable sub-skills in a searchable library.

Each library item should include:

- skill name
- owner department
- primary role
- source ids
- inputs and outputs
- known limitations
- test prompts
- version and score

Use the library to compose new skills. Example: a Sales Enablement Skill can
reuse customer profile analysis from a Department Knowledge Skill and escalation
rules from a Compliance And Policy Skill.

### 3. Reflective memory

When a skill fails, convert the failure into a short reflection.

```yaml
reflection:
  task: "Draft response for refund exception"
  failure: "Answered before checking refund threshold"
  feedback: "Must check threshold and customer segment before drafting"
  fix: "Add threshold check before response generation"
  new_test_prompt: "Customer requests refund above threshold with missing segment"
```

Reflection rules:

- record the concrete failure, not vague dissatisfaction
- link the failure to a workflow step or risk rule
- add or update one test prompt
- revise the smallest relevant instruction

### 4. Deliberate practice

Practice should target weak steps, not repeat easy cases.

For each weak step:

1. create 3-5 prompts that isolate the weakness
2. define the expected behavior
3. run the skill before and after the change
4. keep the change only when behavior improves
5. move persistent weaknesses into `references/operating-rules.md`

## Evolution Loop

Use this loop after every pilot or real workflow:

1. Capture: task, input, output, feedback, source ids, risk level.
2. Diagnose: classify the failure as trigger, source, workflow, risk, format, or tool behavior.
3. Practice: create a targeted prompt for the weak step.
4. Patch: update `SKILL.md`, a reference file, or a validation script.
5. Verify: run test prompts and score against the enterprise rubric.
6. Promote: update the skill library only if the new version improves.

## Mastery Signals

An AI role has mastered a skill when:

- it knows when to use the skill and when not to use it
- it asks for missing required inputs instead of guessing
- it cites source ids for enterprise facts
- it handles happy-path requests without extra guidance
- it escalates restricted or ambiguous cases
- it produces the department's expected output format
- it improves after targeted feedback without expanding scope unnecessarily

## What Not To Do

- Do not call a skill evolved because the README is more polished.
- Do not add broad instructions that make the skill harder to trigger.
- Do not treat all failures as prompt wording problems; source gaps and process
  gaps are different.
- Do not store confidential real examples in an open-source skill library.
