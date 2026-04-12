---
layout: post
lang: en
ref: exit-sovereignty
date: 2026-04-13
title: "Exit Is Flight. Not Freedom."
description: "Sovereignty begins with visibility — not with migration. Those who flee the cloud without knowing what they have simply trade one dependency for more complexity. WAF++ explains why exit and sovereignty are two completely different things."
categories:
  - governance
  - cloud
  - open_source
author_staff_member: sascha
image: /assets/images/articles/exit-fig1-en.png
excerpt: "Sovereignty begins with visibility — not with migration. Those who flee the cloud without knowing what they have simply trade one dependency for more complexity."
---

<img src="/assets/images/articles/exit-fig1-en.png" alt="Exit Is Flight. Not Freedom. — WAF++ at Cloud Native Conference 2026" style="width:100%;height:auto;border-radius:12px;margin-bottom:32px;">

I hear it everywhere. And it's wrong.

"We have to get out of AWS." "Azure is a security risk." "As long as we're with a US hyperscaler, we're not sovereign." I encounter these statements in architecture reviews, in compliance discussions, at conferences. They sound decisive. They feel right.

And they're still wrong.

Not because the desire for independence is misguided. That desire is legitimate and important. But because **exit and sovereignty are two completely different things** — which our industry constantly conflates.

> "Those who don't know what they have cannot know what they depend on. And those who don't know that don't make sovereign decisions — no matter where they migrate."
>
> *WAF++ Sovereign Pillar · SOV-010*

Exit without visibility is not a step toward sovereignty. It is a step toward a new dependency — one that you now have to operate yourself, without the managed-service depth of a hyperscaler, without dedicated teams, and without the infrastructure expertise these companies have built up over decades.

