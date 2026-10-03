export async function POST(request: Request) {
  try {
    const body = await request.json() as {query?:unknown};
    if(typeof body.query !== 'string' || body.query.trim().length < 3 || body.query.length > 300) return Response.json({error:'Use 3–300 characters for your research terms.'},{status:400});
    const words = body.query.replace(/[^\p{L}\p{N}\s-]/gu,' ').trim().split(/\s+/).slice(0,18);
    const query = words.join(' AND ');
    const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
    url.searchParams.set('query',`(${query}) AND SRC:MED`);
    url.searchParams.set('format','json');url.searchParams.set('resultType','core');url.searchParams.set('pageSize','8');
    const response = await fetch(url,{signal:AbortSignal.timeout(18000)});
    if(!response.ok) throw new Error('source unavailable');
    const data = await response.json() as {hitCount:number;resultList:{result:Record<string,unknown>[]}};
    const clean=(v:unknown)=>typeof v==='string'?v.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim():'';
    const papers=data.resultList.result.map(p=>({id:String(p.id),title:clean(p.title),authors:clean(p.authorString),year:clean(p.pubYear),journal:clean((p.journalInfo as {journal?:{title?:string}})?.journal?.title),abstract:clean(p.abstractText),doi:clean(p.doi),open:p.isOpenAccess==='Y',types:(p.pubTypeList as {pubType?:string[]})?.pubType??[],url:`https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(String(p.id))}/`}));
    return Response.json({papers,total:data.hitCount,query,checkedAt:new Date().toISOString()},{headers:{'Cache-Control':'public, max-age=300'}});
  } catch {return Response.json({error:'The research database is taking longer than expected. Try again, or open the PubMed search below.'},{status:503});}
}
