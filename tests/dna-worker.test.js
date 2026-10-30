import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { MAX_FILE_BYTES } from '../src/lib/parser.js';

// Exercise the actual worker handler without a browser or personal genetic data.
const messages=[];
globalThis.self={postMessage:message=>messages.push(message)};
await import('../src/workers/dna.worker.js');
const fixture=readFileSync(new URL('./fixtures/synthetic-four-column.txt',import.meta.url));

test('worker accepts fixture bytes and returns only tracked genotypes', async () => {
  messages.length=0;
  await self.onmessage({data:{file:new File([fixture],'synthetic.txt'),markerIds:['rs762551']}});
  const {result,error}=messages[0];
  assert.equal(error,undefined);
  assert.equal(result.stats.uniqueMarkers,6);
  assert.deepEqual(result.rows.map(row=>row.rsid),['rs762551']);
  assert.equal(result.metadata.build,'GRCh37');
});
test('worker returns an archive error without any genotype result', async () => {
  messages.length=0;
  await self.onmessage({data:{file:new File([gzipSync(fixture)],'renamed.txt'),markerIds:['rs762551']}});
  assert.match(messages[0].error,/Extract the compressed archive/);
  assert.equal(messages[0].result,undefined);
});
test('worker checks file size before requesting file bytes', async () => {
  messages.length=0;let read=false;
  const file={size:MAX_FILE_BYTES+1,arrayBuffer(){read=true;throw new Error('must not read');}};
  await self.onmessage({data:{file,markerIds:[]}});
  assert.equal(read,false);
  assert.match(messages[0].error,/File too large/);
});
