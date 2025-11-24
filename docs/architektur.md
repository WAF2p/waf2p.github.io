---
title: "Architektur"
subtitle: "Referenzmodelle, Reifegrad und Entscheidungsleitfäden"
---

## Referenzmodell

WAF++ beschreibt ein abstrahiertes Referenzmodell für Cloud-Plattformen, das u.a. umfasst:

- **Infrastruktur-Layer** (Compute, Storage, Netzwerk)
- **Plattform-Layer** (Kubernetes, Service Mesh, CI/CD, Observability)
- **Anwendungs-Layer** (Services, APIs, Workloads)
- **Cross-Cutting Concerns** (Security, Compliance, Kosten, Resilienz)

Ziel ist es, verschiedene Provider und Betriebsmodelle vergleichbar abzubilden.

## Reifegradmodell (Maturity Model)

Das Reifegradmodell von WAF++ hilft dabei, einen Ist-Stand strukturiert zu bewerten:

- **Level 1 – Ad hoc:** Einzelne Insel-Lösungen, wenig dokumentierte Entscheidungen.
- **Level 2 – Standardisiert:** Wiederverwendbare Patterns, erste Automatisierung.
- **Level 3 – Integriert:** Durchgängige Plattform, KPIs, kontinuierliche Verbesserung.
- **Level 4 – Souverän:** Klare Governance, Portabilität, Audits, kontrollierte Kosten.

Zu jedem Level sollen später **konkrete Kriterien und Fragen** definiert sein, z.B.:

- Welche Monitoring- und Alerting-Standards sind vorhanden?
- Wie werden Security-Policies umgesetzt und geprüft?
- Wie transparent sind Kosten pro Team/Service?

## Architektur-Entscheidungen

WAF++ strebt an, **Entscheidungsleitfäden** anzubieten, u.a. zu:

- Multi- vs. Single-Cloud
- Eigenbetrieb vs. Managed Services
- Netzwerk- und Zero-Trust-Architektur
- Daten- und Compliance-Anforderungen (z.B. Datenlokalität)

Diese Leitfäden sollen als **Fragenkatalog** und **Scoring-Sheets** verfügbar werden, um Architekt:innen durch den
Entscheidungsprozess zu führen.
