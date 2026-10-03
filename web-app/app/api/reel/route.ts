import {extractMedia} from './extract';
export async function POST(request:Request){
 try{
  const {url}=await request.json() as {url?:unknown};if(typeof url!=='string'||url.length>2000)return Response.json({error:'Paste a public Instagram reel link.'},{status:400});
  const service=process.env.REEL_EXTRACTOR_URL,token=process.env.REEL_EXTRACTOR_TOKEN;
  if(service&&token){
   const origin=new URL(service);if(origin.protocol!=='https:')throw new Error('Service requires HTTPS');
   const result=await fetch(new URL('/extract',origin),{method:'POST',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({url}),signal:AbortSignal.timeout(85000)});
   if(!result.ok){const data=await result.json() as {detail?:string};return Response.json({error:data.detail||'The downloader could not access this reel. Try uploading the clip.'},{status:422})}
   const data=await result.json() as {audioBase64?:string;caption?:string;duration?:number};if(!data.audioBase64||data.audioBase64.length>9_000_000)throw new Error('Invalid audio response');
   return Response.json(data,{headers:{'Cache-Control':'no-store'}});
  }
  const parsed=new URL(url);const match=parsed.pathname.match(/^\/(?:reel|reels|p)\/([A-Za-z0-9_-]{5,28})\/?$/);
  if(!['www.instagram.com','instagram.com'].includes(parsed.hostname)||!match||parsed.protocol!=='https:')return Response.json({error:'Automatic retrieval currently supports public Instagram reel/post links. For TikTok or other sources, use video upload.'},{status:400});
  const response=await fetch(`https://www.instagram.com/p/${match[1]}`,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','Accept':'text/html'},signal:AbortSignal.timeout(18000),redirect:'follow'});
  if(!response.ok||response.url.includes('/accounts/login'))return Response.json({error:'Instagram did not make this reel available anonymously. Upload the video instead; no account credentials are needed.'},{status:422});
  const html=await response.text();if(html.length>4_000_000)throw new Error('page too large');
  let media=extractMedia(html,match[1]);
  // Only use Instagram's logged-out public response. Never request user cookies or private content.
  if(!media){
   const lsd=html.match(/\["LSD",\[\],\{"token":"([^"]+)"/)?.[1];
   if(lsd){
    const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';let pk=BigInt(0);for(const c of match[1])pk=pk*BigInt(64)+BigInt(alphabet.indexOf(c));
    const cookies=response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
    const form=new URLSearchParams({lsd,fb_api_caller_class:'RelayModern',fb_api_req_friendly_name:'PolarisLoggedOutDesktopWWWPostRootContentQuery',server_timestamps:'true',variables:JSON.stringify({media_id:pk.toString()}),doc_id:'27130156389949648'});
    try{
     const gql=await fetch('https://www.instagram.com/api/graphql',{method:'POST',headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','Content-Type':'application/x-www-form-urlencoded','X-IG-App-ID':'936619743392459','X-FB-LSD':lsd,'X-FB-Friendly-Name':'PolarisLoggedOutDesktopWWWPostRootContentQuery','Referer':`https://www.instagram.com/p/${match[1]}`,...(cookies?{Cookie:cookies}:{})},body:form,signal:AbortSignal.timeout(15000)});
     if(gql.ok){const text=await gql.text();if(text.length<4_000_000){const data=JSON.parse(text) as {data?:{xig_polaris_media?:{if_not_gated_logged_out?:unknown}}};const publicMedia=data.data?.xig_polaris_media?.if_not_gated_logged_out;if(publicMedia)media=extractMedia('<script type="application/json">'+JSON.stringify(publicMedia)+'</script>',match[1]);}}
    }catch{/* Platform refusal is handled by the upload fallback. */}
   }
  }
  if(!media)return Response.json({error:'Instagram returned the page but withheld its media. Try again or upload the video. Private, restricted, and some public reels cannot be retrieved.'},{status:422});
  if(!media.hasAudio)return Response.json({error:'This reel is marked as having no audio. Paste its on-screen claim instead.'},{status:422});
  return Response.json(media,{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'We could not retrieve the reel. Check the link, try again, or upload the video.'},{status:503})}
}
