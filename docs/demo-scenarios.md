# AI Inbox portfolio demo scenarios

AI Inbox includes an explicit demo mode for a clean interview walkthrough. Open
`/inbox?demo=1` with a fresh anonymous browser session. The normal public Inbox
does not load sample content. In Demo mode, the app prepares the five rows below
through the normal Supabase client and RLS policies.

Demo mode never deletes or resets existing data. Recognized legacy Demo rows are
updated in place, while genuine uploaded screenshots remain untouched.

## Attend — 2026 广州超级草莓音乐节

- Screenshot: Multi-day music festival poster
- AI intent: Attend
- Expected actions: Add Calendar
- Expected Saved category: Not applicable

## Do — 面试准备提醒

- Screenshot: Interview preparation checklist with a date
- AI intent: Do
- Expected actions: Remind Me
- Expected Saved category: Not applicable

## Go — 北京意面封神榜

- Screenshot: Restaurant recommendation list
- AI intent: Go
- Expected actions: Open Map, Research Trip, Save Place
- Expected Saved category: Places

## Shop — ELLE 行李箱

- Screenshot: Product recommendation
- AI intent: Shop
- Expected actions: Save, Research Product
- Expected Saved category: Products

## Remember — 女性书单 | 女孩保持阅读

- Screenshot: Reading-list recommendation
- AI intent: Remember
- Expected actions: Save, Research
- Expected Saved category: Notes

## Suggested interview walkthrough

1. Start on All to explain the five intent categories.
2. Switch between category tabs to demonstrate automatic organization.
3. Open 北京意面封神榜 and demonstrate Open Map, Research Trip, and Save Place.
4. Save the Shop, Go, and Remember examples, then verify Products, Places, and Notes.
5. Open Attend and Do to demonstrate calendar and reminder confirmation flows.

For the cleanest recording, use a fresh browser profile or clear only the local
anonymous Supabase session before the walkthrough. Do not reset database tables.