<figure class="article-fig" id="fig1-wrap">
<svg id="fig1-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" style="width:100%;height:auto;display:block;" aria-labelledby="fig1-en-title" role="img">
  <title id="fig1-en-title">Figure 1 — What really happens during an exit?</title>
  <defs>
    <marker id="arr1en" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <path d="M0,0 L0,7 L9,3.5 z" fill="#ef4444"/>
    </marker>
    <clipPath id="clip-left-en">
      <rect x="16" y="98" width="332" height="264" rx="10"/>
    </clipPath>
    <clipPath id="clip-right-en">
      <rect x="552" y="98" width="332" height="264" rx="10"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="900" height="420" fill="#ecf2fb" rx="12"/>

  <!-- Label -->
  <rect x="18" y="18" width="104" height="23" rx="11.5" fill="#d6e4f4"/>
  <text x="70" y="33.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="1.3" fill="#5578a0">FIGURE 1</text>

  <!-- Title -->
  <text x="18" y="74" font-family="Inter,system-ui,sans-serif" font-size="19" font-weight="700" fill="#0b1220">What really happens during an exit?</text>

  <!-- Divider -->
  <line x1="18" y1="88" x2="882" y2="88" stroke="#c3d5eb" stroke-width="1"/>

  <!-- ======= LEFT PANEL: TODAY ======= -->
  <rect x="16" y="98" width="332" height="264" rx="10" fill="#ffffff" stroke="#22c55e" stroke-width="2.5"/>
  <!-- TODAY badge -->
  <rect x="126" y="112" width="88" height="22" rx="11" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
  <text x="170" y="127.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="1.2" fill="#15803d">TODAY</text>
  <!-- Title -->
  <text x="182" y="156" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="15.5" font-weight="700" fill="#0b1220">Governed Cloud</text>
  <!-- Box 1 -->
  <rect x="36" y="168" width="292" height="36" rx="7" fill="#0ea5e9"/>
  <text x="182" y="190.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#fff">Database (RDS)</text>
  <!-- Box 2 -->
  <rect x="36" y="212" width="292" height="36" rx="7" fill="#0284c7"/>
  <text x="182" y="234.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#fff">Object Storage (S3)</text>
  <!-- Box 3 -->
  <rect x="36" y="256" width="292" height="36" rx="7" fill="#0369a1"/>
  <text x="182" y="278.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#fff">CDN (CloudFront)</text>
  <!-- Box 4 -->
  <rect x="36" y="300" width="292" height="36" rx="7" fill="#075985"/>
  <text x="182" y="322.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#fff">Identity &amp; Controls</text>
  <!-- Green footer (clipped) -->
  <g clip-path="url(#clip-left-en)">
    <rect x="16" y="342" width="332" height="20" fill="#f0fdf4"/>
    <text x="182" y="356" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="600" fill="#16a34a">✓ 1 Team · clear · auditable</text>
  </g>
  <!-- Caption -->
  <text x="182" y="380" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="12.5" font-weight="700" fill="#16a34a">Clear. Controlled. Sovereign.</text>

  <!-- ======= MIDDLE: EXIT ARROW ======= -->
  <rect x="381" y="188" width="78" height="24" rx="12" fill="#fee2e2" stroke="#fca5a5" stroke-width="1"/>
  <text x="420" y="204.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="700" fill="#dc2626">EXIT</text>
  <line x1="356" y1="230" x2="524" y2="230" stroke="#ef4444" stroke-width="3.5" marker-end="url(#arr1en)"/>
  <text x="420" y="258" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="500" fill="#dc2626">= Flight into</text>
  <text x="420" y="272" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10.5" font-weight="500" fill="#dc2626">Complexity</text>

  <!-- ======= RIGHT PANEL: AFTER EXIT ======= -->
  <rect x="552" y="98" width="332" height="264" rx="10" fill="#161b28" stroke="#ef4444" stroke-width="2"/>
  <!-- Badge -->
  <rect x="608" y="112" width="154" height="22" rx="11" fill="#7f1d1d"/>
  <text x="685" y="127.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="0.8" fill="#fca5a5">AFTER EXIT</text>
  <!-- Title -->
  <text x="718" y="156" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="15.5" font-weight="700" fill="#f1f5f9">Self-operated</text>
  <!-- 3×3 grid -->
  <rect x="566" y="168" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="612" y="187.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">PostgreSQL</text>
  <text x="612" y="200.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">HA</text>
  <rect x="664" y="168" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="710" y="187.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Ceph</text>
  <text x="710" y="200.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Cluster</text>
  <rect x="762" y="168" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="808" y="187.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">CDN</text>
  <text x="808" y="200.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">(self)</text>
  <rect x="566" y="220" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="612" y="239.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">PKI &amp;</text>
  <text x="612" y="252.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Certs</text>
  <rect x="664" y="220" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="710" y="239.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Backup</text>
  <text x="710" y="252.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Mgmt</text>
  <rect x="762" y="220" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="808" y="239.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Monitoring</text>
  <rect x="566" y="272" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="612" y="291.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Auth /</text>
  <text x="612" y="304.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">IdP</text>
  <rect x="664" y="272" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="710" y="291.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Patch</text>
  <text x="710" y="304.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Mgmt</text>
  <rect x="762" y="272" width="92" height="44" rx="6" fill="#1e263a" stroke="#2c3650" stroke-width="1"/>
  <text x="808" y="291.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">On-Call</text>
  <text x="808" y="304.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">Rota</text>
  <!-- Red footer (clipped) -->
  <g clip-path="url(#clip-right-en)">
    <rect x="552" y="342" width="332" height="20" fill="#7f1d1d"/>
    <text x="718" y="356" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="600" fill="#fca5a5">⚠ Who is responsible?</text>
  </g>
  <!-- Caption -->
  <text x="718" y="380" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="12.5" font-weight="700" fill="#ef4444">Complex. Unclear. Expensive.</text>

  <!-- Credit -->
  <text x="450" y="410" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="9.5" fill="#9ba8bb">waf2p.dev · WAF++ Sovereign Pillar</text>
