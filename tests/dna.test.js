import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDNA, normalizeGenotype, buildReport, demoFile, markers, filterReport, catalogMetadata } from '../src/lib/dna.js';
test('normalizes allele order without strand guessing', () => {
 assert.equal(normalizeGenotype('ca'), 'AC'); assert.equal(normalizeGenotype('C/T'), 'CT');
 assert.equal(normalizeGenotype('--'), null); assert.equal(normalizeGenotype('ID'), undefined);
});
test('supports BOM, comments, CRLF, headers and two allele columns', () => {
 const result = parseDNA('\uFEFF# export\r\nrsid,chromosome,position,allele1,allele2\r\nrs4988235,2,136608646,T,C');
 assert.equal(result.rows[0].genotype, 'CT'); assert.equal(result.stats.validRows, 1);
});
test('rejects malformed records and preserves no calls', () => {
 const { rows, stats } = parseDNA('rs1 1 10 --\nrs2 99 20 AA\nrs3 1 -1 CC\nrs4 1 4 BAD\nnot DNA');
 assert.equal(rows.length, 1); assert.equal(stats.noCalls, 1); assert.equal(stats.malformed, 4);
});
test('deduplicates allele order; excludes conflicting duplicate genotypes', () => {
 const { rows, stats } = parseDNA('rs762551 15 10 AC\nrs762551 15 10 CA\nrs762551 15 10 CC');
 assert.equal(rows.length, 1); assert.equal(stats.duplicates, 2); assert.equal(stats.conflicts, 1);
 assert.equal(buildReport(rows)[0].status, 'Conflicting rows');
});
test('does not conflate absent markers with uncalled or conflicting data', () => {
 const report = buildReport(parseDNA('rs762551 15 10 --').rows);
 assert.equal(report[0].status, 'No call'); assert.equal(report[1].status, 'Not found');
});
test('synthetic sample is clearly partial coverage of the expanded catalog', () => {
 const report = buildReport(parseDNA(demoFile).rows);
 assert.equal(report.length, markers.length); assert.equal(report.filter(r => r.status === 'Detected').length, 6); assert.ok(report.some(r => r.status === 'Not found'));
});
test('empty and unrelated files never produce genotype observations', () => {
 assert.equal(parseDNA('').rows.length, 0);
 assert.ok(buildReport(parseDNA('hello world').rows).every(r => r.status === 'Not found'));
});

test('catalog IDs are unique and imported evidence is traceable', () => {
 assert.ok(markers.length > 100);
 assert.equal(new Set(markers.map(m => m.rsid)).size, markers.length);
 for (const marker of markers) {
  assert.match(marker.rsid, /^rs\d+$/);
  assert.ok(marker.categories.length);
  for (const evidence of marker.evidence ?? []) {
   assert.ok(evidence.pValue > 0 && evidence.pValue <= 5e-8);
   assert.match(evidence.pmid, /^\d+$/);
   assert.match(evidence.study, /^GCST/);
  }
 }
 assert.ok(catalogMetadata.markerCount > 100);
});
test('search and combined category/status filters work on the entire catalog', () => {
 const report = buildReport(parseDNA(demoFile).rows);
 const byId = filterReport(report, {query: 'RS762551', status: 'Detected'});
 assert.equal(byId.length, 1); assert.equal(byId[0].rsid, 'rs762551');
 assert.ok(filterReport(report, {category:'Pigmentation'}).every(m => m.categories.includes('Pigmentation')));
 assert.equal(filterReport(report, {query:'definitely-no-matching-marker'}).length, 0);
 assert.ok(filterReport(report, {status:'Not found'}).every(m => m.status === 'Not found'));
});

test('targeted categories include traceable literature references', () => {
 for (const category of ['Nutrition','Taste','Sleep','Caffeine']) {
  const entries = markers.filter(m => m.categories.includes(category));
  assert.ok(entries.length >= 4);
  assert.ok(entries.some(m => /^https:\/\/(pubmed|pmc)\.ncbi\.nlm\.nih\.gov\//.test(m.paper ?? '')));
 }
});

test('file header metadata is reported as declared, never inferred from provider', () => {
 const r = parseDNA('# AncestryDNA raw data\n# build 37\n# forward strand\nrs762551 15 75041917 AC');
 assert.equal(r.metadata.provider,'AncestryDNA header');
 assert.equal(r.metadata.build,'GRCh37'); assert.equal(r.metadata.strand,'Forward (+)');
 assert.equal(parseDNA('# 23andMe\nrs1 1 1 AA').metadata.build,'Unknown');
});
test('ambiguous header builds and reverse strand are visible, not harmonized', () => {
 const r=parseDNA('# build 37; build 38\n# reverse strand\nrs1 1 1 AC');
 assert.equal(r.metadata.build,'Conflicting header values');
 assert.equal(r.metadata.strand,'Reverse (-)'); assert.equal(r.rows[0].genotype,'AC');
 assert.ok(r.metadata.warnings.some(w=>w.includes('not complemented')));
});
test('quoted CSV preserves empty no-call columns and rejects broken quotes', () => {
 assert.equal(parseDNA('"rs1","1","1",""').rows[0].genotype,null);
 assert.equal(parseDNA('"rs1","1","1","AC"junk').stats.malformed,1);
 assert.equal(parseDNA('"rs1","1","1","AC').stats.malformed,1);
});
test('VCF, archives and unsafe integer coordinates are rejected explicitly', () => {
 assert.throws(()=>parseDNA('##fileformat=VCFv4.2\n#CHROM POS'),/VCF/);
 assert.throws(()=>parseDNA('PK\u0003\u0004zip'),/Extract/);
 assert.equal(parseDNA('rs1 1 9007199254740993 AA').stats.malformed,1);
});

import { readFileSync } from 'node:fs';
test('consumer-layout fixtures preserve quality counts and declared metadata', () => {
 const four=parseDNA(readFileSync(new URL('./fixtures/synthetic-four-column.txt',import.meta.url),'utf8'));
 const five=parseDNA(readFileSync(new URL('./fixtures/synthetic-five-column.csv',import.meta.url),'utf8'));
 assert.equal(four.stats.uniqueMarkers,6); assert.equal(four.stats.noCalls,1);
 assert.equal(five.stats.uniqueMarkers,4); assert.equal(five.stats.noCalls,1);
 assert.equal(five.metadata.layout,'Five columns (separate alleles)');
 assert.equal(five.metadata.build,'GRCh37');
 assert.throws(()=>parseDNA(readFileSync(new URL('./fixtures/unsupported-vcf.txt',import.meta.url),'utf8')),/VCF/);
});
test('publication-filtered imports retain matching, traceable records', () => {
 for (const source of catalogMetadata.studyImports) {
  if (source.warning) continue;
  const evidence=markers.flatMap(m=>m.evidence??[]).filter(e=>e.pmid===source.pubmedId);
  assert.ok(evidence.length>0);
  assert.ok(evidence.every(e=>e.pValue>0 && e.pValue<=5e-8));
 }
});
