import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public");

const data = JSON.parse(readFileSync(join(root, "data", "sample.json"), "utf8"));

Handlebars.registerHelper("equals", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

function render(filePath, context) {
  const template = Handlebars.compile(readFileSync(filePath, "utf8"));
  return template(context);
}

function write(relPath, html) {
  const filePath = join(outDir, relPath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html, "utf8");
}

const lpContext = {
  requestNumber: data.lead.requestNumber,
  inquiryDetails: data.inquiryDetails,
  advisorName: data.advisorName,
};

const altEmail = render(join(root, "templates", "neue-anfrage-alt.html"), data);
const neuEmail = render(join(root, "templates", "neue-anfrage.html"), data);

write("lp/feedback.html", render(join(root, "pages", "feedback-lp.html"), lpContext));
write("lp/feedback-reklamation.html", render(join(root, "pages", "feedback-reklamation-lp.html"), lpContext));
write("lp/reklamation.html", render(join(root, "pages", "reklamation-lp.html"), lpContext));
write("email/alt.html", altEmail);
write("email/neu.html", neuEmail);

write(
  "index.html",
  `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>E-Mail Vorschau: Alt vs. Neu</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #2b2f36;
      color: #fff;
    }
    header {
      padding: 12px 16px;
      background: #1e2228;
      border-bottom: 1px solid #3d4450;
      font-size: 14px;
    }
    .compare {
      display: flex;
      gap: 12px;
      padding: 12px;
      height: calc(100vh - 49px);
    }
    .panel {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .label {
      text-align: center;
      font-weight: bold;
      font-size: 13px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 8px;
      border-radius: 6px 6px 0 0;
    }
    .label-alt { background: #6b7280; }
    .label-neu { background: #98c44c; color: #2b2f36; }
    iframe {
      flex: 1;
      width: 100%;
      border: none;
      background: #f2f4f7;
      border-radius: 0 0 6px 6px;
    }
    @media (max-width: 900px) {
      .compare { flex-direction: column; height: auto; }
      iframe { min-height: 70vh; }
    }
  </style>
</head>
<body>
  <header>E-Mail-Vorschau: Reklamations-Abschnitt im Vergleich</header>
  <div class="compare">
    <div class="panel">
      <div class="label label-alt">Alt</div>
      <iframe src="/email/alt.html" title="Alte E-Mail"></iframe>
    </div>
    <div class="panel">
      <div class="label label-neu">Neu</div>
      <iframe src="/email/neu.html" title="Neue E-Mail"></iframe>
    </div>
  </div>
</body>
</html>`
);

console.log("Statische Seiten erstellt in public/");