</svg>
<figcaption class="article-fig-cap">
  <div><strong>Fig. 1 — Exit ≠ Freedom.</strong> What is today an orderly governed cloud becomes, after an unplanned exit, a patchwork of self-operated services. RDS, S3, CloudFront, IAM — everything must be replaced, patched, monitored, and owned. By whom, exactly?</div>
  <button class="article-fig-dl" data-fig="fig1-svg" data-filename="wafpp-fig1-exit-freedom.svg">↓ SVG</button>
</figcaption>
</figure>

## What really happens during an exit

Let's be concrete. Technically, an exit is possible — that's undisputed. Kubernetes runs everywhere. Terraform abstracts providers. The open-source ecosystem with OpenStack, Ceph, and Cilium is mature.

But when you exit RDS, someone has to operate PostgreSQL HA themselves. Failover, backups, security patches — who does that at 3am? When you exit S3, you need an object storage team. When you exit CloudFront, you build your own CDN logic. When you exit IAM, you need your own PKI.

These are not theoretical problems. They are operational realities that become visible exactly when something breaks — and usually too late.

> **From the field:** A European government agency worked for 3 years on an AWS exit. Afterward, they found that 60% of the original compliance requirements were still not met by the new on-premises solution. The problem was never the provider. It was the missing governance framework — which was still missing after the exit.

That's not an isolated case. It's the pattern. Without inventory, without controls, and without documented dependencies, you trade one known dependency for several unknown ones. That's not more sovereignty — that's more complexity with less oversight.

**Sovereignty is not a question of the provider. It is a question of visibility.**

<figure class="article-fig" id="fig2-wrap">
<svg id="fig2-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 448" style="width:100%;height:auto;display:block;" aria-labelledby="fig2-en-title" role="img">
  <title id="fig2-en-title">Figure 2 — Two Conceptions of Sovereignty</title>

  <!-- Background -->
  <rect width="900" height="448" fill="#ecf2fb" rx="12"/>

  <!-- Label -->
  <rect x="18" y="18" width="104" height="23" rx="11.5" fill="#d6e4f4"/>
  <text x="70" y="33.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="1.3" fill="#5578a0">FIGURE 2</text>
  <text x="18" y="64" font-family="Inter,system-ui,sans-serif" font-size="16.5" font-weight="700" fill="#0b1220">Two Conceptions of Sovereignty</text>
  <line x1="18" y1="74" x2="882" y2="74" stroke="#c3d5eb" stroke-width="1"/>

  <!-- ======= LEFT: EXIT = FREEDOM (MISCONCEPTION) ======= -->
  <rect x="16" y="78" width="378" height="326" rx="10" fill="#1e263a"/>
  <rect x="72" y="96" width="250" height="22" rx="11" fill="#374151"/>
  <text x="197" y="111.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="0.8" fill="#94a3b8">COMMON MISCONCEPTION</text>
  <text x="205" y="158" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="28" font-weight="800" fill="#f87171">Exit</text>
  <text x="205" y="188" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="700" fill="#e2e8f0">= Freedom</text>
  <line x1="36" y1="206" x2="374" y2="206" stroke="#2c3650" stroke-width="1"/>
  <text x="52" y="232" font-family="Inter,system-ui,sans-serif" font-size="13" fill="#94a3b8">→  Find a different provider</text>
  <text x="52" y="260" font-family="Inter,system-ui,sans-serif" font-size="13" fill="#94a3b8">→  Cancel the contract</text>
  <text x="52" y="288" font-family="Inter,system-ui,sans-serif" font-size="13" fill="#94a3b8">→  Done. Sovereign.</text>
  <text x="36" y="318" font-family="Inter,system-ui,sans-serif" font-size="9.5" font-weight="700" letter-spacing="0.9" fill="#64748b">RESULT IN PRACTICE:</text>
  <circle cx="48" cy="338" r="4.5" fill="#ef4444"/>
  <text x="60" y="342.5" font-family="Inter,system-ui,sans-serif" font-size="12" fill="#f87171">Cost shock from self-operation</text>
  <circle cx="48" cy="364" r="4.5" fill="#ef4444"/>
  <text x="60" y="368.5" font-family="Inter,system-ui,sans-serif" font-size="12" fill="#f87171">Unexpected hidden dependencies</text>

  <!-- ======= DIVIDER ======= -->
  <text x="450" y="172" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="9.5" font-weight="700" letter-spacing="0.8" fill="#0094ff">WAF++</text>
  <text x="450" y="190" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="22" fill="#0094ff">→</text>
  <text x="450" y="210" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="9.5" font-weight="700" letter-spacing="0.8" fill="#0094ff">BETTER</text>

  <!-- ======= RIGHT: VISIBILITY = FREEDOM (WAF++) ======= -->
  <rect x="506" y="78" width="378" height="326" rx="10" fill="#0b1020"/>
  <rect x="506" y="78" width="378" height="4" rx="2" fill="#0094ff"/>
  <rect x="580" y="96" width="152" height="22" rx="11" fill="#0c2340"/>
  <text x="656" y="111.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="0.8" fill="#60a5fa">WAF++ VISIBILITY</text>
  <text x="695" y="158" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="28" font-weight="800" fill="#f1f5f9">Visibility</text>
  <text x="695" y="188" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="700" fill="#0094ff">= Freedom</text>
  <line x1="526" y1="206" x2="864" y2="206" stroke="#1e2d42" stroke-width="1"/>
  <text x="542" y="232" font-family="Inter,system-ui,sans-serif" font-size="13" fill="#94a3b8">✓  Inventory: know what you have</text>
  <text x="542" y="260" font-family="Inter,system-ui,sans-serif" font-size="13" fill="#94a3b8">✓  Document all dependencies</text>
  <text x="542" y="288" font-family="Inter,system-ui,sans-serif" font-size="13" fill="#94a3b8">✓  Define &amp; enforce controls</text>
  <text x="526" y="318" font-family="Inter,system-ui,sans-serif" font-size="9.5" font-weight="700" letter-spacing="0.9" fill="#64748b">RESULT:</text>
  <circle cx="538" cy="338" r="4.5" fill="#22c55e"/>
  <text x="550" y="342.5" font-family="Inter,system-ui,sans-serif" font-size="12" fill="#86efac">Exit is possible at any time</text>
  <circle cx="538" cy="364" r="4.5" fill="#22c55e"/>
  <text x="550" y="368.5" font-family="Inter,system-ui,sans-serif" font-size="12" fill="#86efac">Sovereign — regardless of provider</text>

  <!-- Bottom statement -->
  <rect x="16" y="412" width="868" height="24" rx="0 0 10 10" fill="#0b1020"/>
  <text x="450" y="428" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="600" fill="#60a5fa">Sovereignty is not a question of the provider. It is a question of visibility.</text>
