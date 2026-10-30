#!/usr/bin/env python3
"""Refresh a bounded educational snapshot from GWAS Catalog API v2. No personal data."""
import concurrent.futures,json,re,urllib.parse,urllib.request,hashlib,subprocess,time,sys
from datetime import datetime,timezone
from pathlib import Path
QUERIES=[('Body measurements', 'body height'), ('Sleep', 'chronotype measurement'), ('Sleep', 'sleep duration trait'), ('Sleep', 'Sleep efficiency'), ('Sleep', 'Wake After Sleep Onset'), ('Sleep', 'sleep latency'), ('Caffeine', 'coffee consumption'), ('Caffeine', 'caffeine measurement'), ('Caffeine', 'caffeine metabolite measurement'), ('Pigmentation', 'eye color'), ('Pigmentation', 'hair color'), ('Hair', 'hair morphology'), ('Nutrition', '25-hydroxyvitamin D3 measurement'), ('Nutrition', '25-hydroxyvitamin D2 measurement'), ('Nutrition', 'lactose tolerance test'), ('Nutrition', 'polyunsaturated fatty acid measurement'), ('Nutrition', 'omega-3 polyunsaturated fatty acid measurement'), ('Nutrition', 'omega-6 polyunsaturated fatty acid measurement'), ('Nutrition', 'saturated fatty acids measurement'), ('Taste', 'sensory perception of bitter taste'), ('Taste', 'sensory perception of sweet taste'), ('Activity', 'physical activity'), ('Activity', 'grip strength measurement')]
BASE='https://www.ebi.ac.uk/gwas/rest/api/v2/associations'
ROOT=Path(__file__).resolve().parents[1]
def fetch(item):
 category,term=item
 cache=ROOT/'.cache/gwas'/ (hashlib.sha256(term.encode()).hexdigest()+'.json')
 if cache.exists() and ('--offline' in sys.argv or time.time()-cache.stat().st_mtime < 86400): return json.loads(cache.read_text())
 if '--offline' in sys.argv: return {'query':term,'url':BASE,'totalAvailable':None,'associations':[],'warning':'No cached response; not fetched in offline mode'}
 url=BASE+'?'+urllib.parse.urlencode({'efo_trait':term,'size':200,'show_child_trait':'false'})
 req=urllib.request.Request(url,headers={'User-Agent':'GeneWise-Educational-Catalog/1.0'})
 data=None
 for attempt in range(2):
  try:
   with urllib.request.urlopen(req,timeout=18) as r: data=json.load(r)
   break
  except Exception as error:
   if attempt: return {'query':term,'url':url,'totalAvailable':None,'associations':[],'warning':str(error)}
 if data is None: raise RuntimeError('Missing response')
 rows=[]
 for a in data.get('_embedded',{}).get('associations',[]):
  # Independently check the returned ontology labels; never silently accept an ignored filter.
  if not any(term.lower() == t.get('efo_trait','').lower() for t in a.get('efo_traits',[])): continue
  if a.get('multi_snp_haplotype') or a.get('snp_interaction'): continue
  p=a.get('p_value')
  if not isinstance(p,(float,int)) or not 0 < p <= 5e-8: continue
  snps=a.get('snp_allele',[])
  if len(snps)!=1 or not re.fullmatch(r'rs\d+',snps[0].get('rs_id','')): continue
  pmid=str(a.get('pubmed_id') or '')
  if not pmid.isdigit() or not a.get('accession_id'):continue
  rows.append({'rsid':snps[0]['rs_id'],'category':category,'trait':term,'associationId':a['association_id'],'study':a['accession_id'],'pmid':pmid,'pValue':p,'mappedGenes':a.get('mapped_genes',[]),'reportedTraits':a.get('reported_trait',[]),'locations':a.get('locations',[])})
 print(f'{term}: {len(rows)} eligible associations',flush=True)
 result={'query':term,'url':url,'totalAvailable':data.get('page',{}).get('totalElements',0),'associations':rows}
 cache.parent.mkdir(parents=True,exist_ok=True);cache.write_text(json.dumps(result))
 return result
# Preserve previously retrieved evidence when upstream requests are temporarily unavailable.
previous=[]
previous_metadata={}
if (ROOT/'src/lib/catalog.js').exists():
 raw=subprocess.check_output(['node','--input-type=module','-e',"import {catalog,catalogMetadata} from './src/lib/catalog.js';console.log(JSON.stringify({catalog,catalogMetadata}));"],cwd=ROOT,text=True)
 old=json.loads(raw);previous=old["catalog"];previous_metadata=old["catalogMetadata"]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 results=list(pool.map(fetch,QUERIES))
by_id={}
if previous:
 results=[{'query':'Previous bounded snapshot','url':BASE,'totalAvailable':None,'associations':[e for m in previous for e in m['evidence']]}]+results
for result in results:
 for row in result['associations']:
  item=by_id.setdefault(row['rsid'],{'rsid':row['rsid'],'category':row['category'],'categories':[],'traits':[],'evidence':[]})
  if row['category'] not in item['categories']:item['categories'].append(row['category'])
  if row['trait'] not in item['traits']:item['traits'].append(row['trait'])
  if row['associationId'] not in [x['associationId'] for x in item['evidence']]:item['evidence'].append(row)
markers=[]
for row in by_id.values():
 evidence=sorted(row['evidence'],key=lambda x:x['pValue'])
 genes=sorted({g for e in evidence for g in e['mappedGenes']})
 markers.append({**row,'title':row['traits'][0].capitalize(),'gene':', '.join(genes) or 'No mapped gene reported','context':'The GWAS Catalog records a population-level association with '+', '.join(row['traits'])+'. Mapped genes are annotations, not proof of a causal mechanism. This entry does not predict an individual trait.','paper':'https://pubmed.ncbi.nlm.nih.gov/'+evidence[0]['pmid']+'/','source':'https://www.ebi.ac.uk/gwas/variants/'+row['rsid'],'evidence':evidence})
markers.sort(key=lambda m:(m['category'],m['rsid']))
assert len(markers)>100,'Unexpectedly small result; refusing to overwrite catalog'
manifest={'retrievedAt':datetime.now(timezone.utc).isoformat(),'source':'NHGRI-EBI GWAS Catalog API v2','sourceUrl':BASE,'selection':'Union of previous bounded snapshot and up to the first 200 associations per exact trait query, p <= 5e-8, single-rsID non-interaction associations with publication IDs; deduplicated by rsID. Bounded, non-comprehensive snapshot; no individual predictions.','queries':[{k:v for k,v in r.items() if k!='associations'} for r in results],'markerCount':len(markers),'associationCount':sum(len(m['evidence']) for m in markers)}
if previous_metadata.get('studyImports'): manifest['studyImports']=previous_metadata['studyImports']
(ROOT/'src/lib/catalog.js').write_text('// Generated by scripts/refresh-markers.py; do not hand-edit.\nexport const catalog = '+json.dumps(markers,indent=2)+';\nexport const catalogMetadata = '+json.dumps(manifest,indent=2)+';\n')
(ROOT/'data/catalog-provenance.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Unavailable queries:',[r['query'] for r in results if r.get('warning')],flush=True)
print(f'Saved {len(markers)} unique markers; {manifest["associationCount"]} associations',flush=True)
