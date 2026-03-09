export const config = { runtime: "edge" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Quarter race index ranges (0-based within the 24-race array)
const Q_RANGES = { Q1: [0, 6], Q2: [7, 12], Q3: [13, 18], Q4: [19, 23] };

// Canonical name maps for fuzzy matching
const DRIVER_MAP = {
  "andrea kimi antonelli": "Kimi Antonelli",
  "kimi antonelli": "Kimi Antonelli",
  "george russell": "George Russell",
  "charles leclerc": "Charles Leclerc",
  "lewis hamilton": "Lewis Hamilton",
  "lando norris": "Lando Norris",
  "max verstappen": "Max Verstappen",
  "oliver bearman": "Oliver Bearman",
  "arvid lindblad": "Arvid Lindblad",
  "gabriel bortoleto": "Gabriel Bortoleto",
  "pierre gasly": "Pierre Gasly",
  "esteban ocon": "Esteban Ocon",
  "alex albon": "Alexander Albon",
  "alexander albon": "Alexander Albon",
  "liam lawson": "Liam Lawson",
  "franco colapinto": "Franco Colapinto",
  "carlos sainz": "Carlos Sainz Jr.",
  "carlos sainz jr.": "Carlos Sainz Jr.",
  "sergio pérez": "Sergio Perez",
  "sergio perez": "Sergio Perez",
  "isack hadjar": "Isack Hadjar",
  "oscar piastri": "Oscar Piastri",
  "nico hülkenberg": "Nico Hulkenberg",
  "nico hulkenberg": "Nico Hulkenberg",
  "fernando alonso": "Fernando Alonso",
  "valtteri bottas": "Valtteri Bottas",
  "lance stroll": "Lance Stroll",
};

const TEAM_MAP = {
  "mercedes": "Mercedes",
  "ferrari": "Ferrari",
  "mclaren": "McLaren",
  "red bull": "Red Bull",
  "haas": "Haas",
  "racing bulls": "Racing Bulls",
  "rb": "Racing Bulls",
  "audi": "Audi",
  "alpine": "Alpine",
  "williams": "Williams",
  "cadillac": "Cadillac",
  "aston martin": "Aston Martin",
};

// H2H team pairings (canonical names)
const H2H_PAIRS = {
  "Red Bull":      ["Max Verstappen", "Isack Hadjar"],
  "Ferrari":       ["Charles Leclerc", "Lewis Hamilton"],
  "Mercedes":      ["Kimi Antonelli", "George Russell"],
  "McLaren":       ["Lando Norris", "Oscar Piastri"],
  "Aston Martin":  ["Fernando Alonso", "Lance Stroll"],
  "Alpine":        ["Pierre Gasly", "Franco Colapinto"],
  "Williams":      ["Alexander Albon", "Carlos Sainz Jr."],
  "Racing Bulls":  ["Liam Lawson", "Arvid Lindblad"],
  "Haas":          ["Esteban Ocon", "Oliver Bearman"],
  "Audi":          ["Gabriel Bortoleto", "Nico Hulkenberg"],
  "Cadillac":      ["Sergio Perez", "Valtteri Bottas"],
};

function matchDriver(name) {
  return DRIVER_MAP[name.toLowerCase()] || null;
}
function matchTeam(name) {
  return TEAM_MAP[name.toLowerCase()] || null;
}

// Strip HTML tags and decode basic entities
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#[0-9]+;/g, "");
}

