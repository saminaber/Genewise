// Targeted educational references for topics poorly covered by the bounded GWAS import.
// These entries are literature references, not validated genotype-to-phenotype rules.
const curated = [
 ['rs2282679','Nutrition','Vitamin D research','GC','20541252','A marker associated with circulating 25-hydroxyvitamin D in a genome-wide study. It does not measure vitamin D levels or establish a supplement requirement.'],
 ['rs12785878','Nutrition','Vitamin D research','DHCR7 region','20541252','A marker near a vitamin D-related locus studied in circulating 25-hydroxyvitamin D. Association is not a blood test or a dosing rule.'],
 ['rs10741657','Nutrition','Vitamin D research','CYP2R1 region','20541252','A marker studied in relation to circulating 25-hydroxyvitamin D. Environmental factors also matter; no individual vitamin status is inferred.'],
 ['rs6013897','Nutrition','Vitamin D research','CYP24A1 region','20541252','A marker studied in relation to circulating vitamin D measurements. This record does not establish deficiency or supplement response.'],
 ['rs713598','Taste','Bitter taste research','TAS2R38','34117880','One of three TAS2R38 variants investigated in bitter-taste sensitivity. Interpretation can depend on the combined haplotype; this prototype does not infer phase or taster status.'],
 ['rs1726866','Taste','Bitter taste research','TAS2R38','34117880','A TAS2R38 coding variant investigated in bitter-taste research. The three-marker haplotype and study context matter; no food-preference prediction is made.'],
 ['rs10246939','Taste','Bitter taste research','TAS2R38','34117880','A TAS2R38 coding variant investigated alongside other receptor variants in taste research. It is not interpreted independently as a dietary recommendation.'],
 ['rs1761667','Taste','Fat taste research','CD36','34117880','A CD36 variant investigated in taste-sensitivity research. This candidate-study reference does not establish a reliable individual food preference or ideal diet.'],
 ['rs2472297','Caffeine','Caffeine consumption research','CYP1A1 / CYP1A2 region','22854411','A marker investigated in habitual caffeine consumption. Consumption and metabolism are different traits; no personal clearance rate is assigned.'],
 ['rs2470893','Caffeine','Caffeine consumption research','CYP1A1 / CYP1A2 region','22854411','A marker investigated in habitual caffeine consumption. This record provides study context, not an individual metabolism estimate.'],
 ['rs4410790','Caffeine','Caffeine consumption research','AHR region','22854411','A marker investigated in caffeine-related research. Habitual intake associations do not establish caffeine tolerance or a safe personal dose.'],
 ['rs6968865','Caffeine','Caffeine consumption research','AHR region','22854411','A marker investigated in habitual caffeine consumption. Population associations should not be treated as personal consumption advice.'],
 ['rs5751876','Caffeine','Caffeine response research','ADORA2A','32303460','An adenosine-receptor marker genotyped in a caffeine-metabolism study. Inclusion in a study does not by itself establish a predictive association.'],
 ['rs35333999','Sleep','Circadian rhythm research','PER2','30926824','A PER2 variant investigated in chronotype and intrinsic circadian period. This reference does not determine a sleep schedule or diagnose a sleep disorder.'],
 ['rs3847634','Sleep','Daylight and chronotype research','ARL14EP region','36519390','A marker investigated in the interaction between daylight exposure and chronotype. This context-dependent association is not a personal light-exposure prescription.'],
 ['rs62158206','Sleep','Sleep duration research','PAX8 region','37770476','A marker associated with sleep-duration categories in a cross-population study. Association is not an estimate of individual sleep requirements.'],
 ['rs1823125','Sleep','Sleep duration research','Sleep-associated region','25469926','A marker investigated in a sleep-duration genome-wide study. The reported population effect does not determine an individual sleep duration.'],
 ['rs8192678','Activity','Exercise physiology research','PPARGC1A','PMC9354774','A variant examined in a study of exercise-related physiological measures in young adults. This candidate-study reference is not a validated training-response predictor.'],
];
export const curatedMarkers = curated.map(([rsid, category, title, gene, publication, context]) => ({
 rsid, category, categories:[category], title, gene, context,
 paper: publication.startsWith('PMC') ? `https://pmc.ncbi.nlm.nih.gov/articles/${publication}/` : `https://pubmed.ncbi.nlm.nih.gov/${publication}/`,
 evidenceKind:'Targeted primary-literature reference',
}));
