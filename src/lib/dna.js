import { curatedMarkers } from './curated-markers.js';
import { catalog, catalogMetadata } from './catalog.js';
export { catalogMetadata };
export { MAX_FILE_BYTES, normalizeGenotype, parseDNA } from './parser.js';
export const demoFile = `# GeneWise synthetic example; not a person's DNA
# rsid chromosome position genotype
rs762551 15 75041917 AC
rs4988235 2 136608646 CT
rs1801260 4 56307853 TT
rs1815739 11 66560624 CT
rs12913832 15 28365618 AG
rs174537 11 61571478 GG`;

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