// Parse a standings block from cleaned lines.
// Driver rows: pos, name, team (skip), pts, r1-r24
// Team rows:   pos, name, pts, r1-r24
function parseSection(lines, maxEntries, skipTeamCol) {
  const entries = [];
  let i = 0;

  // Advance to first row (line === "1")
  while (i < lines.length && lines[i] !== "1") i++;

  while (i < lines.length && entries.length < maxEntries) {
    const pos = parseInt(lines[i], 10);
    if (isNaN(pos)) { i++; continue; }
    i++;

    // Name: consume non-numeric lines, but stop at a known team name if skipTeamCol
    const nameParts = [];
    while (i < lines.length && isNaN(parseInt(lines[i], 10))) {
      const line = lines[i];
      // If we already have a name and this line is a known team, skip it (team column)
      if (skipTeamCol && nameParts.length > 0 && TEAM_MAP[line.toLowerCase()]) {
        i++; // skip the team column value
        break;
      }
      nameParts.push(line);
      i++;
    }
    const rawName = nameParts.join(" ").trim();
    if (!rawName || i >= lines.length) break;

    // pts total
    const pts = parseInt(lines[i++], 10) || 0;

    // r1-r24
    const racePts = [];
    for (let r = 0; r < 24 && i < lines.length; r++) {
      const v = parseInt(lines[i], 10);
      racePts.push(isNaN(v) ? 0 : v);
      i++;
    }
    // Pad to 24 if page doesn't have all races yet
    while (racePts.length < 24) racePts.push(0);

    entries.push({ rawName, pts, racePts });
  }

  return entries;
}

function sumRange(racePts, qKey) {
  const [from, to] = Q_RANGES[qKey];
  return racePts.slice(from, to + 1).reduce((a, b) => a + b, 0);
}

function buildSection(entries, matchFn, qKey) {
  const mapped = entries
    .map(e => ({ name: matchFn(e.rawName), pts: qKey ? sumRange(e.racePts, qKey) : e.pts }))
    .filter(e => e.name);
  const hasData = mapped.some(e => e.pts > 0);
  if (!hasData) return null;
  mapped.sort((a, b) => b.pts - a.pts);
  return mapped.map(e => ({ name: e.name, pts: e.pts }));
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const res = await fetch("https://www.the-race.com/results/formula-1/1-2026/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; F1Predict/1.0)" },
    });
    if (!res.ok) throw new Error("Upstream " + res.status);

    const html = await res.text();
    const text = stripHtml(html);
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // Find section boundaries
    const drvIdx = lines.findIndex(l => l === "Driver Standings");
    const tmIdx  = lines.findIndex(l => l === "Team Standings");
    if (drvIdx === -1 || tmIdx === -1) throw new Error("Could not find standings sections");

    const driverLines = lines.slice(drvIdx + 1, tmIdx);
    const teamLines   = lines.slice(tmIdx + 1);

    const driverEntries = parseSection(driverLines, 22, true);
    const teamEntries   = parseSection(teamLines, 11, false);

    if (!driverEntries.length || !teamEntries.length) {
      throw new Error("Parsed 0 entries — page structure may have changed");
    }

    // Build output
    const out = {
      final: {
        drivers:      buildSection(driverEntries, matchDriver, null),
        constructors: buildSection(teamEntries,   matchTeam,   null),
      },
      Q1: { drivers: buildSection(driverEntries, matchDriver, "Q1"), constructors: buildSection(teamEntries, matchTeam, "Q1") },
      Q2: { drivers: buildSection(driverEntries, matchDriver, "Q2"), constructors: buildSection(teamEntries, matchTeam, "Q2") },
      Q3: { drivers: buildSection(driverEntries, matchDriver, "Q3"), constructors: buildSection(teamEntries, matchTeam, "Q3") },
      Q4: { drivers: buildSection(driverEntries, matchDriver, "Q4"), constructors: buildSection(teamEntries, matchTeam, "Q4") },
    };

    // H2H — compare total season pts per pair
    const driverPts = {};
    driverEntries.forEach(e => {
      const canon = matchDriver(e.rawName);
      if (canon) driverPts[canon] = e.pts;
    });
    out.headToHead = {};
    for (const [team, [d1, d2]] of Object.entries(H2H_PAIRS)) {
      const p1 = driverPts[d1] ?? 0;
      const p2 = driverPts[d2] ?? 0;
      out.headToHead[team] = (p1 === 0 && p2 === 0) ? null : (p1 >= p2 ? d1 : d2);
    }

    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
}
