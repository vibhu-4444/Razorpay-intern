# REVIVE — AI Revenue Recovery & Payment Operations Platform
## System Architecture Specification (Phase 1)

> **One-Line Definition:**  
> Revive turns failed payments into recoverable revenue by diagnosing failure context, selecting bounded recovery actions, executing them safely, and measuring the money recovered.

---

## 1. Core Architectural Principle

```
┌─────────────────────────────────────────────────────────────┐
│                      CORE PRINCIPLE                         │
│  AI can recommend. Deterministic systems decide what the   │
│            application is allowed to execute.               │
└─────────────────────────────────────────────────────────────┘
```

An LLM or machine learning model is an **untrusted advisory unit**; it produces statistical recommendations, failure classifications, and explanations. 
Under **no circumstances** is an AI model permitted to directly authorize, dispatch, or execute financial transactions or state mutations on payment rails.

---

## 2. System Topology & Request Lifecycle

The system operates strictly through unidirectional pipeline layers:

```
[ Ingest Failure Telemetry (Webhook / Ingestion Node) ]
                          │
                          ▼
[ AI Advisory Layer (Feature Analysis & Root-Cause Diagnosis) ]
                          │
                          ▼ (Advisory Output: Action Proposal + Confidence)
[ Deterministic Policy Engine (Invariant Verification: 6/6 Gates) ]
                          │
         ┌────────────────┴────────────────┐
         │                                 │
     [ Passed ]                       [ Failed ]
         │                                 │
         ▼                                 ▼
[ Idempotency Gate ]               [ Exceptions / Review Queue ]
         │                                 │
         ▼                                 ▼
[ Payment Provider (Simulator / Razorpay) ] [ Audit Ledger (Logged) ]
         │
         ▼
[ Gateway Settlement (Captured / Funds Settled) ]
         │
         ▼
[ Immutable Audit Trail Ledger (SHA-256 Verified) ]
```

---

## 3. Directory Structure & Domain Boundaries

```
src/
├── domain/                  # Pure domain types (Payment, Customer, Action, Policy, Audit)
├── policy-engine/           # Sovereign deterministic rule checker & invariants
├── recovery-engine/         # Bounded recovery state machine
├── ai/                      # Advisory model interfaces & failure inference heuristic
├── providers/               # Provider abstraction (SimulatorProvider, RazorpayTestProvider)
├── data/                    # Typed synthetic datasets, scenarios, and historical metrics
├── services/                # Application boundary orchestrating UI -> Engine -> Providers
├── design-system/           # Reusable UI primitives (AppShell, Sidebar, Badges, Tables, Stepper)
└── views/                   # Screens faithfully implementing the Stitch Precision Ledger UI
```

---

## 4. Bounded Recovery Actions

To prevent arbitrary execution, AI can only propose actions from a strictly typed closed set:
1. `RETRY_PAYMENT` — Automatic smart gateway routing with exponential backoff.
2. `SEND_REMINDER` — Dynamic dunning via SMS/Email to handle customer-side balance shortfalls.
3. `OFFER_ALTERNATIVE_METHOD` — WhatsApp / Email payment link for expired cards or invalid mandates.
4. `ESCALATE_TO_HUMAN` — Routes high-risk or high-value cases to the operator review queue.
5. `NO_ACTION` — Halts execution for fraudulent or unrecoverable accounts.

---

## 5. Security & Auditability

1. **No Client-Side Secrets**: All provider credentials and signing keys live in server/environment configs.
2. **Idempotency Guarantee**: Every execution requires an uncommitted idempotency key. Duplicate keys are deterministically rejected.
3. **Audit Ledger**: Every decision (AI proposal, policy check result, gateway RRN) is logged chronologically with cryptographic signature tracking.
