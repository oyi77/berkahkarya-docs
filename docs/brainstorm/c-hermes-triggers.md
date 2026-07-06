# Brainstorm C: Trigger & Threshold Rules — Hermes GM
**Date:** 2026-07-06  
**Owner:** Paijo (BerkahKarya)  
**Status:** Design Phase

---

## Executive Summary

Hermes GM adalah **orchestration brain** di balik BerkahKarya. Dia yang memutuskan:
- Kapan pool di-alokasikan ke trading
- Kapan alarm berbunyi
- Kapan system perlu intervensi manusia
- Kapan workflow bisa berjalan otomatis vs. butuh approval

Tanpa trigger rules, Hermes GM hanya bisa reaktif. Dengan trigger rules, dia bisa proaktif dan self-managing.

---

## 1. Trigger Taxonomy

### Level 1: AUTO — Hermes eksekusi tanpa tanya Paijo
### Level 2: NOTIFY — Hermes eksekusi + kirim notifikasi ke Paijo
### Level 3: ESCALATE — Hermes STOP + minta persetujuan Paijo
### Level 4: EMERGENCY — Hermes pause semua ops + alert darurat

---

## 2. Capital Pool Triggers

### 2.1 Deposit Triggers

| Event | Condition | Action | Level |
|-------|-----------|--------|-------|
| WF6 profit masuk | amount > 0 | Update balance, recalculate allocation | AUTO |
| WF4 payment diterima | amount > 0 | Update balance, send receipt | AUTO |
| WF5 trading profit | PnL > 0 | Deposit net profit, update allocation | AUTO |
| WF5 trading loss | PnL < 0 | Record withdrawal (trading_loss) | NOTIFY |
| Pool balance milestone | balance crosses 10/25/50/100/200 juta | Log milestone, send summary | NOTIFY |

### 2.2 Withdrawal Triggers

| Event | Condition | Action | Level |
|-------|-----------|--------|-------|
| Trading allocation request | amount ≤ 30% of trading_allocation | Approve auto | AUTO |
| Trading allocation request | amount > 30% of trading_allocation | Approve + notify | NOTIFY |
| Operating cost payment | amount ≤ 500k IDR | Auto-pay | AUTO |
| Operating cost payment | 500k < amount ≤ 2 juta | Pay + notify | NOTIFY |
| Operating cost payment | amount > 2 juta | Request approval | ESCALATE |
| Emergency withdrawal | any amount from emergency reserve | Require manual approval | ESCALATE |

### 2.3 Alert Triggers

| Trigger | Condition | Alert | Level |
|---------|-----------|-------|-------|
| Low balance | total_balance < 5 juta IDR | "Pool critical: only X IDR left" | ESCALATE |
| Low balance warning | total_balance < 10 juta IDR | "Pool low: consider pausing trading" | NOTIFY |
| Consecutive negative days | net_flow < 0 for 3+ days | "3-day losing streak, review workflows" | NOTIFY |
| Consecutive negative days | net_flow < 0 for 7+ days | "Week-long decline, STOP trading" | ESCALATE |
| Trading drawdown daily | trading losses > 10% of trading_allocation today | "Pause trading for today" | ESCALATE |
| Single workflow dominance | one source > 80% of 7-day deposits | "Income concentration risk" | NOTIFY |
| No deposits | zero deposits for 7+ days | "All workflows inactive" | ESCALATE |

---

## 3. Trading (WF5) Triggers

### 3.1 Pre-Trade Gates

Before any trade is executed, Hermes checks ALL of these:

```python
class TradingGate:
    """All conditions must pass before Hermes allows a trade."""
    
    def check_pool_balance(self, tenant_id: str, trade_size: float) -> bool:
        """Pool must have sufficient trading allocation."""
        balance = get_balance(tenant_id)
        available = balance["current_allocation"]["trading"]
        return available >= trade_size * 3  # 3x minimum (3 deals buffer)
    
    def check_daily_drawdown(self, tenant_id: str) -> bool:
        """Daily trading losses must be below 10% of trading allocation."""
        losses_today = get_daily_trading_losses(tenant_id)
        trading_allocation = get_trading_allocation(tenant_id)
        return losses_today < trading_allocation * 0.10
    
    def check_weekly_drawdown(self, tenant_id: str) -> bool:
        """Weekly trading losses must be below 15% of total pool."""
        losses_week = get_weekly_trading_losses(tenant_id)
        total_pool = get_balance(tenant_id)["total"]
        return losses_week < total_pool * 0.15
    
    def check_consecutive_losses(self, bot_id: str) -> bool:
        """Bot must not have 3+ consecutive losing trades."""
        last_trades = get_last_n_trades(bot_id, 3)
        return not all(t.pnl < 0 for t in last_trades)
    
    def check_market_conditions(self, pair: str) -> bool:
        """Block trading during extreme volatility events."""
        return not is_high_impact_news_window(pair)  # e.g., NFP, FOMC
```

