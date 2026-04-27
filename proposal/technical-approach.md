# Technical Approach

**RFP #MC-2026-0417 — Meridian Components Inventory Dashboard Modernization**

This section describes how we will address each item in §3 of the RFP. Where the RFP scope is ambiguous, we have documented our assumptions explicitly.

---

## R1 — Reports Module Remediation

The previous vendor's handoff notes acknowledge the Reports module was left in progress, with filters not fully wired. Meridian has logged approximately eight issues; we will treat that list as a starting point.

**Our approach:**
- Conduct a full audit of the Reports page against the rest of the application — comparing filter behavior, API call patterns, data rendering, and i18n coverage to what works correctly in other views
- Resolve all identified defects, not just those on the logged list
- Align Reports to the application's established patterns (filter system, data flow, Vue Composition API) so future changes are consistent and maintainable

**Assumption:** The issue list provided by Meridian is incomplete. Our fixed-fee pricing for R1 covers full remediation of all defects found during audit, not just the logged items.

---

## R2 — Restocking Recommendations

This is the highest-priority net-new capability. The Restocking view will allow operations staff to input a budget ceiling and receive a prioritized list of recommended purchase orders based on current stock levels and demand forecasts.

**Our approach:**
- Design the recommendation logic server-side (FastAPI), drawing on the existing `/api/inventory` and `/api/demand` data
- Build the Restocking view as a new Vue page, consistent with the existing routing and component patterns
- Inputs: warehouse selector, category filter, budget ceiling (operator-supplied)
- Output: ranked list of recommended orders with item, quantity, estimated cost, and rationale (why this item was flagged)
- Budget ceiling enforced at the recommendation layer — total recommended spend will not exceed the operator's input

**Assumption:** Demand forecast data is already available via `/api/demand`. We will use the existing data model; we are not building a new forecasting engine.

---

## R3 — Automated Browser Testing

No automated test coverage exists. Meridian IT has blocked changes to the system as a result. We will establish end-to-end browser test coverage using Playwright, targeting the critical user flows across the application.

**Our approach:**
- Define the flow inventory with Meridian IT sign-off before writing tests — we will not define "critical" unilaterally
- Cover at minimum: dashboard load and filter application, inventory browse and filter, orders browse and filter, Reports page (post-remediation), and the new Restocking view
- Tests will run against the locally hosted application and be executable by Meridian IT without vendor involvement
- Test suite will be committed to the repository alongside the application code

**Assumption:** All flows are in scope per Meridian's clarification. We will finalize the flow list during onboarding.

---

## R4 — Architecture Documentation

The previous vendor's handoff documentation is minimal. We will produce a current-state architecture overview suitable for Meridian IT handoff, verified against the actual codebase rather than prior documentation.

**Our approach:**
- Review the full codebase: frontend (Vue/Vite), backend (FastAPI), data layer (JSON files / mock data), and integration points
- Produce a visual architecture diagram with accompanying written narrative covering: component structure, data flow, API surface, filter system, and deployment topology
- Deliver as an HTML document for ease of viewing without tooling dependencies
- Complete this early in the engagement — it informs our own work on R1 and R2 and gives Meridian IT immediate value

---

## Desired Items (D1–D3)

The following are scoped as follow-on work, sequenced after all required items are complete and tested.

| Item | Our Approach |
|------|-------------|
| **D1 — UI Modernization** | Systematic visual refresh of the existing component set. Scope and design reference to be confirmed with Meridian stakeholders; we do not assume a brand guide exists. |
| **D2 — Internationalization** | Extend i18n coverage to remaining modules. The existing application has partial i18n infrastructure; we will audit coverage and extend to all user-facing strings, prioritizing Tokyo warehouse views. |
| **D3 — Dark Mode** | Operator-selectable theme toggle. Will be prototyped in isolation to avoid disrupting the main codebase during development. |

---

## Technical Assumptions

1. The existing Vue 3 / FastAPI stack is retained; we are not proposing a rewrite.
2. The JSON file data layer is retained for this engagement; database migration is out of scope.
3. Meridian will provide access to the codebase repository and a local development environment.
4. The previous vendor's handoff notes may be incomplete or inaccurate in places — we will verify against the actual code and flag discrepancies.
