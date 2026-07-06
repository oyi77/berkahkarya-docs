# Brainstorm D: Repo-to-Workflow Map
**Date:** 2026-07-06  
**Owner:** Paijo (BerkahKarya)  
**Status:** Ground Truth Mapping

---

## Executive Summary

The doc claimed Section 4 was "incomplete." This map closes that gap using the actual repos on disk.

---

## 1. Full Workflow → Repo Map

### WF1: Content Engine
**Goal:** Build audience trust, generate leads, soft-sell products

| Repo | Status | Role | Gap |
|------|--------|------|-----|
| `1ai-content` | Exists | Content generation, scheduling | Unknown depth — needs audit |
| `1ai-berkahkarya-website` | Exists + deployed | Marketing site, landing pages | No blog/SEO content pipeline |
| `1ai-social` | Exists | Social media posting via PostBridge | Posting works; analytics thin |
| `1ai-skills/` | Exists | Agent skills for content tasks | Fragmented — no unified WF1 orchestration |

**Owner repo:** `1ai-content`  
**Gap:** No single orchestration script that goes "topic → draft → schedule → post → report." Each step is isolated.

---

### WF2: Outreach & Community
**Goal:** Direct human connections, partnerships, trust-building at scale

| Repo | Status | Role | Gap |
|------|--------|------|-----|
| `1ai-social` | Exists | Marketplace inbox, social engagement | Outreach not systematized |
| `.hermes/hermes-agent` | Exists | Orchestration layer | Hermes doesn't have a WF2 skill |
| `1ai-career` | Exists | Job/collaboration leads | Unclear if this feeds WF2 |

**Owner repo:** None (orphaned workflow)  
**Gap:** WF2 has no primary repo. Needs either a new `1ai-outreach` repo OR a dedicated module in `1ai-social`.

---

### WF3: Skills & Knowledge Products
**Goal:** Package expertise into sellable digital products (ebooks, courses, templates)

| Repo | Status | Role | Gap |
|------|--------|------|-----|
| `1ai-berkahkarya-website` | Exists | Landing pages for products | Products not yet built |
| `1ai-payment` | Exists | Payment processing (Tripay) | Works but no product catalog |
| `1ai-harvest` | Exists | ? | Need to audit |
| `1ai-playbook` | Exists | Internal playbooks | These are private, not products |

**Owner repo:** `1ai-berkahkarya-website` (storefront) + `1ai-payment` (transactions)  
**Gap:** No product catalog system. No digital delivery (ebook download, course access). No subscription management beyond Tripay.

---

### WF4: Product & SaaS Sales
**Goal:** Sell trading tools, AI products, SaaS subscriptions

| Repo | Status | Role | Gap |
|------|--------|------|-----|
| `1ai-trade-cex` | Exists, 975 tests | Core trading platform, 8 Telegram bots | Subscription billing not connected to Capital Pool |
| `1ai-trade-bot` | Exists | ? | Need to audit vs. 1ai-trade-cex |
| `1ai-trade-dex` | Exists | DEX trading | Unknown maturity |
| `OmniRoute` | Exists | AI router product | Separate business line |
| `1ai-tracker` | Exists | Next.js tracker | Unknown purpose |
| `1ai-affiliate` | Exists, 3-layer stack | Affiliate tracking platform | Can sell as SaaS; not listed as WF4 product |

**Owner repo:** `1ai-trade-cex`  
**Gap:** Revenue from `1ai-trade-cex` subscriptions not automatically deposited to Capital Pool. `1ai-trade-bot` vs. `1ai-trade-cex` overlap unclear.

---

### WF5: Active Trading (Capital Multiplier)
**Goal:** Multiply capital via algorithmic trading (Forex, Crypto, Indices)

| Repo | Status | Role | Gap |
|------|--------|------|-----|
| `1ai-trade-cex` | Exists, production | 8 bots: Forex, Crypto, Commodities, Binary, DEX, Indices | No Capital Pool integration |
| `idx-trading-bot` | Exists | Indonesian stock market bot | Separate, IDX-specific |
| `1ai-trade-dex` | Exists | DEX (on-chain) trading | Unknown maturity |
| `venv-backtest` | Exists | Backtesting environment | Local dev tool, not deployed |

