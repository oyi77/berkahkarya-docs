# Flywheel Diagram — BerkahKarya

**Rumus Ketahanan Pangan** dalam bentuk visual.

---

## The Full Flywheel

```
┌─────────────────────────────────────────────────────────────────┐
│                     BERKAHKARYA FLYWHEEL                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   WF1: Content ──────────────────────────────────────┐          │
│   (1ai-content + PostBridge)                          │          │
│   → Audience trust, leads, top-of-funnel              │          │
│                                                        │          │
│   WF2: Outreach ─────────────────────────────────────┤          │
│   (1ai-social/community — to build)                   │          │
│   → Partnerships, affiliates, community               │ DEPOSIT  │
│                                                        │    ↓     │
│   WF3: Products ─────────────────────────────────────┤          │
│   (1ai-berkahkarya-website + 1ai-payment)             │  ╔════════════╗
│   → Ebooks, templates, courses                        │  ║  CAPITAL  ║
│                                                        ├─→║   POOL    ║
│   WF4: SaaS Sales ───────────────────────────────────┤  ║  (1ai-hub)║
│   (1ai-trade-cex — 975 tests, deployed)               │  ╚════════════╝
│   → VilonaTradeFX, 1ai-affiliate, OmniRoute subs      │       │        │
│                                                        │       │        │
│   WF6: Arbitrage ────────────────────────────────────┘       │        │
│   (1ai-social/marketplace — 32 tests, ready to deploy)     ALLOC    ALLOC
│   → Bootstrap engine: OLX→FB Marketplace arbitrage           │        │
│     Target: 15-20% margin, 10-40 deals/month                 ↓        ↓
│                                                         WF5 TRADING  REINVEST
│                                                         (1ai-trade-cex)
│                                                         → Multiply capital
│                                                           Forex, Crypto,
└─────────────────────────────────────────────────────────────────┘
                          ↑↓ orchestrates
                    ┌──────────────┐
                    │  HERMES GM   │  ← trigger rules (brainstorm C)
                    │ (auto-pilot) │
                    └──────┬───────┘
                           │ strategic oversight
                    ┌──────┴───────┐
                    │    VILONA    │  ← AI CFO/COO persona
                    │  (AI brain)  │
                    └──────────────┘
```

---

## Capital Pool Allocation Logic

Current phase: **Bootstrap (0–50 juta IDR)**

```
Every deposit →  ┌─ 70% → Trading allocation (WF5)
                 ├─ 20% → Reinvestment (tools, automation, ads)
                 └─ 10% → Operating costs (hosting, subs, emergencies)
```

Phase 2 (50–200 juta):
```
Every deposit →  ┌─ 50% → Trading
                 ├─ 30% → Reinvestment
                 ├─ 15% → Operating
                 └─  5% → Emergency reserve
```

---

## The Bootstrap Loop (Month 1–3)

The minimum viable flywheel — just 2 workflows needed to start compounding:

```
┌──────────────────────────────────────────────────────────────┐
│                     BOOTSTRAP LOOP                            │
│                                                               │
│  WF6 Arbitrage                                               │
│  OLX → Facebook Marketplace                                  │
│  15-20% margin per deal                                      │
│  Month 1: 8-10 deals                                         │
│  → ~5 juta IDR profit                                        │
│            │                                                  │
│            ↓ AUTO DEPOSIT                                     │
│     [Capital Pool]                                           │
│            │                                                  │
│            ├──→ 70% = ~3.5 juta → WF5 Trading               │
│            │    Target: 2-3% daily return                     │
│            │    → ~2 juta/month additional                    │
│            │                                                  │
│            └──→ 20% = ~1 juta → Reinvestment                 │
│                 More accounts, better tools, content ads      │
│                 → More WF6 deals next month                   │
│                                                               │
│  Month 2: ~7 juta (WF6) + ~2 juta (WF5) = 9 juta/month     │
│  Month 3: ~19 juta (WF6 scaled) + ~4 juta (WF5) = 23 juta  │
└──────────────────────────────────────────────────────────────┘
```

---

## Hermes GM Decision Tree (Simplified)

```
Every 15 minutes, Hermes checks:

Pool balance?
  < 5 juta → EMERGENCY: pause all ops
  < 10 juta → ESCALATE: notify Paijo
  ≥ 10 juta → continue

Trading drawdown today?
  > 10% of trading allocation → ESCALATE: pause trading
  > 15% this week → ESCALATE: pause for week
  OK → allow trades

WF6 deals in-flight?
  > 5 simultaneous → NOTIFY: block new buys
  Holding > 7 days → NOTIFY: drop price 10%
  Holding > 21 days → ESCALATE
  OK → allow new buys

No deposits for 7 days?
  → ESCALATE: all workflows inactive
```

---

## 90-Day Milestones

| Week | Milestone | Workflow |
|------|-----------|----------|
| W1-2 | Capital Pool built + tested | Infrastructure |
| W2-3 | First WF6 deal closed, profit auto-deposited | WF6 |
| W3-4 | WF5 trading auto-allocates from pool | WF5 |
| W4-5 | Content automation running (20 min/week) | WF1 |
| W5-6 | Hermes trigger rules live | Orchestration |
| W6-8 | 10+ WF6 deals/month sustained | WF6 |
| W8-10 | Pool balance ≥ 25 juta | Capital |
| W10-12 | First WF4 (content-attributed) subscriber | WF1+WF4 |

---

## Why This Order?

**Capital Pool first** — because you can't be strategic about money you can't see.

**WF6 second** — because it's the only workflow with zero dependencies. No audience, no product, no capital needed beyond working capital. Start it this week.

**WF5 third** — because trading amplifies capital but doesn't create it. Don't trade what you haven't earned.

**WF1/WF2 in parallel** — they compound slowly but permanently. Start the clock now even if the returns come in Month 4+.

**WF4 follows WF1** — you can't sell a product to an audience you haven't built.
