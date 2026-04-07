import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Upload,
  BarChart3,
  Dna,
  Lock,
  ChevronRight,
  Sparkles,
  Activity,
  MoonStar,
  Apple,
  Dumbbell,
  FileText,
  Users,
  CheckCircle2,
  Menu,
  X,
  Database,
  HeartPulse,
  BadgeCheck,
  Mail,
  FlaskConical,
  AlertTriangle,
  Code2,
  GitBranch,
  BookOpen,
} from "lucide-react";

const navItems = ["Home", "Upload DNA", "Sample Report", "Privacy", "Roadmap"];

const featureCards = [
  {
    icon: Upload,
    title: "Mock DNA upload parser",
    text: "Upload a 23andMe-style raw text file and parse genotype rows locally into a clean, student-project demo workflow.",
  },
  {
    icon: BarChart3,
    title: "Trait reporting prototype",
    text: "Generate an example wellness dashboard from a small set of demo markers with readable summaries and simple scoring logic.",
  },
  {
    icon: Lock,
    title: "Ethics-forward product framing",
    text: "Show clear boundaries around privacy, non-diagnostic use, and why real human genetic workflows would require formal approvals.",
  },
];

const metrics = [
  { label: "Prototype type", value: "Interactive" },
  { label: "DNA parsing", value: "Mock" },
  { label: "Positioning", value: "Ethical" },
  { label: "Portfolio use", value: "Strong" },
];

const privacyPoints = [
  "Clear user consent before upload",
  "Plain-language explanation of what the platform does",
  "Wellness framing rather than medical diagnosis claims",
  "User control over data retention and deletion",
  "Future real-world use would require formal institutional and regulatory review",
];

const roadmapPhases = [
  {
    title: "Phase 1 — Software prototype",
    text: "Frontend app, mock DNA parsing, sample report generation, clear product framing, and a recruiter-ready GitHub repository.",
  },
  {
    title: "Phase 2 — Better interpretation engine",
    text: "Expanded marker library, improved report logic, richer explanations, and more realistic upload and dashboard flows using demo data.",
  },
  {
    title: "Phase 3 — Real-world partnerships later",
    text: "Only after proper approvals: third-party lab partnerships, formal consent, compliance review, and institutionally appropriate workflows.",
  },
];

const demoTraitDefinitions = {
  caffeine: {
    label: "Caffeine response",
    rsid: "rs762551",
    scores: { AA: 82, AC: 60, CA: 60, CC: 34 },
    notes: {
      AA: "Pattern often associated with faster caffeine metabolism in simplified educational models.",
      AC: "Mixed signal in this demo model; moderate caffeine sensitivity framing.",
      CA: "Mixed signal in this demo model; moderate caffeine sensitivity framing.",
      CC: "Pattern often framed as slower caffeine metabolism in simplified demo reports.",
      default: "No matching genotype found in uploaded file; showing unavailable status.",
    },
  },
  lactose: {
    label: "Lactose digestion tendency",
    rsid: "rs4988235",
    scores: { TT: 78, CT: 65, TC: 65, CC: 28 },
    notes: {
      TT: "Demo interpretation suggests stronger likelihood of adult lactase persistence tendency.",
      CT: "Demo interpretation suggests intermediate support for lactase persistence tendency.",
      TC: "Demo interpretation suggests intermediate support for lactase persistence tendency.",
      CC: "Demo interpretation suggests lower support for lactase persistence tendency.",
      default: "No matching genotype found in uploaded file; showing unavailable status.",
    },
  },
  sleep: {
    label: "Sleep rhythm tendency",
    rsid: "rs1801260",
    scores: { CC: 71, CT: 58, TC: 58, TT: 43 },
    notes: {
      CC: "Demo model suggests a relatively steadier sleep timing tendency.",
      CT: "Demo model suggests a mixed circadian pattern.",
      TC: "Demo model suggests a mixed circadian pattern.",
      TT: "Demo model suggests a greater likelihood of later sleep timing tendency.",
      default: "No matching genotype found in uploaded file; showing unavailable status.",
    },
  },
  muscle: {
    label: "Power / endurance tendency",
    rsid: "rs1815739",
    scores: { CC: 79, CT: 60, TC: 60, TT: 45 },
    notes: {
      CC: "Demo interpretation leans toward a stronger fast-twitch style tendency signal.",
      CT: "Demo interpretation suggests a mixed response profile.",
      TC: "Demo interpretation suggests a mixed response profile.",
      TT: "Demo interpretation leans toward a stronger endurance-style tendency signal.",
      default: "No matching genotype found in uploaded file; showing unavailable status.",
    },
  },
};

