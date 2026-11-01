export function readDNAFile(file, markerIds, signal) {
  return new Promise((resolve,reject) => {
    if (signal.aborted) { reject(new DOMException('Import cancelled','AbortError')); return; }
    let worker;
    let settled = false;
    const finish = (callback,value) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort',abort);
      if (worker) {
        worker.onmessage = worker.onerror = worker.onmessageerror = null;
        worker.terminate();
      }
      callback(value);
    };
    const abort = () => finish(reject,new DOMException('Import cancelled','AbortError'));
    const fail = () => finish(reject,new Error('Unable to process this file. Try an uncompressed TXT or CSV export.'));
    try {
      worker = new Worker(new URL('../workers/dna.worker.js',import.meta.url), {type:'module'});
      signal.addEventListener('abort',abort,{once:true});
      worker.onmessage = ({data}) => data.error ? finish(reject,new Error(data.error)) : finish(resolve,data.result);
      worker.onerror = worker.onmessageerror = fail;
      worker.postMessage({file,markerIds});
    } catch {
      fail();
    }
  });
}
