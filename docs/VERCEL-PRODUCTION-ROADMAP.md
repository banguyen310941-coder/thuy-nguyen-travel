# HappyGo Travel — Vercel Production Roadmap

## Target

The current GitHub Pages build remains usable as the prototype/demo. On Vercel the same Next.js project runs with server capabilities. The production target is split into two gates:

- **90% operational:** centralized database, real authentication/RBAC, server-side booking/CRM/sales assignment, product/rate/partner data, cost/profit reporting, email, audit logs, backup and monitoring.
- **100% operational:** payment reconciliation, supplier settlement, automation/SLA, Zalo/email journeys, accounting exports, advanced reporting, security hardening and disaster recovery.

## Architecture

Browser / Customer / Partner / Staff
→ Next.js on Vercel
→ `/api/*` server routes
→ PostgreSQL
→ email/payment/Zalo integrations

The browser must never be the source of truth for passwords, permissions, bookings, customer data, revenue, cost price or partner NET rates. `localStorage` remains only a migration/fallback mechanism during transition.

## 90% production gate

1. PostgreSQL schema and migrations for users, staff, roles, customers, leads, assignments, products, units, rates, partners, bookings, booking items, payments, costs, reviews and audit events.
2. Server authentication with hashed passwords, secure HttpOnly sessions, password reset and account lockout.
3. Server-side RBAC. Owner sees all; Sales sees only assigned customers/bookings; Partner sees only its own permitted records.
4. Booking transaction creates customer/lead, snapshots selling price and cost when available, and runs round-robin assignment atomically.
5. CRM pipeline: new → assigned → contacted → quoted → deposit pending → deposited → confirmed → completed/lost; follow-up date and activity timeline.
6. Cost/profit: product/partner NET price auto-populates booking cost; Sales can enter missing cost; owner can audit/override. Preserve historical price/cost snapshots.
7. Partner extranet stored centrally with approval workflow, commission, NET/retail/promo rates and inventory.
8. Transactional email for booking received, confirmed, payment and voucher events. Marketing consent stored separately.
9. Audit log for status, Sale assignment, price/cost, permission and partner changes.
10. Monitoring, error logging, database backup, restore test, rate limiting and input validation.

## 100% completion gate

1. Payment gateway + webhook verification + deposit/balance/refund reconciliation.
2. Supplier payable/receivable and partner settlement; gross profit and net profit reports.
3. Automated lead SLA: notify assigned Sale, remind overdue leads, escalate/reassign by policy.
4. Email/Zalo automation: confirmation, payment reminder, pre-trip reminder, post-trip review and remarketing with opt-out.
5. Quotation/voucher/invoice documents generated from immutable booking snapshots.
6. Advanced dashboards: conversion by Sale/source/product, response time, cancellation, margin, partner performance and repeat customers.
7. Data export/import, accounting integration and scheduled management reports.
8. 2FA for privileged accounts, security headers, CSRF/session protection, secret rotation and least-privilege database access.
9. Automated tests for booking totals, RBAC, round-robin, cost/profit, payment webhooks and partner privacy.
10. Disaster-recovery runbook and periodic restore drills.

## Data migration rule

Before production cutover, migrate browser data once into PostgreSQL. Preserve stable IDs, booking codes, timestamps, frozen `salesStaffId`, `revenue`, `costPrice`, product/unit identifiers and partner ownership. After verification, server data becomes authoritative and browser writes are disabled.

## Vercel cutover checklist

- Connect GitHub repository to Vercel.
- Configure production domain and HTTPS.
- Add environment variables from `.env.example`.
- Provision PostgreSQL and run migrations.
- Create the first owner account server-side; remove prototype/default credentials.
- Import existing products, partners, customers and bookings.
- Verify RBAC with Owner, Sale and Partner test accounts.
- Verify one complete booking from public site through CRM, Sale, confirmation, cost/profit and email.
- Enable backups/monitoring before accepting real customer data.

## Non-negotiable production rules

- No plaintext passwords in browser storage or database.
- No authorization based only on hidden UI elements.
- No customer PII or partner NET price exposed to unauthorized clients.
- Money is stored as integer VND (or explicit currency/minor units), never parsed from display strings for accounting.
- Booking selling price, cost and Sale attribution are historical snapshots and do not silently change when product prices or CRM assignments change.
- Payment/email webhook processing must be idempotent.
