'use client';
import {useState} from 'react';
export function candidateClaims(text:string){
 const cleaned=text.replace(/https?:\/\/\S+/g,'').replace(/^\s*(?:[•*-]\s+|\d+[.)]\s+)/gm,'').trim();
 return [...new Set(cleaned.split(/\n+|(?<=[.!?])\s+(?=[A-Z“"])/).map(s=>s.trim()).filter(s=>s.length>=15))];
}
export default function ClaimSelection({claims,onChoose,onWhole}:{claims:string[];onChoose:(claims:string[])=>void;onWhole:()=>void}){
 const [selected,setSelected]=useState<string[]>([]);
 return <div className="claim-selection"><p className="eyebrow">ONE REEL, MORE THAN ONE CLAIM</p><h3>What should Sage investigate?</h3><p>Select one or several statements. Each gets its own search and evidence summary.</p><button className="quiet" onClick={()=>setSelected(selected.length===claims.length?[]:claims)}>{selected.length===claims.length?'Clear selection':'Select all statements'}</button>{claims.map((c,i)=><label className="claim-choice" key={i}><input type="checkbox" checked={selected.includes(c)} onChange={()=>setSelected(selected.includes(c)?selected.filter(x=>x!==c):[...selected,c])}/><span>{i+1}</span>{c}</label>)}<button className="primary" disabled={!selected.length} onClick={()=>onChoose(claims.filter(c=>selected.includes(c)))}>Investigate {selected.length||''} {selected.length===1?'statement':'statements'}</button><button className="quiet" onClick={onWhole}>Let me edit the full text instead</button></div>;
}