</svg>
<figcaption class="article-fig-cap">
  <div><strong>Fig. 2 — Myth vs. Reality.</strong> What most believe: changing provider = sovereign. What WAF++ shows: visibility = sovereign. With full inventory and controls, exit is possible at any time — but no exit is needed to achieve sovereignty.</div>
  <button class="article-fig-dl" data-fig="fig2-svg" data-filename="wafpp-fig2-sovereignty.svg">↓ SVG</button>
</figcaption>
</figure>

## What sovereignty really means

Here is the thesis that WAF++ represents — and it's uncomfortable because it means more work than a migration project:

**Sovereignty is a continuous system property, not a destination.**

It doesn't arise from canceling a contract. It arises from knowing at any point in time what you have, why you use it, how you depend on it — and how you can get out if you must.

That means: **Inventory** — every resource, every dependency, every proprietary service documented. **Controls** — governance requirements defined as YAML, machine-checked, versioned. **Portability as a decision** — not every workload must be portable, but every decision about it must be conscious. And **public transparency** — decisions, votes, and roadmap changes visible to everyone.

When all of this is in place, you are sovereign. **Regardless of whether you run on AWS, Azure, GCP, Hetzner, or your own hardware.**

And yes: that's harder than an exit. An exit ends. Governance never ends. But that is exactly the point — sovereignty is not a project. It is an attitude.

