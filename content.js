(function () {
  "use strict";

  const STREAM_URL_RE = /\/streams?\/(\d+)/;

  function getEpisodeId() {
    const match = location.pathname.match(STREAM_URL_RE);
    return match ? match[1] : null;
  }

  async function fetchStreamInfo(episodeId) {
    const res = await fetch(`https://backend.gronkh.tv/v3/videos/episode/${episodeId}`);
    if (!res.ok) {
      throw new Error(`API antwortete mit Status ${res.status}`);
    }
    const json = await res.json();
    const playlistUrl = json?.data?.urls?.playlist;
    const title = json?.data?.title || null;
    if (!playlistUrl) {
      throw new Error("Keine urls.playlist in der Antwort gefunden.");
    }
    return { playlistUrl, title };
  }

  function getCurrentPositionMs() {
    const video = document.querySelector("video");
    if (!video || Number.isNaN(video.currentTime)) return null;
    return Math.floor(video.currentTime * 1000);
  }

  function buildVlcIntentUrl(streamUrl, title, positionMs) {
    // Android Intent-Syntax: übergibt die URL an VLC. Falls VLC fehlt, spielt Firefox
    // die rohe Stream-URL selbst als Fallback ab.
    const fallback = encodeURIComponent(streamUrl);
    const titlePart = title ? `S.title=${encodeURIComponent(title)};` : "";
    const positionPart =
      positionMs && positionMs > 0 ? `l.position=${positionMs};` : "";
    return (
      `intent:${streamUrl}#Intent;` +
      `action=android.intent.action.VIEW;` +
      `type=video/*;` +
      `package=org.videolan.vlc;` +
      titlePart +
      positionPart +
      `S.browser_fallback_url=${fallback};` +
      `end`
    );
  }

  function createPanel() {
    const panel = document.createElement("div");
    panel.id = "gronkh-companion-panel";

    const vlcBtn = document.createElement("button");
    vlcBtn.textContent = "In VLC öffnen";
    vlcBtn.className = "gronkh-companion-btn";

    const status = document.createElement("span");
    status.className = "gronkh-companion-status";

    panel.appendChild(vlcBtn);
    panel.appendChild(status);
    document.body.appendChild(panel);

    return { panel, vlcBtn, status };
  }

  async function init() {
    const episodeId = getEpisodeId();
    if (!episodeId) return; // keine Stream-Detailseite

    const { vlcBtn, status } = createPanel();

    vlcBtn.addEventListener("click", async () => {
      status.textContent = "Lade Stream-URL...";
      try {
        const positionMs = getCurrentPositionMs();
        const { playlistUrl, title } = await fetchStreamInfo(episodeId);
        status.textContent = "Öffne VLC...";
        location.href = buildVlcIntentUrl(playlistUrl, title, positionMs);
        status.textContent = "";
      } catch (err) {
        status.textContent = "Fehler: " + err.message;
        console.error("[GronkhTV Companion]", err);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
