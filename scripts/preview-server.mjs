import { createServer } from "node:http";
import { readFileSync, watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Handlebars from "handlebars";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const port = Number(process.env.PORT) || 5173;

const templatePaths = {
  neu: join(root, "templates", "neue-anfrage.html"),
  alt: join(root, "templates", "neue-anfrage-alt.html"),
};
const dataPath = join(root, "data", "sample.json");
const lpPaths = {
  reklamation: join(root, "pages", "reklamation-lp.html"),
  feedback: join(root, "pages", "feedback-lp.html"),
  "feedback-reklamation": join(root, "pages", "feedback-reklamation-lp.html"),
};

Handlebars.registerHelper("equals", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

function renderTemplate(filePath) {
  const template = Handlebars.compile(readFileSync(filePath, "utf8"));
  const data = JSON.parse(readFileSync(dataPath, "utf8"));
  return template(data);
}

function renderLandingPage(type) {
  const template = Handlebars.compile(readFileSync(lpPaths[type], "utf8"));
  const data = JSON.parse(readFileSync(dataPath, "utf8"));
  return template({
    requestNumber: data.lead.requestNumber,
    inquiryDetails: data.inquiryDetails,
    advisorName: data.advisorName,
  });
}

function loadPreviews() {
  return {
    neu: renderTemplate(templatePaths.neu),
    alt: renderTemplate(templatePaths.alt),
    reklamation: renderLandingPage("reklamation"),
    feedback: renderLandingPage("feedback"),
    "feedback-reklamation": renderLandingPage("feedback-reklamation"),
  };
}

let previews = loadPreviews();

function reload() {
  try {
    previews = loadPreviews();
    console.log("Vorschau aktualisiert.");
  } catch (error) {
    console.error("Fehler beim Neuladen:", error.message);
  }
}

for (const filePath of [...Object.values(templatePaths), dataPath, ...Object.values(lpPaths)]) {
  watch(filePath, reload);
}

const comparePage = `<!DOCTYPE html>
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
      <iframe src="/alt" title="Alte E-Mail"></iframe>
    </div>
    <div class="panel">
      <div class="label label-neu">Neu</div>
      <iframe src="/neu" title="Neue E-Mail"></iframe>
    </div>
  </div>
</body>
</html>`;

function getPath(req) {
  return new URL(req.url ?? "/", `http://localhost:${port}`).pathname;
}

const server = createServer((req, res) => {
  const path = getPath(req);

  if (path === "/" || path === "/preview") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(comparePage);
    return;
  }

  if (path === "/alt") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(previews.alt);
    return;
  }

  if (path === "/neu") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(previews.neu);
    return;
  }

  if (path === "/lp/reklamation") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(previews.reklamation);
    return;
  }

  if (path === "/lp/feedback") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(previews.feedback);
    return;
  }

  if (path === "/lp/feedback-reklamation") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(previews["feedback-reklamation"]);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Nicht gefunden");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${port} ist bereits belegt.`);
    console.log(`Vorschau läuft vermutlich schon: http://localhost:${port}`);
    process.exit(0);
  }

  throw error;
});

server.listen(port, () => {
  console.log(`Vorschau (Alt vs. Neu): http://localhost:${port}`);
});
