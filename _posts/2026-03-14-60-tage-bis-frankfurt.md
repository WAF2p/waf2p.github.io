---
date: 2026-03-14
lang: de
title: "60 Tage bis Frankfurt: Warum WAF++ das wichtigste Cloud-Framework sein könnte, von dem du noch nie gehört hast"
description: "60 Tage vor der Cloud Native Conference 2026 steht WAF++ kurz vor dem v1-Release. Ein vendor-neutrales, open-source Assessment-Framework für Cloud-Architekturen — und warum es jetzt relevant ist."
categories:
  - cloud
  - open_source
  - governance
author_staff_member: sascha
---

Es gibt eine ganz bestimmte Art von Frustration, die jeder erfahrene Cloud-Architekt kennt. Man sitzt in einem Raum und reviewt ein Infrastrukturdesign. Die Arbeit sieht auf den ersten Blick solide aus — multi-region, auto-skaliert, ordentlich getaggt. Aber stellt man dem Team eine direkte Frage — warum dieser Provider, warum diese Region, was passiert, wenn wir migrieren müssen — werden die Antworten vage. Nicht weil die Engineers schlecht sind. Sondern weil das Framework, das sie für diese Entscheidungen genutzt haben, genau diese Fragen nie gestellt hat.

WAF++ wurde für genau diesen Moment gebaut.

## Die Lücke, die die großen Frameworks offenlassen

AWS Well-Architected, Azure CAF, GCP Framework — das sind echte, nützliche Werkzeuge. Sie bieten konkrete, produktnahe Orientierung innerhalb ihrer eigenen Ökosysteme. Aber sie teilen eine strukturelle Einschränkung: Sie wurden von Herstellern für Hersteller gebaut. Vendor-Neutralität, Exit-Fähigkeit, regulatorische Souveränität — diese Themen fehlen entweder ganz oder werden als Randnotiz behandelt.

CNCF kommt dem näher. Das Governance-Modell, die Working-Group-Struktur und das Bekenntnis zu offenen Standards machen CNCF zum geistigen Vorläufer von WAF++. Aber CNCF bietet kein einheitliches, konsistentes Assessment-Framework. Es gibt kein Scoring-Modell. Keine nachvollziehbare Beweiskette. Keinen strukturierten Review-Prozess, der mit nachweisbaren, verteidigbaren Entscheidungen endet.

> **Nachvollziehbarkeit statt Bauchgefühl. Kriterien statt Buzzwords.**

Das ist die Lücke, die WAF++ schließt. Nicht indem es AWS WA oder CNCF ersetzt — sondern indem es als vendor-neutrale Assessment-Schicht darüber liegt. Ein Werkzeug, um Entscheidungen zu strukturieren, Trade-offs zu dokumentieren und Governance zu einem Engineering-Artefakt zu machen — nicht zu einer PowerPoint-Folie.

## Sieben Säulen, zwei aktiv, eine Vision

WAF++ strukturiert die Bewertung von Cloud-Architekturen über sieben Säulen: Security, Cost Optimization, Performance Efficiency, Reliability, Operational Excellence, Sustainability und Sovereign. Jede Säule ist darauf ausgelegt, die Fragen zu stellen, die Provider-Frameworks überspringen — inklusive Guidance zu Evidence-Artefakten, Scoring-Logik und regulatorischer Ausrichtung.

Aktuell sind zwei Säulen vollständig aktiv:

- **Säule 2 — Cost Optimization:** FinOps-Prinzipien, Kostentransparenz, Budget-Guardrails und Right-Sizing-Empfehlungen.
- **Säule 7 — Sovereign:** Datensouveränität, Vendor-Lock-in, Exit-Fähigkeit und regulatorische Compliance. Die Säule, die kein großes Provider-Framework als erstklassiges Thema behandelt.

Die verbleibenden fünf Säulen sind geplant und befinden sich in unterschiedlichen Design-Phasen. Das Projekt ist bewusst lean ausgerichtet: Liefern, was real ist — nicht, was auf einer Roadmap-Folie vollständig wirkt.

Das Governance-Modell ist dokumentiert. Die Antora-basierte technische Dokumentation ist teilweise fertig. Und am 12. Mai — einen Tag vor der Cloud Native Conference 2026 in Frankfurt — geht WAF++ Version 1 live: sowohl die Marketing-Plattform als auch die Dokumentation.

## Static-First, deterministisch und bewusst begrenzt

Eine der interessanteren Engineering-Entscheidungen bei WAF++ betrifft die Plattform selbst. Website und Dokumentation basieren auf einer konsequenten Static-First-Architektur: Jekyll für das öffentliche Web, Antora für die technische Dokumentation, GitHub Pages für das Hosting. Keine Runtime-API-Abhängigkeiten. Kein Plugin-Magie. Kein dynamisches Rendering.

Das ist keine Kostensparmaßnahme — es ist eine bewusste philosophische Entscheidung. Jeder Build ist reproduzierbar. Jede Seite ist auditierbar. GitHub-Contributor-Daten werden zur Build-Zeit abgerufen und als lokales JSON gecacht. SEO-Metadaten werden in jedem Artikel explizit im Frontmatter definiert — niemals vom Theme-Standard abgeleitet.

Das Prinzip zieht sich durch das gesamte Projekt: explizite Konfiguration statt impliziter Magie. Dasselbe Prinzip, das das Governance-Framework antreibt — wer seine Arbeit nicht zeigen kann, dessen Entscheidung ist nicht nachvollziehbar.

