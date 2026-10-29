# GeneWise

An educational consumer-genetics prototype by Sami Naber. React, Vite and JavaScript. The current revision focuses on inspecting genotype-file quality and making marker observations traceable, rather than predicting personal health or wellness traits.

## Run locally

Requires a current Node.js LTS release.

```sh
npm ci
npm run dev
npm test
npm run build
```

## Reproducible demo

Choose **Explore Sample Report** on the home page or **Try synthetic example** on the upload page. The six-row fixture is synthetic and clearly labeled. Real DNA is not required. `mock_dna_sample.txt` contains the same synthetic records.

## Supported input

Uncompressed TXT, TSV, whitespace-separated or simple CSV files under 20 MiB:

```text
# rsid chromosome position genotype
rs762551 15 75041917 AC
```

Separate allele columns are supported too:

```text
rsid,chromosome,position,allele1,allele2
rs4988235,2,136608646,C,T
```

The parser skips blank/comment/header lines, checks rsIDs, chromosome identifiers and positive integer coordinates, and accepts diploid A/C/G/T SNP genotypes. It normalizes case and allele order without reverse-complementing or guessing strand. Missing calls such as `--` are retained separately. Repeated identical records are combined; duplicate markers with inconsistent coordinates or genotypes are flagged and excluded from observations. Quality totals expose skipped rows, no-call rows, duplicates and conflicts. Unique markers include uncalled/conflicted records, so the tracked-marker detection count is shown separately.

Unsupported: ZIP, VCF, sequencing reads, indels, structural variants, haploid genotypes, full quoted CSV grammar, ancestry inference, clinical interpretation, genome-build conversion and strand harmonization. The 20 MiB limit bounds browser memory; parsing currently runs on the main thread.

## Architecture

- `src/lib/dna.js`: pure parser, quality accounting, marker metadata and indexed report construction.
- `src/App.jsx`: file lifecycle, explicit synthetic demo, report and JSON export.
- `tests/dna.test.js`: Node built-in regression tests; no real personal genetic data.

The report scans the expanded marker catalog and distinguishes detected, absent, uncalled and conflicted records. Each card links to the corresponding NCBI dbSNP record. Selected cards also link to original research. These links are learning resources, not evidence that a personal interpretation has been validated. GeneWise does not verify strand or genome build and therefore does not map allele pairs to predicted phenotypes. A marker being absent is not a negative result.

## Scientific scope

The earlier prototype made simplified genotype-to-wellness statements that were not sufficiently validated. This revision removes those personal predictions. In particular, rs12913832 is presented in eye-pigmentation research context rather than as a skin-sensitivity test. Future interpretation rules need documented allele orientation, genome build, primary evidence, population limitations and independent validation before being enabled.

Example primary literature:
- Lactase persistence variants: https://pubmed.ncbi.nlm.nih.gov/29063188/
- HERC2/OCA2 and eye pigmentation: https://pubmed.ncbi.nlm.nih.gov/18252222/

## Privacy

DNA file contents are processed in browser memory, not posted to a server or stored in localStorage. Clear data or reload to remove the in-app dataset. A user-requested JSON download contains catalog marker observations and quality counts, not the full uploaded genotype file. The downloaded copy remains on the user's device.

The optional waitlist posts email to the existing Formspree endpoint. External images and hosting can receive ordinary page requests. Local DNA processing does not imply that the whole site makes no network requests.

## Deployment status

This source update is prepared for review on the `codex/expand-marker-catalog` branch. The existing Vercel deployment has not been verified for this revision and may still run older code. Publishing requires merging the update and a successful deployment.


## Expanded marker catalog

The current catalog has 465 unique markers across eight research categories. It combines 446 unique GWAS Catalog markers (514 recorded associations), the original educational markers and targeted primary-literature references. Overlapping rsIDs are merged; markers may appear in multiple categories. These are research references, not 465 validated personal findings.

| Category | Catalog markers |
| --- | ---: |
| Caffeine | 19 |
| Nutrition | 6 |
| Sleep | 7 |
| Activity | 105 |
| Pigmentation | 258 |
| Taste | 4 |
| Body measurements | 57 |
| Hair | 10 |

Source: NHGRI-EBI GWAS Catalog API v2, bounded snapshots retrieved 2026-10-29. Each query requests up to the first 200 associations, retaining single-rsID, non-interaction associations with p <= 5e-8 and publication IDs. Original and targeted literature references use different inclusion criteria and are not claimed to meet that threshold. The catalog is not a complete variant database and does not calculate disease risks, personal trait predictions or genotype-directed treatment recommendations.

- `data/catalog-provenance.json`: query URLs, source counts, retrieval date and warnings for unavailable requests.
- `src/lib/catalog.js`: imported associations, study IDs, PubMed IDs, mapped genes and reported traits.
- `src/lib/curated-markers.js`: targeted references for vitamin D, taste, caffeine, circadian biology and exercise physiology.

The public API timed out during this update. Only successfully retrieved records were added; existing evidence was preserved. Some exact trait queries returned no eligible associations. Unavailable queries are recorded explicitly. Marker count and statistical significance do not establish predictive accuracy, causality, clinical usefulness or coverage on consumer arrays.

Refresh intentionally, review the generated diff, then rerun checks:

```sh
python3 scripts/refresh-markers.py
npm test
npm run build
```

For a network-free rebuild from the existing snapshot and locally cached responses:

```sh
python3 scripts/refresh-markers.py --offline
```

The refresh fetches public reference data only, never personal genotypes. It uses three concurrent requests and a one-day local cache. Failed requests do not discard prior evidence. This refresh merges records; it does not automatically prune old or retracted associations. Review upstream changes before publication. A later run can produce a different count as upstream curation changes.

Reports include per-category detection coverage, text search, category/status filters, 12-card pagination and expandable association sources. Export includes the entire catalog report regardless of active display filters. The six-row synthetic example is deliberately partial coverage, not a claim that every catalog marker is present.
