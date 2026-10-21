# Validation record

- Six deterministic Node tests pass: overlapping starts, looping and audio-clock stop/explosion scheduling, Next/Reset, Stop cancellation and round counting, previews, invalid settings/uploads, auto-round countdown/restart/cancellation, cancellation during loading, and custom WAV decoding path.
- Streamlit 1.66.0 AppTest runs app.py with no app exceptions.
- Local Streamlit server launches successfully. Browser loaded the actual v2 component and decoded bundled audio, reached BOOM/Next Round using 1–2-second settings, stopped the following round, and reset to Ready / Round 1. Restored 20–60-second defaults.
- Inspected desktop and 390 × 844 phone-width screenshots: readable controls and responsive layout.
- Downloaded three real MP3 tracks plus CC0 explosion; soundfile inspected each recording and converted the explosion to PCM WAV. No generated assets.
- Automated tests mock Web Audio and DOM; they do not measure audible output. Real speakers, Bluetooth latency, mobile hardware autoplay, and user-uploaded recordings still need manual testing. Browser testing did not establish that audio was audibly heard.

Commands: `node --test tests/game.test.mjs`; `python -m streamlit run app.py`.

Phone UI update: compact header/arena, full-width primary action, prominent active Stop control, 48px+ touch fields, grouped settings and collapsible uploads. Browser inspected at phone viewport overrides (390×844 and 320×640); Start/Playing/Stop/Reset verified, default durations retained. All six Node tests still pass. Hardware touch testing remains manual.

Animation/usability update: six Node tests pass. Browser at phone width verified preview feedback, starting play clears preview feedback, Loading/Playing controls, and Reset back to Ready. Inspected blue phone layout and saved mobile-preview.png. Decorative animations use fixed CSS durations, not the hidden deadline; reduced-motion and manual motion-off rules disable them.

Cloudflare standalone validation: build completes with bundled licensed audio and generated versioned service worker. Six shared engine tests pass. Browser completed a 1–2 second standalone round. Downloaded all six audio assets, stopped the local HTTP server, and reloaded the page successfully from the service worker cache. Tested starting another round using cached audio. Real-device offline/Bluetooth listening still requires manual verification.

Music library expansion: eight MP3 recordings validated with soundfile, all below Cloudflare's 25 MiB per-file limit. Shared engine tests: six pass. Cloudflare build succeeds; audio_catalog.json is now the common catalog for both versions.

20+4 expansion: all 20 music recordings and 4 WAV explosions decode via soundfile and satisfy the 25 MiB per-file size limit. Seven shared state/audio tests pass, including fixed explosion selection across rounds and previews. Browser on local Streamlit loaded the 20-track picker and four-explosion selector, and completed a 1–2 second round using Who Likes to Party / Blast 3 through static audio fetches. No real-speaker listening claim.

2026-10-21 social preview: deployed Open Graph and Twitter large-image metadata to Cloudflare. Verified public HTML HTTP 200, correct og:image URL, and PNG HTTP 200/image/png at 1200×630 using a facebookexternalhit-style User-Agent. The image also opens in a normal browser. Actual WhatsApp/Facebook preview caches were not purged or tested through a user's account.
