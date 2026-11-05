import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDNA, demoFile, markers, buildReport } from '../src/lib/dna.js';
import { buildReportExport } from '../src/lib/report-export.js';

function download(dataset, isDemo) {
  return JSON.parse(JSON.stringify(buildReportExport(dataset, isDemo)));
}

test('download retains study evidence and educational explanations for every catalog marker', () => {
  const dataset = parseDNA(demoFile);
  const exported = download(dataset, true);
  const report = buildReport(dataset.rows);
  assert.equal(exported.version, 3);
  assert.equal(exported.source, 'synthetic example');
  assert.equal(exported.markers.length, markers.length);
  for (const marker of report) {
    const saved = exported.markers.find(row => row.rsid === marker.rsid);
    assert.deepEqual(saved.evidence, marker.evidence);
    assert.deepEqual(saved.categories, marker.categories);
    assert.equal(saved.paper, marker.paper);
    assert.equal(saved.source, marker.source);
    assert.equal(saved.evidenceKind, marker.evidenceKind);
    assert.equal(saved.interpretation, marker.interpretation);
    assert.equal(saved.meaning, marker.meaning);
    assert.equal(saved.nextStep, marker.nextStep);
  }
  assert.ok(exported.markers.some(row => row.evidence?.some(e => e.study && e.pmid && e.associationId)));
  assert.match(exported.limitations, /Population associations/);
});

test('download preserves no-call, conflict and absent statuses with declared metadata', () => {
  const dataset = parseDNA('# build 38\n# reverse strand\nrs762551 15 10 --\nrs4988235 2 20 AC\nrs4988235 2 20 CC');
  const exported = download(dataset);
  assert.equal(exported.source, 'user file');
  assert.deepEqual(exported.quality, dataset.stats);
  assert.deepEqual(exported.fileMetadata, dataset.metadata);
  assert.equal(exported.fileMetadata.build, 'GRCh38');
  assert.equal(exported.fileMetadata.strand, 'Reverse (-)');
  assert.equal(exported.markers.find(row => row.rsid === 'rs762551').status, 'No call');
  assert.equal(exported.markers.find(row => row.rsid === 'rs4988235').status, 'Conflicting rows');
  assert.ok(exported.markers.some(row => row.status === 'Not found'));
});

test('download excludes untracked genotypes and input filenames while keeping quality totals', () => {
  const dataset = parseDNA(`${demoFile}\nrs999999999999 1 123 AA`);
  dataset.fileName = 'synthetic-private-name.txt';
  dataset.rawText = 'synthetic-only-private-content';
  const exported = download(dataset);
  const serialized = JSON.stringify(exported);
  assert.equal(exported.quality.uniqueMarkers, 7);
  assert.equal(exported.markers.filter(row => row.status === 'Detected').length, 6);
  assert.ok(!serialized.includes('rs999999999999'));
  assert.ok(!serialized.includes(dataset.fileName));
  assert.ok(!serialized.includes(dataset.rawText));
  assert.equal(exported.rows, undefined);
});
