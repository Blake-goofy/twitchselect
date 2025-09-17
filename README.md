<div align="center">

	<img src="./image/twitchselect.png" alt="TwitchSelect" width="720" />

	<h1 style="margin: 8px 0 0; font-weight: 800;">MultiTwitch Live Channel Selector</h1>
	<p style="color: #8d8d96; margin: 6px 0 0;">Pick your favorites from the channels you follow and open them in MultiTwitch — fast.</p>

</div>

## What this is

Simple, focused, and fast: authenticate with Twitch, see who’s live, filter/sort, select, and open a MultiTwitch link.

## How to use

- Sign in with Twitch (top-right)
- Use the filters on the left: Streamer, Title, and Game
- Sort by Viewers, Channel Name, or Uptime (top of results)
- Click cards to select; click again to unselect
- Press Enter to trigger the “Open” button
- Middle‑click or double‑click a card to open it immediately (respects Dark URL setting)
- Toggle Dark URL to append `?darkmode` to MultiTwitch
- Star button lets you save filter presets (and set a default)
- Auto‑select toggles (right pane) automatically select those streamers when they’re live

## Notes

- It only shows streamers you follow
- Live list, stable selection UI, and minimal refresh flicker
- Preferences and presets are saved for your account

## Privacy

Uses Twitch OAuth to read followed channels and live data. No extra permissions beyond that.

## Local development

It’s a Cloudflare Worker (TypeScript) with a D1 database for preferences.
If you’re familiar with Workers, you’ll feel at home. Otherwise, the code is straightforward to skim.

— Enjoy!
