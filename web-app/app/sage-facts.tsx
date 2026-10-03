'use client';
import {useRef,useState} from 'react';
const sleep='https://medlineplus.gov/healthysleep.html',clock='https://www.nigms.nih.gov/education/fact-sheets/Pages/circadian-rhythms',dna='https://www.genome.gov/about-genomics/fact-sheets/Deoxyribonucleic-Acid-Fact-Sheet';
export const sageFacts=[
 ['sleep-stages','Your brain has a night-time itinerary. Sleep cycles through REM and non-REM stages, rather than one long “off” mode.',sleep],
 ['three-stages','Non-REM sleep has three stages, ranging from light to deep sleep. A night’s rest is more varied than it looks!',sleep],
 ['rem-name','REM stands for rapid eye movement. The name describes what your eyes do during this sleep stage.',sleep],
 ['dreams','Dreams are usually most vivid in REM sleep, but you can dream during non-REM sleep too.','https://health.nih.gov/health-topics-a-z/healthy-sleep'],
 ['body-clocks','You have more than one body clock: nearly every tissue and organ has its own circadian rhythm.',clock],
 ['daily-rhythms','Circadian rhythms are not just about bedtime. They also influence things like hormone levels and body temperature.',clock],
 ['master-clock','Your brain has a “master clock” called the suprachiasmatic nucleus. It helps coordinate the body’s daily rhythms.',clock],
 ['light-clock','Your eyes help your body tell the time: light signals help synchronise the brain’s master clock.',clock],
 ['fly-clock','Research on fruit flies helped uncover how biological clocks work—and earned three scientists a Nobel Prize in 2017.','https://www.nigms.nih.gov/education/Pages/Circadian-Rhythms'],
 ['mitochondria','Some of your DNA lives outside the nucleus. Mitochondria—the cell’s energy-producing structures—have their own small genome.',dna],
 ['dna-template','When DNA is copied, each original strand serves as a template for a new partner strand. Biology’s version of keeping a backup!',dna],
 ['mito-circle','Mitochondrial DNA forms a circular chromosome. Not all of your genetic instructions are packaged the same way.','https://www.genome.gov/genetics-glossary/Mitochondrial-DNA'],
 ['fingerprints','Identical twins can share the same DNA and still have different fingerprints. Genes are not the whole story.','https://medlineplus.gov/genetics/understanding/traits/fingerprints/'],
 ['genome','A genome is an organism’s complete set of DNA. In humans, that includes the small mitochondrial chromosome too.','https://www.genome.gov/genetics-glossary/Genome'],
 ['biotin','Biotin is a vitamin, not a hair-specific ingredient. It helps enzymes involved in processing fats, sugars and amino acids.','https://ods.od.nih.gov/factsheets/Biotin-HealthProfessional/'],
 ['forgetting','In a mouse study, scientists linked certain neurons active during REM sleep to forgetting. Sleep research asks what we let go of as well as what we remember.','https://www.nih.gov/news-events/nih-research-matters/rem-sleep-may-help-brain-forget']
].map(([id,text,url])=>({id,text,url}));
type Fact={id:string;text:string;url:string;quote?:string;year?:string;kind?:string};
const storage='detok-sage-facts-v1';
export default function SageFacts({mini=false}:{mini?:boolean}){
 const [fact,setFact]=useState<Fact|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const seen=useRef<Set<string>|null>(null),queue=useRef<Fact[]>([]),cursor=useRef<string>('*'),clicks=useRef(0);
 async function next(){if(busy)return;setMessage('');if(!seen.current){try{seen.current=new Set(JSON.parse(localStorage.getItem(storage)||'[]'))}catch{seen.current=new Set()}}
 const unseen=sageFacts.filter(f=>!seen.current!.has(f.id));let chosen:Fact|undefined=unseen[Math.floor(Math.random()*unseen.length)];
 if(!chosen){setBusy(true);setMessage('Sage is finding a new sourced science surprise…');try{
  if(cursor.current==='*'){try{cursor.current=localStorage.getItem('detok-fact-cursor')||'*'}catch{}}
  for(let attempt=0;attempt<3&&!chosen;attempt++){
   chosen=queue.current.find(f=>!seen.current!.has(f.id));if(chosen)break;
   const mark=cursor.current;
   const r=await fetch('/api/facts?cursor='+encodeURIComponent(mark),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const d=await r.json() as {facts:Fact[];cursor:string|null};queue.current=d.facts;
   {cursor.current=d.cursor||'*';try{localStorage.setItem('detok-fact-cursor',cursor.current)}catch{}}
   chosen=queue.current.find(f=>!seen.current!.has(f.id));
  }
  clicks.current++;if(!chosen)setMessage('I’m looking for a new sourced finding. Tap again to continue through the research collection.');
 }catch{setMessage('Fresh research is temporarily unavailable. Your seen list is kept so I do not repeat old facts.')}finally{setBusy(false)}}
 if(chosen){setMessage('');seen.current!.add(chosen.id);setFact(chosen);try{localStorage.setItem(storage,JSON.stringify([...seen.current!]))}catch{}}
 }
 return <div className={mini?'sage-facts sage-fact-mini':'sage-facts'}><button className="sage-fact-trigger" aria-label="Sage: tell me a new fun fact" aria-expanded={Boolean(fact)} disabled={busy} onClick={next}><img className={mini?'sage-mini':'sage-scientist'} src="/sage-lamb.png" alt="Sage, a fluffy lamb scientist holding a research board and magnifying glass" width={mini?70:1254} height={mini?70:1254}/></button>{!mini&&<p className="small">{busy?'Finding a fresh science surprise…':'Tap Sage for a little science surprise ✳'}</p>}{fact&&<div className="fact-popup" aria-live="polite"><p className="eyebrow">{fact.kind||"SAGE’S LITTLE SCIENCE SURPRISE"}</p><p>{fact.text}</p>{fact.quote&&<><blockquote>{fact.quote}</blockquote><p className="small">Excerpt from the study’s conclusion · {fact.year}. One study is not the whole evidence picture.</p></>}<a href={fact.url} target="_blank" rel="noopener noreferrer">Follow the source ↗</a><button className="quiet" disabled={busy} onClick={next}>{busy?'Finding something new…':'Another fact'}</button><button className="quiet" onClick={()=>setFact(null)} aria-label="Close fun fact">Close</button></div>}{message&&<p className="small" role="status">{message}</p>}</div>;
}
