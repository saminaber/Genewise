export function readDNAFile(file, markerIds, signal) {
  return new Promise((resolve,reject) => {
    if (signal.aborted) { reject(new DOMException('Import cancelled','AbortError')); return; }
    const worker = new Worker(new URL('../workers/dna.worker.js',import.meta.url), {type:'module'});
    const finish = (callback,value) => { worker.terminate(); signal.removeEventListener('abort',abort); callback(value); };
    const abort = () => finish(reject,new DOMException('Import cancelled','AbortError'));
    signal.addEventListener('abort',abort,{once:true});
    worker.onmessage = ({data}) => data.error ? finish(reject,new Error(data.error)) : finish(resolve,data.result);
    worker.onerror = () => finish(reject,new Error('Unable to process this file. Try an uncompressed TXT or CSV export.'));
    worker.postMessage({file,markerIds});
  });
}
