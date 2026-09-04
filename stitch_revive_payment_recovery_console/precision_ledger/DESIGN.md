---
name: Precision Ledger
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#3e3fcc'
  on-tertiary: '#ffffff'
  tertiary-container: '#585be6'
  on-tertiary-container: '#f1eeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter-table: 0.75rem
  layout-margin-desktop: 2rem
  layout-margin-mobile: 1rem
---

## Brand & Style

This design system embodies the rigor, composure, and architectural clarity required for high-stakes payment operations and autonomous revenue recovery. Designed for risk officers, finance operations leads, and billing engineers, the interface eliminates cognitive noise in favor of rapid auditability, absolute reliability, and mathematical certainty.

The aesthetic philosophy draws inspiration from modern enterprise instrumentation and structural minimalism. Every pixel functions as a utility: pure neutral surfaces establish hierarchy without decoration, hairline strokes define spatial logic, and color is reserved strictly for operational state, deterministic compliance, and advisory telemetry. The user experience balances sovereign enterprise trust with the agile execution speed of developer-grade tooling.

## Colors

The palette employs a functional, high-density light hierarchy calibrated to reduce eye strain during prolonged operational audits while guaranteeing WCAG AAA legibility.

### Surface Architecture
- **Canvas Base (`#F8FAFC`)**: Soft cool background establishing depth against active work areas.
- **Card & Data Surfaces (`#FFFFFF`)**: Pure white layered elevations providing absolute contrast for tabular ledgers.
- **Subtle Structural Borders (`#E2E8F0`)**: 1px low-contrast dividers framing panels, metrics, and data rows.

### Core Brands & Accents
- **Primary Royal Cobalt (`#2563EB`)**: High-priority actions, verified interactive states, focused borders, and primary navigation links. Deepens to `#1E40AF` on hover.
- **Secondary Slate Anchor (`#0F172A`)**: Deep navy-slate reserved for headers, high-emphasis text, and core structural iconography.
- **AI Advisory Lavender/Violet (`#6366F1`)**: Exclusively reserved for predictive heuristics, auto-dunning forecasts, and AI-suggested retry routing (`bg: #EEF2FF`).

### Semantic Enforcements
- **Deterministic Positive (`#059669` / `bg: #ECFDF5`)**: Hard policy authorizations, successful recoveries, verified capture events.
- **Deterministic Warning (`#D97706` / `bg: #FFFBEB`)**: SLA thresholds nearing expiry, retry rate anomalies, partial dispute resolution.
- **Deterministic Critical (`#DC2626` / `bg: #FEF2F2`)**: Hard processor declines, fraud triggers, unrecoverable churn events.

AI suggestions must never borrow deterministic green or red states; they remain strictly bounded within the indigo/violet spectrum to prevent operational confusion between machine advice and programmatic ledger status.

## Typography

Typography relies entirely on the systematic clarity of Inter. The typographic hierarchy is strictly controlled to sustain compact data tables, dense audit feeds, and fast visual scanning across hundreds of transactional events.

### Tabular Formatting
All monetary numbers, transaction IDs, status percentages, and timestamp values require tabular figures (`font-variant-numeric: tabular-nums`). This prevents jitter in dynamically updating queues and provides clean vertical alignment down transaction tables.

### Hierarchy & Scale
- **Headlines (`headline-xl`, `headline-lg`, `headline-md`)**: Reserved for platform dashboards, account balances, and high-level recovery metrics. Rendered with tight negative tracking (`-0.02em`) to produce a sharp, cohesive aesthetic.
- **Body (`body-md`, `body-sm`)**: Used for explanatory text, payment metadata breakdowns, and dispute notes. Slate-900 (`#0F172A`) is used for primary reading, Slate-600 (`#475569`) for secondary descriptors, and Slate-400 (`#94A3B8`) for timestamp subtexts.
- **Labels & Badges (`label-md`, `label-sm`)**: Rendered in medium weight (`500`) with positive tracking to optimize micro-copy readability across status tags and state filters.

## Layout & Spacing

Layouts follow an 8-point base grid, down-scaled to a 4-point micro-grid for compact UI modules like badge indicators, segmented toolbars, and ledger cells.

### Grid Systems & Structural Layout
- **Desktop (>= 1280px)**: 12-column grid with 24px gutters and fixed 64px collapsed / 240px expanded navigation sidebar. Main content areas restrict line lengths for analytical tables to full viewport width with a 32px safe outer padding.
- **Tablet (768px – 1279px)**: 8-column layout. Metric card clusters collapse from 4-across to 2x2 formations. Side navigation shifts to an overlay drawer.
- **Mobile (< 768px)**: 4-column layout with 16px lateral padding. Tables transition into vertically stacked transaction detail cards.

