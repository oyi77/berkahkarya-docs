# Rumus Ketahanan Pangan — Brainstorm Index

**Owner:** Paijo (BerkahKarya)  
**Date:** 2026-07-06  
**Status:** Active Strategy Document

---

## Apa ini?

"Rumus Ketahanan Pangan" adalah metafora untuk **income resilience** — sistem yang menghasilkan, melindungi, dan melipatgandakan kapital secara otomatis via 6 workflow yang saling terhubung.

Dokumen-dokumen di sini adalah hasil brainstorm mendalam dari sesi 2026-07-06, mencakup desain teknis, definisi operasional, dan peta implementasi.

---

## The 6-Workflow Flywheel

```
  WF1: Content ──────────────────────────────────────┐
  WF2: Outreach ──────────────────────────────────────┤
  WF3: Products ──────────────────────────────────────┤──→ [CAPITAL POOL] ──→ WF5: Trading
  WF4: SaaS Sales ────────────────────────────────────┤    (1ai-hub)          (multiply ×)
  WF6: Arbitrage (Bootstrap) ─────────────────────────┘
                                                            ↑
                                                   Hermes GM (orchestration)
                                                            ↑
                                                    Vilona (strategic AI)
```

**Insight kunci:** Semua workflow deposit ke Capital Pool. Pool yang mendistribusikan ke trading atau reinvestment. Tanpa Pool, flywheel tidak berputar — ini prioritas #1.

---

## Status Setiap Workflow

| Workflow | Repo Utama | Tests | Deployed | Pool Connected | Score |
|----------|-----------|-------|----------|---------------|-------|
| **WF1** Content | `1ai-content` | ? | Partial | ❌ | 🟡 40% |
| **WF2** Outreach | *(belum ada)* | ❌ | ❌ | ❌ | 🔴 10% |
| **WF3** Products | `1ai-berkahkarya-website` | ? | Yes | ❌ | 🟡 30% |
| **WF4** SaaS Sales | `1ai-trade-cex` | 975 ✅ | Yes | ❌ | 🟢 70% |
| **WF5** Trading | `1ai-trade-cex` | 975 ✅ | Yes | ❌ | 🟢 65% |
| **WF6** Arbitrage | `1ai-social/marketplace` | 32 ✅ | ❌ | ❌ | 🟡 55% |
| **Hermes GM** | `.hermes/hermes-agent` | ? | Partial | ❌ | 🟡 40% |
| **Capital Pool** | `1ai-hub` *(to build)* | ❌ | ❌ | N/A | 🔴 **0%** |

---

## Brainstorm Documents

### [A — Capital Pool Design](/brainstorm/a-capital-pool)
Database schema, service API, allocation logic (70/20/10 split), integrasi dengan semua workflow. **Ini yang harus dibangun pertama.**

### [B — WF6: Arbitrage Engine](/brainstorm/b-wf6-concrete)
WF6 bukan lagi "vague middleman" — ini concrete C2C arbitrage: produk apa, platform mana (OLX ↔ Facebook ↔ Carousell), margin berapa, volume target per bulan.

### [C — Hermes GM Trigger Rules](/brainstorm/c-hermes-triggers)
4 level trigger: AUTO / NOTIFY / ESCALATE / EMERGENCY. Threshold lengkap untuk Capital Pool, trading bot, WF6 deals, content performance, system health.

### [D — Repo → Workflow Map](/brainstorm/d-repo-map)
Ground truth: 30+ repos dipetakan ke 6 workflow. Mana yang sudah ada, mana yang overlap, mana yang gap. 5 file paling kritis diidentifikasi.

### [E — Content & Outreach Cadence](/brainstorm/e-content-outreach)
WF1 + WF2 minimum viable cadence: 50 menit/minggu total. Content pillars, automation stack, outreach templates, 90-day plan.

---

## Priority Action Stack

Berdasarkan semua brainstorm, urutan yang paling masuk akal:

1. **Minggu 1-2:** Build Capital Pool service di `1ai-hub` ([detail →](/brainstorm/a-capital-pool#6-implementation-roadmap))
2. **Minggu 2-3:** Deploy `1ai-social/marketplace` ke production, close first 3 WF6 deals ([detail →](/brainstorm/b-wf6-concrete#next-actions))
3. **Minggu 3-4:** Connect `1ai-trade-cex` PnL → Capital Pool ([detail →](/brainstorm/d-repo-map#4-priority-repo-actions-by-workflow-impact))
4. **Paralel:** Setup PostBridge content automation + 5 content templates ([detail →](/brainstorm/e-content-outreach))
5. **Minggu 4-6:** Load Hermes trigger rules, Vilona awareness ([detail →](/brainstorm/c-hermes-triggers#9-implementation-plan))

---

## Context

- **Owner:** Paijo a.k.a. Oyi77 / codergaboets
- **Company:** BerkahKarya (berkahkarya.org) — "1 Man, Infinite Agents"
- **Architecture:** Hermes GM (orchestration) + Vilona (AI strategic persona) + 1ai-hub (central brain)
- **Stack:** Python, TypeScript, Next.js, FastAPI, PostgreSQL, PM2, Telegram bots, Netlify
