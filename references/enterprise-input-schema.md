# Enterprise Input Schema

Use this schema to convert messy enterprise material into a compact DNA brief.
The brief is the source of truth for generated skills.

## Enterprise Brief

```yaml
enterprise:
  name: "ExampleCo"
  business_unit: "Customer Operations"
  confidentiality: "internal"
  primary_language: "zh-CN"
  generated_for:
    department: "Customer Support"
    roles:
      - "Frontline support agent"
      - "Support team lead"
  success_criteria:
    - "Answer common policy questions with source references"
    - "Route refund edge cases to the correct escalation path"
    - "Generate support replies in the approved tone"
```

## Source Inventory

Every generated skill needs a source map. If a field is unknown, write
`unknown` rather than guessing.

```yaml
sources:
  - id: "S01"
    title: "Refund SOP"
    type: "doc"
    owner: "Support Operations"
    location: "internal-drive/refund-sop"
    last_updated: "2026-05-01"
    sensitivity: "internal"
    confidence: "high"
    notes: "Authoritative for refund process"
```

Sensitivity values:

- `public`: safe for open-source examples
- `internal`: keep inside company workspace
- `restricted`: limit to named roles
- `regulated`: requires compliance review before embedding

## Department Map

```yaml
departments:
  - name: "Customer Support"
    mission: "Resolve customer issues while protecting refund policy compliance"
    roles:
      - role: "Support Agent"
        responsibilities:
          - "Classify inbound issue"
          - "Draft customer response"
          - "Escalate refund exceptions"
        tools:
          - "Zendesk"
          - "Refund console"
        decisions:
          - "Can this issue be resolved directly?"
          - "Does the request require escalation?"
    escalation_paths:
      - trigger: "refund over approved threshold"
        destination: "Support Team Lead"
        required_context:
          - "order id"
          - "customer tier"
          - "refund reason"
```

## Workflow Map

```yaml
workflows:
  - name: "Refund request handling"
    trigger: "Customer asks for refund"
    inputs:
      - "order id"
      - "refund reason"
      - "purchase date"
    steps:
      - "Check refund eligibility window"
      - "Check excluded categories"
      - "Draft response"
      - "Escalate if threshold or exception applies"
    outputs:
      - "customer reply"
      - "internal ticket note"
      - "escalation summary when needed"
    failure_modes:
      - "missing order id"
      - "conflicting policy versions"
      - "regulated customer segment"
```

## Vocabulary Map

```yaml
vocabulary:
  - term: "VIP"
    meaning: "Customer tier with priority support"
    aliases: ["high-value customer", "tier 1"]
    source: "S03"
  - term: "refund window"
    meaning: "Number of days after purchase when refund is allowed"
    source: "S01"
```

## Constraint Map

```yaml
constraints:
  permissions:
    - "Do not approve refunds directly unless policy says the role may do so"
  compliance:
    - "Do not reveal internal fraud signals to customers"
  brand_voice:
    - "Clear, warm, concise"
  must_ask_when_missing:
    - "order id"
    - "purchase date"
  must_escalate_when:
    - "policy conflict"
    - "regulated customer data appears"
```

## Stakeholder Interview Prompts

Ask only the missing questions needed to generate the current skill.

1. Who is the primary user of this skill?
2. What are the top three tasks this user repeats every week?
3. Which source is authoritative when documents conflict?
4. What should the agent never do without human confirmation?
5. What output format does the department already use?
6. What are the most common failure cases?
7. Which tools or data systems does the skill need to mention?
8. Which details must stay private and never enter open-source examples?

## Minimum Brief

If the user wants speed, proceed with the minimum brief:

- primary department
- primary user role
- one workflow
- three source notes
- one risky request type
- expected output format

Mark the result as a draft until the full source map is available.
