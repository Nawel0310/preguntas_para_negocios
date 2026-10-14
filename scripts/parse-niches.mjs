// Convierte "docs/PROBLEMAS DE NICHOS Y SOLUCIONES.docx" en data/niches.json.
// Uso: pnpm parse:niches  (requiere el binario `unzip` en el sistema)
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docx = resolve(root, "docs/PROBLEMAS DE NICHOS Y SOLUCIONES.docx");
const out = resolve(root, "data/niches.json");

const xml = execFileSync("unzip", ["-p", docx, "word/document.xml"], {
  maxBuffer: 64 * 1024 * 1024,
}).toString("utf8");

const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Extrae párrafos: { style, list, lines[] } (las líneas se separan por <w:br/>) */
function paragraphs(source) {
  const result = [];
  const re = /<w:p[ >][\s\S]*?<\/w:p>/g;
  for (const match of source.matchAll(re)) {
    const p = match[0];
    const style = p.match(/<w:pStyle w:val="([^"]+)"/)?.[1] ?? null;
    const list = p.includes("<w:numPr>");
    // Solo el contenido de <w:t>; cada <w:br/> se vuelve un salto de línea
    const chunks = [];
    for (const m of p.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>|<w:br[^>]*\/>/g)) {
      chunks.push(m[1] !== undefined ? m[1] : "\n");
    }
    const lines = decode(chunks.join(""))
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    result.push({ style, list, lines });
  }
  return result;
}

const words = (s) =>
  new Set(
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9ñ]+/)
      .filter((w) => w.length > 3),
  );

