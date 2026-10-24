# Club Event Radar — teammate handoff

## What works now

The [Club Event Radar website](https://nickiee-g.github.io/BUS4498_InClass_Builds/event_radar/) lists published events and accepts club announcements with an optional JPG or PNG flyer. The `submit-event` agent reads announcements and flyers, applies the posting rules, saves events, and holds posts with photos for a moderator. Moderator sign-in lets the existing moderator review waiting posts and approve or reject them. New account sign-ups are turned off.

## Where things live

- GitHub repository: `BUS4498_InClass_Builds` (`event_radar/` folder)
- Supabase project: **nickiee-g's Project** — [Project URL](https://wgohwjnbkhzimedvtmtu.supabase.co)
- Website: `event_radar/index.html`, `app.js`, `style.css`, and `config.js`
- Agent: `event_radar/supabase/functions/submit-event/index.ts`; function settings: `supabase/config.toml`
- Database changes: `supabase/migrations/`; event rules and campus places: `context/`
- Sample announcements and flyer: `test/`

## Secrets

The agent uses `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, stored in Supabase → **Edge Functions → Secrets**. If both are set, it uses Anthropic. `HOLD_ALL_POSTS` is an optional setting that makes every post wait for the instructor. The teammate does not need any secret values; never copy them into GitHub or this document. `config.js` contains only the public Project URL and publishable key.

## How to test

- Submit **Post A** from `test/sample-announcements.md` without a flyer. It should publish with Thursday, October 29 details and free food. Submit **Post C** after A; it describes the same date, start time, and place, so it should be reported as a duplicate.
- Submit the **sample flyer** using `test/sample-flyer.png` and its sample announcement. It should wait for moderator review, show event details read from the flyer, and display the flyer after approval.
- Sign in through **Moderator sign-in**, approve the flyer post, and confirm it appears on the public event list. Rejecting a waiting post should remove it from the review queue without publishing it.

## What’s next

After uploading with GitHub Desktop, check the live website and run the builder’s checks for the database, agent, and moderator sign-ups. Confirm moderator sign-in and flyer approval on the live site. The optional next improvement is the nightly cleanup job that archives past events.

## How we take turns

Before starting, download the latest repository changes with **Pull** in GitHub Desktop. Before stopping, review and upload your changes with **Push**. Tell each other before working in the same files so one person’s changes do not replace the other’s.
