# Service & Repair Marketplace

## Current State
The platform currently uses government-specific language throughout the UI: "Government Institution", "government-grade marketplace", "government job postings", "For Government Institutions", "Connecting government institutions with skilled service providers across India", and related phrases. This limits the perceived audience to public sector entities.

## Requested Changes (Diff)

### Add
- Nothing new to add.

### Modify
- **Landing.tsx**: Replace all government-specific phrases with inclusive, universal language:
  - "Government institutions post repair & maintenance requirements" → "Any institution posts repair & maintenance requirements"
  - "A government-grade marketplace" → "A trusted marketplace"
  - "For Government Institutions" → "For Any Institution"
  - "Browse government job postings" → "Browse job postings"
  - "government-grade" and similar → neutral/inclusive equivalents
- **Auth.tsx**:
  - Role label `"Government Institution"` → `"Institution"`
  - Placeholder `"Ministry / Company / Institution"` → `"Company / Organization / Institution"`
- **Footer.tsx**:
  - Tagline `"Connecting government institutions with skilled service providers across India."` → `"Connecting institutions and organizations with skilled service providers worldwide."`
- **InstitutionDashboard.tsx**:
  - Fallback text `"Government Institution"` → `"Institution"`
- **InstitutionProfile.tsx**:
  - Placeholder `"Ministry / Department / Institution name"` → `"Company / Organization / Institution name"`
  - Description `"Upload your institution's logo or representative photo"` → stays the same (already generic)

### Remove
- All government-specific framing ("government-grade", "government institutions", "across India" geography-lock)

## Implementation Plan
1. Update `Landing.tsx` — all 8+ government-specific text strings to inclusive alternatives
2. Update `Auth.tsx` — role label and organization placeholder
3. Update `Footer.tsx` — tagline
4. Update `InstitutionDashboard.tsx` — fallback organization name
5. Update `InstitutionProfile.tsx` — placeholder text
6. Validate and deploy
