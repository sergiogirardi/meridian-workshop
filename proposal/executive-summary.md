# Executive Summary

**RFP #MC-2026-0417 — Meridian Components Inventory Dashboard Modernization**

Meridian Components has built a functional inventory dashboard but is operating with known defects, no test coverage, and a gap in the capabilities its operations team needs. The previous vendor left work unfinished. Our engagement picks up from that point and delivers a system Meridian's IT team can safely maintain and its operations team can rely on.

## Our understanding of the ask

The four required items in §3 are not independent — they are sequenced. Automated browser tests (R3) are the gate that allows Meridian IT to approve changes. That means R3 is not simply one of four deliverables: it is the foundation that makes the others safe to ship. We will establish test coverage early, not at the end of the engagement.

The Restocking view (R2) is the capability R. Tanaka's operations team has been waiting for. It is the highest-value net-new feature in the scope and will receive proportionate attention in our technical approach.

Reports remediation (R1) addresses the most immediate user pain — a broken module that operations staff encounter daily. We will treat the logged issue list as a floor, not a ceiling: our audit will surface and resolve all defects, including any not yet logged.

Architecture documentation (R4) is both a required deliverable and useful to us — we will complete it early as part of onboarding, giving Meridian IT a current-state picture and giving our team the foundation for safe, well-scoped changes throughout.

## Our approach

We work directly in the codebase from day one. We will not reconstruct the previous vendor's work from documentation alone — we will read the code, verify the handoff notes against reality, and scope from what we find. Where the handoff docs are incomplete or inaccurate (a risk the thin documentation already signals), we will surface that early rather than late.

Our delivery is phased: stabilize first (R3 + R1), then build (R2), then document and close (R4). Desired items D1–D3 are scoped as follow-on work, sequenced after the required items are complete and tested.

## Why us

We have delivered comparable engagements on Vue/Python stacks with similar characteristics: inherited codebases, incomplete documentation, and an operations team that needs both fixes and new features on a predictable timeline. We know what it takes to get a system from "functional but incomplete" to a state Meridian IT will confidently approve changes against.

---

*Response prepared by: [Firm Name] | Contact: sergio.girardi@accenture.com*
