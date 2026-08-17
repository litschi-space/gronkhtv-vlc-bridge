# GronkhTV+ VLC-Bridge

Eine kleine Firefox-Erweiterung für [gronkh.tv](https://gronkh.tv), die auf
Stream-Detailseiten (`gronkh.tv/stream/{id}`) einen **"In VLC öffnen"**-Button
einblendet. Damit lässt sich der Stream an VLC übergeben – inklusive
Hintergrundwiedergabe bei gesperrtem Display, was die Website selbst
(noch) nicht unterstützt.

## Warum?

gronkh.tv ist ein kostenloses, werbefreies Video-Stream-Archiv – aber es gibt
bisher keine native App, und im mobilen Browser (Firefox for Android) fehlen
Features wie Picture-in-Picture oder Hintergrundwiedergabe bei gesperrtem
Telefon. Diese Erweiterung schließt genau diese Lücke, indem sie den Stream
stattdessen direkt an einen externen Player (VLC) übergibt, der diese
Features nativ mitbringt.

## Features

- Erkennt automatisch Stream-Detailseiten (`/stream/{episode_id}`)
- Holt Titel und Playlist-URL über die öffentliche gronkh.tv-API
  (`backend.gronkh.tv/v3/videos/episode/{id}`)
- Übergibt den Stream per Android-Intent an VLC, inklusive:
  - Original-Titel des Streams (statt "playlist")
  - Aktuelle Abspielposition der Webseite als Startpunkt in VLC
- Fallback: Ist VLC nicht installiert, spielt Firefox die rohe Stream-URL
  selbst ab

## Installation

### Für Nutzer (Firefox for Android)

Firefox for Android installiert nur signierte Erweiterungen. Der Weg über
den offiziellen Store:

[Hier die Erweiterung vom addons.mozilla.com-Store installieren](https://addons.mozilla.org/de/firefox/addon/gronkhtv-vlc-bridge/)
(Prüfung von Mozilla steht aktuell noch aus, nach Bestehen wird das Addon hier verfügbar sein)

### Manuell / zum Testen

Da diese Erweiterung nicht öffentlich im normalen Firefox-Add-on-Katalog
gelistet sein muss, um genutzt zu werden, gibt es zwei Wege:

**Desktop (temporär, zum Entwickeln):**

1. `about:debugging` → "Dieser Firefox" → "Temporäres Add-on laden"
2. `manifest.json` aus diesem Repo auswählen

**Android (dauerhaft):**

1. Repo als `.zip` herunterladen oder selbst packen (siehe unten)
2. Bei [addons.mozilla.org/developers](https://addons.mozilla.org/developers/)
   als "Selbstständig" (unlisted) hochladen und signieren lassen
3. Die signierte `.xpi` herunterladen
4. In Firefox for Android: Einstellungen → "Über Firefox" → Logo 5× tippen
   (aktiviert den Debug-Modus) → im neuen Menüpunkt die `.xpi` aus den
   Downloads auswählen und installieren

## Build

Keine Build-Tools nötig – reines, unminifiziertes JavaScript/CSS/JSON.
Zum Paketieren:

```bash
zip -r gronkhtv-vlc-bridge.zip manifest.json content.js content.css icons/
```

## Projektstruktur

```
.
├── manifest.json      # Extension-Manifest (Firefox, MV2, Android-kompatibel)
├── content.js          # Content-Script: Button, API-Aufruf, Intent-Bau
├── content.css          # Styling für das eingeblendete Panel
├── icons/                # Icon-Set (16/32/48/96/128 px)
└── LICENSE
```

## Wie die gronkh.tv-API genutzt wird

```
GET https://backend.gronkh.tv/v3/videos/episode/{episode_id}
```

Liefert u.a.:

```json
{
  "data": {
    "title": "...",
    "urls": {
      "playlist": "https://backend.gronkh.tv/v3/videos/{uuid}/playlist"
    }
  }
}
```

Die `urls.playlist`-URL liefert direkt die abspielbare Stream-Playlist
(HLS/m3u8), die wir 1:1 an VLC weiterreichen.

## Bekannte Einschränkungen

- Nur für Android relevant (Desktop-Firefox hat kein `intent://`-Handling)
- Abhängig von der aktuellen, undokumentierten gronkh.tv-API-Struktur –
  kann sich jederzeit ändern
- Kein offizieller Zusammenhang mit gronkh.tv oder VLC/VideoLAN

## Lizenz

MIT, siehe [LICENSE](LICENSE).
