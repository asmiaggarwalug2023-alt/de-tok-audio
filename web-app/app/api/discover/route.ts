import {topics,type Discovery} from '../../discover/topics';
const strip=(v:unknown)=>typeof v==='string'?v.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim():'';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;const topic=topics.find(t=>t.id===(params.get('topic')||'brain'));if(!topic)return Response.json({error:'Choose a listed subject.'},{status:400});const page=Math.min(499,Math.max(0,Math.floor(Number(params.get('page'))||0)));
 try{
 if(params.has('cursor'))throw new Error('Continue fallback feed');
 const now=new Date(),since=new Date(now);since.setUTCDate(since.getUTCDate()-90);const until=now.toISOString().slice(0,10),from=since.toISOString().slice(0,10);
 const url=new URL('https://api.crossref.org/works');url.searchParams.set('query',topic.query);url.searchParams.set('filter',`type:journal-article,from-pub-date:${from},until-pub-date:${until}`);url.searchParams.set('sort','published');url.searchParams.set('order','desc');url.searchParams.set('rows','18');url.searchParams.set('offset',String(page*18));
 const response=await fetch(url,{headers:{'User-Agent':'DeTokResearchDiscovery/1.0'},signal:AbortSignal.timeout(9000)});if(!response.ok)throw new Error('source unavailable');
 const raw=await response.json() as {message:{items:Record<string,unknown>[]}};
 const articles:Discovery[]=raw.message.items.flatMap(p=>{
 const title=strip((p.title as string[])?.[0]),doi=strip(p.DOI);if(!title||!doi||/^(?:correction|erratum|retraction|editorial|contents|cover)\b/i.test(title)||!/^10\.\d{4,9}\//.test(doi))return [];
 const parts=(p.published as {'date-parts'?:number[][]})?.['date-parts']?.[0]||[];if(!parts[0])return [];const date=[parts[0],String(parts[1]||1).padStart(2,'0'),String(parts[2]||1).padStart(2,'0')].join('-');
 const authors=(p.author as {given?:string;family?:string;affiliation?:{name:string}[]}[]||[]).slice(0,3).map(a=>[a.given,a.family].filter(Boolean).join(' ')).filter(Boolean).join(', ');
 const abstract=strip(p.abstract);if(!topic.terms.test(title+' '+abstract))return [];const preview=abstract.split(/\s+/).slice(0,50).join(' ')+(abstract.split(/\s+/).length>50?'…':'');
 return [{id:doi,title,abstract:preview,journal:strip((p['container-title'] as string[])?.[0])||'Journal article',date,dateLabel:parts.length<3?'Month/year supplied by publisher':'Publisher publication date',url:'https://doi.org/'+encodeURIComponent(doi),authors,countries:[],hasAbstract:Boolean(abstract)}];});
 return Response.json({articles,topic:topic.id,page,more:raw.message.items.length===18&&page<499,checkedAt:new Date().toISOString(),from,until,source:'Crossref publisher metadata'},{headers:{'Cache-Control':'public, max-age=900'}});
  }catch{
  try{
   const terms:Record<string,string>={mental:'"mental health" OR anxiety OR depression',sleep:'sleep OR insomnia OR circadian',nutrition:'nutrition OR diet OR microbiome',movement:'exercise OR "physical activity" OR fitness',brain:'brain OR cognition OR neuroscience OR memory',ageing:'"healthy aging" OR longevity OR "older adults"',reproductive:'"reproductive health" OR menstruation OR menopause OR fertility',public:'"public health" OR prevention OR vaccination'};
   const now=new Date(),since=new Date(now);since.setUTCDate(since.getUTCDate()-90);const from=since.toISOString().slice(0,10),until=now.toISOString().slice(0,10);
   const url=new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');url.searchParams.set('query',`(${terms[topic.id]}) AND SRC:MED AND FIRST_PDATE:[${from} TO ${until}] sort_date:y`);url.searchParams.set('format','json');url.searchParams.set('resultType','core');url.searchParams.set('pageSize','18');url.searchParams.set('cursorMark',params.get('cursor')||'*');
   const response=await fetch(url,{signal:AbortSignal.timeout(14000)});if(!response.ok)throw new Error('fallback unavailable');const data=await response.json() as {hitCount:number;nextCursorMark?:string;resultList:{result:Record<string,unknown>[]}};
   const articles:Discovery[]=data.resultList.result.flatMap(p=>{const title=strip(p.title),id=String(p.id),date=strip(p.firstPublicationDate);if(!title||!/^\d+$/.test(id)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!topic.terms.test(title+' '+strip(p.abstractText)))return [];const abstract=strip(p.abstractText),words=abstract.split(/\s+/);return [{id:'pubmed:'+id,title,abstract:words.slice(0,50).join(' ')+(words.length>50?'…':''),journal:strip((p.journalInfo as {journal?:{title?:string}})?.journal?.title)||'Journal article',date,dateLabel:'First publication date supplied by Europe PMC',url:`https://pubmed.ncbi.nlm.nih.gov/${id}/`,authors:strip(p.authorString),countries:[],hasAbstract:Boolean(abstract),source:'Europe PMC / PubMed'}]});
   return Response.json({articles,topic:topic.id,page,more:Boolean(data.nextCursorMark)&&data.resultList.result.length===18&&data.nextCursorMark!==(params.get('cursor')||'*'),cursor:data.nextCursorMark,checkedAt:new Date().toISOString(),source:'Europe PMC / PubMed',from,until},{headers:{'Cache-Control':'public, max-age=300'}});
  }catch{return Response.json({error:'Both research sources are unavailable right now. Try again shortly or explore PubMed directly. Your saved reads are still available.'},{status:503})}
 }

}