<figure class="article-fig" id="fig3-wrap">
<svg id="fig3-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 330" style="width:100%;height:auto;display:block;" aria-labelledby="fig3-en-title" role="img">
  <title id="fig3-en-title">Figure 3 — Three Uncomfortable Truths</title>

  <!-- Background -->
  <rect width="900" height="330" fill="#ecf2fb" rx="12"/>

  <!-- Label + Title -->
  <rect x="18" y="18" width="104" height="23" rx="11.5" fill="#d6e4f4"/>
  <text x="70" y="33.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="1.3" fill="#5578a0">FIGURE 3</text>
  <text x="18" y="64" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="700" fill="#0b1220">Three things that are true — even if they're uncomfortable.</text>
  <line x1="18" y1="74" x2="882" y2="74" stroke="#c3d5eb" stroke-width="1"/>

  <!-- ======= CARD 1: RED ======= -->
  <rect x="16" y="84" width="274" height="218" rx="10" fill="#fff" stroke="#fca5a5" stroke-width="1.5"/>
  <rect x="16" y="84" width="274" height="5" rx="5" fill="#ef4444"/>
  <rect x="28" y="100" width="36" height="20" rx="6" fill="#fee2e2"/>
  <text x="46" y="114.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="700" fill="#ef4444">01</text>
  <text x="28" y="142" font-family="Inter,system-ui,sans-serif" font-size="14.5" font-weight="700" fill="#0b1220">Exit doesn't solve a</text>
  <text x="28" y="162" font-family="Inter,system-ui,sans-serif" font-size="14.5" font-weight="700" fill="#0b1220">governance problem.</text>
  <line x1="28" y1="176" x2="276" y2="176" stroke="#f1f5f9" stroke-width="1"/>
  <text x="28" y="198" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">An org without inventory</text>
  <text x="28" y="215" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">is just as unsovereign after</text>
  <text x="28" y="232" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">exit as before. Only the</text>
  <text x="28" y="249" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">provider changes.</text>
  <rect x="28" y="274" width="244" height="24" rx="6" fill="#ef4444"/>
  <text x="150" y="290" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11.5" font-weight="700" letter-spacing="0.6" fill="#fff">SOV-001</text>

  <!-- ======= CARD 2: DARK ======= -->
  <rect x="314" y="84" width="272" height="218" rx="10" fill="#161b28"/>
  <rect x="314" y="84" width="272" height="5" rx="5" fill="#0094ff"/>
  <rect x="326" y="100" width="36" height="20" rx="6" fill="#0c2340"/>
  <text x="344" y="114.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="700" fill="#60a5fa">02</text>
  <text x="326" y="142" font-family="Inter,system-ui,sans-serif" font-size="14.5" font-weight="700" fill="#f1f5f9">Visibility is more</text>
  <text x="326" y="162" font-family="Inter,system-ui,sans-serif" font-size="14.5" font-weight="700" fill="#f1f5f9">demanding than exit.</text>
  <line x1="326" y1="176" x2="572" y2="176" stroke="#2c3650" stroke-width="1"/>
  <text x="326" y="198" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#94a3b8">Controls must run.</text>
  <text x="326" y="215" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#94a3b8">Inventory must be current.</text>
  <text x="326" y="232" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#94a3b8">Decisions must be</text>
  <text x="326" y="249" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#94a3b8">documented. Always.</text>
  <rect x="326" y="274" width="246" height="24" rx="6" fill="#0094ff"/>
  <text x="449" y="290" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11.5" font-weight="700" letter-spacing="0.6" fill="#fff">SOV-002</text>

  <!-- ======= CARD 3: GREEN ======= -->
  <rect x="610" y="84" width="274" height="218" rx="10" fill="#fff" stroke="#86efac" stroke-width="1.5"/>
  <rect x="610" y="84" width="274" height="5" rx="5" fill="#22c55e"/>
  <rect x="622" y="100" width="36" height="20" rx="6" fill="#f0fdf4"/>
  <text x="640" y="114.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="700" fill="#16a34a">03</text>
  <text x="622" y="142" font-family="Inter,system-ui,sans-serif" font-size="14.5" font-weight="700" fill="#0b1220">Sovereignty works</text>
  <text x="622" y="162" font-family="Inter,system-ui,sans-serif" font-size="14.5" font-weight="700" fill="#0b1220">in AWS too.</text>
  <line x1="622" y1="176" x2="870" y2="176" stroke="#f1f5f9" stroke-width="1"/>
  <text x="622" y="198" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">If you know what you have,</text>
  <text x="622" y="215" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">why you use it, and how to</text>
  <text x="622" y="232" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">exit — you are sovereign.</text>
  <text x="622" y="249" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">No matter where you run.</text>
  <rect x="622" y="274" width="248" height="24" rx="6" fill="#22c55e"/>
  <text x="746" y="290" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11.5" font-weight="700" letter-spacing="0.6" fill="#fff">SOV-003</text>

  <!-- Credit -->
  <text x="450" y="320" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="9.5" fill="#9ba8bb">waf2p.dev · WAF++ Sovereign Pillar</text>
