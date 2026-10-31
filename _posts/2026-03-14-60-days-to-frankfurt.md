---
date: 2026-03-14
lang: en
title: "60 Days to Frankfurt: Why WAF++ Might Be the Most Important Cloud Framework You've Never Heard Of"
description: "With 60 days to Cloud Native Conference 2026, WAF++ — the vendor-neutral, open-source cloud architecture framework — is approaching its v1 release. Here's why it matters."
categories:
  - cloud
  - open_source
  - governance
author_staff_member: sascha
---

There is a specific kind of frustration that every seasoned cloud architect knows. You sit in a room, reviewing an infrastructure design. The work looks solid on the surface — multi-region, auto-scaled, properly tagged. But ask the team a direct question — why this provider, why this region, what happens when we need to exit — and the answers get vague. Not because the engineers are bad. Because the framework they used to make those decisions never asked those questions in the first place.

WAF++ was built for exactly that moment.

## The Gap the Big Frameworks Leave Open

AWS Well-Architected, Azure CAF, GCP Framework — these are genuinely useful tools. They provide concrete, product-aligned guidance within their own ecosystems. But they share a structural limitation: they are built by vendors, for vendors. Vendor-neutrality, exit capability, regulatory sovereignty — these concerns are either absent or treated as afterthoughts.

CNCF gets closer. Its governance model, working group structure, and commitment to open standards make it the spiritual ancestor of WAF++. But CNCF does not offer a single, consistent assessment framework. There is no scoring model. No evidence-based audit trail. No way to take a platform team through a structured review that ends with traceable, defensible decisions.

> **Traceability instead of gut feeling. Criteria instead of buzzwords.**

That is the gap WAF++ fills. Not by replacing AWS WA or CNCF — but by sitting above them as a vendor-neutral assessment lens. A way to structure decisions, document trade-offs, and make governance an engineering artifact, not a slide deck.

## Seven Pillars, Two Live, One Vision

WAF++ structures cloud architecture evaluation across seven pillars: Security, Cost Optimization, Performance Efficiency, Reliability, Operational Excellence, Sustainability, and Sovereign. Each pillar is designed to ask the questions that provider frameworks skip — including guidance on evidence artifacts, scoring logic, and regulatory alignment.

As of today, two pillars are fully active:

- **Pillar 2 — Cost Optimization:** FinOps principles, cost transparency, budget guardrails, and right-sizing guidance.
- **Pillar 7 — Sovereign:** Data sovereignty, vendor lock-in, exit capability, and regulatory compliance. The pillar that no major provider framework treats as first-class.

The remaining five pillars are planned and in varying stages of design. The project is intentionally lean: ship what is real, not what looks complete on a roadmap slide.

The governance model is documented. The Antora-based technical documentation is partially built. And on May 12th — one day before the Cloud Native Conference 2026 in Frankfurt — WAF++ version 1 of both the marketing platform and the documentation goes live.

## Static-First, Deterministic, and Deliberately Constrained

One of the more interesting engineering decisions in WAF++ is the platform itself. The website and documentation are built on a strict static-first architecture: Jekyll for the public web, Antora for technical documentation, GitHub Pages for hosting. No runtime API dependencies. No plugin magic. No dynamic rendering.

This is not a cost-cutting measure — it is a philosophical choice. Every build is reproducible. Every page is auditable. GitHub contributor data is fetched at build time and cached as local JSON. SEO metadata is defined explicitly in frontmatter on every article, never inferred from theme defaults.

The principle runs throughout: explicit configuration over implicit magic. It is the same principle that drives the governance framework itself — if you cannot show your work, your decision is not traceable.

Multilingual support (English and German) follows the same logic. No i18n plugin that adds build complexity and unpredictable caching. Instead: a clean parallel structure under `/de/` that gives full SEO control and deterministic output on every build.

## YAML as a Control Language

The governance framework at the heart of WAF++ is defined declaratively in YAML. Each control has an ID, a pillar, a severity level, and a set of typed checks that can be validated by a policy engine — currently Terraform.

```yaml
id: SOV-010
pillar: sovereign
severity: high
type: [governance, configuration]
checks:
  - id: tf.region_pinned
    engine: terraform
```

This is what separates WAF++ from a collection of best-practice documents. The controls are machine-checkable. Evidence types are typed — architecture diagrams, IaC, config exports. The engine abstraction means you can validate against multiple tools without rewriting the control definition.

The community governance model mirrors this transparency: a Technical Steering Committee, Maintainer teams, Working Groups, and an RFC process. Every decision is documented publicly. Every role has a defined term and clear responsibilities.

![WAF++ at Cloud Native Conference 2026 Frankfurt](https://waf2p.dev/assets/images/articles/cloud_native_conference_waf2p.png)
*Cloud Native Conference 2026 · Frankfurt · May 13, 2026*

## Frankfurt Is a Starting Line, Not a Finish

The Cloud Native Conference 2026 in Frankfurt — May 13th — lands one day after the WAF++ v1 release. That timing is not accidental. The conference is the first major moment for WAF++ to meet the community it was built for: platform engineers, cloud architects, and the teams who actually have to make governance decisions at scale.

The goal is not to arrive with a polished product and a demo. The goal is to arrive with something real, open, and ready for review. The pillars are not finished — and that is the point. WAF++ is designed to be built in public, shaped by the people who use it.

> **"If you think governance is someone else's problem, you haven't been the one explaining a $400,000 egress bill to a CFO."**

Between now and May 12th, the team is focused on three things: finalizing the v1 documentation structure in Antora, completing the Sovereign pillar reference content, and hardening the governance YAML controls to the point where they can be used as a real audit baseline.

If you are attending Cloud Native Conference 2026 in Frankfurt, the WAF++ team will be there. Not with a vendor booth and branded swag — but with working software, open RFCs, and a genuine interest in hearing what problems you are actually trying to solve.

## The Cloud Isn't Getting Simpler

Multi-cloud is not a future state anymore — it is operational reality for most organizations above a certain size. And as the environment grows more complex, the gap between "we have a framework" and "we can trace our decisions" grows wider.

Regulatory pressure is accelerating this. GDPR was a starting point. DORA, NIS2, and the evolving landscape of data residency requirements are making sovereignty a first-class technical concern — not just a legal one. ISO 27001 and NIST provide strong compliance foundations, but they were not designed for day-to-day cloud architecture decisions.

WAF++ is not a compliance tool. It is an engineering tool that makes compliance tractable. It gives platform teams the shared language, scoring model, and evidence framework to answer the hard questions before an auditor asks them.

## Everything Is in the Open

WAF++ is open source. The framework, the controls, the governance model, and the platform are all public. Contributions are not just welcome — they are the point. Working Groups are forming around each pillar. The RFC process is live.

If you have operated cloud infrastructure at scale, dealt with a vendor lock-in situation, tried to explain cost anomalies to non-technical stakeholders, or built a platform that needed to be compliant across multiple regulatory regimes — you have knowledge that belongs in WAF++.

---

**Website:** [waf2p.dev](https://waf2p.dev)
**Repository:** [github.com/waf2p](https://github.com/waf2p)
**Documentation:** Live May 12, 2026
**Cloud Native Conference 2026, Frankfurt — May 13, 2026**

---

*WAF++ is an open-source initiative operating under the Maintainer model, with a strategic orientation toward Foundation or CNCF-adjacent structures. Code: Apache 2.0 · Documentation & Content: CC BY 4.0*
