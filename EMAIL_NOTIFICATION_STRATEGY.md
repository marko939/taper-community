# Email Notification Strategy

## The Problem
Users should be notified when someone replies to their thread,
but not spammed if a post gets 50 replies in a day.

## The Solution — End of Day Digest via Resend at 2pm CEST

### How it works
- Throughout the day, reply activity is collected passively — no emails sent
- At 2pm CEST every day, a background server process fires
- It checks every user for unread reply notifications since their last digest
- One single email is sent per user covering everything from the last 24 hours
- If a user has no new replies, no email is sent

### Why 2pm CEST
- 2pm CEST = 8am EST = 5am PST
- Hits European users at a productive afternoon moment
- Hits US East Coast users first thing in the morning
- Maximizes open rates across the core SA audience (majority US + UK + Europe)

### Send rules
- Maximum 1 digest email per user per day, no exceptions
- No immediate emails per reply — everything waits for the 2pm send
- If a thread gets 50 replies in a day, the user gets 1 email, not 50

### Digest Email Format
Subject: "[Name], 3 people replied to your thread — [thread title truncated]"
Body:
- Show first 2 replies in full with author name
- "...and 4 more replies. View thread →" with direct link
- One-click unsubscribe link in footer
- Sent via Resend.com for reliable deliverability

### User Controls (in notification settings)
- Off
- Daily digest at 2pm CEST (default)
- Weekly digest (sends Mondays at 2pm CEST)

### Implementation (when ready to build)
- Set up Resend.com and configure as SMTP provider in Supabase first
- Background job: Vercel cron job scheduled for 2pm CEST (12:00 UTC)
  configured in vercel.json:
  { "crons": [{ "path": "/api/send-digest", "schedule": "0 12 * * *" }] }
- /api/send-digest route:
  1. Query all users who have replies newer than their last_digest_sent_at
  2. Group replies by thread per user
  3. Build digest email content
  4. Send via Resend API
  5. Update last_digest_sent_at for each user
- Track in a user_notification_prefs table:
  - user_id
  - digest_preference (off / daily / weekly)
  - last_digest_sent_at
