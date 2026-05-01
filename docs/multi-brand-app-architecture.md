# Multi-Brand App Architecture

This project should evolve as a command center that coordinates multiple isolated brand applications, not as one large workspace where all brand data and workflows are mixed together.

## Core Decision

2clouds AI Marketing Department is the front-facing command center.

Each client brand is a logically independent Brand App that can operate on its own:

- independent brand brain
- independent product, customer, visual, and channel context
- independent tasks, submissions, reviews, trace logs, and revenue signals
- independent brand-specific skills and prompt context
- independent permissions and member workspace boundaries

The command center can see cross-brand operating status, but brand apps must not leak confidential data or working context into each other.

## Why This Matters

The platform must support real client operations. A problem in one brand's content, prompt, visual rules, ad data, or customer information must not affect another brand.

This architecture protects:

- client confidentiality
- brand-specific strategy
- platform reliability
- member accountability
- reviewer quality control
- future integrations with ecommerce, Meta, Google Ads, LINE, and other channel data

## Application Shape

The app should be organized around two layers:

```text
2clouds Command Center
├── team cockpit
├── newcomer training
├── brand directory
├── reviewer queue
├── member workspaces
└── cross-brand performance overview

Brand App
├── brand cockpit
├── brand brain
├── product brain
├── customer brain
├── visual brain
├── daily tasks
├── submissions
├── reviews
├── trace logs
├── revenue signals
├── senior member activity
└── channel modules
    ├── ecommerce
    ├── Meta
    ├── Google Ads
    └── LINE
```

## Routing Direction

Start with routes like:

```text
/brands
/brands/[brandId]
/brands/[brandId]/brain
/brands/[brandId]/tasks
/brands/[brandId]/submissions
/brands/[brandId]/reviews
/brands/[brandId]/performance
/members/[memberId]/workspace
```

The platform home remains the 2clouds command center. Brand routes are scoped to one brand at a time.

## Data Boundary

Any client-brand operating entity must carry `brandId`.

Examples:

```ts
type ClientBrand = {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
};

type BrandTask = {
  id: string;
  brandId: string;
  title: string;
};

type BrandBrainNode = {
  id: string;
  brandId: string;
  type: "strategy" | "product" | "customer" | "visual" | "channel" | "revenue";
};

type Submission = {
  id: string;
  brandId: string;
  taskId: string;
  authorId: string;
};

type Review = {
  id: string;
  brandId: string;
  submissionId: string;
  reviewerId: string;
};

type RevenueSignal = {
  id: string;
  brandId: string;
  source: "manual" | "ecommerce" | "meta" | "google_ads" | "line";
};
```

Any member-specific operating entity should also carry `memberId`, `assigneeId`, or `ownerId` as appropriate.

## Member Workspace Boundary

Each member should have an independent operating environment:

- assigned brands
- assigned tasks
- permitted channels
- reviewer queue visibility
- personal training progress
- personal trace history

Members can collaborate on the same brand only through explicit shared brand tasks, reviews, comments, or senior member activity records. Cross-brand data should not be visible just because a member can access another brand.

## Skill and Prompt Boundary

Prompt context must be composed by scope:

```text
global 2clouds method
+ member role and permission context
+ brand-specific skill
+ brand-specific brain nodes
+ task context
+ reviewer rules
```

Brand-specific skills must not be loaded for unrelated brands. This prevents one brand's positioning, customer data, visual rules, or ad learning from influencing another brand.

## Development Principle

Do not build a generic "all brands mixed together" task board. Build brand-scoped workflows first, then add command-center views that aggregate status without exposing private brand details unnecessarily.

When the architecture is uncertain, consult Jacky Wiki and document the resulting decision before implementing large changes.

## Isolation Specification

The data boundary, permission boundary, minimum viable data pack, and completeness scoring are formally defined in:

→ **[docs/brand-app-isolation-spec.md](./brand-app-isolation-spec.md)**

Key rules:
- Every brand entity must carry `brandId` — no exceptions.
- Members can only access brands they are explicitly assigned to.
- Command Center may aggregate status counts but must not expose private brand detail cross-brand.
- Before a newcomer enters a brand, the brand's Phase 1 data pack must pass the completeness gate.

## Newcomer Brand Entry Workflow

How a newcomer moves from training to real brand operations, including Day 1 checklist:

→ **[docs/brand-onboarding-workflow.md](./brand-onboarding-workflow.md)**

## Brand Intake

How to collect and structure brand data before onboarding:

→ **[docs/brand-intake-checklist.md](./brand-intake-checklist.md)**
→ **[docs/mujiso-intake-prep.md](./mujiso-intake-prep.md)** (木酢寵物達人 — placeholder only)

## Next Product Direction

The next major slice should be:

```text
Multi-brand Command Center + Isolated Brand App Shell
```

Acceptance criteria:

- user can see a brand directory
- user can open one brand workspace
- brand workspace shows brand brain summary, daily tasks, senior member activity, and revenue signals
- all brand data in domain models is scoped by `brandId`
- member-specific work can be scoped by member or assignee
- no brand-specific skill or prompt context is shared across brands by default
- brand app completeness gate is checked before newcomer can enter the brand workspace
