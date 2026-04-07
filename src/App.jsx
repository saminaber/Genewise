import { useMemo, useState } from "react";

const demoFile = `rs762551 7 24966446 AC
rs4988235 2 136608646 CT
rs1801260 4 56307853 TT
rs1815739 11 66560624 CT`;

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
  ];
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
          <div className="brand-icon">G</div>
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
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">Genetics-informed wellness exploration</div>
              <h2>Consumer DNA data, translated into clearer wellness insight</h2>
              <p>
                GeneWise is a concept platform that transforms consumer genotype
                data into structured, educational insight categories across sleep,
                fitness, nutrition, and skin / immune sensitivity context.
              </p>
              <p>
                The goal is to make personal genomic information more accessible
                through simplified reporting that supports awareness, not diagnosis.
              </p>

              <div className="hero-actions">
                <button className="primary-btn" onClick={() => setPage("upload")}>
                  Start with DNA Upload
                </button>
                <button className="ghost-btn" onClick={() => setPage("report")}>
                  Explore Sample Report
                </button>
              </div>

              <div className="hero-meta">
                <span>Educational insights</span>
                <span>Privacy-conscious framing</span>
                <span>Non-diagnostic reporting</span>
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-card">
                <div className="panel-top">
                  <span className="pill">Platform Preview</span>
                  <span className="pill muted-pill">{rows.length} markers</span>
                </div>

                <div className="mini-grid">
                  <div className="mini-card">
                    <div className="mini-title">Sleep</div>
                    <div className="mini-sub">Timing and recovery context</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-title">Fitness</div>
                    <div className="mini-sub">Exercise response tendencies</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-title">Nutrition</div>
                    <div className="mini-sub">Metabolic trait summaries</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-title">Skin / Immune</div>
                    <div className="mini-sub">Sensitivity-oriented context</div>
                  </div>
                </div>

                <div className="panel-note">
                  Designed to convert raw genotype data into a structured,
                  user-friendly wellness reporting experience.
                </div>
              </div>
            </div>
          </section>

          <section className="stats-row">
            <div className="stat-card">
              <div className="stat-value">4</div>
              <div className="stat-label">core wellness categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Local</div>
              <div className="stat-label">file parsing workflow</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Clear</div>
              <div className="stat-label">scientific framing</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Modern</div>
              <div className="stat-label">multi-page product demo</div>
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