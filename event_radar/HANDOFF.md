# Club Event Radar — handoff for Nicole

## What works now

The [Club Event Radar website](https://nickiee-g.github.io/BUS4498_InClass_Builds/event_radar/) lists published club events and accepts announcements with optional JPG or PNG flyers. The `submit-event` agent checks announcements against the posting rules, saves event details, and sends flyer posts to moderator review. The moderator can sign in, approve or reject waiting posts, and the **Free food only** button filters the public event list. New account sign-ups are turned off.

## Where things live

- GitHub repository: `BUS4498_InClass_Builds`; the website is in `event_radar/`.
- Supabase project: **nickiee-g’s Project** — [Project URL](https://wgohwjnbkhzimedvtmtu.supabase.co).
- Website files: `event_radar/index.html`, `app.js`, `style.css`, and `config.js`.
- Database and agent: `event_radar/supabase/migrations/` and `event_radar/supabase/functions/submit-event/index.ts`.
- Posting rules, campus place codes, and sample posts: `event_radar/context/` and `event_radar/test/`.

## Secrets

The agent uses `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, stored in Supabase → **Edge Functions → Secrets**. If both exist, it uses Anthropic. `HOLD_ALL_POSTS` is an optional setting that holds every post for the instructor. Nicole does not need the secret values; don’t copy them into GitHub or this document. `config.js` holds the public Project URL and publishable key only.

## How to test

- Submit **Post A** from `test/sample-announcements.md` without a flyer. It should publish with free food. Turn on **Free food only**; the event should remain visible. Turn it off to show all published events.
- Submit **Post C** after A. It describes the same date, start time, and place, so it should be reported as a duplicate.
- Submit the sample flyer using `test/sample-flyer.png`. It should wait for moderator review; sign in, approve it, and confirm it appears on the public event list with its flyer.

## What’s next

After uploading with GitHub Desktop, check the live page, the free-food filter, and moderator approval. Run the builder’s checks for the database, agent, and sign-ups. The optional improvement is a nightly job to archive past events.

## How we take turns

Pull the latest repository changes in GitHub Desktop before starting. Review and push your changes before stopping. Tell each other before editing the same files so one person’s work does not replace the other’s.
