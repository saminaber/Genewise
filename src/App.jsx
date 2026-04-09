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
      return parts.length >= 4 ? { rsid: parts[0], genotype: parts[3] } : null;
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
        "Use as general context for caffeine timing, not as a medical recommendation.",
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
          ? "This pattern may be framed as a stronger fast-twitch tendency in simplified models."
          : muscle === "TT"
          ? "This pattern may be framed as a stronger endurance-oriented tendency."
          : muscle === "CT" || muscle === "TC"
          ? "This pattern may suggest a mixed training response profile."
          : "No matching marker was found in the current file.",
      nextStep:
        "Use this as a conversation starter for training style, not as a hard biological limit.",
    },
    {
      title: "Skin / Sensitivity",
      genotype: skin,
      interpretation:
        "Educational context for pigmentation, UV response, and visible skin-trait framing.",
      meaning:
        skin === "AA"
          ? "This pattern may align with lighter pigmentation-related traits in simplified models."
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
    <div className="brand">
      <div className="brand-mark" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <span className="orbit-dot" />
      </div>
      <div className="brand-copy">
        <span className="brand-name">GeneWise</span>
        <span className="brand-tag">Consumer genetics wellness platform</span>
      </div>
    </div>
  );
}

function HeroBackground() {
  return (
    <div className="hero-bg-art" aria-hidden="true">
      <span className="bg-glow bg-glow-1" />
      <span className="bg-glow bg-glow-2" />
      <span className="bg-glow bg-glow-3" />
      <span className="bg-glow bg-glow-4" />

      <span className="hero-noise" />

      <span className="grid-v g1" />
      <span className="grid-v g2" />
      <span className="grid-v g3" />
      <span className="grid-v g4" />
      <span className="grid-v g5" />
      <span className="grid-h gh1" />
      <span className="grid-h gh2" />
      <span className="grid-h gh3" />
      <span className="grid-h gh4" />

      <span className="net-line l1" />
      <span className="net-line l2" />
      <span className="net-line l3" />
      <span className="net-line l4" />
      <span className="net-line l5" />
      <span className="net-line l6" />

      <span className="net-node n1" />
      <span className="net-node n2" />
      <span className="net-node n3" />
      <span className="net-node n4" />
      <span className="net-node n5" />
      <span className="net-node n6" />
      <span className="net-node n7" />
      <span className="net-node n8" />

      <div className="floating-panel fp-1 meaningful-panel">
        <span>Input layer</span>
        <strong>Raw SNP markers detected</strong>
        <small>rs762551 · rs4988235 · rs1801260</small>
      </div>

      <div className="floating-panel fp-2 meaningful-panel">
        <span>Privacy model</span>
        <strong>Local browser parsing</strong>
        <small>Prototype workflow keeps file handling client-side</small>
      </div>

      <div className="floating-panel fp-3 meaningful-panel">
        <span>Output layer</span>
        <strong>Structured wellness report</strong>
        <small>Sleep · Fitness · Nutrition · Skin</small>
      </div>
    </div>
  );
}

function HeroSignalPanel() {
  return (
    <div className="hero-signal-panel">
      <div className="signal-header">
        <span className="signal-kicker">Prototype signal map</span>
        <span className="signal-chip">Local parsing</span>
      </div>

      <div className="signal-core">
        <div className="signal-data-stream">
          <span>rs762551</span>
          <span>rs4988235</span>
          <span>rs1801260</span>
          <span>rs1815739</span>
          <span>rs12913832</span>
          <span>rs174537</span>
        </div>

        <div className="signal-ring signal-ring-1" />
        <div className="signal-ring signal-ring-2" />
        <div className="signal-ring signal-ring-3" />

        <div className="signal-center">
          <span>GeneWise</span>
          <strong>Insight Engine</strong>
        </div>

        <div className="signal-node-card node-card-a">
          <span>Sleep</span>
          <strong>Circadian context</strong>
        </div>
        <div className="signal-node-card node-card-b">
          <span>Fitness</span>
          <strong>Recovery profile</strong>
        </div>
        <div className="signal-node-card node-card-c">
          <span>Nutrition</span>
          <strong>Metabolic signals</strong>
        </div>
        <div className="signal-node-card node-card-d">
          <span>Skin</span>
          <strong>Sensitivity framing</strong>
        </div>
      </div>
    </div>
  );
}

