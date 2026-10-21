from pathlib import Path
import json
import streamlit as st

ROOT = Path(__file__).resolve().parent
st.set_page_config(page_title="Pass the Bomb", page_icon=str(ROOT / "assets/images/icon-192.png"), layout="centered")
st.markdown("<style>" + (ROOT / "frontend/shell.css").read_text(encoding="utf-8") + "</style>", unsafe_allow_html=True)

def bundled_audio():
    # Serve files individually instead of embedding the full library in a websocket message.
    import shutil
    target = ROOT / "static" / "audio"
    target.mkdir(parents=True, exist_ok=True)
    def catalog(name):
        result = []
        for item in json.loads((ROOT / name).read_text(encoding="utf-8")):
            source = ROOT / "assets" / "audio" / item["file"]
            destination = target / item["file"]
            if not destination.exists() or destination.stat().st_size != source.stat().st_size:
                shutil.copyfile(source, destination)
            result.append({"title": item["title"], "url": "app/static/audio/" + item["file"]})
        return result
    return {"tracks": catalog("audio_catalog.json"), "explosions": catalog("explosion_catalog.json")}

game = st.components.v2.component("pass_the_bomb", html=(ROOT / "frontend/game.html").read_text(encoding="utf-8"), css=(ROOT / "frontend/game.css").read_text(encoding="utf-8"), js=(ROOT / "frontend/game.js").read_text(encoding="utf-8"))
game(data=bundled_audio(), key="party_game")
with st.expander("Audio credits & licenses"):
    st.markdown((ROOT / "ASSET_CREDITS.md").read_text(encoding="utf-8"))

st.html("<style>" + (ROOT / "frontend/creator.css").read_text(encoding="utf-8") + "</style>" + (ROOT / "frontend/creator.html").read_text(encoding="utf-8"))
