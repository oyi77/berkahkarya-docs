# Brainstorm A: Capital Pool Design
**Date:** 2026-07-06  
**Owner:** Paijo (BerkahKarya)  
**Status:** Design Phase

---

## Executive Summary

The Capital Pool is the **financial hub** of BerkahKarya's 6-workflow flywheel. Every workflow either deposits money into it (WF4, WF6) or draws from it (WF5). Without it, the flywheel is just isolated revenue streams.

**This document defines:**
1. Database schema (ledger + allocation rules)
2. Service API
3. Allocation logic (how money splits between trading / reinvestment / operations)
4. Integration points with existing systems

---

## 1. Database Schema

### 1.1 Core Tables

#### `capital_pool_ledger`
Main transaction log — all deposits and withdrawals.

```sql
CREATE TABLE capital_pool_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Source tracking
    source_workflow VARCHAR(50), -- 'WF1_content', 'WF4_product', 'WF5_trading', 'WF6_arbitrage'
    source_system VARCHAR(100), -- '1ai-trade-cex', '1ai-affiliate', '1ai-social/marketplace'
    source_reference VARCHAR(255), -- external ID (e.g., deal_id, trade_id, campaign_id)
    
    -- Purpose tracking (for withdrawals)
    purpose VARCHAR(50), -- 'trading_allocation', 'reinvestment', 'operating_costs', 'emergency'
    
    -- Metadata
    metadata JSONB, -- flexible field for workflow-specific data
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    
    -- Balance snapshot after this transaction
    balance_after DECIMAL(15, 2),
    
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_ledger_tenant ON capital_pool_ledger(tenant_id);
CREATE INDEX idx_ledger_type ON capital_pool_ledger(transaction_type);
CREATE INDEX idx_ledger_source ON capital_pool_ledger(source_workflow);
CREATE INDEX idx_ledger_created ON capital_pool_ledger(created_at DESC);
```

#### `allocation_rules`
Defines how pool balance splits between purposes.

```sql
CREATE TABLE allocation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    
    -- Rule thresholds
    min_pool_balance DECIMAL(15, 2) DEFAULT 0, -- rule applies when pool >= this
    max_pool_balance DECIMAL(15, 2), -- rule applies when pool <= this (NULL = no limit)
    
    -- Allocation percentages (must sum to 100)
    trading_pct DECIMAL(5, 2) DEFAULT 0 CHECK (trading_pct >= 0 AND trading_pct <= 100),
    reinvestment_pct DECIMAL(5, 2) DEFAULT 0 CHECK (reinvestment_pct >= 0 AND reinvestment_pct <= 100),
    operating_pct DECIMAL(5, 2) DEFAULT 0 CHECK (operating_pct >= 0 AND operating_pct <= 100),
    emergency_reserve_pct DECIMAL(5, 2) DEFAULT 0 CHECK (emergency_reserve_pct >= 0 AND emergency_reserve_pct <= 100),
    
    -- Priority (lower number = higher priority, used when multiple rules match)
    priority INT DEFAULT 100,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT sum_to_100 CHECK (
        trading_pct + reinvestment_pct + operating_pct + emergency_reserve_pct = 100
    )
);

CREATE INDEX idx_allocation_tenant ON allocation_rules(tenant_id);
CREATE INDEX idx_allocation_active ON allocation_rules(is_active, priority);
```

#### `pool_snapshots`
Daily/hourly snapshots for historical tracking and dashboards.

```sql
CREATE TABLE pool_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    
    -- Balance breakdown
    total_balance DECIMAL(15, 2) NOT NULL,
    available_balance DECIMAL(15, 2) NOT NULL, -- not locked in trading
    locked_balance DECIMAL(15, 2) DEFAULT 0, -- currently in active trades
    
    -- Source breakdown (last 24h/7d/30d)
    deposits_24h DECIMAL(15, 2) DEFAULT 0,
    withdrawals_24h DECIMAL(15, 2) DEFAULT 0,
    net_flow_24h DECIMAL(15, 2) DEFAULT 0,
    
    -- Workflow contributions (cumulative)
    wf1_content_total DECIMAL(15, 2) DEFAULT 0,
    wf4_product_total DECIMAL(15, 2) DEFAULT 0,
    wf5_trading_total DECIMAL(15, 2) DEFAULT 0, -- net PnL from trading
    wf6_arbitrage_total DECIMAL(15, 2) DEFAULT 0,
    
    -- Current allocation (based on active rules)
    current_trading_allocation DECIMAL(15, 2),
    current_reinvestment_allocation DECIMAL(15, 2),
    current_operating_allocation DECIMAL(15, 2),
    current_emergency_reserve DECIMAL(15, 2),
    
    snapshot_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_balance CHECK (total_balance >= 0)
);

CREATE INDEX idx_snapshot_tenant ON pool_snapshots(tenant_id);
CREATE INDEX idx_snapshot_time ON pool_snapshots(snapshot_at DESC);
```

