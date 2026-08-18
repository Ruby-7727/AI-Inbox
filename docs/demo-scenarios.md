# AI Inbox portfolio demo scenarios

AI Inbox includes an explicit demo mode for a clean interview walkthrough. Set
`NEXT_PUBLIC_AI_INBOX_DEMO_MODE=true` in `.env.local` and open the app with a
fresh anonymous browser session. If that session's Inbox is empty, the app adds
the five rows below through the normal Supabase client and RLS policies.

Demo mode never deletes or resets existing data. It does not seed a non-empty
Inbox, which prevents duplicate scenarios and preserves the user's records.

## Shop — ChangYuan 毛毯照片墙

- Screenshot: Product recommendation
- AI intent: Shop
- Expected actions: Save, Research Product
- Expected Saved category: Products

## Go — 北京咖啡地图

- Screenshot: Xiaohongshu-style coffee shop recommendation list
- AI intent: Go
- Expected actions: Open Map, Research Trip, Save Place
- Expected Saved category: Places

## Attend — 2026 广州超级草莓音乐节

- Screenshot: Multi-day music festival poster
- AI intent: Attend
- Expected actions: Add Calendar
- Expected Saved category: Not applicable

## Do — 面试准备提醒

- Screenshot: Interview preparation task with a reminder time
- AI intent: Do
- Expected actions: Remind Me
- Expected Saved category: Not applicable

## Remember — 女性文学书单

- Screenshot: Reading-list recommendation
- AI intent: Remember
- Expected actions: Save, Research
- Expected Saved category: Notes

## Suggested interview walkthrough

1. Start on All to explain the five intent categories.
2. Switch between category tabs to demonstrate automatic organization.
3. Open 北京咖啡地图 and demonstrate Open Map, Research Trip, and Save Place.
4. Save the Shop, Go, and Remember examples, then verify Products, Places, and Notes.
5. Open Attend and Do to demonstrate calendar and reminder confirmation flows.

For the cleanest recording, use a fresh browser profile or clear only the local
anonymous Supabase session before the walkthrough. Do not reset database tables.
