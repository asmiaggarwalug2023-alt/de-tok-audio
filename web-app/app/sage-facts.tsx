'use client';
import {useEffect,useRef,useState} from 'react';
import {fetchFactPage,type Fact} from './sage-fact-client';
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
const storage='detok-sage-facts-v1',queueStorage='detok-sage-fact-queue-v2',cursorStorage='detok-fact-cursor';
export default function SageFacts({mini=false}:{mini?:boolean}){
 const [fact,setFact]=useState<Fact|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const seen=useRef<Set<string>>(new Set()),queue=useRef<Fact[]>([]),cursor=useRef('*'),ready=useRef(false),loading=useRef<Promise<void>|null>(null),clicking=useRef(false);
 function restore(){if(ready.current)return;ready.current=true;try{const ids=JSON.parse(localStorage.getItem(storage)||'[]');if(Array.isArray(ids))seen.current=new Set(ids.filter(id=>typeof id==='string'));const saved=JSON.parse(localStorage.getItem(queueStorage)||'[]');if(Array.isArray(saved))queue.current=saved.filter(f=>f&&typeof f.id==='string'&&typeof f.text==='string'&&typeof f.url==='string'&&!seen.current.has(f.id));cursor.current=localStorage.getItem(cursorStorage)||'*'}catch{}}
 function persist(){try{localStorage.setItem(storage,JSON.stringify([...seen.current]));localStorage.setItem(queueStorage,JSON.stringify(queue.current));localStorage.setItem(cursorStorage,cursor.current)}catch{}}
 function refill(){if(loading.current)return loading.current;loading.current=(async()=>{const page=await fetchFactPage(cursor.current);queue.current=[...queue.current,...page.facts.filter(f=>!seen.current.has(f.id)&&!queue.current.some(q=>q.id===f.id))];cursor.current=page.cursor||'*';persist()})().finally(()=>{loading.current=null});return loading.current}
 useEffect(()=>{restore();if(queue.current.length<3)void refill().catch(()=>{});},[]);
 async function next(){if(clicking.current)return;clicking.current=true;restore();setMessage('');
 const unseen=sageFacts.filter(f=>!seen.current.has(f.id));let chosen:Fact|undefined=unseen[Math.floor(Math.random()*unseen.length)]||queue.current.find(f=>!seen.current.has(f.id));
 if(!chosen){setBusy(true);setMessage('Sage is following a new science trail. This can take a few seconds…');try{for(let attempt=0;attempt<3&&!chosen;attempt++){await refill();chosen=queue.current.find(f=>!seen.current.has(f.id))}if(!chosen)setMessage('This batch has no new snippets. Tap Sage to continue to the next batch.')}catch{setMessage('The research source is not responding right now. Try again shortly; your saved surprises are kept.')}finally{setBusy(false)}}
 if(chosen){setMessage('');seen.current.add(chosen.id);queue.current=queue.current.filter(f=>f.id!==chosen!.id);setFact(chosen);persist();if(queue.current.length<3)void refill().catch(()=>{})}
 clicking.current=false;
 }
 return <div className={mini?'sage-facts sage-fact-mini':'sage-facts'}><button className="sage-fact-trigger" aria-label="Sage: tell me a new fun fact" aria-expanded={Boolean(fact)} disabled={busy} onClick={next}><img className={mini?'sage-mini':'sage-scientist'} src="/sage-lamb.png" alt="Sage, a fluffy lamb scientist holding a research board and magnifying glass" width={mini?70:1254} height={mini?70:1254}/></button>{!mini&&<p className="small">{busy?'Finding a fresh science surprise…':'Tap Sage for a little science surprise ✳'}</p>}{fact&&<div className="fact-popup" aria-live="polite"><p className="eyebrow">{fact.kind||"SAGE’S LITTLE SCIENCE SURPRISE"}</p><p>{fact.text}</p>{fact.quote&&<><blockquote>{fact.quote}</blockquote><p className="small">Excerpt from the study’s abstract · {fact.year}. One study is not the whole evidence picture.</p></>}<a href={fact.url} target="_blank" rel="noopener noreferrer">Follow the source ↗</a><button className="quiet" disabled={busy} onClick={next}>{busy?'Finding something new…':'Another fact'}</button><button className="quiet" onClick={()=>setFact(null)} aria-label="Close fun fact">Close</button></div>}{message&&<p className="small" role="status">{message}</p>}</div>;
}
