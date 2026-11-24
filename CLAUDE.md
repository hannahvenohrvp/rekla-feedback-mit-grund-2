# Rekla-Quote und Lead-Qualität (zweistufig)

Prototyp/Vorschau für einen zweistufigen Feedback- und Reklamations-Flow bei Pflegehilfe (VP Verbund Pflegehilfe).
Ziel: die Reklamationsquote senken und die Lead-Qualität verbessern. Partner sollen zuerst Feedback zu einer
Anfrage geben und erst danach (Stufe 2) reklamieren.

Sprache im Projekt: **Deutsch**. Alle sichtbaren Texte, Commit-Messages und Kommentare auf Deutsch.
Partner werden in Texten mit **„Sie“** angesprochen.

## Befehle

- `npm run dev`: lokale Vorschau auf http://localhost:5173 (`scripts/preview-server.mjs`). Rendert bei jeder
  Dateiänderung in `templates/`, `pages/` und `data/sample.json` neu. Den Browser musst du danach neu laden.
  Wenn der Port belegt ist, läuft die Vorschau schon.
- `npm run build`: rendert statische Seiten nach `public/` (`scripts/build-static.mjs`). Netlify nutzt das zum Deployen.

Es gibt keine Tests und keinen Linter. Prüfe Änderungen im Browser über die Vorschau.

## Aufbau

| Ordner/Datei | Inhalt |
|---|---|
| `templates/neue-anfrage.html` | E-Mail „Neue Anfrage“ an Partner, **neue** Version mit Feedback-/Reklamationsabschnitt |
| `templates/neue-anfrage-alt.html` | dieselbe E-Mail, **alte** Version (Referenz, nur zum Vergleich) |
| `pages/feedback-lp.html` | Landingpage Stufe 1: Feedback (`/lp/feedback`) |
| `pages/feedback-reklamation-lp.html` | Landingpage Stufe 2: Anfrage reklamieren mit Grund (`/lp/feedback-reklamation`) |
| `pages/reklamation-lp.html` | Landingpage zur direkten Reklamation (`/lp/reklamation`) |
| `data/sample.json` | Beispieldaten (Lead, Kontakt, Senioren, Berater) für alle Templates |
| `scripts/` | Dev-Server und Static-Build. Beide registrieren den Handlebars-Helper `equals` |
| `public/` | **Build-Ausgabe, gitignored**. Nie von Hand bearbeiten |
| `netlify.toml` | Build-Config und Redirects (`/alt`, `/neu`, `/lp/...`) |

URLs der Vorschau: `/` (Alt-vs.-Neu-Vergleich der E-Mail), `/alt`, `/neu`, `/lp/feedback`,
`/lp/feedback-reklamation`, `/lp/reklamation`.

## Regeln und Konventionen

- **Templates sind Handlebars.** Die E-Mails bekommen das komplette `sample.json` als Kontext. Die Landingpages
  bekommen nur `requestNumber`, `inquiryDetails` und `advisorName`. Wenn du ein neues Feld brauchst, ergänze es
  in `data/sample.json` und, für Landingpages, im Kontext in **beiden** Scripts (`preview-server.mjs` und
  `build-static.mjs`).
- **Neue Seite oder Route:** in `preview-server.mjs`, `build-static.mjs` **und** `netlify.toml` eintragen, damit
  lokal und auf Netlify dieselben URLs gelten.
- **E-Mail-HTML** (`templates/`): Layout mit Tabellen, Styles inline, Schrift `Arial, Helvetica, Tahoma, sans-serif`.
  Kein externes CSS, kein JavaScript, keine Flexbox/Grid, weil E-Mail-Clients das nicht zuverlässig darstellen.
- **Nur `neue-anfrage.html` ändern.** `neue-anfrage-alt.html` bleibt der unveränderte Stand zum Vergleich, außer
  wenn ausdrücklich etwas anderes gewünscht ist.
- **Landingpages** (`pages/`): eigenständige HTML-Dateien mit eingebettetem `<style>` und `<script>`.
  Schalter wie `variant-toggle` (Modus „7-Tage-Frist abgelaufen“, Flag `fbExpired` im `localStorage`) und
  `scheme-toggle` sind Prototyp-Steuerungen für Demos, keine Produktfunktionen.
- **Markenfarben:** Grün `#98c44c`, Text dunkel `#48453b`. Bilder und Logos kommen von `static.pflegehilfe.org`.
- **Keine echten Personendaten.** In `sample.json` und Beispieltexten stehen nur Musterdaten (Max Mustermann usw.).

## Git

- Hauptbranch `main`, Remote `origin`. Für Änderungen einen eigenen Branch anlegen.
- Commit-Messages kurz und auf Deutsch, z. B. „7 Tage Frist Update“.
- Push und Merge nur nach Rückfrage.
