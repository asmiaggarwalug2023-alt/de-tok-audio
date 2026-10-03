export async function runStatementSearches({claims,signal,onUpdate,fetcher=fetch,timeoutMs=35000}){
 let position=0;
 async function worker(){
  while(!signal.aborted&&position<claims.length){
   const index=position++,{claim,query}=claims[index];
   onUpdate(index,{status:'searching'});
   const controller=new AbortController(),cancel=()=>controller.abort();
   signal.addEventListener('abort',cancel,{once:true});
   const timer=setTimeout(()=>controller.abort(),timeoutMs);
   try{
    if(!query||query.length<3)throw Error('Edit this statement to include a specific research topic.');
    const response=await fetcher('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query}),signal:controller.signal});
    const data=await response.json();
    if(!response.ok)throw Error(data.error||'Search unavailable.');
    if(!Array.isArray(data.papers)||typeof data.total!=='number')throw Error('The research service returned an incomplete response. Try again.');
    if(!signal.aborted)onUpdate(index,{status:'complete',papers:data.papers,total:data.total});
   }catch(error){
    if(!signal.aborted)onUpdate(index,{status:'error',error:controller.signal.aborted?'This search took too long. Retry it or continue on PubMed.':error instanceof Error?error.message:'Search unavailable.'});
   }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel)}
  }
 }
 await Promise.all(Array.from({length:Math.min(2,claims.length)},worker));
}
