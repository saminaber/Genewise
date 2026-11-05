import { parseDNA, MAX_FILE_BYTES } from '../lib/parser.js';
import { decodeDNABytes } from '../lib/file-decoder.js';
self.onmessage = async ({data}) => {
  try {
    if (data.file.size > MAX_FILE_BYTES) throw new Error('File too large. Choose an uncompressed text file under 20 MB.');
    const parsed = parseDNA(decodeDNABytes(await data.file.arrayBuffer()));
    const tracked = new Set(data.markerIds);
    // Only tracked rows leave this worker. Full raw genotypes are discarded on termination.
    parsed.rows = parsed.rows.filter(row => tracked.has(row.rsid));
    self.postMessage({result:parsed});
  } catch (error) { self.postMessage({error:error.message || 'Unable to parse this file.'}); }
};
