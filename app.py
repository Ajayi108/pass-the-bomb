from pathlib import Path
import base64
import streamlit as st

ROOT = Path(__file__).resolve().parent
st.set_page_config(page_title="Pass the Bomb", page_icon="💣", layout="centered")
st.markdown("<style>" + (ROOT / "frontend/shell.css").read_text(encoding="utf-8") + "</style>", unsafe_allow_html=True)

@st.cache_data
def bundled_audio():
    tracks = []
    for filename, title in [("disco-medusae.mp3", "Disco Medusae"), ("funkorama.mp3", "Funkorama"), ("electrodoodle.mp3", "Electrodoodle"), ("exit-the-premises.mp3", "Exit the Premises"), ("sneaky-snitch.mp3", "Sneaky Snitch")]:
        path = ROOT / "assets" / "audio" / filename
        if path.exists():
            tracks.append({"title": title, "audio": base64.b64encode(path.read_bytes()).decode()})
    blast = ROOT / "assets" / "audio" / "explosion.wav"
    if not blast.exists():
        blast = ROOT / "assets" / "audio" / "explosion.ogg"
    return {"tracks": tracks, "explosion": base64.b64encode(blast.read_bytes()).decode() if blast.exists() else None}

game = st.components.v2.component("pass_the_bomb", html=(ROOT / "frontend/game.html").read_text(encoding="utf-8"), css=(ROOT / "frontend/game.css").read_text(encoding="utf-8"), js=(ROOT / "frontend/game.js").read_text(encoding="utf-8"))
game(data=bundled_audio(), key="party_game")
with st.expander("Audio credits & licenses"):
    st.markdown((ROOT / "ASSET_CREDITS.md").read_text(encoding="utf-8"))