</svg>
<figcaption class="article-fig-cap">
  <div><strong>Fig. 3 — Three Uncomfortable Truths.</strong> Exit doesn't solve a governance problem. Visibility is more demanding than exit. And sovereignty works in AWS too — if you know what you have and why.</div>
  <button class="article-fig-dl" data-fig="fig3-svg" data-filename="wafpp-fig3-truths.svg">↓ SVG</button>
</figcaption>
</figure>

## When exit is still the right answer

WAF++ does not fundamentally reject exit. There are legitimate scenarios:

**Exit makes sense** when data localization laws explicitly exclude US companies as processors. When the organization has the operational maturity to permanently self-operate managed services. When a complete cost-benefit analysis supports the move.

**Exit is the wrong answer** when it happens as a reaction to a headline. When no inventory exists. When no dedicated platform team is standing by. And when exit serves as a substitute for governance — as if a provider change were the same as a governance framework.

The decisive question is not: "Where do we run?" The question is: **"Do we know what we're doing — and can we prove it?"**

<figure class="article-fig" id="fig4-wrap">
<svg id="fig4-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 482" style="width:100%;height:auto;display:block;" aria-labelledby="fig4-en-title" role="img">
  <title id="fig4-en-title">Figure 4 — Are you sovereign? Four honest questions.</title>

  <!-- Background -->
  <rect width="900" height="482" fill="#ecf2fb" rx="12"/>

  <!-- Label + Title -->
  <rect x="18" y="18" width="104" height="23" rx="11.5" fill="#d6e4f4"/>
  <text x="70" y="33.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="1.3" fill="#5578a0">FIGURE 4</text>
  <text x="18" y="64" font-family="Inter,system-ui,sans-serif" font-size="16.5" font-weight="700" fill="#0b1220">Are you sovereign? Four honest questions.</text>
  <line x1="18" y1="74" x2="882" y2="74" stroke="#c3d5eb" stroke-width="1"/>

  <!-- Row 1 -->
  <rect x="16" y="82" width="868" height="64" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="16" y="82" width="4" height="64" rx="2" fill="#0094ff"/>
  <circle cx="54" cy="114" r="16" fill="#22c55e"/>
  <text x="54" y="119.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="700" fill="#fff">✓</text>
  <text x="82" y="107" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#0b1220">Do you fully know which cloud resources you have?</text>
  <text x="82" y="128" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">Inventory, dependency map, proprietary services all marked.</text>

  <!-- Row 2 -->
  <rect x="16" y="154" width="868" height="64" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="16" y="154" width="4" height="64" rx="2" fill="#0094ff"/>
  <circle cx="54" cy="186" r="16" fill="#22c55e"/>
  <text x="54" y="191.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="700" fill="#fff">✓</text>
  <text x="82" y="179" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#0b1220">Is every dependency a conscious decision?</text>
  <text x="82" y="200" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">Not accidentally grown. Documented and justified.</text>

  <!-- Row 3 -->
  <rect x="16" y="226" width="868" height="64" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="16" y="226" width="4" height="64" rx="2" fill="#0094ff"/>
  <circle cx="54" cy="258" r="16" fill="#22c55e"/>
  <text x="54" y="263.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="700" fill="#fff">✓</text>
  <text x="82" y="251" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#0b1220">Can you show a regulator today exactly what you do with what?</text>
  <text x="82" y="272" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">Controls running. Evidence exists. Audit-ready.</text>

  <!-- Row 4 -->
  <rect x="16" y="298" width="868" height="64" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="16" y="298" width="4" height="64" rx="2" fill="#0094ff"/>
  <circle cx="54" cy="330" r="16" fill="#22c55e"/>
  <text x="54" y="335.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="700" fill="#fff">✓</text>
  <text x="82" y="323" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#0b1220">Do you know how to exit in an emergency — and what it would cost?</text>
  <text x="82" y="344" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#64748b">Exit scenario documented. Portability score known.</text>

  <!-- Row 5 (red X) -->
  <rect x="16" y="370" width="868" height="64" rx="8" fill="#fff7f7" stroke="#fca5a5" stroke-width="1"/>
  <rect x="16" y="370" width="4" height="64" rx="2" fill="#ef4444"/>
  <circle cx="54" cy="402" r="16" fill="#ef4444"/>
  <text x="54" y="407.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="700" fill="#fff">✗</text>
  <text x="82" y="395" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#0b1220">Are you currently in the process of exiting AWS / Azure / GCP?</text>
  <text x="82" y="416" font-family="Inter,system-ui,sans-serif" font-size="11.5" fill="#ef4444">That is a project — not the same as sovereignty.</text>

  <!-- Bottom -->
  <rect x="16" y="442" width="868" height="28" rx="6" fill="#0094ff" opacity="0.08"/>
  <text x="450" y="460" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="10" font-weight="600" fill="#5578a0">If you answered the first four with Yes: You are sovereign. Regardless of provider. · waf2p.dev</text>
