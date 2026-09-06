# HappyGo Travel database baseline

Production uses Neon/PostgreSQL. The repository keeps the schema in two additive layers so a fresh database can be rebuilt without relying on browser/local state or undocumented manual SQL.

1. Run `db/schema.sql` for the core travel/CRM/catalog/booking/CTV tables.
2. Run `db/production-extension.sql` for customer accounts/reviews, partner portal support, suppliers, payment requests, accounting and the production payment columns.
3. Configure application secrets/environment variables separately. Do not place credentials in SQL or Git.

`db/production-extension.sql` was reconciled against the actual Neon production schema on 2026-09-06, including the important constraints and indexes for those extension tables. It is intended for fresh-database bootstrap and disaster-recovery documentation; production schema changes should still go through a reviewed migration/temporary Neon branch before application.

The `affiliates.commission_rate` column remains only for backwards compatibility. It is not the business source of truth. Active commission is calculated by application logic from successful order number and booking profit: 35% for orders 1–10, 40% for 11–20, 45% for 21–50 and 50% from order 51 onward.
