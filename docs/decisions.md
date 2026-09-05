# Architectural Decision Records (ADR)
## REVIVE Revenue Recovery Platform

---

### Decision 001: Separation of AI Recommendation from Execution Authorization
* **Status**: Accepted
* **Context**: In automated revenue recovery, AI models are effective at classifying failure telemetry, clustering patterns, and predicting recovery likelihood. However, LLMs and probabilistic models are non-deterministic and can hallucinate or violate financial policies.
* **Decision**: We strictly separate the AI advisory layer (`src/ai/`) from the execution authorization engine (`src/policy-engine/`). AI outputs are typed as `isAdvisoryOnly: true`. Financial dispatch requires passing 6 programmatic, deterministic invariant gates.
* **Consequences**: Zero probability of an LLM triggering unapproved financial transactions, double-billing, or violating merchant SLAs.
* **Hinglish Rationale**:
  *AI recommendation ko directly execute nahi kar rahe. Fintech flow mein model ka output untrusted recommendation hai; actual permission deterministic policy engine decide karega.*

---

### Decision 002: Payment Provider Abstraction Layer
* **Status**: Accepted
* **Context**: Coupling recovery business logic to a single payment gateway (such as direct Razorpay REST calls) makes local testing flaky, couples domain models to third-party schema changes, and prevents multi-gateway failover.
* **Decision**: We defined a provider-independent `PaymentProvider` interface in `src/providers/types.ts`. Implementations include `SimulatorProvider` and `RazorpayTestProvider`.
* **Consequences**: High testability, zero dependency on live gateway availability for CI/CD runs, and easy addition of alternate settlement rails in future phases.
* **Hinglish Rationale**:
  *Yahan provider call ko domain logic se separate rakha hai, taaki kal RazorpayTestProvider ki jagah simulator use karna ho toh recovery engine ko rewrite na karna pade.*

---

### Decision 003: Deterministic Simulation Alongside Provider Integration
* **Status**: Accepted
* **Context**: Demonstrating and evaluating complex edge cases (e.g. cascading bank downtime, velocity exhaustion, cardholder disputes) on live testnet gateways is unreliable and rate-limited.
* **Decision**: We built a high-fidelity `SimulatorProvider` that deterministically reproduces ISO 8583 responses, gateway RRNs, auth codes, and idempotency rejection.
* **Consequences**: Repeatable benchmark evaluation in the Evaluation Lab with 100% reproducible test runs.
* **Hinglish Rationale**:
  *Simulation se benchmark test scenarios (jaise 500 controlled cases) har baar identical deterministic output dete hain bina kisi external network failure ke.*

---

### Decision 004: Strict Decoupling of Business Logic from UI Components
* **Status**: Accepted
* **Context**: In naive dashboards, UI buttons directly trigger API calls or mutate state inline, leading to untestable code and duplicate business logic.
* **Decision**: UI components only dispatch actions to the application service layer (`RecoveryService`). The service orchestrates domain validation, calls the policy engine, commits audit events, and interfaces with the provider.
* **Consequences**: Clean UI components that mirror the Stitch design without being polluted by complex policy algorithms or gateway handling.
* **Hinglish Rationale**:
  *UI component ka kaam sirf rendering aur user intent capture karna hai; business invariants aur execution rights service layer aur policy engine ke paas rehte hain.*

---

### Decision 005: Safe Failure Handling & Provider Timeout Idempotency
* **Status**: Accepted
* **Context**: In real-world payment gateways, 504 Gateway Timeouts or socket drops leave the transaction in an ambiguous state: the cardholder might have been debited, or the switch might have aborted. Blindly re-attempting a timed-out recovery causes double-debits and regulatory fines.
* **Decision**: Any network or provider timeout yields `UNKNOWN_PROVIDER_STATE`. The case is transitioned to `ESCALATED` rather than `FAILED` or `RECOVERED`. Automated re-dispatch is strictly suppressed. An audit event is recorded explaining the suppression, and the case is routed to human operations review. Additionally, idempotency caching ensures that duplicate requests with the same key return the original cached result without secondary gateway dispatch.
* **Consequences**: Zero risk of duplicate debiting during bank switch connectivity degradation. Complete operational transparency.
* **Hinglish Rationale**:
  *Timeout ke waqt payment state unconfirmed rehti hai. Blindly dobara retry karne se customer double-charge ho sakta hai, isliye case ko ESCALATED mark karke human reconciliation ke liye bhejte hain.*

---

### Decision 006: Dynamic Ledger Single Source of Truth
* **Status**: Accepted
* **Context**: Prototype dashboards often hardcode summary KPIs (e.g. ₹8,42,500 at risk, 37 interventions) separately from table items, creating discrepancies when transactions update.
* **Decision**: All platform metrics (`getOverviewKPIs()`), pipeline conversion funnel counts (`getPipelineFunnel()`), exception queues, and case tables derive dynamically from the centralized `RecoveryService` case store. When a recovery action is executed, recovered revenue increments, at-risk revenue decrements, and conversion rates recalculate reactively across all views.
* **Consequences**: Real-time ledger consistency. Zero drift between executive summary cards and granular audit records.
* **Hinglish Rationale**:
  *Fake static numbers ki jagah saare KPIs dynamic hain. Jaise hi koi case recover hota hai, command center ke cards aur pipeline stepper live update hote hain.*