Die mehrsprachige Unterstützung (Englisch und Deutsch) folgt derselben Logik. Kein i18n-Plugin, das Build-Komplexität und unvorhersehbares Caching erzeugt. Stattdessen: eine saubere Parallelstruktur unter `/de/`, die volle SEO-Kontrolle und deterministischen Output bei jedem Build liefert.

## YAML als Steuerungssprache

Das Governance-Framework im Kern von WAF++ ist deklarativ in YAML definiert. Jedes Control hat eine ID, eine Säule, einen Schweregrad und eine Menge typisierter Checks, die von einer Policy-Engine validiert werden können — aktuell Terraform.

```yaml
id: SOV-010
pillar: sovereign
severity: high
type: [governance, configuration]
checks:
  - id: tf.region_pinned
    engine: terraform
```

Das ist es, was WAF++ von einer Sammlung von Best-Practice-Dokumenten unterscheidet. Die Controls sind maschinell prüfbar. Evidence-Typen sind typisiert — Architekturdiagramme, IaC, Config-Exports. Die Engine-Abstraktion ermöglicht die Validierung gegen mehrere Tools, ohne die Control-Definition neu schreiben zu müssen.

Das Community-Governance-Modell spiegelt diese Transparenz wider: ein Technical Steering Committee, Maintainer-Teams, Working Groups und ein RFC-Prozess. Jede Entscheidung ist öffentlich dokumentiert. Jede Rolle hat eine definierte Amtszeit und klare Verantwortlichkeiten.

![WAF++ auf der Cloud Native Conference 2026 Frankfurt](https://waf2p.dev/assets/images/articles/cloud_native_conference_waf2p.png)
*Cloud Native Conference 2026 · Frankfurt · 13. Mai 2026*

## Frankfurt ist eine Startlinie, kein Ziel

Die Cloud Native Conference 2026 in Frankfurt — 13. Mai — fällt einen Tag nach dem WAF++ v1-Release. Dieses Timing ist kein Zufall. Die Konferenz ist der erste große Moment, bei dem WAF++ auf die Community trifft, für die es gebaut wurde: Platform Engineers, Cloud-Architekten und die Teams, die Governance-Entscheidungen im großen Maßstab tatsächlich treffen müssen.

Das Ziel ist nicht, mit einem polierten Produkt und einer Demo anzureisen. Das Ziel ist, mit etwas Echtem, Offenem und Review-bereitem anzukommen. Die Säulen sind nicht fertig — und das ist der Punkt. WAF++ ist darauf ausgelegt, öffentlich gebaut und von den Menschen geformt zu werden, die es nutzen.

> **„Wer glaubt, Governance sei das Problem von jemand anderem, war noch nie derjenige, der einer CFO eine 400.000-Dollar-Egress-Rechnung erklären musste."**

Bis zum 12. Mai konzentriert sich das Team auf drei Dinge: die v1-Dokumentationsstruktur in Antora finalisieren, die Sovereign-Säulen-Referenzinhalte vervollständigen und die Governance-YAML-Controls so weit härten, dass sie als echte Audit-Baseline eingesetzt werden können.

Wer die Cloud Native Conference 2026 in Frankfurt besucht, wird das WAF++-Team dort antreffen. Nicht mit einem Vendor-Stand und gebrandeten Werbeartikeln — sondern mit funktionierender Software, offenen RFCs und echtem Interesse daran, zu hören, welche Probleme ihr tatsächlich lösen müsst.

## Die Cloud wird nicht einfacher

Multi-Cloud ist kein Zukunftsszenario mehr — es ist operative Realität für die meisten Organisationen ab einer bestimmten Größe. Und je komplexer das Umfeld wird, desto größer wird die Lücke zwischen „wir haben ein Framework" und „wir können unsere Entscheidungen nachvollziehen".

Der regulatorische Druck beschleunigt das. DSGVO war ein Anfang. DORA, NIS2 und die sich weiterentwickelnde Landschaft von Datenlokalisierungsanforderungen machen Souveränität zu einem erstklassigen technischen Anliegen — nicht nur zu einem rechtlichen. ISO 27001 und NIST bieten solide Compliance-Grundlagen, wurden aber nicht für alltägliche Cloud-Architekturentscheidungen konzipiert.

WAF++ ist kein Compliance-Tool. Es ist ein Engineering-Werkzeug, das Compliance handhabbar macht. Es gibt Platform-Teams die gemeinsame Sprache, das Scoring-Modell und das Evidence-Framework, um die schwierigen Fragen zu beantworten, bevor ein Auditor sie stellt.

## Alles ist offen

WAF++ ist Open Source. Das Framework, die Controls, das Governance-Modell und die Plattform sind alle öffentlich. Beiträge sind nicht nur willkommen — sie sind der eigentliche Punkt. Working Groups bilden sich rund um jede Säule. Der RFC-Prozess ist live.

Wer Cloud-Infrastruktur im großen Maßstab betrieben hat, mit einer Vendor-Lock-in-Situation konfrontiert war, Kostenanomalen gegenüber nicht-technischen Stakeholdern erklären musste oder eine Plattform gebaut hat, die über mehrere regulatorische Regime hinweg compliant sein musste — der hat Wissen, das in WAF++ gehört.

---

**Website:** [waf2p.dev](https://waf2p.dev)
**Repository:** [github.com/waf2p](https://github.com/waf2p)
**Dokumentation:** Live ab 12. Mai 2026
**Cloud Native Conference 2026, Frankfurt — 13. Mai 2026**

---

*WAF++ ist eine Open-Source-Initiative, die nach dem Maintainer-Modell operiert und strategisch auf eine Foundation- oder CNCF-nahe Struktur ausgerichtet ist. Code: Apache 2.0 · Dokumentation & Inhalte: CC BY 4.0*