**Owner repo:** `1ai-trade-cex`  
**Gaps:**
1. No Capital Pool integration (PnL not reported to pool)
2. No Hermes trigger integration (drawdown limits not enforced system-wide)
3. `idx-trading-bot` vs. `1ai-trade-cex` - are they separate? Does IDX bot report to same pool?

---

### WF6: Automation Middleman (Arbitrage Engine)
**Goal:** Buy-low-sell-high on C2C marketplaces — bootstrap capital without dependencies

| Repo | Status | Role | Gap |
|------|--------|------|-----|
| `1ai-social/ai_social/marketplace/` | Exists, 32/32 tests | Full marketplace engine: scan, score, post, reply, treasury | Not deployed to production yet |
| `waha-core` | Exists | WhatsApp API (WAHA) | Can be used for buyer comms via WhatsApp |
| `waha-dashboard` | Exists | WAHA management UI | Supporting infra |

**Owner repo:** `1ai-social` (marketplace module)  
**Gaps:**
1. Not deployed to production — needs PM2/Cron setup
2. Treasury (`TreasuryBridge`) not connected to Capital Pool
3. OLX/Facebook adapters work but accounts need to be registered + tested
4. No multi-account rotation yet (single account per platform)

---

### Orchestration Layer: Hermes GM
**Goal:** Cross-workflow orchestration, decision-making, Vilona's execution layer

| Repo | Status | Role | Gap |
|------|--------|------|-----|
| `.hermes/hermes-agent` | Exists | Core Hermes agent | No workflow trigger rules loaded |
| `1ai-hub` | Exists | Hub: brain, memory, routing | Capital Pool service not built |
| `1ai-hub/hub-core` | Exists | Shared client library | `capital_pool.py` client missing |
| `1ai-skills/` | Exists | Agent skills | Hermes skills not mapped to workflows |

**Owner repo:** `.hermes/hermes-agent` + `1ai-hub`  
**Gaps:**
1. Hermes has no Capital Pool awareness
2. No trigger rules defined (brainstorm C addresses this)
3. Vilona ↔ Hermes communication not systematized

---

### Infrastructure & Cross-Cutting

| Repo | Status | Role |
|------|--------|------|
| `1ai-hub` | Core | Brain, memory, auth, routing hub |
| `1ai-cf-router` | Exists | Cloudflare routing layer |
| `1ai-mt-router` | Exists | MT (MetaTrader?) router |
| `1ai-payment` | Exists | Payment processing |
| `1ai-osint` | Exists | OSINT tooling |
| `1ai-auto-bounty` | Exists | Automated bug bounty |
| `1ai-auto-hunt` | Exists | Automated hunting |
| `1ai-phonefarm` | Exists | Phone farm management |

---

## 2. Workflow Coverage Matrix

| Workflow | Primary Repo | Tests | Deployed? | Capital Pool Connected? | Score |
|----------|-------------|-------|-----------|------------------------|-------|
| WF1 Content | `1ai-content` | ? | Partial | ❌ | 🟡 40% |
| WF2 Outreach | None | ❌ | ❌ | ❌ | 🔴 10% |
| WF3 Products | `1ai-berkahkarya-website` | ? | Yes (site) | ❌ | 🟡 30% |
| WF4 SaaS Sales | `1ai-trade-cex` | 975 ✅ | Yes | ❌ | 🟢 70% |
| WF5 Trading | `1ai-trade-cex` | 975 ✅ | Yes | ❌ | 🟢 65% |
| WF6 Arbitrage | `1ai-social/marketplace` | 32/32 ✅ | ❌ | ❌ | 🟡 55% |
| Hermes Orchestration | `.hermes/hermes-agent` | ? | Partial | ❌ | 🟡 40% |
| Capital Pool | `1ai-hub` | ❌ | ❌ | N/A | 🔴 0% |