---

## 2. Service API

### 2.1 Core Operations

#### Deposit (Record Income)
```python
# /api/capital-pool/deposit
POST {
    "tenant_id": "berkahkarya_main",
    "amount": 5000000.00,
    "currency": "IDR",
    "source_workflow": "WF6_arbitrage",
    "source_system": "1ai-social/marketplace",
    "source_reference": "deal_abc123",
    "metadata": {
        "product": "iPhone 14 Pro",
        "platform": "olx",
        "margin_pct": 18.5
    },
    "notes": "OLX arbitrage deal #abc123 - net profit after fees"
}

Response 201:
{
    "transaction_id": "uuid",
    "balance_after": 12500000.00,
    "allocation": {
        "trading": 8750000.00,  // 70%
        "reinvestment": 2500000.00,  // 20%
        "operating": 1250000.00  // 10%
    }
}
```

#### Withdraw (Allocate Capital)
```python
# /api/capital-pool/withdraw
POST {
    "tenant_id": "berkahkarya_main",
    "amount": 3000000.00,
    "purpose": "trading_allocation",
    "source_system": "1ai-trade-cex",
    "source_reference": "trade_session_20260706",
    "metadata": {
        "bot": "vilona_tradefx",
        "pair": "XAUUSD",
        "risk_pct": 2.0
    }
}

Response 201:
{
    "transaction_id": "uuid",
    "balance_after": 9500000.00,
    "available_balance": 9500000.00,
    "locked_balance": 3000000.00
}
```

#### Get Balance
```python
# /api/capital-pool/balance?tenant_id=berkahkarya_main
GET

Response 200:
{
    "tenant_id": "berkahkarya_main",
    "total_balance": 12500000.00,
    "available_balance": 9500000.00,
    "locked_balance": 3000000.00,
    "currency": "IDR",
    "last_updated": "2026-07-06T09:15:00Z"
}
```

#### Get Snapshot (Full Accounting)
```python
# /api/capital-pool/snapshot?tenant_id=berkahkarya_main&period=7d
GET

Response 200:
{
    "tenant_id": "berkahkarya_main",
    "snapshot_time": "2026-07-06T09:15:00Z",
    "balance": {
        "total": 12500000.00,
        "available": 9500000.00,
        "locked": 3000000.00
    },
    "flows": {
        "deposits_7d": 8000000.00,
        "withdrawals_7d": 5500000.00,
        "net_flow_7d": 2500000.00
    },
    "by_workflow": {
        "WF1_content": 0,
        "WF4_product": 4500000.00,
        "WF5_trading": 1200000.00,  // net PnL
        "WF6_arbitrage": 2300000.00
    },
    "current_allocation": {
        "trading": 8750000.00,
        "reinvestment": 2500000.00,
        "operating": 1250000.00
    },
    "allocation_rule": {
        "trading_pct": 70,
        "reinvestment_pct": 20,
        "operating_pct": 10
    }
}
```

#### Get Allocation Rules
```python
# /api/capital-pool/allocation-rules?tenant_id=berkahkarya_main
GET

Response 200:
{
    "tenant_id": "berkahkarya_main",
    "active_rule": {
        "id": "uuid",
        "min_balance": 0,
        "max_balance": 50000000,
        "trading_pct": 70,
        "reinvestment_pct": 20,
        "operating_pct": 10,
        "emergency_reserve_pct": 0
    },
    "next_rule": {
        "id": "uuid2",
        "min_balance": 50000001,
        "max_balance": null,
        "trading_pct": 50,
        "reinvestment_pct": 30,
        "operating_pct": 15,
        "emergency_reserve_pct": 5
    }
}
```

