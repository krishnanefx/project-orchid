# Project Orchid Product Brief

## Source Notes

Project Orchid is a flagship digital infrastructure initiative by UKSSC's Technology Division under the Operations Department.

It is intended to become a centralised ecosystem for UK-based Singaporean student societies, supporting membership management, event hosting, forum discussions, analytics, workflow automation, and related operations.

## Confirmed Decisions

- Build target: real production application, not only a prototype.
- Initial operating model: UKSSC-internal first.
- Future expansion: keep architecture ready for each Singaporean student society to have its own admin area later.
- Existing systems: this is a new platform, not a replacement for a current single system.
- V1 scope ambition: include membership, events, forums, analytics, reimbursements, and society directory if feasible.
- V1 execution: all major modules should be visible, with pragmatic depth and production foundations.
- Authentication: open signup with university email verification for students.
- Verification: university email domains should be curated and admin-managed.
- Guest accounts: alumni and sponsors can participate in the wider community but cannot join university societies as student members.
- Rubric: keep as a future integration; Supabase is the app source of truth for now.
- Deployment target: Vercel plus Supabase.
- Notifications: email-first.
- Brand direction: Orchid-led, with UKSSC as the parent operator.

## Product Direction

Project Orchid should start as a UKSSC operations platform that centralises student society data, events, internal workflows, and reporting. The first release should prioritise foundations that are hard to change later: authentication, roles, data ownership, auditability, and clean data models.

The platform should avoid assuming that UKSSC will always be the only operator. Society-level tenancy, scoped permissions, and society-specific dashboards should be designed into the model even if they are not exposed in the first release.

## Parking Lot

- Society self-service admin areas are not part of the initial operating model, but must remain a planned expansion path.
- Spreadsheet import/export.
- Rubric sync/import.
- Paid society memberships and payment processing.
