export const MAX_FILE_BYTES = 20 * 1024 * 1024;
const noCalls = new Set(['--', '00', 'NN', 'N', 'NA', 'N/A', '.', './.', '']);
export function normalizeGenotype(value) {
  const raw = String(value).trim().toUpperCase();
  if (noCalls.has(raw)) return null;
  const alleles = raw.replace(/[|/]/g, '');
  if (!/^[ACGT]{2}$/.test(alleles)) return undefined;
  return alleles.split('').sort().join('');
}

// Single-line CSV only; malformed quotes are rejected, not silently stripped.
export function splitRecord(line) {
  if (!line.includes(',')) return line.trim().split(/\s+/);
  const fields = []; let field = ''; let quoted = false; let closed = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else field += char;
    } else if (char === ',') { fields.push(field.trim()); field = ''; closed = false; }
    else if (char === '"') {
      if (field.trim() || closed) return null;
      quoted = true;
    } else {
      if (closed && char.trim()) return null;
      field += char;
    }
  }
  if (quoted) return null;
  fields.push(field.trim()); return fields;
}

export function parseDNA(text) {
  const records = new Map();
  const stats = { dataLines: 0, validRows: 0, malformed: 0, duplicates: 0, conflicts: 0, noCalls: 0, uniqueMarkers: 0 };
  const metadata = { provider: 'Unknown', build: 'Unknown', strand: 'Unknown', layout: 'Unknown', warnings: [] };
  const builds = new Set(); const strands = new Set(); const layouts = new Set();
  const raw = String(text).replace(/^\uFEFF/, '');
  if (/^\s*##fileformat=VCF/i.test(raw)) throw new Error('VCF files are not supported. Choose a consumer raw SNP text export.');
  if (raw.startsWith('PK\u0003\u0004') || raw.startsWith('\u001f\u008b')) throw new Error('Extract the compressed archive first, then choose the TXT or CSV file inside.');
  for (const line of raw.split(/\r\n|\n|\r/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) {
      if (/23andme/i.test(trimmed)) metadata.provider = '23andMe header';
      if (/ancestrydna/i.test(trimmed)) metadata.provider = 'AncestryDNA header';
      if (/myheritage/i.test(trimmed)) metadata.provider = 'MyHeritage header';
      for (const match of trimmed.matchAll(/(?:GRCh\s*|build\s*|hg)(37|38|19)\b/gi)) builds.add(match[1] === '19' ? 'GRCh37' : `GRCh${match[1]}`);
      if (/\b(?:plus|forward)\s*(?:\(\+\))?\s*strand\b|\bstrand\s*[:=]\s*(?:plus|forward|\+)/i.test(trimmed)) strands.add('Forward (+)');
      if (/\b(?:minus|reverse)\s*(?:\(-\))?\s*strand\b|\bstrand\s*[:=]\s*(?:minus|reverse|-)/i.test(trimmed)) strands.add('Reverse (-)');
      continue;
    }
    const parts = splitRecord(trimmed);
    if (parts && /^(rsid|snp|snp_id)$/i.test(parts[0])) continue;
    stats.dataLines++;
    if (!parts || ![4, 5].includes(parts.length) || !/^rs\d+$/i.test(parts[0]) ||
        !/^(?:[1-9]|1\d|2[0-2]|X|Y|XY|MT|M|2[3-6])$/i.test(parts[1]) ||
        !/^\d+$/.test(parts[2]) || !Number.isSafeInteger(Number(parts[2])) || Number(parts[2]) < 1) {
      stats.malformed++; continue;
    }
    const genotype = normalizeGenotype(parts.length === 5 ? parts[3] + parts[4] : parts[3]);
    if (genotype === undefined) { stats.malformed++; continue; }
    layouts.add(parts.length === 5 ? 'Five columns (separate alleles)' : 'Four columns (combined genotype)');
    stats.validRows++;
    if (genotype === null) stats.noCalls++;
    const rsid = parts[0].toLowerCase();
    const row = { rsid, chromosome: parts[1].toUpperCase(), position: Number(parts[2]), genotype, conflict: false };
    if (records.has(rsid)) {
      stats.duplicates++;
      const previous = records.get(rsid);
      if (!previous.conflict && (previous.genotype !== genotype || previous.chromosome !== row.chromosome || previous.position !== row.position)) {
        previous.conflict = true; previous.genotype = null; stats.conflicts++;
      }
    } else records.set(rsid, row);
  }
  stats.uniqueMarkers = records.size;
  metadata.build = builds.size === 1 ? [...builds][0] : builds.size > 1 ? 'Conflicting header values' : 'Unknown';
  metadata.strand = strands.size === 1 ? [...strands][0] : strands.size > 1 ? 'Conflicting header values' : 'Unknown';
  metadata.layout = layouts.size === 1 ? [...layouts][0] : layouts.size > 1 ? 'Mixed layouts' : 'Unknown';
  if (builds.size !== 1) metadata.warnings.push(builds.size > 1 ? 'Multiple genome builds are mentioned in the header; no build was selected.' : 'No unambiguous genome build was declared in the header.');
  if (strands.size !== 1) metadata.warnings.push(strands.size > 1 ? 'Multiple strand orientations are declared in the header.' : 'Strand orientation was not declared in the header.');
  if (strands.has('Reverse (-)')) metadata.warnings.push('Reverse-strand alleles are displayed as supplied; they are not complemented or interpreted.');
  metadata.warnings.push('Header labels are file declarations, not independent verification. No coordinate conversion or allele harmonization is performed.');
  return { rows: [...records.values()], stats, metadata };
}
