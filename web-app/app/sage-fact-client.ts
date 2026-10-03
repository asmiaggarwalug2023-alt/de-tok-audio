export type Fact={id:string;text:string;url:string;quote?:string;year?:string;kind?:string};
export type FactPage={facts:Fact[];cursor:string|null};
// The server allows Europe PMC 20 seconds; leave room for transport and JSON parsing.
export const FACT_REQUEST_TIMEOUT_MS=35000;
export async function fetchFactPage(cursor:string):Promise<FactPage>{
 const request=async(mark:string)=>fetch('/api/facts?cursor='+encodeURIComponent(mark),{signal:AbortSignal.timeout(FACT_REQUEST_TIMEOUT_MS)});
 let response=await request(cursor);
 // A stale saved cursor must not permanently block this browser.
 if(response.status===400&&cursor!=='*')response=await request('*');
 if(!response.ok)throw Error('Research source unavailable');
 const page=await response.json() as FactPage;
 if(!Array.isArray(page.facts))throw Error('Invalid research response');
 return {facts:page.facts.filter(f=>typeof f.id==='string'&&typeof f.text==='string'&&typeof f.url==='string'),cursor:typeof page.cursor==='string'?page.cursor:null};
}