</svg>
<figcaption class="article-fig-cap">
  <div><strong>Fig. 4 — Four Honest Questions.</strong> Do you fully know what you have? Are all dependencies conscious decisions? Can you show a regulator today what you do with what? Do you know how to exit? If yes: you are sovereign — no matter where you run.</div>
  <button class="article-fig-dl" data-fig="fig4-svg" data-filename="wafpp-fig4-questions.svg">↓ SVG</button>
</figcaption>
</figure>

## What this has to do with the Cloud Native Conference

On May 13th in Frankfurt, this exact question will land on stage. The panel discussion *"Does sovereignty eat cloud-native for breakfast?"* brings two positions head to head: the cloud-native enthusiast who says innovation needs the big hyperscalers, and the exit advocate who says their path was without alternative.

WAF++ is neither side. We are the framework that enables the community to **answer this question for themselves** — with evidence, not ideology.

In the Deep Dive (14:20) we'll show live: What does a WAF++ control look like? How does Terraform run as a policy engine? How does an organization get from "no idea where we stand" to "fully auditable" in 90 days — without migrating a single workload?

If that interests you: come by. Bring your hardest questions.

<style>
.article-fig { margin: 36px 0; }
.article-fig-cap {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 4px 0;
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.55;
}
.article-fig-cap strong { color: var(--text); }
.article-fig-cap > div { flex: 1; }
.article-fig-dl {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--surface-raised, #f0f4fa);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  padding: 7px 14px;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .15s, border-color .15s;
}
.article-fig-dl:hover {
  background: var(--brand-500);
  border-color: var(--brand-500);
  color: #fff;
}
</style>

<script>
(function(){
  document.querySelectorAll('.article-fig-dl').forEach(function(btn){
    btn.addEventListener('click', function(){
      var svg = document.getElementById(this.dataset.fig);
      if (!svg) return;
      var src = '<?xml version="1.0" encoding="UTF-8"?>\n' + svg.outerHTML;
      var blob = new Blob([src], {type:'image/svg+xml;charset=utf-8'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = this.dataset.filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
})();
</script>
