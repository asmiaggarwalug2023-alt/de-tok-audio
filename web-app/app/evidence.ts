/** Local, transparent keyword extraction; claims are kept intact for review. */
export function researchTerms(claim:string):string {
 if(/\badhd\b|attention.deficit/i.test(claim)&&/sit|still|restless|fidget|place|minute/i.test(claim))return 'ADHD hyperactivity diagnosis';
 const aliases:[RegExp,string][]=[[/\bsleep(?:ing)?\b|\binsomnia\b/i,'sleep'],[/\bhair\s+loss\b|\bbald(?:ing|ness)?\b/i,'alopecia'],[/\bblood\s+sugar\b/i,'glucose'],[/\blose\s+weight\b|\bweight\s+loss\b/i,'weight loss'],[/\bgut\s+health\b/i,'gut microbiome']];
 let text=claim.toLowerCase().replace(/https?:\/\/\S+/g,' ');
 for(const [pattern,term] of aliases)text=text.replace(pattern,term);
 const stop=new Set('if cant cannot one minutes minute five a an the this that these those it its is are was were be been being i you your we they everyone all people should must can could may might will would do does did not no never really very always helps help improves improve causes cause cures cure makes make taking take eat eating drink drinking use using says said claim claims better good bad for to of in on with and or from by as at about every daily day science research study studies proven actually because which who how have has get more less my our their'.split(' '));
 const words=[...new Set((text.match(/[a-z][a-z-]+/g)||[]).filter(w=>!stop.has(w)&&w.length>2))];
 return words.slice(0,6).join(' ');
}
export type DigestPaper={id:string;abstract:string;types:string[];url:string;title:string};
export function finding(p:DigestPaper):string|null {
 if(!p.abstract)return null;
 const conclusion=p.abstract.match(/\b(?:conclusions?|interpretation)\s*[:.]\s*(.+)$/i)?.[1];
 if(!conclusion)return null;
 const sentences=conclusion.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[conclusion];
 return sentences.slice(0,2).join(' ').trim();
}

export type Assessment={verdict:string;answer:string;findings:{paper:number;quote:string;meaning:string;direction?:string}[];limits:string};
const normalize=(s:string)=>s.toLowerCase().replace(/\s+/g,' ').trim();
const verdicts=['Some support','Evidence challenges it','Mixed evidence','Insufficient evidence'];
export function validateAssessment(value:unknown,papers:DigestPaper[]):Assessment|null{
 const d=value as Assessment;
 if(!d||!verdicts.includes(d.verdict)||typeof d.answer!=='string'||d.answer.length<20||d.answer.length>1600||typeof d.limits!=='string'||d.limits.trim().length<20||/^\s*(?:[12][- ]?sentences?|explain|write|describe|\.\.\.)/i.test(d.limits)||!Array.isArray(d.findings)||!d.findings.length||d.findings.length>8)return null;
 for(const f of d.findings){const p=papers[f.paper-1];if(!Number.isInteger(f.paper)||!p||typeof f.quote!=='string'||f.quote.length<20||f.quote.length>450||!normalize(p.abstract).includes(normalize(f.quote))||typeof f.meaning!=='string'||f.meaning.trim().length<10)return null;}
 return d;
}