function bestProblem(resolves, problems, fallbackIndex) {
  if (problems.length === 0) return undefined;
  const target = words(resolves);
  let best = -1;
  let bestScore = 0;
  problems.forEach((p, i) => {
    const pw = words(p.text);
    let score = 0;
    for (const w of target) if (pw.has(w)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  if (best === -1) best = Math.min(fallbackIndex, problems.length - 1);
  return problems[best].id;
}

const parsePrice = (line) => {
  const m = line.match(/USD\s*([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (!m) return null;
  return [Number(m[1].replace(/\./g, "")), Number(m[2].replace(/\./g, ""))];
};

const parseChannel = (lines) => {
  const [head, ...rest] = lines;
  const m = head.match(/^(.+?):\s*Efectividad\s+(alta|media|baja)\s*(.*)$/i);
  if (!m) return null;
  return {
    channel: m[1].trim(),
    effectiveness: m[2].toLowerCase(),
    tip: [m[3], ...rest].filter(Boolean).join(" ").trim(),
  };
};

const categories = [];
const niches = [];
let category = null;
let niche = null;
let section = null; // 'contact' | 'problems' | 'solutions'
let solution = null;

const finishSolution = () => {
  if (solution && niche) niche.solutions.push(solution);
  solution = null;
};
const finishNiche = () => {
  finishSolution();
  if (niche) {
    niche.solutions.forEach((s, i) => {
      s.problemId = bestProblem(s.resolves || s.description, niche.problems, i);
    });
    niches.push(niche);
  }
  niche = null;
  section = null;
};

for (const p of paragraphs(xml)) {
  const first = p.lines[0];
  if (p.style === "Heading1") {
    finishNiche();
    const name = first.replace(/:$/, "");
    if (/^Nichos de Mercado/i.test(name)) continue;
    category = { id: slugify(name), name };
    categories.push(category);
    continue;
  }
  if (p.style === "Heading2") {
    finishNiche();
    const name = first.replace(/:$/, "").trim();
    niche = {
      id: slugify(name),
      categoryId: category?.id ?? "otros",
      name,
      contacts: [],
      contactTip: "",
      problems: [],
      solutions: [],
    };
    continue;
  }
  if (!niche) continue;
  if (p.style === "Heading3") {
    finishSolution();
    if (/estrategia/i.test(first)) section = "contact";
    else if (/problemas/i.test(first)) section = "problems";
    else if (/soluciones/i.test(first)) section = "solutions";
    else section = null;
    continue;
  }
  if (p.style === "Heading4" && section === "solutions") {
    finishSolution();
    solution = {
      id: `${niche.id}--${slugify(first)}`,
      name: first.replace(/:$/, ""),
      description: "",
      resolves: "",
      deliverables: [],
      priceMin: null,
      priceMax: null,
    };
    continue;
  }

  const joined = p.lines.join(" ");
  if (section === "contact") {
    const ch = parseChannel(p.lines);
    if (ch) niche.contacts.push(ch);
    else niche.contactTip = [niche.contactTip, joined].filter(Boolean).join(" ");
  } else if (section === "problems") {
    const text = joined.replace(/\s+/g, " ").trim();
    niche.problems.push({ id: `${niche.id}--p${niche.problems.length + 1}`, text });
  } else if (section === "solutions" && solution) {
    const price = parsePrice(joined);
    if (price) {
      [solution.priceMin, solution.priceMax] = price;
    } else if (/^Resuelve:/i.test(joined)) {
      solution.resolves = joined.replace(/^Resuelve:\s*/i, "");
    } else if (/^Lo que vas a construir/i.test(joined)) {
      // encabezado de la lista de entregables
    } else if (p.list) {
      solution.deliverables.push(joined);
    } else if (!solution.description) {
      solution.description = joined;
    } else {
      solution.deliverables.push(joined);
    }
  }
}
finishNiche();

// Ids únicos (por si dos nichos comparten nombre)
const seen = new Map();
for (const n of niches) {
  const count = seen.get(n.id) ?? 0;
  seen.set(n.id, count + 1);
  if (count > 0) n.id = `${n.id}-${count + 1}`;
}
// Frases cortas escritas a mano (data/pain-phrases.json): proceso y dolor para el resumen de cierre,
// y el valor de la solución para el checklist de prioridades
const phrasesFile = resolve(root, "data/pain-phrases.json");
const phrases = existsSync(phrasesFile) ? JSON.parse(readFileSync(phrasesFile, "utf8")) : {};
const unused = new Set(Object.keys(phrases));
const missing = [];
for (const n of niches) {
  for (const p of n.problems) {
    const ph = phrases[p.id];
    if (!ph) {
      missing.push(p.id);
      continue;
    }
    unused.delete(p.id);
    if (ph.process) p.process = ph.process;
    if (ph.pain) p.pain = ph.pain;
    const s = n.solutions.find((x) => x.problemId === p.id);
    if (s && ph.value) s.value = ph.value;
  }
}
if (missing.length) console.warn(`Sin frases cortas (${missing.length}): ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "…" : ""}`);
if (unused.size) console.warn(`Frases sin problema (${unused.size}): ${[...unused].slice(0, 10).join(", ")}`);

const usedCategories = categories.filter((c) => niches.some((n) => n.categoryId === c.id));

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ categories: usedCategories, niches }, null, 2) + "\n");

// Índice liviano para el cliente (selector, filtros, listados)
const index = {
  categories: usedCategories,
  niches: niches.map((n) => ({ id: n.id, name: n.name, categoryId: n.categoryId })),
};
writeFileSync(resolve(root, "data/niche-index.json"), JSON.stringify(index) + "\n");

// Un archivo por nicho, servido estático y pedido bajo demanda desde el cliente
const publicDir = resolve(root, "public/data/niches");
rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });
for (const n of niches) writeFileSync(resolve(publicDir, `${n.id}.json`), JSON.stringify(n));

const solutions = niches.reduce((acc, n) => acc + n.solutions.length, 0);
const problems = niches.reduce((acc, n) => acc + n.problems.length, 0);
console.log(
  `OK → ${usedCategories.length} categorías, ${niches.length} nichos, ${problems} problemas, ${solutions} soluciones`,
);
