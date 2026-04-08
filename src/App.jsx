import { useMemo, useState } from "react";

const demoFile = `rs762551 7 24966446 AC
rs4988235 2 136608646 CT
rs1801260 4 56307853 TT
rs1815739 11 66560624 CT
rs12913832 15 28365618 AG
rs174537 11 61571478 GG`;

function parseDNA(text) {
  return text
    .split("\n")
    .map((line) => {
      const parts = line.trim().split(/\s+/);
      return parts.length >= 4
        ? { rsid: parts[0], genotype: parts[3] }
        : null;
    })
    .filter(Boolean);
}

function getGenotype(rows, rsid) {
  return rows.find((r) => r.rsid === rsid)?.genotype || "N/A";
}

function buildReport(rows) {
  const caffeine = getGenotype(rows, "rs762551");
  const lactose = getGenotype(rows, "rs4988235");
  const sleep = getGenotype(rows, "rs1801260");
  const muscle = getGenotype(rows, "rs1815739");
  const skin = getGenotype(rows, "rs12913832");
  const nutrition = getGenotype(rows, "rs174537");

  return [
    {
      title: "Caffeine Response",
      genotype: caffeine,
      interpretation: "Educational context for caffeine metabolism tendency.",
      meaning:
        caffeine === "AA"
          ? "This pattern may align with faster caffeine metabolism in simplified consumer genetics models."
          : caffeine === "AC" || caffeine === "CA"
          ? "This pattern may align with a more moderate caffeine response."
          : caffeine === "CC"
          ? "This pattern may align with slower caffeine metabolism in simplified models."
          : "No matching marker was found in the current file.",
      nextStep:
        "Use as general context for daily caffeine timing, not as a medical recommendation.",
    },
    {
      title: "Lactose Digestion",
      genotype: lactose,
      interpretation: "Educational context for lactase persistence tendency.",
      meaning:
        lactose === "TT"
          ? "This pattern may be associated with stronger adult lactase persistence tendency."
          : lactose === "CT" || lactose === "TC"
          ? "This pattern may suggest an intermediate tendency for lactose digestion."
          : lactose === "CC"
          ? "This pattern may suggest lower support for lactase persistence."
          : "No matching marker was found in the current file.",
      nextStep:
        "Pair this with real-world digestion experience rather than treating it as a diagnosis.",
    },
    {
      title: "Sleep Rhythm",
      genotype: sleep,
      interpretation: "Educational context for circadian timing tendency.",
      meaning:
        sleep === "TT"
          ? "This pattern may align with a later sleep timing tendency."
          : sleep === "CC"
          ? "This pattern may align with steadier sleep timing in simplified models."
          : sleep === "CT" || sleep === "TC"
          ? "This pattern may reflect a more mixed circadian profile."
          : "No matching marker was found in the current file.",
      nextStep:
        "Use this as background context when thinking about sleep schedules and recovery habits.",
    },
    {
      title: "Power / Endurance",
      genotype: muscle,
      interpretation: "Educational context for exercise response tendency.",
      meaning:
        muscle === "CC"
          ? "This pattern may be framed as stronger fast-twitch tendency in simplified models."
          : muscle === "TT"
          ? "This pattern may be framed as stronger endurance-oriented tendency."
          : muscle === "CT" || muscle === "TC"
          ? "This pattern may suggest a mixed training response profile."
          : "No matching marker was found in the current file.",
      nextStep:
        "Use this as a conversation starter for training style, not as a hard biological limit.",
    },
    {
      title: "Skin Profile",
      genotype: skin,
      interpretation:
        "Educational context for pigmentation, UV response, and visible skin-trait context.",
      meaning:
        skin === "AA"
          ? "This pattern may align with a stronger tendency toward lighter pigmentation-related traits in simplified models."
          : skin === "AG" || skin === "GA"
          ? "This pattern may align with an intermediate pigmentation context in simplified models."
          : skin === "GG"
          ? "This pattern may align with darker pigmentation-related context in simplified models."
          : "No matching marker was found in the current file.",
      nextStep:
        "Use this as light educational context around UV exposure habits and skin-awareness routines, not as a cosmetic or medical conclusion.",
    },
    {
      title: "Nutrition Lipid Context",
      genotype: nutrition,
      interpretation:
        "Educational context for fatty-acid metabolism and broader nutrition-response framing.",
      meaning:
        nutrition === "GG"
          ? "This pattern may align with a stronger omega-fatty-acid processing context in simplified nutrition models."
          : nutrition === "GT" || nutrition === "TG"
          ? "This pattern may suggest a more mixed lipid-metabolism context."
          : nutrition === "TT"
          ? "This pattern may suggest a less efficient conversion pattern in simplified educational models."
          : "No matching marker was found in the current file.",
      nextStep:
        "Use this as a prompt to think about dietary patterns and nutrition questions, not as a prescription or deficiency diagnosis.",
    },
  ];
}

