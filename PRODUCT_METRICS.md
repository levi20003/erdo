# Product metrics

FocusGrove collects **no telemetry**. Product decisions therefore rest on two sources: the numbers the app computes for the user on their own device, and what users choose to tell us.

## 1. In-app (local, shown to the user)

Computed from the session log in `src/lib/stats.js` and `src/lib/insights.js`; nothing extra is recorded.

| Metric | Definition | Where shown |
| --- | --- | --- |
| Total focus time | Sum of completed sessions' duration | Total focus tile, share card |
| Plants grown | Count of completed sessions | Total focus tile, share card |
| Completion rate | completed ÷ (completed + failed); failed sessions under 30 s aren't logged | Total focus tile |
| Current streak | Consecutive days with ≥ 1 completed session; alive until the end of today | Streak card, celebration, share card |
| Best streak | Longest such run | Streak card |
| Next milestone | Next of 3, 7, 14, 30, 60, 100, 180, 365 days | Streak card |
| Last 7 days vs previous 7 | Focus minutes, and % change (hidden when the previous week is empty) | My progress |
| Active days, average per active day | Distinct days with completed focus; total ÷ active days | My progress |
| Favourite category, best day | Most minutes all-time; the single day with most minutes | My progress |
| Today / weekly charts | Minutes per category and per day | Today and Weekly tiles |

## 2. Beta measurement without tracking

| Question | Signal | How we get it |
| --- | --- | --- |
| Do people come back? | Testers with ≥ 5 completed sessions; streak length | Weekly beta form asks for the numbers shown on the Streak and Total tiles (or a screenshot) |
| Is it satisfying? | Star rating 1–5 (target ≥ 4.2 average) | In-app prompt after 5 sessions; stored locally, shared only via the "Write a suggestion" link or the form |
| What breaks? | Error log entries | Testers download their log (Settings → Error log) when reporting a bug |
| Does Strict Mode feel fair? | Failed-by-leaving share, false-fail reports | Beta form question + CSV export if the tester agrees |
| Is the forest worth sharing? | Share-card posts, `#focusgrove` mentions | Public social posts |

Targets for the December launch (estimates, to be revisited after the beta):

| Metric | Target by 31 January |
| --- | --- |
| Testers completing ≥ 5 sessions | ≥ 20 |
| Average rating | ≥ 4.2 |
| Testers reporting a ≥ 7-day streak | ≥ 30 % |
| Critical bugs open | 0 |

## 3. Explicitly out of scope

Device IDs, analytics SDKs, crash reporters that upload, cookies, A/B infrastructure. Adding any of these requires updating [PRIVACY.md](PRIVACY.md) first and an explicit, opt-in choice in the app.
