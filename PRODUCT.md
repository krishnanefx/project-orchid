# Product

## Register

product

## Users

**Primary: Singaporean university students studying in the UK.** They are 18–25, living away from home, navigating dual cultural identities. They use the platform to find community, stay connected to Singaporean peer networks, attend cultural events, and manage their involvement in student societies. Context: usually on laptops for dashboard use, mobile for quick event checks. Time-scarce and social — they engage in bursts, not sessions.

**Secondary: Society committee leaders.** Committee members at Singaporean student societies at UK universities. They use the platform to manage their society's hub, post events, moderate forums, and process reimbursement claims. They need efficiency — they're volunteers juggling coursework.

**Tertiary: Finance reviewers and UKSSC staff.** Administrators reviewing and approving reimbursement claims, monitoring society activity across the network, and maintaining platform integrity. They need audit trails, clear status states, and reliable data exports.

**Peripheral: Alumni, sponsors, recruiters.** Lower engagement frequency. Primarily browse events and the broader community profile.

## Product Purpose

Project Orchid is a centralised digital ecosystem for UK-based Singaporean students, operated by the UK Singapore Students' Council (UKSSC). It replaces scattered WhatsApp groups, Notion pages, and email chains with a single platform covering:

- **Membership and identity** — verified profiles tied to university email addresses
- **Event discovery** — cross-society event calendar with RSVP management
- **Society hubs** — per-society spaces with forums, resources, and announcements
- **Peer forums** — structured discussion boards for the broader community
- **Reimbursement workflows** — end-to-end claim submission and approval for committee finance
- **Admin analytics** — UKSSC-level dashboards for platform health and society oversight

Success: a student arriving at a UK university finds Project Orchid, creates a profile, discovers their local Singaporean society, attends an event, and feels less alone. A committee treasurer submits a reimbursement and gets it resolved without a single email.

## Brand Personality

**Warm. Grounded. Quietly proud.**

The brand should feel like a trusted community hub — not a startup, not a government portal. It carries the botanical warmth of the orchid symbol (Singapore's national flower) without being decorative or precious. It is confident without being loud, welcoming without being saccharine, and professional without being corporate.

Emotional goals for marketing surfaces: belonging, anticipation, pride in community. For product surfaces: calm competence, low friction, trust in the system.

## Anti-references

- Generic SaaS dashboards (Linear clones, Notion copycats, "admin panel" templates)
- Corporate recruitment portals — stiff, formal, achievement-obsessed
- Generic "student union" websites — clipart-heavy, dated, low visual ambition
- Neon-on-dark "tech bro" aesthetics — wrong cultural register entirely
- Overdesigned fintech / crypto interfaces — too transactional, wrong warmth

## Design Principles

1. **Community over product.** Every screen should feel like it was made for people who already know each other, not for anonymous users. Prioritise warmth and human-readable copy over clinical efficiency language.

2. **Botanical restraint.** The orchid metaphor earns its place through material choices (texture, organic form, botanical colour), not through decorative overuse. One orchid motif per screen is enough. Two is the maximum.

3. **Low-noise density.** Students and committee members are time-scarce. Surfaces should carry enough information to act without requiring navigation. Avoid filler, repetition, and empty states that feel apologetic rather than helpful.

4. **Trust through clarity.** Reimbursement, forum moderation, and admin workflows involve real accountability. Status states, error messages, and data displays should be unambiguous — no purple prose where a clear label will do.

5. **Dual register, single voice.** The marketing pages (landing, login) and the product dashboard share the same brand voice but use it differently. Marketing evokes and invites. Product guides and confirms. The same word choices, different cadence.

## Accessibility & Inclusion

- **WCAG 2.1 AA minimum.** All interactive elements, colour contrast, and form controls must meet AA.
- **Focus management.** Keyboard navigation must be fully supported, including focus-visible outlines on all interactive elements. A skip-to-content link is required on all full-page layouts.
- **Reduced motion.** All animations must respect `prefers-reduced-motion`. No motion-dependent information.
- **Colour blindness.** Status indicators (claim states, RSVP states) must not rely on colour alone — include icon or text differentiation.
- **Language.** Platform is English-only for now. All dates use DD Month YYYY format (UK convention). Currency uses GBP (£).