---

## 3. Allocation Logic

### 3.1 Default Rules (Bootstrap Phase)

**Phase 1: Bootstrap (0 - 50 juta IDR)**
- 70% trading (multiply capital fast)
- 20% reinvestment (content, tools, automation)
- 10% operating (hosting, subscriptions, emergencies)

**Phase 2: Growth (50 juta - 200 juta IDR)**
- 50% trading (steady multiplier)
- 30% reinvestment (scale systems, hire freelancers)
- 15% operating (infrastructure, legal, accounting)
- 5% emergency reserve (buffer for losses/downturns)

**Phase 3: Scale (200 juta+)**
- 40% trading (conservative, preserve capital)
- 35% reinvestment (team, R&D, new products)
- 20% operating (full operations)
- 5% emergency reserve

### 3.2 Dynamic Allocation

Hermes GM can override rules based on context:
- **After big trading loss:** Pause trading allocation, all to operating/reserve
- **During high-profit arbitrage period:** Increase WF6 reinvestment (more accounts, more automation)
- **Product launch phase:** Temporarily increase operating % for marketing spend

---

## 4. Integration Points

### 4.1 WF4 (Product Sales) → Pool
**Systems:** `1ai-trade-cex`, `1ai-affiliate`, `1ai-harvest`

```python
# After successful subscription payment
from hub_core.clients.capital_pool import deposit

deposit(
    tenant_id="berkahkarya_main",
    amount=299000.00,  # subscription price
    source_workflow="WF4_product",
    source_system="1ai-trade-cex",
    source_reference=f"subscription_{user_id}",
    metadata={
        "product": "vilona_tradefx_monthly",
        "user_id": user_id,
        "plan": "basic"
    }
)
```

### 4.2 WF5 (Trading PnL) → Pool
**System:** `1ai-trade-cex`

```python
# After trade closes
from hub_core.clients.capital_pool import deposit

if trade_pnl > 0:
    deposit(
        tenant_id="berkahkarya_main",
        amount=trade_pnl,
        source_workflow="WF5_trading",
        source_system="1ai-trade-cex",
        source_reference=f"trade_{trade_id}",
        metadata={
            "bot": "vilona_tradefx",
            "pair": "XAUUSD",
            "entry": 2650.00,
            "exit": 2680.00,
            "pnl": trade_pnl
        }
    )
else:
    # Loss - record as withdrawal
    withdraw(
        tenant_id="berkahkarya_main",
        amount=abs(trade_pnl),
        purpose="trading_loss",
        source_system="1ai-trade-cex",
        source_reference=f"trade_{trade_id}"
    )
```

### 4.3 WF6 (Arbitrage) → Pool
**System:** `1ai-social/marketplace`

Already built — `TreasuryBridge.push_deal_profit()` just needs to call the Capital Pool API:

```python
# In TreasuryBridge.push_deal_profit()
from hub_core.clients.capital_pool import deposit

deposit(
    tenant_id=self.tenant_id,
    amount=net_profit,
    source_workflow="WF6_arbitrage",
    source_system="1ai-social/marketplace",
    source_reference=deal_id,
    metadata={
        "product": deal.product_name,
        "source_platform": deal.source_platform,
        "target_platform": deal.target_platform,
        "margin_pct": margin_pct
    }
)
```

### 4.4 Pool → WF5 (Trading Allocation)
**System:** `1ai-trade-cex`

Before starting a trade session, bot checks available trading allocation:

```python
from hub_core.clients.capital_pool import get_balance, withdraw

# Check available trading allocation
balance = get_balance(tenant_id="berkahkarya_main")
trading_allocation = balance["current_allocation"]["trading"]

if trading_allocation < MIN_TRADE_CAPITAL:
    logger.warning("Insufficient trading allocation, pausing bot")
    return

# Lock capital for trading
withdraw(
    tenant_id="berkahkarya_main",
    amount=trade_size,
    purpose="trading_allocation",
    source_system="1ai-trade-cex",
    source_reference=f"session_{session_id}"
)
```

---

## 5. Risk Management Rules

