'use client';
import {useEffect,useRef,useState} from 'react';
import {researchTerms,type DigestPaper} from './evidence';
import ClaimReport from './claim-report';
import ResearchContext from './research-context';
import {runStatementSearches} from './batch-search.mjs';
type Result={claim:string;query:string;status:'queued'|'searching'|'complete'|'error';papers:DigestPaper[];total:number;error?:string};
export default function BatchResearch({claims}:{claims:string[]}){
 const [results,setResults]=useState<Result[]>([]),[busy,setBusy]=useState(true),[retry,setRetry]=useState(0);
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{root.current?.scrollIntoView({behavior:'smooth',block:'start'});root.current?.focus({preventScroll:true})},[claims]);
 useEffect(()=>{
  const abort=new AbortController(),items=claims.map(claim=>({claim,query:researchTerms(claim)}));
  setResults(items.map(item=>({...item,status:'queued',papers:[],total:0})));setBusy(true);
  runStatementSearches({claims:items,signal:abort.signal,onUpdate:(index,update)=>setResults(previous=>previous.map((result,i)=>i===index?{...result,...update}:result))}).finally(()=>{if(!abort.signal.aborted)setBusy(false)});
  return()=>abort.abort();
 },[claims,retry]);
 const finished=results.filter(r=>r.status==='complete'||r.status==='error').length;
 return <section className="results" ref={root} tabIndex={-1} aria-label="Selected statement reports"><p className="eyebrow">YOUR REEL, CLAIM BY CLAIM</p><h2>Investigating {claims.length} statements</h2><p role="status">{busy?`${finished} of ${claims.length} searches finished. Each statement has its own progress below.`:'Searches finished. Open a statement to read its papers and ask Sage about that exact claim.'}</p>{results.map((r,i)=><article className="paper" key={r.claim}><p className="small">Statement {i+1} · {r.status==='queued'?'Waiting to search':r.status==='searching'?'Searching the literature…':r.status==='error'?'Search needs a retry':'Research ready'}</p><h3>{r.claim}</h3>{r.status==='error'?<><p role="alert" className="error">{r.error}</p><a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(r.query)}`} target="_blank" rel="noopener noreferrer">Continue this search on PubMed ↗</a></>:r.status==='complete'?<details><summary>Open papers &amp; investigate this statement · {r.papers.length} sources</summary><p>{r.total.toLocaleString()} matching records · up to 8 papers shown. Search matches alone do not establish whether this statement is true.</p>{r.papers.length===0&&<p>No matching papers were returned. Try a more specific claim or a different wording; this does not mean the statement is false.</p>}{r.papers.map((p,n)=><details className="paper" key={p.id}><summary>{n+1}. {p.title}</summary><p>{p.abstract||'No abstract supplied.'}</p><a href={p.url} target="_blank" rel="noopener noreferrer">Inspect the source ↗</a></details>)}<ResearchContext claim={r.claim} papers={r.papers}/><ClaimReport claim={r.claim} papers={r.papers}/></details>:null}</article>)}{!busy&&results.some(r=>r.status==='error')&&<button className="secondary" onClick={()=>setRetry(x=>x+1)}>Retry statement searches</button>}<p className="small">Choose “Ask Sage about this claim” inside each report for its evidence summary. Assess one at a time to keep on-device analysis manageable. Research literacy, not medical advice.</p></section>;
}