### Dense Data Rules
Table row heights are strictly pinned to 40px for compact views and 48px for standard views with double-line metadata. Section header modules maintain an invariant 16px bottom padding, anchoring directly to table containers without floating whitespace.

## Elevation & Depth

Visual depth is achieved primarily through structural hairline borders and restrained tonal contrasts rather than heavy shadows. The system preserves a crisp, industrial physical presence.

### Elevation Hierarchy
- **Level 0 (Canvas)**: `#F8FAFC` flat surface. Holds no elevation or borders.
- **Level 1 (Card & Surface)**: `#FFFFFF` resting background with a 1px solid `#E2E8F0` perimeter border. A light ambient drop shadow (`0 1px 2px 0 rgba(15, 23, 42, 0.04)`) separates interactive panels from the canvas.
- **Level 2 (Popovers, Dropdowns, Flyouts)**: `#FFFFFF` surface with a 1px solid `#CBD5E1` border and an expanded utility shadow (`0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`).
- **Level 3 (Modal Dialogs & Command Menus)**: Centered floating surfaces backed by a semi-opaque neutral overlay (`rgba(15, 23, 42, 0.40)` with `backdrop-filter: blur(2px)`), featuring a defined drop shadow (`0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`).

Decorative glow effects, saturated ambient color reflections, and multi-tier glassmorphism are explicitly avoided.

## Shapes

Shapes reflect precision and operational restraint. The core geometry standardizes on controlled, subtle curvature (`roundedness: 1`).

- **Base Radius (`0.25rem` / 4px)**: Checkboxes, segmented control buttons, status indicators, and nested micro-badges.
- **Medium Radius (`0.375rem` / 6px)**: Standard interactive buttons, dropdown triggers, and form input containers.
- **Container Radius (`0.5rem` / 8px)**: Data tables, analytical metric modules, payment detail panels, and modal containers.
- **Pill Radius (`9999px`)**: Exclusively reserved for status badges, SLA trackers, and AI confidence level tags.

Sharp vertical dividers (1px) are deployed to slice horizontally dense dashboards into logical categorical columns, retaining visual stability across high-density data.

## Components

### Buttons
- **Primary**: Solid Cobalt (`#2563EB`) fill, text `#FFFFFF`, height 36px, horizontal padding 14px, `rounded-md` (6px). Hover: `#1E40AF`. Active: `#1D4ED8`. Focus: 2px ring `#2563EB` offset by 2px `#FFFFFF`.
- **Secondary / Outline**: `#FFFFFF` background, 1px `#E2E8F0` border, text `#0F172A`. Hover: `#F8FAFC` background with border `#CBD5E1`.
- **Ghost / Utility**: Transparent background, text `#475569`. Hover: `#F1F5F9`, text `#0F172A`.
- **Destructive**: Solid Crimson (`#DC2626`) fill, text `#FFFFFF`. Reserved strictly for immutable operational interventions (e.g., terminating merchant routing keys or revoking dunning policies).

### Chips & Badges
- **Deterministic Status**: 20px height, pill radius, padding `2px 8px`, `label-sm` (11px, medium).
  - *Pass / Cleared*: `#ECFDF5` background, `#047857` text, solid `#A7F3D0` 1px border.
  - *Failed / Blocked*: `#FEF2F2` background, `#B91C1C` text, solid `#FECACA` 1px border.
  - *Pending / Audit*: `#FFFBEB` background, `#B45309` text, solid `#FDE68A` 1px border.
- **AI Recommendation**: `#EEF2FF` background, `#4338CA` text, solid `#C7D2FE` 1px border. Always prepended by a distinctive spark/intellect micro-glyph to communicate advisory nature.

### Input Fields & Controls
- **Text Inputs**: Height 36px, 1px `#E2E8F0` border, `#FFFFFF` background, padding `0 12px`, typography `body-md`. Placeholder text `#94A3B8`. Focus: border color `#2563EB` with `0 0 0 1px #2563EB`.
- **Checkboxes & Radios**: 16px square/circle, 1px `#CBD5E1` border. Selected state: solid `#2563EB` fill with crisp white vector checkmark.

### Cards & Ledger Tables
- **Cards**: Single-pixel `#E2E8F0` border, white surface, 16px internal padding, 8px border radius. Card headers feature subtle `#F8FAFC` backgrounds separated by a 1px border from the content body.
- **Ledger Tables**: Zero outer padding within containers. Row headers use `label-sm` in `#475569` on `#F8FAFC` background. Table rows include a 1px bottom border `#F1F5F9`, transitioning to `#F8FAFC` on hover. Monospaced tabular numerals are enforced across currency and reference columns.