function GeneWiseLogo() {
  return (
    <div className="brand-icon brand-logo" aria-hidden="true">
      <span className="logo-ring logo-ring-a" />
      <span className="logo-ring logo-ring-b" />
      <span className="logo-dot" />
    </div>
  );
}

function HeroNetwork() {
  const nodes = [
    { top: "8%", left: "4%" },
    { top: "20%", left: "18%" },
    { top: "10%", left: "34%" },
    { top: "28%", left: "46%" },
    { top: "16%", left: "63%" },
    { top: "8%", left: "82%" },
    { top: "34%", left: "88%" },
    { top: "48%", left: "71%" },
    { top: "42%", left: "52%" },
    { top: "62%", left: "38%" },
    { top: "70%", left: "18%" },
    { top: "82%", left: "8%" },
    { top: "78%", left: "58%" },
    { top: "70%", left: "84%" },
  ];

  const lines = [
    ["4%", "8%", "18%", "20%"],
    ["18%", "20%", "34%", "10%"],
    ["34%", "10%", "46%", "28%"],
    ["46%", "28%", "63%", "16%"],
    ["63%", "16%", "82%", "8%"],
    ["82%", "8%", "88%", "34%"],
    ["63%", "16%", "71%", "48%"],
    ["46%", "28%", "52%", "42%"],
    ["52%", "42%", "38%", "62%"],
    ["38%", "62%", "18%", "70%"],
    ["18%", "70%", "8%", "82%"],
    ["52%", "42%", "58%", "78%"],
    ["58%", "78%", "84%", "70%"],
    ["71%", "48%", "84%", "70%"],
    ["18%", "20%", "18%", "70%"],
    ["34%", "10%", "52%", "42%"],
    ["46%", "28%", "71%", "48%"],
  ];

  return (
    <div className="network-graphic" aria-hidden="true">
      {lines.map((line, i) => (
        <svg key={i} className="network-line">
          <line
            x1={line[0]}
            y1={line[1]}
            x2={line[2]}
            y2={line[3]}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}
      {nodes.map((node, i) => (
        <span
          key={i}
          className="network-node"
          style={{ top: node.top, left: node.left }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [rows, setRows] = useState(parseDNA(demoFile));
  const [status, setStatus] = useState("Demo data loaded");
  const [fileName, setFileName] = useState("demo-dna-file.txt");

  const report = useMemo(() => buildReport(rows), [rows]);

  function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseDNA(reader.result);
      setRows(parsed);
      setFileName(file.name);
      setStatus(`Loaded ${parsed.length} genetic markers from ${file.name}`);
    };
    reader.readAsText(file);
  }

  const pages = [
    ["home", "Home"],
    ["upload", "Upload DNA"],
    ["report", "Report"],
    ["privacy", "Privacy"],
  ];

  const homeCategories = [
    {
      title: "Sleep",
      text: "Explore simplified circadian and recovery-related context from consumer genotype data.",
    },
    {
      title: "Fitness",
      text: "See educational interpretations tied to exercise response, training style, and recovery tendencies.",
    },
    {
      title: "Nutrition",
      text: "Surface context around lactose digestion, caffeine metabolism, and broader metabolic traits.",
    },
    {
      title: "Skin & Immune Sensitivity",
      text: "Frame how genomic variation may relate to skin barrier context and general immune sensitivity patterns.",
    },
  ];

  return (
    <div className="app-shell">
      <div className="bg-glow glow-1" />
      <div className="bg-glow glow-2" />

      <header className="topbar">
        <div className="brand">
          <GeneWiseLogo />
          <div>
            <h1>GeneWise</h1>
            <p>Consumer genetics wellness platform</p>
          </div>
        </div>

        <nav className="nav">
          {pages.map(([key, label]) => (
            <button
              key={key}
              className={page === key ? "nav-btn active" : "nav-btn"}
              onClick={() => setPage(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {page === "home" && (
        <main className="page">
          <section className="hero-banner">
            <HeroNetwork />

            <div className="hero-banner-content">
              <div className="eyebrow hero-eyebrow">
                Genetics-informed wellness exploration
              </div>
              <h2>
                Consumer DNA data,
                <br />
                translated into structured
                <br />
                wellness insight
              </h2>
              <p className="hero-banner-copy">
                GeneWise is a concept platform that transforms consumer
                genotype data into educational insight categories across
                sleep, fitness, nutrition, skin, and immune sensitivity.
              </p>
              <p className="hero-banner-copy">
                The goal is to make personal genomic information easier to
                explore through clean, non-diagnostic reporting designed for
                awareness and self-education.
              </p>

              <div className="hero-actions">
                <button className="primary-btn" onClick={() => setPage("upload")}>
                  Start with DNA Upload
                </button>
                <button className="ghost-btn hero-ghost" onClick={() => setPage("report")}>
                  Explore Sample Report
                </button>
              </div>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">6</div>
                <div className="hero-stat-label">report sections</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">Local</div>
                <div className="hero-stat-label">DNA parsing workflow</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">Clear</div>
                <div className="hero-stat-label">scientific framing</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">Modern</div>
                <div className="hero-stat-label">consumer-style interface</div>
              </div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div className="eyebrow">How it works</div>
              <h3>A simple workflow for turning DNA data into wellness context</h3>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <h4>Upload consumer DNA data</h4>
                <p>
                  Import a 23andMe-style raw genotype file to simulate a consumer
                  genetics workflow.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">02</div>
                <h4>Map markers to insight categories</h4>
                <p>
                  Parse structured genotype markers and connect them to curated,
                  educational wellness-oriented categories.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <h4>View a structured report</h4>
                <p>
                  Generate simplified summaries with interpretation context and
                  suggested next-step framing.
                </p>
              </div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div className="eyebrow">Platform categories</div>
              <h3>What GeneWise is designed to help users explore</h3>
            </div>

            <div className="insight-grid">
              {homeCategories.map((item) => (
                <div key={item.title} className="info-card">
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section-block cta-block">
            <div>
              <div className="eyebrow">Explore the demo</div>
              <h3>See how the reporting flow comes together</h3>
              <p className="section-sub">
                Review the sample report or test the upload flow to see how a
                consumer-facing genetics wellness experience could work.
              </p>
            </div>

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => setPage("report")}>
                View Demo Report
              </button>
              <button className="ghost-btn" onClick={() => setPage("upload")}>
                Try Upload Flow
              </button>
            </div>
          </section>
        </main>
      )}

      {page === "upload" && (
        <main className="page">
          <section className="section-block">
            <div className="section-heading">
              <div className="eyebrow">DNA intake</div>
              <h3>Upload consumer DNA data</h3>
              <p className="section-sub">
                Simulate the first step of a user-facing genetics workflow with a
                raw genotype file.
              </p>
            </div>

            <div className="upload-layout">
              <div className="upload-dropzone">
                <div className="upload-icon">↑</div>
                <h4>Drop a raw DNA file here</h4>
                <p>
                  Upload a 23andMe-style file to populate the reporting workflow.
                </p>
                <label className="upload-label">
                  Choose File
                  <input className="hidden-input" type="file" onChange={upload} />
                </label>

                <div className="status-box">
                  <strong>Current file:</strong> {fileName}
                  <br />
                  {status}
                </div>
              </div>

              <div className="info-card">
                <h4>What happens after upload</h4>
                <ul className="clean-list">
                  <li>Structured genotype markers are parsed locally</li>
                  <li>Markers are matched to simplified wellness categories</li>
                  <li>A user-facing insight report is generated</li>
                  <li>Outputs are framed as educational, not diagnostic</li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      )}

      {page === "report" && (
        <main className="page">
          <section className="section-block">
            <div className="section-heading">
              <div className="eyebrow">Sample results</div>
              <h3>Illustrative wellness insight report</h3>
              <p className="section-sub">
                Example reporting generated from the currently loaded genotype markers.
              </p>
            </div>

            <div className="report-grid">
              {report.map((card) => (
                <div key={card.title} className="report-card">
                  <div className="report-head">
                    <h4>{card.title}</h4>
                    <span className="pill">{card.genotype}</span>
                  </div>

                  <div className="report-section">
                    <div className="report-label">Interpretation</div>
                    <p>{card.interpretation}</p>
                  </div>

                  <div className="report-section">
                    <div className="report-label">What this may mean</div>
                    <p>{card.meaning}</p>
                  </div>

                  <div className="report-section">
                    <div className="report-label">Suggested next step</div>
                    <p>{card.nextStep}</p>
                  </div>

                  <div className="report-chip-row">
                    <span className="report-chip">Consumer DNA context</span>
                    <span className="report-chip">Educational only</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === "privacy" && (
        <main className="page">
          <section className="section-block">
            <div className="section-heading">
              <div className="eyebrow">Trust and scientific framing</div>
              <h3>Built to be informative, not diagnostic</h3>
            </div>

            <div className="privacy-grid">
              <div className="info-card">
                <h4>Core principles</h4>
                <ul className="clean-list">
                  <li>Educational wellness interpretation only</li>
                  <li>No disease or allergy diagnosis</li>
                  <li>No clinical claims or medical decision guidance</li>
                  <li>Privacy-conscious product framing</li>
                </ul>
              </div>

              <div className="info-card">
                <h4>Why this matters</h4>
                <p>
                  Consumer genotype data can be useful for structured self-exploration,
                  but meaningful diagnosis depends on validated clinical workflows,
                  context, and professional evaluation.
                </p>
                <p>
                  Most health-related traits reflect both genetics and environmental
                  factors, so outputs should be understood as simplified context rather
                  than certainty.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}