const starterDemoFile = `# This is a mock 23andMe-style raw data file for GeneWise demo use only
# rsid\tchromosome\tposition\tgenotype
rs762551\t7\t24966446\tAC
rs4988235\t2\t136608646\tCT
rs1801260\t4\t56307853\tTT
rs1815739\t11\t66560624\tCT
`;

function parseRawDNA(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    if (parts.length >= 4 && parts[0].startsWith("rs")) {
      rows.push({
        rsid: parts[0],
        chromosome: parts[1],
        position: parts[2],
        genotype: parts[3].toUpperCase(),
      });
    }
  }
  return rows;
}

function buildTraitReport(rows) {
  const rowMap = new Map(rows.map((row) => [row.rsid, row]));
  return Object.values(demoTraitDefinitions).map((trait) => {
    const found = rowMap.get(trait.rsid);
    const genotype = found?.genotype ?? "N/A";
    const score = trait.scores[genotype] ?? null;
    const note = trait.notes[genotype] ?? trait.notes.default;
    return {
      label: trait.label,
      rsid: trait.rsid,
      genotype,
      score,
      note,
      available: score !== null,
    };
  });
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 rounded-full bg-slate-800">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-sky-300 to-emerald-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function PageButton({ activePage, page, setActivePage }) {
  const active = activePage === page;
  return (
    <button
      onClick={() => setActivePage(page)}
      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
        active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {page}
    </button>
  );
}

