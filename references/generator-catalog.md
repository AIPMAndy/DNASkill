# Enterprise Generator Catalog

Choose one primary generator pattern. A focused skill is easier to trigger,
validate, and improve than a broad enterprise assistant.

## Selection Matrix

| Generator | Use When | Avoid When |
|---|---|---|
| Department Knowledge Skill | Users ask role or department questions | The task requires external system actions |
| SOP Automation Skill | A repeatable process has clear steps | The process changes case by case |
| Customer Support Skill | Customer replies, ticket triage, escalation | Legal or medical advice is required |
| Sales Enablement Skill | Sales needs messaging, qualification, proposals | Pricing approval is unbounded |
| Onboarding And Training Skill | New hires need guided learning | Source material is not stable |
| Compliance And Policy Skill | Policy interpretation and risk checks matter | No authoritative policy owner exists |
| Data Analysis Skill | Metrics, dashboards, and definitions drive work | Raw data access rules are unclear |
| Workflow Integration Skill | Internal tools or APIs are central | Integration docs are missing |
| Meeting And Reporting Skill | Recurring summaries and reports are needed | Meeting content is highly confidential |
| Decision Advisor Skill | Leaders need structured trade-off analysis | The decision requires authority the agent lacks |

## 1. Department Knowledge Skill

Purpose: answer department-specific questions with source-grounded guidance.

Required inputs:

- department mission
- roles and responsibilities
- vocabulary map
- source inventory
- escalation paths

Generated behavior:

- answer with cited source labels
- distinguish fact, assumption, and recommendation
- ask for missing context before giving procedural advice

Best test prompts:

- "What does this team own?"
- "Who approves this exception?"
- "Two docs disagree. Which one should I trust?"

## 2. SOP Automation Skill

Purpose: help users execute a repeatable business process.

Required inputs:

- workflow map
- required inputs per step
- decision points
- approval gates
- failure modes

Generated behavior:

- collect required fields
- walk through steps in order
- stop at approval gates
- produce execution notes or handoff packets

Best test prompts:

- "Run the refund review workflow for this case."
- "I am missing one required field. What should I collect?"
- "This request violates a threshold. What happens next?"

## 3. Customer Support Skill

Purpose: classify issues, draft replies, and route tickets.

Required inputs:

- support categories
- tone guide
- escalation rules
- policy snippets
- forbidden claims

Generated behavior:

- classify issue type
- draft customer-facing response
- create internal ticket notes
- escalate restricted cases

Best test prompts:

- "Draft a reply to this refund complaint."
- "Classify this ticket and explain the next action."
- "The customer asks for something policy forbids."

## 4. Sales Enablement Skill

Purpose: support qualification, messaging, objection handling, and proposals.

Required inputs:

- ICP and personas
- product positioning
- case studies
- pricing boundaries
- objection library

Generated behavior:

- tailor messaging to persona and stage
- draft emails, discovery questions, and proposal outlines
- flag pricing or legal approval needs

Best test prompts:

- "Create discovery questions for this customer."
- "Handle this competitor objection."
- "Draft a proposal outline without inventing pricing."

## 5. Onboarding And Training Skill

Purpose: turn training material into a guided learning assistant.

Required inputs:

- role expectations
- learning path
- source lessons
- exercises
- assessment criteria

Generated behavior:

- create role-specific learning plans
- quiz the learner
- explain internal vocabulary
- point to source materials

Best test prompts:

- "Build my first week learning plan."
- "Quiz me on the refund SOP."
- "Explain this internal acronym."

## 6. Compliance And Policy Skill

Purpose: interpret policies, identify risk, and enforce escalation.

Required inputs:

- authoritative policies
- scope of applicability
- risk categories
- required approvals
- prohibited actions

Generated behavior:

- cite policy source
- separate allowed, restricted, and prohibited actions
- escalate ambiguous or regulated cases

Best test prompts:

- "Can I share this data with a vendor?"
- "Which policy applies here?"
- "The request is ambiguous. What is the safe next step?"

## 7. Data Analysis Skill

Purpose: help users interpret metrics, dashboards, and analytical outputs.

Required inputs:

- metric dictionary
- data source map
- dashboard definitions
- caveats and exclusions
- approved analysis templates

Generated behavior:

- explain metric meaning and source
- generate analysis narratives
- flag missing data and invalid comparisons
- avoid unsupported causal claims

Best test prompts:

- "Explain why this metric changed."
- "Write an executive summary for this dashboard."
- "Can I compare these two numbers?"

## 8. Workflow Integration Skill

Purpose: guide or automate work across internal tools and APIs.

Required inputs:

- tool inventory
- API docs
- authentication model
- input and output schemas
- rate limits and failure responses

Generated behavior:

- validate required inputs
- call or describe tool steps
- handle API errors
- produce audit-friendly summaries

Best test prompts:

- "Create this record in the CRM."
- "What fields are required for this API call?"
- "The API returned this error. What should I do?"

## 9. Meeting And Reporting Skill

Purpose: convert meetings, notes, and updates into standardized reports.

Required inputs:

- report templates
- stakeholder list
- decision log format
- action item rules
- confidentiality rules

Generated behavior:

- summarize meetings
- extract decisions, risks, and owners
- create weekly reports or project reviews
- flag sensitive content

Best test prompts:

- "Turn this meeting transcript into a weekly update."
- "Extract decisions and action items."
- "Create a leadership summary without sensitive details."

## 10. Decision Advisor Skill

Purpose: support structured decision-making without taking authority away from
human owners.

Required inputs:

- decision criteria
- constraints
- options
- stakeholder priorities
- risk model

Generated behavior:

- compare options
- show assumptions
- identify irreversible risks
- recommend next analysis or approval steps

Best test prompts:

- "Compare these vendor options."
- "What information is missing before we decide?"
- "Give a recommendation and list the risks."
