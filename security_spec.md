# Security Specification for Aegis Brand Governance

## 1. Data Invariants
1. **User Identity & PII Isolation**:
   - A user profile `/users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid == userId`, or an administrator (`sharmakhusboo924@gmail.com`).
   - Non-authenticated users cannot read or write user profiles.
   - Users cannot arbitrarily elevate themselves to admin or change system immutable fields without authorization.

2. **Draft Ownership & Governance Workflow Invariant**:
   - Only authenticated users can create drafts. The `authorId` on creation must strictly match `request.auth.uid`.
   - Creators can edit their own drafts in `draft` or `changes_requested` status.
   - Once a draft is submitted or in review, status transitions to `approved` or `rejected` can only be performed by authorized reviewers (managers, compliance officers, or admin).
   - Document ID and `authorId` cannot be mutated on update.
   - String boundaries: titles <= 200 chars, text <= 50,000 chars.

3. **Fact Vault Invariants**:
   - The `/facts/{factId}` collection contains verified brand statements.
   - Read access is allowed for authenticated organization members so creators can ground claims.
   - Write access (create, update, delete) is restricted to managers and compliance officers or the bootstrapped admin (`sharmakhusboo924@gmail.com`).

## 2. The Dirty Dozen Payloads (Adversarial Test Payloads)
1. **Unauthenticated Read on Drafts**: Anonymous client attempts `GET /drafts/draft-123` -> Rejected.
2. **Author Impersonation on Create**: Authenticated user `uid-attacker` submits draft with `authorId: 'uid-victim'` -> Rejected (fails identity integrity).
3. **Ghost Field Injection (Shadow Update)**: Attacker attempts to inject hidden field `bypassApproval: true` or `isAdmin: true` -> Rejected via strict `hasOnly` / schema keys.
4. **ID Poisoning Attack**: Attacker attempts writing to `/drafts/../../admin_secrets` or 2KB path name -> Rejected by `isValidId()` regex `^[a-zA-Z0-9_\-]+$` and length <= 128.
5. **Denial of Wallet Payload**: Attacker submits 5MB text field to exhaust database bandwidth -> Rejected by `data.text.size() <= 50000`.
6. **Unauthorized Status Escalation**: Creator attempts direct update from `in_review` to `approved` without manager signoff -> Rejected by role-governed status transition checks.
7. **Tampering with Immutable Creation Fields**: Attacker attempts modifying `createdAt` or `authorId` on existing draft -> Rejected (`incoming().authorId == existing().authorId`).
8. **Malicious Fact Poisoning**: Unauthorized creator attempts writing unverified promotional claim into `/facts/fact-1` -> Rejected (requires manager/compliance role).
9. **Blanket Query Scraping**: Malicious client issues unfiltered collection query on drafts -> Restricted by list rules evaluating document ownership or member clearance.
10. **Email Spoofing Attack**: Attacker sets email header to `sharmakhusboo924@gmail.com` with `email_verified == false` -> Rejected by token verification.
11. **Type Poisoning**: Attacker passes `score: "one-hundred"` (string instead of number) -> Rejected by `data.score is number`.
12. **Foreign Profile Write**: User `uid-A` tries writing to `/users/uid-B` -> Rejected (`request.auth.uid == userId`).
