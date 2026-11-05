import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { decodeDNABytes } from '../src/lib/file-decoder.js';
import { MAX_FILE_BYTES, parseDNA } from '../src/lib/parser.js';

const fixture = readFileSync(new URL('./fixtures/synthetic-four-column.txt',import.meta.url));

test('raw fixture bytes and UTF-8 BOM preserve SNP records', () => {
  assert.equal(parseDNA(decodeDNABytes(fixture)).stats.uniqueMarkers,6);
  assert.equal(parseDNA(decodeDNABytes(Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),fixture]))).stats.uniqueMarkers,6);
});
test('real gzip bytes receive archive guidance before lossy text decoding', () => {
  const compressed=gzipSync(fixture);
  assert.ok(new TextDecoder().decode(compressed).includes('\ufffd'));
  assert.throws(()=>decodeDNABytes(compressed),/Extract the compressed archive/);
});
test('ZIP local, empty and spanning signatures receive archive guidance', () => {
  for (const ending of [[3,4],[5,6],[7,8]]) {
    assert.throws(()=>decodeDNABytes(Uint8Array.from([0x50,0x4b,...ending,0,0])),/Extract the compressed archive/);
  }
});
test('invalid UTF-8, UTF-16 and NUL data are rejected rather than repaired', () => {
  assert.throws(()=>decodeDNABytes(Uint8Array.from([0xc3,0x28])),/not valid UTF-8/);
  assert.throws(()=>decodeDNABytes(Uint8Array.from([0xff,0xfe,0x41,0])),/UTF-16/);
  assert.throws(()=>decodeDNABytes(new TextEncoder().encode('rs1 1 1 AA\u0000')),/binary data/);
});
test('empty and oversized byte buffers fail with actionable errors', () => {
  assert.throws(()=>decodeDNABytes(new Uint8Array()),/empty/);
  assert.throws(()=>decodeDNABytes(new Uint8Array(MAX_FILE_BYTES+1)),/File too large/);
});