### 3.2 Bot-Level Triggers

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| Open trade | All gates pass | Execute trade, lock capital | AUTO |
| Close trade (profit) | TP hit | Deposit profit to pool, release capital | AUTO |
| Close trade (loss) | SL hit | Record loss to pool, release capital | NOTIFY |
| Max open trades | 3+ trades simultaneously | Block new trades, notify | NOTIFY |
| Bot silent | No activity for 4h during market hours | "Bot unresponsive, check" | ESCALATE |
| Consecutive losses | 3 losing trades in a row | Pause bot for 24h, notify | ESCALATE |
| Daily loss limit | Lose 10% of daily allocation | Pause bot for rest of day | ESCALATE |
| Weekly loss limit | Lose 15% of weekly allocation | Pause bot for rest of week | ESCALATE |

### 3.3 Trading Allocation Rules

| Pool Balance | Trading Allocation % | Max Single Trade | Notes |
|-------------|---------------------|-----------------|-------|
| < 10 juta | 0% | 0 | Pool too small, no trading |
| 10-25 juta | 50% | 10% of trading alloc | High risk tolerance (bootstrap) |
| 25-50 juta | 70% | 8% of trading alloc | Standard bootstrap |
| 50-100 juta | 60% | 5% of trading alloc | Growth phase |
| 100-200 juta | 50% | 3% of trading alloc | Conservative growth |
| 200 juta+ | 40% | 2% of trading alloc | Capital preservation mode |

---

## 4. WF6 Arbitrage Triggers

### 4.1 Scanning Triggers

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| Opportunity found | score ≥ 70, margin ≥ 15% | Add to queue, notify | NOTIFY |
| High-value opportunity | score ≥ 85, margin ≥ 25% | Add to queue, priority alert | ESCALATE |
| Stale opportunity | listed 2+ hours ago, not acted on | Remove from queue, log | AUTO |
| Platform down | API error 3+ times in 30 min | Skip platform, notify | NOTIFY |
| Account flagged | login failure or captcha loop | Rotate to backup account | NOTIFY |

### 4.2 Deal Flow Triggers

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| Buyer inquiry | message received | Auto-reply (template/LLM) | AUTO |
| Price agreed | buyer accepts listing price | Notify Paijo to coordinate meetup | ESCALATE |
| Deal closed | payment received | Record profit to pool, close listing | AUTO |
| Deal failed | no buyer after 7 days | Drop listing, re-evaluate pricing | AUTO |
| Deal failed | buyer backed out after price agreed | Re-post, log failure | NOTIFY |

### 4.3 Working Capital Triggers

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| WF6 capital request | amount ≤ available working capital | Auto-approve from pool | AUTO |
| WF6 capital request | exceeds 40% of available pool | Request approval | ESCALATE |
| Deals in-flight > 5 | 5+ simultaneous buys pending | Block new buys | NOTIFY |
| Holding time > 10 days | item unsold after 10 days | Drop price 10%, re-notify | NOTIFY |
| Holding time > 21 days | item unsold after 21 days | Emergency price drop, escalate | ESCALATE |

---

## 5. Content & Outreach Triggers (WF1/WF2)

### 5.1 Content Performance

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| High engagement post | views > 10k in 24h | Boost budget, cross-post | NOTIFY |
| Conversion spike | link clicks > 200 from content | Double production of that format | NOTIFY |
| Zero engagement | 3+ posts < 500 views each | Pause format, review strategy | NOTIFY |
| Platform algorithm change | engagement drops 50%+ in 7 days | Alert, trigger strategy review | ESCALATE |

### 5.2 Lead Generation

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| New lead in funnel | CTA clicked, form submitted | Auto-sequence triggered | AUTO |
| High-intent signal | lead visits pricing page 2+ times | Priority follow-up queued | NOTIFY |
| Cold lead | no activity for 14 days | Re-engagement sequence | AUTO |
| Lead converts to customer | payment confirmed | Onboarding sequence triggered | AUTO |
| Lead churns | subscription cancelled | Win-back sequence triggered | AUTO |

---

## 6. System Health Triggers

### 6.1 Infrastructure

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| Service down | health check fails | Restart service, notify | NOTIFY |
| Service down | restart fails 3x | Escalate to manual fix | ESCALATE |
| DB disk full | disk > 90% | Alert + auto-cleanup old logs | NOTIFY |
| API rate limit | 429 errors > 10 in 5 min | Back off + circuit breaker | AUTO |
| Memory leak | RAM > 85% for 10+ min | Restart service | NOTIFY |

### 6.2 Credential Health

| Trigger | Condition | Action | Level |
|---------|-----------|--------|-------|
| Bot token expired | 401 on Telegram bot | Refresh token, notify | NOTIFY |
| API key invalid | 403 on external API | Alert: manual key rotation needed | ESCALATE |
| Platform account locked | login failure 3x | Rotate to backup, notify | NOTIFY |
| Proxy failure | all proxies timing out | Fallback to direct IP (temporary) | NOTIFY |