### 5.1 Hard Limits
1. **Max trading allocation per session:** 30% of trading allocation (not total pool)
2. **Min pool balance before trading pauses:** 5 juta IDR
3. **Max daily drawdown:** 10% of total pool → auto-pause all withdrawals
4. **Emergency reserve untouchable:** Cannot withdraw from emergency reserve without manual approval

### 5.2 Alerts
Hermes GM triggers alerts to Vilona (and Paijo) when:
- Pool balance drops below 10 juta IDR
- Daily net flow negative for 3+ consecutive days
- Trading drawdown exceeds 7%
- Any single workflow contributes >80% of deposits (diversification risk)

---

## 6. Implementation Roadmap

### Week 1: Core Ledger
- [ ] Create DB schema in `1ai-hub` PostgreSQL
- [ ] Build `CapitalPoolService` class (`1ai-hub/src/capital_pool/service.py`)
- [ ] Implement deposit/withdraw/balance/snapshot methods
- [ ] Write 20+ unit tests

### Week 2: Allocation Engine
- [ ] Seed default allocation rules (Phase 1/2/3)
- [ ] Build allocation rule evaluator
- [ ] Add API endpoints (`/api/capital-pool/*`)
- [ ] Test allocation logic with various pool sizes

### Week 3: Integration (WF6 First)
- [ ] Connect `1ai-social/marketplace` TreasuryBridge to pool
- [ ] Deploy WF6 to production
- [ ] Monitor first arbitrage → pool deposit cycle
- [ ] Verify balance updates in real-time

### Week 4: Integration (WF4 & WF5)
- [ ] Instrument `1ai-trade-cex` for deposit/withdraw
- [ ] Instrument `1ai-affiliate` for commission deposits
- [ ] Add pool balance checks before trading
- [ ] Test full deposit/withdraw cycle with live trades

### Week 5: Vilona Integration
- [ ] Build Capital Pool client in `hub_core.clients.capital_pool`
- [ ] Add pool snapshot to Vilona's CFO reasoning context
- [ ] Implement alert system (Telegram notifications)
- [ ] Test Vilona's allocation recommendations

### Week 6: Dashboard & Monitoring
- [ ] Build pool dashboard in `1ai-hub` frontend
- [ ] Real-time balance chart
- [ ] Workflow contribution breakdown
- [ ] Historical snapshots + projections

---

## 7. Success Metrics

**Week 1-2:**
- [ ] Capital Pool API operational (all endpoints working)
- [ ] Balance tracking accurate to the cent

**Week 3-4:**
- [ ] WF6 arbitrage profits automatically deposited
- [ ] WF5 trading allocations automated
- [ ] Zero manual money tracking

**Week 5-6:**
- [ ] Vilona provides CFO-style insights ("trading allocation running low, recommend pausing or depositing")
- [ ] Flywheel visible: one workflow's profit fuels another's capital

**30-day goal:**
- [ ] Pool balance grows 20%+ per month
- [ ] All 3+ workflows contributing (diversified income)
- [ ] Zero manual accounting (100% automated)

---

## 8. FAQ

**Q: What if pool balance hits zero?**
A: Emergency reserve should prevent this. If it happens anyway:
1. Pause all withdrawals (trading, operating)
2. Alert Paijo immediately
3. WF4/WF6 keep depositing until reserve rebuilds to 5 juta minimum

**Q: How do we handle currency conversion (USD profits → IDR pool)?**
A: All deposits auto-convert to IDR at deposit time using live exchange rate. Metadata stores original currency + amount.

**Q: Can we have multiple pools (e.g., IDR pool + USD pool)?**
A: Phase 1 = single IDR pool only. Phase 2 (if needed) = add `currency` filter to all queries, separate allocation rules per currency.

**Q: What if trading bot loses money?**
A: Loss recorded as withdrawal with `purpose=trading_loss`. If losses exceed 10% of trading allocation in one day, trading auto-pauses. Hermes GM alerts Vilona for manual review.

---

## Conclusion

The Capital Pool turns BerkahKarya from "collection of revenue streams" into a **true flywheel**. Every rupiah has a job (trading / reinvestment / operating), and every workflow knows where it stands.

**Next step:** Build the ledger (Week 1) and connect WF6 (Week 3) — bootstrap engine first, then multiply with WF5.
