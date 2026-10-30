import { useEffect, useMemo, useRef, useState } from "react";

import { parseDNA, buildReport, demoFile, MAX_FILE_BYTES, markers, filterReport, catalogMetadata } from "./lib/dna.js";

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
        <span className="brand-tag">Genetics education prototype</span>
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
        <small>Expanded research catalog</small>
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
          <strong>Muscle research</strong>
        </div>
        <div className="signal-node-card node-card-c">
          <span>Nutrition</span>
          <strong>Research context</strong>
        </div>
        <div className="signal-node-card node-card-d">
          <span>Pigmentation</span>
          <strong>Eye-color research</strong>
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

import { readDNAFile } from './lib/file-reader.js';

export default function App() {
  const [page, setPage] = useState("home");
  const [dataset, setDataset] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const importController = useRef(null);
  useEffect(() => () => importController.current?.abort(), []);
  function cancelImport() {
    importController.current?.abort(); importController.current = null; setLoading(false);
  }
  const rows = dataset?.rows ?? [];
  const [status, setStatus] = useState("Choose a file or try the synthetic example.");
  const [fileName, setFileName] = useState("No file loaded");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const report = useMemo(() => buildReport(rows), [rows]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [resultStatus, setResultStatus] = useState("All");
  const [resultPage, setResultPage] = useState(0);
  const filteredReport = useMemo(() => filterReport(report, {query, category, status: resultStatus}), [report, query, category, resultStatus]);
  const pageCount = Math.max(1, Math.ceil(filteredReport.length / 12));
  const activePage = Math.min(resultPage, pageCount - 1);
  const visibleReport = filteredReport.slice(activePage * 12, (activePage + 1) * 12);
  const categories = [...new Set(markers.flatMap(m => m.categories))].sort();

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

  function resetData() {
    cancelImport();
    setDataset(null); setIsDemo(false); setFileName("No file loaded"); setResultPage(0);
    setStatus("Data cleared from this session.");
  }

  function loadDemo() {
    cancelImport();
    setDataset(parseDNA(demoFile)); setIsDemo(true); setResultPage(0);
    setFileName("Synthetic example"); setStatus("Synthetic example loaded. This is not personal DNA.");
    setPage("report");
  }

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    cancelImport();
    setDataset(null); setIsDemo(false); setFileName("No file loaded"); setResultPage(0);
    if (file.size > MAX_FILE_BYTES) { setStatus("File too large. Choose an uncompressed text file under 20 MB."); return; }
    const controller = new AbortController(); importController.current = controller;
    setLoading(true);
    try {
      const parsed = await readDNAFile(file, markers.map(m => m.rsid), controller.signal);
      if (importController.current !== controller) return;
      if (!parsed.stats.uniqueMarkers) { setStatus("No supported SNP records found. Use a raw text export with rsID, chromosome, position and genotype columns."); return; }
      setDataset(parsed); setFileName(file.name);
      setStatus(`Loaded ${parsed.stats.uniqueMarkers.toLocaleString()} unique markers. Review file quality below.`);
    } catch (error) {
      if (error.name !== "AbortError" && importController.current === controller) setStatus(error.message);
    } finally {
      if (importController.current === controller) { importController.current = null; setLoading(false); }
    }
  }

  function exportReport() {
    const payload = { project: "GeneWise", version: 2, catalog: catalogMetadata, source: isDemo ? "synthetic example" : "user file",
      limitations: "Educational marker observations only; genome build and strand not verified; no phenotype predictions.",
      quality: dataset.stats, fileMetadata: dataset.metadata,
      markers: report.map(({rsid, gene, genotype, status, category, source, paper}) => ({rsid, gene, genotype, status, category, source, paper})) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"}));
    const link = document.createElement("a"); link.href = url; link.download = "genewise-marker-report.json";
    link.click(); URL.revokeObjectURL(url);
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
      text: "Learn about circadian research and why a single marker cannot establish sleep needs.",
      customVisual: <SleepVisual />,
    },
    {
      title: "Fitness",
      text: "Explore muscle-biology research without assigning training plans or athletic potential.",
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
      title: "Eye pigmentation",
      text: "Explore an eye pigmentation research marker and the limits of single-marker associations.",
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
                      <span className="eyebrow">Explore your genotype file</span>

                      <h1>Understand the markers.<br />Understand the limits.</h1>
                      <p className="hero-text">Explore {markers.length.toLocaleString()} research markers in a raw DNA file, check data quality, and learn what the research does and does not establish.</p>
                      <p className="hero-subtext">Your DNA file is processed in this browser session. Start with a synthetic example to explore without uploading personal data.</p>

                      <div className="hero-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => setPage("upload")}
                        >
                          Start with DNA Upload
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={loadDemo}
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
                      <strong>{markers.length.toLocaleString()}</strong>
                      <span>research markers</span>
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
                      Follow the concept as it evolves. Get updates as the educational prototype develops.
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
                  <span className="eyebrow">How it works</span>
                  <h2>From a raw file to traceable marker observations</h2>
                </div>

                <div className="feature-band">
                  <div className="feature-band-card">
                    <span className="feature-kicker">Structured intake</span>
                    <h3>Upload raw consumer DNA data</h3>
                    <p>
                      Check supported SNP records and see which rows were skipped, duplicated, or uncalled.
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
                    <span className="feature-kicker">Research context</span>
                    <h3>Learn the limits of each observation</h3>
                    <p>
                      Separate what your file contains from what research can establish. Open the original marker records to learn more.
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
                      Try a synthetic example, inspect the expanded marker catalog, and download a concise record of the observations.
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
                      onClick={loadDemo}
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
                  Choose an uncompressed raw text export with rsID, chromosome, position, and genotype columns. Four-column and separate-allele five-column layouts are supported.
                </p>
              </div>

              <div className="upload-layout">
                <div className="upload-card">
                  <div className="upload-icon" aria-hidden="true">
                    ↑
                  </div>

                  <h3>Choose a raw DNA text file</h3>
                  <p className="upload-description">
                    TXT, TSV or CSV, up to 20 MB. ZIP, VCF, indels and haploid genotypes are not supported. Allele order is normalized; strand and genome build are not inferred.
                  </p>

                  <label className="file-input-wrap">
                    <input type="file" accept=".txt,.csv,.tsv" disabled={loading} onChange={upload} />
                    <span className="btn btn-primary">Choose File</span>
                  </label>

                  <div className="upload-meta">
                    <div className="meta-row">
                      <span className="meta-label">Current file</span>
                      <strong>{fileName}</strong>
                    </div>
                    <div className="status-box" role="status" aria-live="polite">{loading ? "Reading file locally…" : status}</div>
                    <div className="hero-actions">
                      {loading && <button className="btn btn-secondary" onClick={() => {cancelImport(); setStatus("Import cancelled. No data was loaded.");}}>Cancel import</button>}
                      <button className="btn btn-secondary" disabled={loading} onClick={loadDemo}>Try synthetic example</button>
                      {dataset && <button className="btn btn-primary" disabled={loading} onClick={() => setPage("report")}>View report</button>}
                      {dataset && <button className="btn btn-secondary" disabled={loading} onClick={resetData}>Clear data</button>}
                    </div>
                  </div>
                </div>

                <aside className="info-card">
                  <span className="eyebrow">What happens after upload</span>
                  <h3>Structured parsing, then simplified reporting</h3>

                  <ul className="info-list">
                    <li>Structured genotype markers are parsed locally in the browser.</li>
                    <li>Catalog markers are matched by rsID and shown with research context.</li>
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
                <span className="eyebrow">Marker observations</span>
                <h2>Your educational marker report</h2>
                <p>
                  Review the markers present in the loaded file. Single-marker observations do not establish personal traits.
                </p>
              </div>

              {!dataset ? <div className="info-card"><h3>No DNA data loaded</h3><p>Choose a file or use our clearly labeled synthetic example.</p><div className="hero-actions"><button className="btn btn-primary" onClick={() => setPage("upload")}>Choose file</button><button className="btn btn-secondary" onClick={loadDemo}>Try synthetic example</button></div></div> : <>
              <div className="quality-panel">
                <div><span className="eyebrow">{isDemo ? "SYNTHETIC EXAMPLE — NOT PERSONAL DNA" : "YOUR FILE"}</span><h3>{fileName}</h3></div>
                <div className="quality-grid">
                  <div><strong>{dataset.stats.uniqueMarkers.toLocaleString()}</strong><span>unique markers</span></div>
                  <div><strong>{report.filter(r => r.status === "Detected").length} / {markers.length.toLocaleString()}</strong><span>tracked markers detected</span></div>
                  <div><strong>{dataset.stats.malformed}</strong><span>rows skipped</span></div>
                  <div><strong>{dataset.stats.duplicates}</strong><span>duplicate rows</span></div>
                  <div><strong>{dataset.stats.conflicts}</strong><span>conflicting markers</span></div>
                  <div><strong>{dataset.stats.noCalls}</strong><span>no-call rows</span></div>
                </div>
                {dataset.metadata && <details className="file-details"><summary>File details and limitations</summary><dl><dt>Header label</dt><dd>{dataset.metadata.provider}</dd><dt>Declared genome build</dt><dd>{dataset.metadata.build}</dd><dt>Declared allele strand</dt><dd>{dataset.metadata.strand}</dd><dt>Detected layout</dt><dd>{dataset.metadata.layout}</dd></dl><ul>{dataset.metadata.warnings.map(w => <li key={w}>{w}</li>)}</ul></details>}
                <p>Only supported SNP rows are counted. Identical duplicates are combined; conflicting duplicates are excluded. Strand orientation and genome build are not verified. No personal phenotype predictions are generated.</p>
                <div className="hero-actions"><button className="btn btn-secondary" onClick={exportReport}>Download marker report</button><button className="btn btn-secondary" onClick={resetData}>Clear data</button></div>
              </div>
              <div className="category-coverage" aria-label="Marker coverage by research category">
                {categories.map(topic => {
                  const total = report.filter(m => m.categories.includes(topic));
                  const detected = total.filter(m => m.status === "Detected").length;
                  return <button key={topic} className={`coverage-card ${category === topic ? "selected" : ""}`} onClick={() => {setCategory(topic); setResultPage(0);}}><strong>{topic}</strong><span>{detected} / {total.length} markers detected</span></button>;
                })}
              </div>
              <div className="catalog-controls">
                <p>Catalog: {markers.length.toLocaleString()} markers. GWAS snapshot retrieved {catalogMetadata.retrievedAt.slice(0,10)}. This is a selected research catalog, not all known genetic variants. Study populations and methods vary; an association does not establish causation.</p>
                <div className="catalog-filters">
                  <label>Search markers<input type="search" value={query} placeholder="rsID, gene or research topic" onChange={e => {setQuery(e.target.value); setResultPage(0);}} /></label>
                  <label>Research category<select value={category} onChange={e => {setCategory(e.target.value); setResultPage(0);}}><option>All</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
                  <label>File status<select value={resultStatus} onChange={e => {setResultStatus(e.target.value); setResultPage(0);}}>{["All", "Detected", "Not found", "No call", "Conflicting rows"].map(c => <option key={c}>{c}</option>)}</select></label>
                </div>
                <p role="status" aria-live="polite">{filteredReport.length.toLocaleString()} matching markers · Page {activePage + 1} of {pageCount}</p>
              </div>
              {filteredReport.length === 0 && <div className="info-card">No markers match these filters. Try a different search or choose All.</div>}
              <div className="report-grid">
                {visibleReport.map((card) => (
                  <article className="report-card" key={card.rsid}>
                    <div className="report-card-top">
                      <h3>{card.title}</h3>
                      <span className="genotype-pill">{card.genotype}</span>
                    </div>

                    <div className="report-block">
                      <span className="report-label">{card.rsid} · {card.gene} · {card.status}</span>
                      <p>{card.interpretation}</p>
                    </div>

                    <div className="report-block">
                      <span className="report-label">File observation</span>
                      <p>{card.meaning}</p>
                    </div>

                    <div className="report-block">
                      <span className="report-label">Interpretation limits</span>
                      <p>{card.nextStep}</p>
                    </div>

                    {card.evidence?.length > 0 && <details className="marker-evidence"><summary>{card.evidence.length} catalog association{card.evidence.length === 1 ? "" : "s"}</summary><p>Association significance is not predictive accuracy. Read the study for participants, methods and limitations.</p><ul>{card.evidence.map(e => <li key={e.associationId}>{e.trait} · p = {e.pValue.toExponential()} · <a href={`https://www.ebi.ac.uk/gwas/studies/${e.study}`} target="_blank" rel="noreferrer">{e.study}</a> · <a href={`https://pubmed.ncbi.nlm.nih.gov/${e.pmid}/`} target="_blank" rel="noreferrer">Publication</a></li>)}</ul></details>}
                    <div className="report-tags">
                      <a href={`https://www.ncbi.nlm.nih.gov/snp/${card.rsid}`} target="_blank" rel="noreferrer">dbSNP record</a>
                      {card.paper && <a href={card.paper} target="_blank" rel="noreferrer">Research paper</a>}
                      {card.source && <a href={card.source} target="_blank" rel="noreferrer">GWAS Catalog</a>}
                      <span>{card.category}</span>
                      <span>Educational only</span>
                    </div>
                  </article>
                ))}
              </div>
              <div className="catalog-pagination"><button className="btn btn-secondary" disabled={activePage === 0} onClick={() => setResultPage(activePage - 1)}>Previous page</button><span>Page {activePage + 1} of {pageCount}</span><button className="btn btn-secondary" disabled={activePage + 1 >= pageCount} onClick={() => setResultPage(activePage + 1)}>Next page</button></div>
              </>}
            </div>
          </section>
        )}

        {page === "privacy" && (
          <section className="section">
            <div className="container narrow">
              <div className="section-heading">
                <span className="eyebrow">Your data and the evidence</span>
                <h2>Built to be informative, not diagnostic</h2>
              </div>

              <div className="privacy-card">
                <h3>Core principles</h3>
                <ul className="info-list">
                  <li>Educational marker observations only; no personal trait prediction.</li>
                  <li>No disease or allergy diagnosis.</li>
                  <li>No clinical claims or medical decision guidance.</li>
                  <li>DNA file contents are processed in memory in this browser, not sent to a server or saved in browser storage. Clear data or reload the page to remove them.</li>
                  <li>Downloaded reports contain genetic observations. Save them only where you intend to keep them.</li>
                  <li>The optional email waitlist sends your email to Formspree. DNA contents are not included. Hosting and external images may generate standard network requests.</li>
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