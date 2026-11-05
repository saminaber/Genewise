import { buildReport, catalogMetadata } from './dna.js';

// Build from the dataset so display filters and pagination cannot truncate the download.
export function buildReportExport(dataset, isDemo = false) {
  return {
    project: 'GeneWise',
    version: 3,
    catalog: catalogMetadata,
    source: isDemo ? 'synthetic example' : 'user file',
    limitations: 'Educational marker observations only; genome build and strand not verified; no phenotype predictions. Population associations do not establish individual predictive accuracy or causation.',
    quality: dataset.stats,
    fileMetadata: dataset.metadata,
    markers: buildReport(dataset.rows).map(({
      rsid, title, gene, genotype, status, category, categories, traits,
      source, paper, evidenceKind, evidence, interpretation, meaning, nextStep,
    }) => ({
      rsid, title, gene, genotype, status, category, categories, traits,
      source, paper, evidenceKind, evidence, interpretation, meaning, nextStep,
    })),
  };
}
