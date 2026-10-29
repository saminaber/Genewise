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
