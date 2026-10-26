# Privacy

**Short version:** FocusGrove has no account, no ads, no analytics and no tracking. Your sessions, categories and settings are stored only in your browser on your device. Nothing is sent anywhere unless you explicitly export or share it yourself.

*Röviden (HU):* Nincs fiók, nincs reklám, nincs analitika és nincs követés. A munkameneteid, kategóriáid és beállításaid csak a böngésződben, a saját eszközödön vannak. Semmi nem kerül el sehova, hacsak te magad nem exportálod vagy osztod meg.

## What is stored, and where

All in the browser's `localStorage` for the app's address (`levi20003.github.io`):

| Key | Contents |
| --- | --- |
| `focusgrove:v1` | Your categories (name, colour, plant), sessions (start, end, duration, completed/failed and why), the running timer, settings (break guide, language, feedback prompt state) |
| `focusgrove:v1:backup-v<N>` | An untouched copy of your data, taken before upgrading it to a new format |
| `focusgrove:v1:backup-before-reset-<time>` | A copy taken before "Reset to defaults" on the crash screen |
| `focusgrove:v1:corrupt-<time>` | A copy of saved data that could not be read, kept instead of being overwritten |
| `focusgrove:errors` | The error log (below) |

The service worker additionally caches the app's own files (HTML, JavaScript, CSS, icons) so it works offline. It caches no personal data.

**Deleting everything:** clear the site data for the app in your browser settings (or uninstall the installed app). There is no copy anywhere else.

## Network

The only network traffic is downloading the app itself from GitHub Pages, which, like any web host, sees the request (IP address, browser). After the first visit the app runs from the device cache. FocusGrove makes no other requests: no APIs, fonts, CDNs, analytics or ads.

## The error log

When something goes wrong, the app records a short entry **on the device**: time, error type, a shortened message, up to five stack-frame file names, the app and data versions, and a coarse environment (e.g. `Chrome/Android PWA`). It never includes your categories, sessions or other state; email addresses, long numbers, long quoted text and URLs are masked. It is capped at 50 entries / 16 KB. You can download it (to attach to a bug report) or clear it under **Settings → Error log**. It is never sent automatically.

## Things that leave the device only when you choose

| Action | What leaves | Where it goes |
| --- | --- | --- |
| Backup (JSON) / Spreadsheet (CSV) | Your data, as a file | Your device's downloads |
| Share my forest | An image: your plants, total hours, sessions, streak, the date | Wherever you share it (or your downloads) |
| Feedback → "Write a suggestion" | Opens a GitHub "new issue" page pre-filled with your star rating and the app version; nothing is submitted unless you submit it | GitHub (its privacy policy applies) |
| Download error log | The error log, as a file | Your device's downloads |

The star rating itself is stored only on your device.

## Permissions

FocusGrove asks for no permissions. The Screen Wake Lock (keeping the screen on during focus) needs no permission and shares no data. The share sheet is your operating system's own.