**Critical finding: Capital Pool = 0%. Everything else is blocked from being a real flywheel until this exists.**

---

## 3. Redundancy / Overlap Issues

### Issue 1: `1ai-trade-bot` vs. `1ai-trade-cex`
- Both exist, both seem to be trading bots
- `1ai-trade-cex` has 975 tests and multi-bot architecture
- `1ai-trade-bot` status unknown
- **Decision needed:** Are these parallel? Is `1ai-trade-bot` the older version?
- **Recommendation:** Audit, then consolidate or clearly separate

### Issue 2: `1ai-social` vs. standalone marketplace
- `1ai-social` contains `marketplace/` module — good architecture
- But the parent `1ai-social` also has other modules (content?, social media?)
- **Risk:** Marketplace gets buried in a larger codebase, harder to maintain
- **Recommendation:** Keep as module for now, consider split if complexity grows

### Issue 3: `1ai-skills` scatter
- Skills live in both `~/1ai-skills/` (root) and `~/projects/1ai-skills/` and `~/projects/1ai-ecosystem-skills/`
- Multiple copies of the same skill ecosystem
- **Recommendation:** Establish canonical location, symlink or consolidate

### Issue 4: `1ai-hub` vs. `gbrain`
- `1ai-hub` contains a `brain/` module
- `~/projects/gbrain` also exists separately
- **Risk:** Split brain (pun intended) — two memory systems
- **Recommendation:** `1ai-hub/brain` is canonical; `gbrain` is the GB-era predecessor. Migrate any missing functionality, deprecate `gbrain`.

---

## 4. Priority Repo Actions (by workflow impact)

### Tier 1: Unlock the flywheel (do first)
1. **Build Capital Pool in `1ai-hub`** — unblocks everything downstream
2. **Deploy `1ai-social/marketplace` to production** — WF6 starts generating income
3. **Connect `1ai-trade-cex` PnL → Capital Pool** — WF5 loop closes

### Tier 2: Strengthen existing workflows
4. **Audit `1ai-trade-bot`** — clarify vs. `1ai-trade-cex`, kill/merge
5. **Build WF2 outreach module** in `1ai-social` — longest-running gap
6. **Instrument `1ai-berkahkarya-website` payments** → Capital Pool

### Tier 3: Polish and optimize
7. **Consolidate skills** — single canonical location
8. **Hermes trigger rules** — load brainstorm C thresholds into Hermes
9. **Vilona Capital Pool awareness** — feed pool snapshot to Vilona's context

---

## 5. The 5 Files That Matter Most Right Now

Given all the repos, these 5 files are the most critical path:

1. `1ai-hub/src/capital_pool/service.py` — **doesn't exist yet, needs to be built**
2. `1ai-social/ai_social/marketplace/treasury.py` — **exists, needs Capital Pool hookup**
3. `1ai-trade-cex/trading_bot/server.py` — **exists, needs PnL reporting to pool**
4. `.hermes/hermes-agent/` — **exists, needs trigger rules loaded**
5. `1ai-hub/hub-core/src/hub_core/clients/capital_pool.py` — **doesn't exist, needs to be built**

---

## 6. Summary Diagram

```
WF1: 1ai-content ──────────────────────────────┐
WF2: (missing) ─────────────────────────────────┤
WF3: 1ai-berkahkarya-website + 1ai-payment ─────┤──→ [CAPITAL POOL]  ──→  WF5: 1ai-trade-cex
WF4: 1ai-trade-cex (subscriptions) ─────────────┤      (1ai-hub)          (multiply capital)
WF6: 1ai-social/marketplace ─────────────────────┘
                                                      ↑
                                            .hermes/hermes-agent
                                            (orchestration)
                                                      ↑
                                               Vilona persona
                                            (strategic layer)
```

**Current state:** All arrows MISSING (Capital Pool doesn't exist).  
**Target state:** All arrows AUTOMATED (Hermes monitors and routes everything).