export default function GeneWiseLandingPage() {
  const [activePage, setActivePage] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [rawText, setRawText] = useState(starterDemoFile);
  const [parsedRows, setParsedRows] = useState(parseRawDNA(starterDemoFile));
  const [fileName, setFileName] = useState("genewise_demo_raw_data.txt");
  const [parseMessage, setParseMessage] = useState("Loaded demo file. Upload your own mock raw file or edit the sample text.");

  const reportTraits = useMemo(() => buildTraitReport(parsedRows), [parsedRows]);

  const pageTitle = useMemo(() => {
    switch (activePage) {
      case "Upload DNA":
        return "Mock DNA parsing workflow";
      case "Sample Report":
        return "Trait report prototype";
      case "Privacy":
        return "Ethics, consent, and limitations";
      case "Roadmap":
        return "Project roadmap and resume framing";
      default:
        return "DNA-powered wellness prototype";
    }
  }, [activePage]);

  const availableTraits = reportTraits.filter((trait) => trait.available).length;

  function processRawText(text, nextFileName = fileName) {
    const rows = parseRawDNA(text);
    setRawText(text);
    setParsedRows(rows);
    setFileName(nextFileName);
    if (rows.length === 0) {
      setParseMessage("No valid rsid rows found. Use a 23andMe-style tab- or space-separated format.");
    } else {
      setParseMessage(`Parsed ${rows.length} genotype row${rows.length === 1 ? "" : "s"} from ${nextFileName}.`);
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      processRawText(text, file.name);
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_25%),linear-gradient(to_bottom,#07111f,#0b1728,#07111f)]" />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Dna className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">GeneWise</div>
                <div className="text-sm text-slate-400">{pageTitle}</div>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              {navItems.map((page) => (
                <PageButton key={page} activePage={activePage} page={page} setActivePage={setActivePage} />
              ))}
            </div>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2 overflow-hidden md:hidden"
              >
                {navItems.map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setActivePage(page);
                      setMenuOpen(false);
                    }}
                    className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium ${
                      activePage === page ? "bg-white text-slate-950" : "bg-white/5 text-slate-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <AnimatePresence mode="wait">
          {activePage === "Home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-16"
            >
              <section className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                    Student-built genetics wellness product prototype
                  </div>

                  <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                    A stronger biotech portfolio project built around
                    <span className="block bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent">
                      mock DNA parsing, responsible reporting, and clear ethics
                    </span>
                  </h1>

                  <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                    GeneWise is a software-first prototype that lets users upload a mock consumer DNA file, parses genotype rows, and generates a sample wellness report with careful non-diagnostic framing.
                  </p>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                    Many human traits have genetic components. At the same time, most health-related traits are shaped by both genes and environment. This project is intentionally built as a learning and portfolio app rather than a real clinical or commercial genetics pipeline.
                  </p>

                  <div className="mt-9 flex flex-wrap gap-4">
                    <button
                      onClick={() => setActivePage("Upload DNA")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:scale-[1.02]"
                    >
                      Try mock upload
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActivePage("Roadmap")}
                      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                    >
                      View roadmap
                    </button>
                  </div>

                  <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
                    {metrics.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <div className="text-xl font-semibold text-white">{item.value}</div>
                        <div className="mt-1 text-sm text-slate-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sky-400/15 to-emerald-400/10 blur-2xl" />
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-2xl backdrop-blur-xl">
                    <div className="rounded-[1.6rem] border border-white/10 bg-[#0a1422] p-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-5">
                        <div>
                          <p className="text-sm text-slate-400">Current demo status</p>
                          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Interactive prototype</h2>
                        </div>
                        <div className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-sm text-sky-200">
                          Portfolio ready
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {reportTraits.map((item) => (
                          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                                <Sparkles className="h-5 w-5 text-sky-300" />
                              </div>
                              <div className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
                                {item.genotype}
                              </div>
                            </div>
                            <div className="mt-5 h-2 rounded-full bg-slate-800">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-sky-300 to-emerald-300"
                                style={{ width: `${item.score ?? 18}%` }}
                              />
                            </div>
                            <h3 className="mt-4 text-lg font-medium">{item.label}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{item.note}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/10 p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-200" />
                          <p className="text-sm leading-6 text-slate-200">
                            This app uses simplified educational trait logic and mock upload workflows. Real human DNA analysis and returned results would require formal approvals, careful consent, and compliant operational design.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-3">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      whileHover={{ y: -4 }}
                      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7 shadow-xl backdrop-blur-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-emerald-300" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold tracking-tight">{feature.title}</h3>
                      <p className="mt-3 leading-7 text-slate-400">{feature.text}</p>
                    </motion.div>
                  );
                })}
              </section>
            </motion.div>
          )}

          {activePage === "Upload DNA" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid gap-8 lg:grid-cols-[1fr_1fr]"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Upload className="h-5 w-5 text-sky-300" />
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight">Mock DNA upload</h1>
                <p className="mt-4 max-w-xl leading-8 text-slate-400">
                  This page demonstrates a student-safe portfolio implementation: local file reading, parsing raw genotype text, and converting it into a mock report. It does not perform real clinical interpretation.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-[1.5rem] border border-dashed border-sky-300/30 bg-sky-300/5 p-6">
                    <label className="block cursor-pointer text-center">
                      <Database className="mx-auto h-8 w-8 text-sky-300" />
                      <p className="mt-4 text-base font-medium">Upload a mock raw DNA file</p>
                      <p className="mt-2 text-sm text-slate-400">Use a 23andMe-style TXT file with rsid chromosome position genotype columns</p>
                      <span className="mt-5 inline-block rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950">
                        Choose file
                      </span>
                      <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0c1727] p-4">
                    <div className="text-sm font-medium text-slate-300">Loaded file</div>
                    <div className="mt-1 text-sm text-slate-400">{fileName}</div>
                  </div>

                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-slate-100">
                    {parseMessage}
                  </div>

                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-slate-200">
                    Important: this prototype intentionally uses local parsing and demo logic only. It avoids claiming diagnostic validity or real-world operational readiness.
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[#0c1727] p-8">
                <h2 className="text-2xl font-semibold tracking-tight">Editable mock raw file</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  You can paste sample rsid data here to test parsing behavior. Each valid row should look like: rsid chromosome position genotype
                </p>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="mt-6 h-80 w-full rounded-2xl border border-white/10 bg-[#08111d] p-4 font-mono text-sm text-slate-200 focus:outline-none"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => processRawText(rawText, fileName)}
                    className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950"
                  >
                    Parse text
                  </button>
                  <button
                    onClick={() => processRawText(starterDemoFile, "genewise_demo_raw_data.txt")}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white"
                  >
                    Reset demo file
                  </button>
                  <button
                    onClick={() => setActivePage("Sample Report")}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white"
                  >
                    View report
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activePage === "Sample Report" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <FileText className="h-5 w-5 text-sky-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Generated from current parsed input</div>
                      <h1 className="text-3xl font-semibold tracking-tight">Sample wellness report</h1>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0c1727] p-4">
                      <div className="text-xl font-semibold">{parsedRows.length}</div>
                      <div className="mt-1 text-sm text-slate-400">Parsed rows</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0c1727] p-4">
                      <div className="text-xl font-semibold">{availableTraits}/4</div>
                      <div className="mt-1 text-sm text-slate-400">Traits found</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0c1727] p-4">
                      <div className="text-xl font-semibold">Mock</div>
                      <div className="mt-1 text-sm text-slate-400">Interpretation type</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0c1727] p-4">
                      <div className="text-xl font-semibold">Local</div>
                      <div className="mt-1 text-sm text-slate-400">File handling</div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-5">
                    {reportTraits.map((trait) => (
                      <div key={trait.label} className="rounded-2xl border border-white/10 bg-[#0c1727] p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-medium">{trait.label}</h3>
                            <p className="mt-1 text-sm text-slate-400">Marker: {trait.rsid} · Genotype: {trait.genotype}</p>
                          </div>
                          <div className="rounded-full bg-sky-300/10 px-3 py-1 text-sm font-medium text-sky-200">
                            {trait.available ? `${trait.score}/100` : "N/A"}
                          </div>
                        </div>
                        <div className="mt-4">
                          <ProgressBar value={trait.score ?? 12} />
                        </div>
                        <p className="mt-4 text-sm leading-7 text-slate-300">{trait.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="rounded-[2rem] border border-white/10 bg-[#0c1727] p-8">
                    <h2 className="text-2xl font-semibold tracking-tight">Why this is stronger for GitHub and internships</h2>
                    <div className="mt-6 space-y-4">
                      {[
                        "Shows actual file parsing logic",
                        "Demonstrates product thinking, not just styling",
                        "Includes careful scientific limitations",
                        "Connects frontend UX with biotech context",
                        "Creates honest material for resume bullets",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                          <div className="text-slate-300">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-8">
                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">Scientific framing</div>
                    <p className="mt-4 leading-8 text-slate-200">
                      This report uses simplified educational trait logic. It should be described as a prototype exploring genotype parsing and user-facing presentation, not as a medical or commercial genetics service.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activePage === "Privacy" && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid gap-8 lg:grid-cols-[1fr_0.95fr]"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-sky-300" />
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight">Privacy and ethics</h1>
                <p className="mt-4 max-w-2xl leading-8 text-slate-400">
                  A strong biotech portfolio project should show that you understand not only the product idea, but also why real human genetics workflows require care, consent, and formal oversight.
                </p>

                <div className="mt-8 space-y-4">
                  {privacyPoints.map((point) => (
                    <div key={point} className="rounded-2xl border border-white/10 bg-[#0c1727] p-4 text-slate-300">
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-[2rem] border border-white/10 bg-[#0c1727] p-8">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-5 w-5 text-emerald-300" />
                    <h2 className="text-2xl font-semibold tracking-tight">Why the project stays software-first</h2>
                  </div>
                  <p className="mt-5 leading-8 text-slate-400">
                    This prototype avoids real sample collection, lab resource use, and real-world human subject handling. That keeps the work appropriate for a student portfolio while still demonstrating relevant biotech product skills.
                  </p>
                  <p className="mt-4 leading-8 text-slate-400">
                    Future real deployments would need appropriate institutional permission, privacy controls, consent workflows, and likely regulatory review depending on use.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-8">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-200" />
                    <h3 className="text-xl font-semibold">Important limitation statement</h3>
                  </div>
                  <p className="mt-4 leading-8 text-slate-200">
                    Many traits have genetic influences, but most health traits are shaped by both genes and environment. This app presents educational associations only and should not be described as diagnostic or clinically validated.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activePage === "Roadmap" && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-6 w-6 text-sky-300" />
                    <h1 className="text-4xl font-semibold tracking-tight">Roadmap</h1>
                  </div>
                  <div className="mt-8 space-y-5">
                    {roadmapPhases.map((phase) => (
                      <div key={phase.title} className="rounded-2xl border border-white/10 bg-[#0c1727] p-5">
                        <h3 className="text-lg font-semibold">{phase.title}</h3>
                        <p className="mt-2 leading-7 text-slate-400">{phase.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="rounded-[2rem] border border-white/10 bg-[#0c1727] p-8">
                    <div className="flex items-center gap-3">
                      <Code2 className="h-5 w-5 text-emerald-300" />
                      <h2 className="text-2xl font-semibold tracking-tight">What to say on GitHub</h2>
                    </div>
                    <div className="mt-5 space-y-3 text-slate-300">
                      <p>• React prototype for parsing mock consumer DNA files</p>
                      <p>• Sample trait report generator using simplified educational logic</p>
                      <p>• Product design focused on privacy, consent, and responsible genetics messaging</p>
                      <p>• Future work may include broader demo marker coverage and safer workflow simulation</p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-8">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-emerald-200" />
                      <h3 className="text-xl font-semibold">Resume framing</h3>
                    </div>
                    <p className="mt-4 leading-8 text-slate-100">
                      Describe GeneWise as a genetics wellness platform prototype that parses mock genotype files and generates user-facing educational trait reports with explicit privacy and non-diagnostic framing.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
