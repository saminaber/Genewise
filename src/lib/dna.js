import { curatedMarkers } from './curated-markers.js';
import { catalog, catalogMetadata } from './catalog.js';
export { catalogMetadata };
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const demoFile = `# GeneWise synthetic example; not a person's DNA
# rsid chromosome position genotype
rs762551 15 75041917 AC
rs4988235 2 136608646 CT
rs1801260 4 56307853 TT
rs1815739 11 66560624 CT
rs12913832 15 28365618 AG
rs174537 11 61571478 GG`;

const noCalls = new Set(['--', '00', 'NN', 'N', 'NA', 'N/A', '.', './.', '']);
export function normalizeGenotype(value) {
  const raw = String(value).trim().toUpperCase();
  if (noCalls.has(raw)) return null;
  const alleles = raw.replace(/[|/]/g, '');
  if (!/^[ACGT]{2}$/.test(alleles)) return undefined;
  // Normalize allele order only. Never infer strand or complement alleles.
  return alleles.split('').sort().join('');
}

export function parseDNA(text) {
  const records = new Map();
  const stats = { dataLines: 0, validRows: 0, malformed: 0, duplicates: 0, conflicts: 0, noCalls: 0, uniqueMarkers: 0 };
  for (const line of String(text).replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.replace(/"/g, '').split(/[\s,]+/);
    if (/^(rsid|snp|snp_id)$/i.test(parts[0])) continue;
    stats.dataLines++;
    if (![4, 5].includes(parts.length) || !/^rs\d+$/i.test(parts[0]) ||
        !/^(?:[1-9]|1\d|2[0-2]|X|Y|XY|MT|M|2[3-6])$/i.test(parts[1]) ||
        !/^\d+$/.test(parts[2]) || Number(parts[2]) < 1) {
      stats.malformed++; continue;
    }
    const genotype = normalizeGenotype(parts.length === 5 ? parts[3] + parts[4] : parts[3]);
    if (genotype === undefined) { stats.malformed++; continue; }
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
  return { rows: [...records.values()], stats };
}

const originalMarkers = [
  { rsid: 'rs762551', title: 'Caffeine research', gene: 'CYP1A2', context: 'A marker studied in relation to CYP1A2 activity and caffeine metabolism. Caffeine response also depends on habits, medications, and other factors.' },
  { rsid: 'rs4988235', title: 'Lactase persistence', gene: 'MCM6 / LCT region', context: 'A regulatory marker studied in adult lactase persistence. Other variants also contribute, and this marker alone cannot establish whether someone experiences lactose intolerance.', paper: 'https://pubmed.ncbi.nlm.nih.gov/29063188/' },
  { rsid: 'rs1801260', title: 'Circadian research', gene: 'CLOCK', context: 'A marker investigated in circadian biology. GeneWise does not infer sleep schedules or recovery needs from this single marker.' },
  { rsid: 'rs1815739', title: 'Muscle biology', gene: 'ACTN3', context: 'A coding variant studied in muscle biology and athletic populations. A single marker does not determine athletic ability or an appropriate training plan.' },
  { rsid: 'rs12913832', title: 'Eye pigmentation', gene: 'HERC2 / OCA2 region', context: 'A regulatory marker associated with eye pigmentation in studied populations. It is not a test for skin sensitivity or UV protection needs.', paper: 'https://pubmed.ncbi.nlm.nih.gov/18252222/' },
  { rsid: 'rs174537', title: 'Fatty-acid research', gene: 'FADS region', context: 'A marker studied in fatty-acid biology. This prototype does not calculate nutrient requirements, conversion efficiency, or supplement recommendations.' },
];

const categories = ['Caffeine', 'Nutrition', 'Sleep', 'Activity', 'Pigmentation', 'Nutrition'];
const markerIndex = new Map();
for (const marker of [...originalMarkers.map((m, i) => ({...m, category: categories[i], categories:[categories[i]]})), ...curatedMarkers, ...catalog]) {
  const previous = markerIndex.get(marker.rsid);
  markerIndex.set(marker.rsid, {...previous, ...marker, categories:[...new Set([...(previous?.categories ?? []), ...marker.categories])]});
}
export const markers = [...markerIndex.values()];

export function filterReport(report, { query = '', category = 'All', status = 'All' } = {}) {
  const term = query.trim().toLowerCase();
  return report.filter(m => (category === 'All' || m.categories.includes(category)) &&
    (status === 'All' || m.status === status) &&
    (!term || [m.rsid, m.gene, m.title, m.category, ...(m.traits ?? [])].join(' ').toLowerCase().includes(term)))
    .sort((a, b) => Number(b.status === 'Detected') - Number(a.status === 'Detected'));
}

export function buildReport(rows) {
  const index = new Map(rows.map(row => [row.rsid, row]));
  return markers.map(marker => {
    const row = index.get(marker.rsid);
    const status = !row ? 'Not found' : row.conflict ? 'Conflicting rows' : row.genotype === null ? 'No call' : 'Detected';
    return { ...marker, status, genotype: row?.genotype ?? '--',
      interpretation: marker.context,
      meaning: status === 'Detected' ? `Your file contains ${marker.rsid} with the reported allele pair ${row.genotype}. This is a file observation, not a predicted trait.` : status === 'No call' ? 'The file lists this marker but does not provide a usable genotype.' : status === 'Conflicting rows' ? 'Duplicate rows disagree. This marker is excluded from interpretation.' : 'This marker is absent from the file. Absence is not a negative result.',
      nextStep: 'Check the original file and linked research. Strand orientation and genome build are not verified; GeneWise does not assign personal trait predictions.' };
  });
}