function SleepVisual() {
  return (
    <div className="abstract-visual sleep-visual" aria-hidden="true">
      <span className="moon-shape" />
      <span className="sleep-dot dot-a" />
      <span className="sleep-dot dot-b" />
      <span className="sleep-dot dot-c" />
      <span className="sleep-wave wave-1" />
      <span className="sleep-wave wave-2" />
      <span className="sleep-wave wave-3" />
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [rows, setRows] = useState(parseDNA(demoFile));
  const [status, setStatus] = useState("Demo data loaded successfully.");
  const [fileName, setFileName] = useState("demo-dna-file.txt");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const report = useMemo(() => buildReport(rows), [rows]);

  async function handleWaitlistSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const formData = new FormData(e.target);

    try {
      const res = await fetch("https://formspree.io/f/xgopbjlb", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setSubmitted(true);
        e.target.reset();
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } catch (error) {
      setSubmitError("Something went wrong. Please try again.");
    }
  }

  function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const parsed = parseDNA(reader.result || "");
      setRows(parsed);
      setFileName(file.name);
      setStatus(`Loaded ${parsed.length} genetic markers from ${file.name}.`);
    };

    reader.onerror = () => {
      setStatus("There was a problem reading the file.");
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
      customVisual: <SleepVisual />,
    },
    {
      title: "Fitness",
      text: "See educational interpretations tied to exercise response, training style, and recovery tendencies.",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Nutrition",
      text: "Surface context around lactose digestion, caffeine metabolism, and broader metabolic traits.",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Skin / Sensitivity",
      text: "Frame how genomic variation may relate to skin barrier context and general sensitivity patterns.",
      image:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="site-shell">
      <div className="site-bg site-bg-one" />
      <div className="site-bg site-bg-two" />

      <header className="topbar">
        <div className="container topbar-inner">
          <GeneWiseLogo />

          <nav className="nav-tabs" aria-label="Main navigation">
            {pages.map(([key, label]) => (
              <button
                key={key}
                className={`nav-tab ${page === key ? "active" : ""}`}
                onClick={() => setPage(key)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-content">
        {page === "home" && (
          <>
            <section className="hero-section hero-section-wide">
              <div className="hero-shell hero-shell-wide">
                <HeroBackground />

                <div className="hero-inner">
                  <div className="hero-top-row">
                    <div className="hero-copy">
                      <span className="eyebrow">Genetics-informed wellness exploration</span>

                      <h1>
                        Turn raw consumer
                        <br />
                        DNA data into a
                        <br />
                        clearer wellness
                        <br />
                        signal layer
                      </h1>

                      <p className="hero-text">
                        GeneWise is a biotech-style product concept that transforms
                        raw genotype data into structured, educational wellness
                        reporting across sleep, fitness, nutrition, skin,
                        caffeine response, and lactose digestion.
                      </p>

                      <p className="hero-subtext">
                        The experience is designed around scientific restraint,
                        strong interface clarity, and local browser parsing in this
                        prototype rather than exaggerated health claims.
                      </p>

                      <div className="hero-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => setPage("upload")}
                        >
                          Start with DNA Upload
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setPage("report")}
                        >
                          Explore Sample Report
                        </button>
                      </div>
                    </div>

                    <div className="hero-visual-zone">
                      <HeroSignalPanel />
                    </div>
                  </div>

                  <div className="hero-bottom-row">
                    <div className="hero-metric">
                      <strong>6</strong>
                      <span>report categories</span>
                    </div>
                    <div className="hero-metric">
                      <strong>Local</strong>
                      <span>browser-based DNA parsing</span>
                    </div>
                    <div className="hero-metric">
                      <strong>Clear</strong>
                      <span>non-diagnostic reporting</span>
                    </div>
                    <div className="hero-metric">
                      <strong>Modern</strong>
                      <span>consumer biotech UX</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="container">
                <form
                  className="waitlist-card waitlist-card-premium"
                  onSubmit={handleWaitlistSubmit}
                >
                  <div className="waitlist-copy">
                    <span className="waitlist-kicker">Early access</span>
                    <h3>Join the GeneWise waitlist</h3>
                    <p>
                      Follow the concept as it evolves. No fake traction, no
                      inflated user counts, just direct interest collection.
                    </p>
                  </div>

                  <div className="waitlist-form-block">
                    {submitted ? (
                      <div className="success-message">You're on the waitlist.</div>
                    ) : (
                      <div className="waitlist-fields">
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          required
                        />
                        <button type="submit" className="btn btn-primary">
                          Join Waitlist
                        </button>
                      </div>
                    )}

                    {submitError ? (
                      <div className="error-message">{submitError}</div>
                    ) : null}
                  </div>
                </form>
              </div>
            </section>

            <section className="section">
              <div className="container">
                <div className="section-heading">
                  <span className="eyebrow">Product framing</span>
                  <h2>A more credible way to translate consumer genotype data into usable wellness context</h2>
                </div>

                <div className="feature-band">
                  <div className="feature-band-card">
                    <span className="feature-kicker">Structured intake</span>
                    <h3>Upload raw consumer DNA data</h3>
                    <p>
                      Simulate a real product entry point with a clean intake
                      flow instead of dropping users into a generic report.
                    </p>
                  </div>
                  <div className="feature-band-card">
                    <span className="feature-kicker">Signal mapping</span>
                    <h3>Convert markers into meaningful categories</h3>
                    <p>
                      Organize genotype data into a framework users can
                      understand, rather than showing isolated SNPs with no
                      context.
                    </p>
                  </div>
                  <div className="feature-band-card">
                    <span className="feature-kicker">Scientific restraint</span>
                    <h3>Frame outputs without fake clinical claims</h3>
                    <p>
                      Keep the experience polished and credible by staying
                      educational, non-diagnostic, and privacy-conscious.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="container">
                <div className="section-heading">
                  <span className="eyebrow">Platform categories</span>
                  <h2>What GeneWise is designed to help users explore</h2>
                </div>

                <div className="category-grid">
                  {homeCategories.map((item) => (
                    <article className="category-card" key={item.title}>
                      {item.customVisual ? (
                        <div className="category-custom-visual">
                          {item.customVisual}
                        </div>
                      ) : (
                        <div
                          className="category-image"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                      )}
                      <div className="category-overlay" />
                      <div className="category-content">
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="section">
              <div className="container">
                <div className="split-cta">
                  <div className="split-cta-main">
                    <span className="eyebrow">See the prototype flow</span>
                    <h2>Start with the upload experience or jump directly into the report</h2>
                    <p>
                      Explore the front-end flow from intake to structured
                      interpretation and see how the concept comes together as a
                      polished wellness platform.
                    </p>
                  </div>

                  <div className="split-cta-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => setPage("upload")}
                    >
                      Try Upload Flow
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setPage("report")}
                    >
                      View Demo Report
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === "upload" && (
          <section className="section upload-section">
            <div className="container">
              <div className="section-heading upload-heading">
                <span className="eyebrow">DNA intake</span>
                <h2>Upload consumer DNA data</h2>
                <p>
                  Simulate the first step of a user-facing genetics workflow
                  with a raw genotype file. This page is intentionally clean,
                  balanced, and image-free.
                </p>
              </div>

              <div className="upload-layout">
                <div className="upload-card">
                  <div className="upload-icon" aria-hidden="true">
                    ↑
                  </div>

                  <h3>Drop a raw DNA file here</h3>
                  <p className="upload-description">
                    Upload a 23andMe-style text file to populate the reporting
                    workflow and preview how structured wellness insights could
                    be generated.
                  </p>

                  <label className="file-input-wrap">
                    <input type="file" accept=".txt,.csv" onChange={upload} />
                    <span className="btn btn-primary">Choose File</span>
                  </label>

                  <div className="upload-meta">
                    <div className="meta-row">
                      <span className="meta-label">Current file</span>
                      <strong>{fileName}</strong>
                    </div>
                    <div className="status-box">{status}</div>
                  </div>
                </div>

                <aside className="info-card">
                  <span className="eyebrow">What happens after upload</span>
                  <h3>Structured parsing, then simplified reporting</h3>

                  <ul className="info-list">
                    <li>Structured genotype markers are parsed locally in the browser.</li>
                    <li>Markers are mapped to simplified wellness categories.</li>
                    <li>A user-facing report is generated from the detected markers.</li>
                    <li>Outputs stay educational and non-diagnostic.</li>
                  </ul>

                  <div className="info-note">
                    GeneWise is a concept experience for wellness education and
                    product design exploration, not a medical testing platform.
                  </div>
                </aside>
              </div>
            </div>
          </section>
        )}

        {page === "report" && (
          <section className="section">
            <div className="container">
              <div className="section-heading">
                <span className="eyebrow">Sample results</span>
                <h2>Illustrative wellness insight report</h2>
                <p>
                  Example reporting generated from the genotype markers
                  currently loaded into the prototype.
                </p>
              </div>

              <div className="report-grid">
                {report.map((card) => (
                  <article className="report-card" key={card.title}>
                    <div className="report-card-top">
                      <h3>{card.title}</h3>
                      <span className="genotype-pill">{card.genotype}</span>
                    </div>

                    <div className="report-block">
                      <span className="report-label">Interpretation</span>
                      <p>{card.interpretation}</p>
                    </div>

                    <div className="report-block">
                      <span className="report-label">What this may mean</span>
                      <p>{card.meaning}</p>
                    </div>

                    <div className="report-block">
                      <span className="report-label">Suggested next step</span>
                      <p>{card.nextStep}</p>
                    </div>

                    <div className="report-tags">
                      <span>Consumer DNA context</span>
                      <span>Educational only</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === "privacy" && (
          <section className="section">
            <div className="container narrow">
              <div className="section-heading">
                <span className="eyebrow">Trust and scientific framing</span>
                <h2>Built to be informative, not diagnostic</h2>
              </div>

              <div className="privacy-card">
                <h3>Core principles</h3>
                <ul className="info-list">
                  <li>Educational wellness interpretation only.</li>
                  <li>No disease or allergy diagnosis.</li>
                  <li>No clinical claims or medical decision guidance.</li>
                  <li>Privacy-conscious product framing with local parsing in this prototype.</li>
                </ul>

                <h3>Why this matters</h3>
                <p>
                  Consumer genotype data can be useful for structured
                  self-exploration, but meaningful diagnosis depends on
                  validated clinical workflows, additional context, and
                  professional evaluation.
                </p>
                <p>
                  Most health-related traits reflect both genetics and
                  environmental factors, so outputs should be understood as
                  simplified context rather than certainty.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}