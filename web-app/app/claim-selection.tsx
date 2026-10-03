'use client';
export function candidateClaims(text:string){
 const cleaned=text.replace(/https?:\/\/\S+/g,'').replace(/^\s*(?:[•*-]\s+|\d+[.)]\s+)/gm,'').trim();
 return [...new Set(cleaned.split(/\n+|(?<=[.!?])\s+(?=[A-Z“"])/).map(s=>s.trim()).filter(s=>s.length>=15))].slice(0,8);
}
export default function ClaimSelection({claims,onChoose,onWhole}:{claims:string[];onChoose:(claim:string)=>void;onWhole:()=>void}){
 return <div className="claim-selection"><p className="eyebrow">ONE REEL, MORE THAN ONE CLAIM</p><h3>Which statement should Sage investigate?</h3><p>These are passages from your text, not verified claims. Choose one, then edit it into a factual question.</p>{claims.map((c,i)=><button className="claim-choice" key={i} onClick={()=>onChoose(c)}><span>{i+1}</span>{c}</button>)}<button className="quiet" onClick={onWhole}>Let me edit the full text instead</button></div>;
}
