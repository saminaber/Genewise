import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readDNAFile } from '../src/lib/file-reader.js';

// Control delivery order without reading, uploading or inventing personal DNA.
class FakeWorker {
  static instances = [];
  constructor() { FakeWorker.instances.push(this); this.terminations = 0; }
  postMessage(message) { this.request = message; }
  terminate() { this.terminations++; }
}
const originalWorker = globalThis.Worker;
beforeEach(() => { FakeWorker.instances = []; globalThis.Worker = FakeWorker; });
afterEach(() => {
  if (originalWorker === undefined) delete globalThis.Worker;
  else globalThis.Worker = originalWorker;
});
const file = new File(['synthetic fixture placeholder'], 'synthetic.txt');
const result = { rows: [], stats: { uniqueMarkers: 0 } };
function assertClean(worker) {
  assert.equal(worker.terminations, 1);
  assert.equal(worker.onmessage, null);
  assert.equal(worker.onerror, null);
  assert.equal(worker.onmessageerror, null);
}

test('already cancelled imports never start a worker', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(readDNAFile(file, [], controller.signal), { name: 'AbortError' });
  assert.equal(FakeWorker.instances.length, 0);
});

test('successful imports release handlers and ignore later aborts or queued errors', async () => {
  const controller = new AbortController();
  const pending = readDNAFile(file, ['rs762551'], controller.signal);
  const worker = FakeWorker.instances[0];
  const queuedError = worker.onerror;
  assert.deepEqual(worker.request, { file, markerIds: ['rs762551'] });
  worker.onmessage({ data: { result } });
  assert.equal(await pending, result);
  controller.abort();
  queuedError();
  assertClean(worker);
});

test('cancellation rejects once and ignores a queued result', async () => {
  const controller = new AbortController();
  const pending = readDNAFile(file, [], controller.signal);
  const rejected = assert.rejects(pending, { name: 'AbortError' });
  const worker = FakeWorker.instances[0];
  const queuedResult = worker.onmessage;
  controller.abort();
  queuedResult({ data: { result } });
  await rejected;
  assertClean(worker);
});

test('a cancelled import cannot supply results to its replacement', async () => {
  const oldController = new AbortController();
  const oldImport = readDNAFile(file, [], oldController.signal);
  const rejected = assert.rejects(oldImport, { name: 'AbortError' });
  const oldWorker = FakeWorker.instances[0];
  const queuedOldResult = oldWorker.onmessage;
  oldController.abort();
  const nextImport = readDNAFile(file, [], new AbortController().signal);
  const nextWorker = FakeWorker.instances[1];
  queuedOldResult({ data: { result: { stale: true } } });
  nextWorker.onmessage({ data: { result } });
  assert.equal(await nextImport, result);
  await rejected;
  assertClean(oldWorker);
  assertClean(nextWorker);
});

test('worker validation errors retain their actionable message and clean up', async () => {
  const pending = readDNAFile(file, [], new AbortController().signal);
  const worker = FakeWorker.instances[0];
  worker.onmessage({ data: { error: 'Extract the compressed archive first.' } });
  await assert.rejects(pending, /Extract the compressed archive/);
  assertClean(worker);
});

for (const event of ['onerror', 'onmessageerror']) {
  test(`${event} rejects instead of leaving the import pending`, async () => {
    const pending = readDNAFile(file, [], new AbortController().signal);
    const worker = FakeWorker.instances[0];
    worker[event]();
    await assert.rejects(pending, /Unable to process this file/);
    assertClean(worker);
  });
}

for (const stage of ['constructor', 'postMessage']) {
  test(`${stage} failures reject with guidance and release any worker`, async () => {
    globalThis.Worker = class extends FakeWorker {
      constructor() {
        if (stage === 'constructor') throw new Error('internal startup detail');
        super();
      }
      postMessage() { throw new Error('internal transfer detail'); }
    };
    const controller = new AbortController();
    await assert.rejects(readDNAFile(file, [], controller.signal), /Unable to process this file/);
    controller.abort();
    if (stage === 'constructor') assert.equal(FakeWorker.instances.length, 0);
    else assertClean(FakeWorker.instances[0]);
  });
}
