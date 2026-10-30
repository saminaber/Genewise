import { parseDNA } from '../lib/parser.js';
self.onmessage = async ({data}) => {
  try {
    const parsed = parseDNA(await data.file.text());
    const tracked = new Set(data.markerIds);
    // Only tracked rows leave this worker. Full raw genotypes are discarded on termination.
    parsed.rows = parsed.rows.filter(row => tracked.has(row.rsid));
    self.postMessage({result:parsed});
  } catch (error) { self.postMessage({error:error.message || 'Unable to parse this file.'}); }
};
