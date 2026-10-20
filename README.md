# Pass the Bomb

An in-person Streamlit party game: pass a soft ball while dance music plays. An unpredictable explosion ends the round. Whoever holds the ball loses; if airborne, the thrower loses. Choose elimination, a funny challenge, or a point penalty. One host device and speaker; no accounts or scoring.

## Run locally

Python 3.11+ recommended. Windows PowerShell:

```powershell
cd C:\Users\ajayi\Documents\ChatGPT\Hot_potato
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m streamlit run app.py
```

macOS/Linux:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m streamlit run app.py
```

Open the localhost URL printed in the terminal. Pair your Bluetooth speaker or connect a wired/USB speaker and select it in system audio output. Test Music and Test Explosion verify levels. Music previews stop after 15 seconds; Stop Audio Preview cancels immediately.

## Settings and audio

Defaults are 20–60 seconds. Choose a fixed soundtrack or Random each round (repeats are possible). Music and explosion have independent volumes. Settings lock during loading, play, and automatic breaks. Start resumes browser audio directly from the click, decodes the files, then schedules the music stop and explosion on the Web Audio clock. There is no visible play countdown.

Stop cancels all pending sounds and automatic starts without an explosion; cancelled rounds do not advance the round number. Reset also clears completed rounds. Auto-next-round is off by default. Its break countdown defaults to eight seconds, extended to the explosion length if necessary. Stop or Reset cancels the break.

Five real downloaded MP3 recordings and an explosion are included in assets/audio/ (about 35 MB). No external audio is fetched during play. See ASSET_CREDITS.md for sources, licenses, and attribution. Full recordings loop; boundaries may be audible.

Custom uploads support MP3 and WAV, at most 15 MB and 10 minutes each. Uploads stay in browser memory for this mounted session: never saved to the server or repository. Clear the upload to restore defaults. Invalid files show a helpful message when tested/started. Standard MP3 or PCM WAV gives broad compatibility.

For permanent replacement, put licensed recordings under the filenames in app.py or edit its track list. Update credits and restart. The explosion prefers explosion.wav, falling back to explosion.ogg. `python download_assets.py` optionally retrieves the original files from public URLs; no login bypass is implemented.

## Free deployment on Streamlit Community Cloud

1. Create a GitHub repository containing app.py, frontend/, assets/audio/, requirements.txt, ASSET_CREDITS.md, README.md, and .gitignore. Commit the actual audio files, preserving credits. Exclude .deps and .venv.
2. Sign in at https://share.streamlit.io/ and connect GitHub. Choose Create app / deploy from GitHub.
3. Select your repository, the branch containing the app (usually main), and app.py as the entrypoint. Choose a supported Python version (3.12+ recommended) in advanced settings.
4. Deploy, open the app URL, connect a speaker and test both sounds. Updates pushed to that branch redeploy the app.

No secrets, database, ffmpeg, external backend, or paid audio hosting is required. Streamlit is the only runtime dependency; paths work on Linux. Free hosting is subject to Community Cloud resource limits and current availability. No external deployment was performed; account login and deployment remain your steps.

## Troubleshooting and limits

- Muted sound: check tab mute, system output, Bluetooth connection, and both volume sliders. Zero volume intentionally silences a channel.
- Autoplay: press Start or Test directly. If the browser suspends audio, return to the tab and press Start again.
- Keep the tab open, visible, and device awake. Hiding the tab cancels play without elimination. Locked phones and browser/device suspension are not reliable.
- Decoding can take a moment on slower phones. Try standard MP3 or PCM WAV if an upload fails.
- Bluetooth latency cannot be controlled; everyone should listen to the same speaker.
- Reload, server reconnect, or component unmount resets gameplay. No player tracking or online multiplayer.

The app uses a stable-key Streamlit Components v2 component. Controls, uploads, and active rounds stay in JavaScript with no gameplay callbacks to Python, avoiding widget reruns. Unmount cleanup stops nodes and removes listeners. API choice checked against https://docs.streamlit.io/develop/concepts/custom-components/components-v2/register .

## Validation

Run deterministic state/audio scheduling checks with `node --test tests/game.test.mjs`. These mock checks do not prove audible quality, real browser autoplay behavior, or real-device layouts.

Manual party checklist: test sounds; use 1–2-second rounds; repeat Start/Next; Stop before explosion; Reset during automatic break; try custom MP3/WAV and an invalid file; inspect phone/projector/desktop layout. Then restore 20–60 seconds. Real-device audio has not been heard or tested by the developer agent.

Before each round, use “Music for the next round” above Start/Next to select a bundled track or Random. The selection also stays available during automatic breaks, and locks while loading/playing. Uploading custom music selects its named Custom option; you can switch back to a bundled track without removing the upload.


The expanded library includes Exit the Premises (driving electronic dance) and Sneaky Snitch (playful suspense). Mission: Impossible is not bundled: no license permitting public-repository redistribution was established. To use an authorized MP3/WAV copy for your session, open Round settings → Use your own audio → Custom music. Uploading selects that file in the round music picker. Buying or streaming a recording does not itself establish repository redistribution rights.

Animation and usability update: constant-speed floating bomb, loading orbit, decorative beat bars, and a brief particle burst. Motion never reflects the remaining round duration. Disable Play animations in settings or use the operating system reduced-motion preference. Music preview controls now sit beside the track selector with live playback feedback, and volume fields display percentages. Break announcements update only when the displayed second changes.
