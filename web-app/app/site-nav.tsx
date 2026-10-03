export default function SiteNav({current}:{current:'claim'|'discover'|'products'}){
 return <nav className="site-nav" aria-label="De-Tok pages">{[{id:'claim',href:'/',label:'Check a claim'},{id:'discover',href:'/discover',label:'De-Tok Time'},{id:'products',href:'/products',label:'Products & Treatments'}].map(p=><a key={p.id} href={p.href} aria-current={current===p.id?'page':undefined}>{p.label}</a>)}</nav>;
}