---

## 7. Vilona Decision Gates

Beberapa keputusan strategis butuh Vilona (AI CFO) sebelum Hermes eksekusi:

| Decision | Hermes asks Vilona | Vilona criteria |
|----------|-------------------|-----------------|
| New product launch | "Should we allocate 10 juta to WF5 for new trading account?" | Pool balance ≥ 30 juta, drawdown < 5% this month |
| Partnership deal | "Prospect wants revenue share, 30/70, on affiliate traffic" | LTV estimate > 6 months operating cost |
| Platform expansion | "Should we expand WF6 to Tokopedia?" | WF6 profit ≥ 15 juta/month consistently for 2 months |
| Hiring freelancer | "Content editor, 2 juta/month, 3-month contract" | Content ROI > 3x, pool balance > 50 juta |
| Emergency response | "Trading bot lost 8 juta in 24h" | Pause + full review before any trading resumes |

---

## 8. Notification Routing

| Level | Where | Format |
|-------|-------|--------|
| AUTO | Log only (internal) | JSON log, no notification |
| NOTIFY | Telegram DM to Paijo | Brief: event + action taken + new state |
| ESCALATE | Telegram DM (urgent tag) | Context + recommendation + decision needed |
| EMERGENCY | Telegram + Phone call (if available) | FULL context, immediate action required |

### Telegram Message Templates

**NOTIFY template:**
```
ℹ️ [BerkahKarya] {event_title}

📊 Event: {description}
✅ Action taken: {action}
💰 Pool balance: {balance}

— Hermes GM
```

**ESCALATE template:**
```
⚠️ [BerkahKarya] NEEDS YOUR INPUT

📊 Situation: {description}
💰 Financial impact: {impact}
🤔 Hermes recommendation: {recommendation}

Reply:
  /approve — proceed as recommended
  /deny — cancel action
  /more — full context

— Hermes GM
```

**EMERGENCY template:**
```
🚨 EMERGENCY — BERKAHKARYA 🚨

📊 {title}
💰 Impact: {financial_impact}
⏱️ Time-sensitive: {urgency}

ALL OPERATIONS PAUSED

Action required NOW:
{required_action}

— Hermes GM
```

---

## 9. Implementation Plan

### Phase 1: Core Triggers (Week 1-2)
- [ ] Capital Pool triggers (deposit/withdraw gates)
- [ ] Trading drawdown alerts
- [ ] Telegram notification integration
- [ ] Basic escalation flow

### Phase 2: Smart Triggers (Week 3-4)
- [ ] WF6 arbitrage triggers (scan → deal → profit pipeline)
- [ ] Bot health monitoring
- [ ] Consecutive loss detection

### Phase 3: Vilona Integration (Week 5-6)
- [ ] Vilona decision gates
- [ ] Natural language escalations ("Hermes needs your input on...")
- [ ] Approval via Telegram command (`/approve`, `/deny`)

### Phase 4: Self-Optimization (Month 2+)
- [ ] Hermes learns from approval patterns
- [ ] Adjust thresholds based on historical performance
- [ ] Predictive alerts (before problems happen)

---

## 10. Threshold Summary (Quick Reference)

```yaml
capital_pool:
  critical_balance: 5_000_000      # IDR - STOP everything
  warning_balance: 10_000_000      # IDR - notify
  min_trading_balance: 10_000_000  # IDR - no trading below this
  
trading:
  daily_loss_limit: 0.10           # 10% of trading allocation
  weekly_loss_limit: 0.15          # 15% of total pool
  consecutive_loss_limit: 3        # trades
  max_single_trade: 0.05           # 5% of trading allocation (Phase 2)
  max_open_trades: 3               # simultaneous positions
  
wf6_arbitrage:
  min_margin: 0.15                 # 15%
  min_score: 70                    # out of 100
  max_deals_inflight: 5            # simultaneous buys
  stale_listing_hours: 2           # remove from queue
  max_holding_days: 7              # price drop trigger
  emergency_holding_days: 21       # emergency drop trigger
  
operating_cost_limits:
  auto_approve: 500_000            # IDR - auto approve
  notify_approve: 2_000_000        # IDR - approve + notify
  manual_approve: 2_000_001        # IDR+ - needs Paijo
```

---

## Conclusion

Trigger rules = the difference between "Hermes does what it's told" and "Hermes runs the business."

**Key insight:** 80% of daily decisions should be AUTO. Only 15% need NOTIFY, 4% ESCALATE, 1% EMERGENCY. If Paijo is getting >5 escalations/week, triggers need tuning (thresholds too tight).

**The goal:** Paijo checks in 15 min/day. Hermes handles the rest.
