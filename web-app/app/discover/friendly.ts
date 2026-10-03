import type {Discovery} from './topics';
// Preserve each paper's actual intervention, outcome and population.
// Rephrase a research question, never infer a result from a topic keyword.
const plain=(text:string)=>text
 .replace(/\bassociation(?:s)? between\b/gi,'connection between')
 .replace(/\bcognitive function(?:ing)?\b/gi,'thinking skills')
 .replace(/\bcardiovascular health\b/gi,'heart health')
 .replace(/\bcardiovascular disease\b/gi,'heart and blood vessel disease')
 .replace(/\bphysical activity\b/gi,'physical movement')
 .replace(/\bquality of life\b/gi,'quality of everyday life')
 .replace(/\bsedentary behavio[u]?r\b/gi,'time spent sitting')
 .replace(/\bhypertension\b/gi,'high blood pressure')
 .replace(/\bglyc(?:a)?emic control\b/gi,'blood sugar control')
 .replace(/\bolder adults\b/gi,'older people')
 .replace(/\badolescents\b/gi,'teenagers')
 .replace(/\bpediatric\b/gi,'children’s')
 .replace(/\b efficacy\b/gi,' effectiveness');
const lowerFirst=(s:string)=>s.replace(/^[A-Z](?=[a-z])/ ,letter=>letter.toLowerCase());
export function friendlyStudy(article:Discovery,_topicLabel:string){
 const original=article.title.trim().replace(/\.$/,'');
 // Only remove a trailing study-design subtitle, not the research question.
 const core=plain(original.replace(/\s*[:–—]\s*(?:a |an |the )?(?:systematic review|meta.analysis|randomi[sz]ed|cross.sectional|prospective|retrospective|longitudinal|cohort|scoping review|pilot study|study protocol)[\s\S]*$/i,'')).trim()||original;
 const animal=/\b(mice|mouse|rats?|zebrafish|drosophila|animal model)\b/i.test(original);
 const lab=animal||/\b(in vitro|cell culture|cell line)\b/i.test(original);
 const review=/systematic review|meta.analysis|scoping review/i.test(original);
 const protocol=/protocol/i.test(original);
 const trial=/randomi[sz]ed|clinical trial|controlled trial/i.test(original);
 const observational=/association|correlat|cohort|cross.sectional|longitudinal|prospective/i.test(original+' '+article.abstract);
 const connection=core.match(/^(?:the )?(?:connection|relationship|link|correlation) between (.+?) and (.+)$/i);
 const effect=core.match(/^(?:the )?(?:effect(?:s)?|impact|influence) of (.+?) on (.+)$/i);
 const verb=core.match(/^(.+?)\s+(improves|reduces|increases|predicts|prevents|enhances)\s+(.+)$/i);
 let question:string;
 if(core.endsWith('?'))question=core;
 else if(connection)question=`How might ${lowerFirst(connection[1])} relate to ${lowerFirst(connection[2])}?`;
 else if(effect)question=observational?`How might ${lowerFirst(effect[1])} relate to ${lowerFirst(effect[2])}?`:`Could ${lowerFirst(effect[1])} change ${lowerFirst(effect[2])}?`;
 else if(verb){const base=verb[2].toLowerCase().replace(/s$/,'');question=`Does ${lowerFirst(verb[1])} ${base} ${lowerFirst(verb[3])}?`}
 else question=`A closer look: ${lowerFirst(core)}`;
 const title=lab?`${animal?'Animal research':'In the lab'}: ${question}`:connection||effect||verb?`Have you ever wondered… ${lowerFirst(question)}`:question;
 const kind=protocol?'A planned study — this paper describes a protocol, not completed findings.':review?'Researchers bring existing studies together to examine this question.':trial?'Researchers test this question in a trial.':observational?'Researchers examine patterns and connections; this alone cannot establish cause and effect.':'This paper investigates the specific question above.';
 // Use an actual, complete purpose sentence when supplied, without inventing an abstract summary.
 const sentences=(article.abstract||'').match(/[^.!?]+[.!?](?:\s|$)/g)||[];
 const purpose=sentences.map(s=>s.trim()).find(s=>/\b(aim(?:ed|s)?|objective|investigat(?:e|ed|es)|examin(?:e|ed|es)|evaluat(?:e|ed|es))\b/i.test(s)&&s.split(/\s+/).length<=45&&!s.includes('…'));
 const description=purpose?`${kind} The abstract’s stated focus: “${purpose}”${lab?' These findings cannot be assumed to apply to people.':''}`:`${kind}${lab?' This is laboratory research, not a demonstrated benefit in people.':''} Open the original title and abstract to check exactly who or what was studied and what the authors found.`;
 return {title,description};
}
