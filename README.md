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

Uncompressed TXT, TSV, whitespace-separated or single-line quoted CSV files under 20 MiB:

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

TSV fields are separated by literal tabs, preserving empty fields and trailing empty genotype columns as no-calls. Missing chromosome or position fields remain invalid instead of shifting later fields into their places. Space-separated files still allow repeated spaces. A tab cannot also be used as cosmetic indentation; tabs define columns. Synthetic empty-field coverage is in `tests/fixtures/synthetic-empty-fields.tsv`.

Unsupported: ZIP, VCF, sequencing reads, indels, structural variants, haploid genotypes, multiline CSV fields, ancestry inference, clinical interpretation, genome-build conversion and strand harmonization. The 20 MiB limit bounds browser memory; parsing runs in a dedicated browser worker, which is terminated after completion or cancellation.

## Architecture

- `src/lib/parser.js`: format validation, declared header metadata, deduplication and quality accounting.
- `src/lib/dna.js`: marker metadata and indexed report construction.
- `src/lib/file-reader.js` and `src/workers/dna.worker.js`: cancellable background parsing; only tracked marker rows return to the UI.
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

The current catalog has 686 unique markers across eight research categories. It combines 669 unique GWAS Catalog markers (749 recorded associations), the original educational markers and targeted primary-literature references. Overlapping rsIDs are merged; markers may appear in multiple categories. These are research references, not 686 validated personal findings.

| Category | Catalog markers |
| --- | ---: |
| Caffeine | 19 |
| Nutrition | 140 |
| Sleep | 91 |
| Activity | 105 |
| Pigmentation | 258 |
| Taste | 9 |
| Body measurements | 57 |
| Hair | 10 |

Source: NHGRI-EBI GWAS Catalog API v2, bounded snapshots retrieved 2026-10-29 to 2026-10-30 UTC. Each query requests up to the first 200 associations, retaining single-rsID, non-interaction associations with p <= 5e-8 and publication IDs. Original and targeted literature references use different inclusion criteria and are not claimed to meet that threshold. The catalog is not a complete variant database and does not calculate disease risks, personal trait predictions or genotype-directed treatment recommendations.

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


## Publication-filtered expansion

`scripts/import-studies.py` merges GWAS Catalog records filtered to four verified primary publications: PMID 30846698 (sleep duration), 32059762 (vitamin D), 25288136 (coffee consumption), and 30223776 (bitter taste). It verifies the publication ID on every record, applies the single-marker and p-value filters, and deduplicates association IDs. `data/catalog-provenance.json` retains request URLs and returned/accepted counts. Use `python3 scripts/import-studies.py --fetch` to retrieve these public study records; without `--fetch`, the script uses locally cached responses. A missing cache is explicitly recorded, not treated as evidence that the study has no associations.

## Upload workflow

Header comments can declare a provider label, GRCh37/GRCh38 build and forward/reverse allele strand. These are reported as unverified file declarations. Multiple builds or strand directions produce warnings; no reference coordinate conversion or allele complementation occurs. Unknown metadata remains Unknown even when a provider name is present. Strict single-line CSV parsing preserves empty no-call fields and rejects malformed quotes. VCF and recognizable archive signatures receive explicit error messages.

File text stays in a dedicated worker. The worker retains only tracked marker rows in its returned result and is terminated after completion or cancellation; the main thread keeps overall quality counts plus those tracked rows. Clearing data, loading the demo or selecting a replacement file cancels an outstanding import. JSON export includes header metadata alongside quality counts. The app does not claim secure memory erasure by the browser.

Worker startup, message-transfer and message-decoding failures reject the import with guidance instead of leaving it pending. Every completion path removes event handlers and releases the worker; queued events after cancellation are ignored. `tests/file-reader.test.js` controls worker event order to cover cancellation, replacement imports and failure cleanup using synthetic placeholders. These lifecycle tests complement the actual-worker parsing tests; they do not simulate the React interface or certify every browser.

Synthetic fixtures in `tests/fixtures/` cover four-column, quoted five-column, and unsupported VCF inputs. The four-column fixture was also imported through the browser worker and its metadata/report checked visually. These fixtures are fabricated test records, not genetic data from a person.

Input-format references:
- https://int.customercare.23andme.com/hc/en-us/articles/215983947-Raw-Genotype-Data-Technical-Details
- https://help.ancestry.com/hc/en-us/articles/53933317283603-Downloading-DNA-Data

This establishes support for the documented layouts using synthetic fixtures, not certification of every vendor version or validation of an individual DNA file.


## Byte validation before parsing

The upload worker inspects original file bytes before decoding. ZIP and gzip signatures receive extraction guidance, including when an archive has been renamed to `.txt`. Empty files, uploads over the 20 MiB limit, UTF-16 BOMs, invalid UTF-8 and NUL-containing binary data are rejected with specific messages. UTF-8 text and its optional BOM remain supported.

The worker checks file size before reading its contents. It then uses `src/lib/file-decoder.js` for byte validation and strict decoding before invoking the SNP parser. Tests exercise real gzip-compressed synthetic data, ZIP signatures, malformed encodings and the actual worker handler; successful worker responses still contain only tracked marker rows.
