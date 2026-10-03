export function allowedMedia(raw:string){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname.endsWith('.cdninstagram.com')||u.hostname.endsWith('.fbcdn.net'))}catch{return false}}
export function extractMedia(html:string,expectedCode?:string){
 let media:Record<string,unknown>|null=null;
 function walk(v:unknown,depth=0){if(depth>60||media)return;if(Array.isArray(v)){for(const x of v)walk(x,depth+1)}else if(v&&typeof v==='object'){const o=v as Record<string,unknown>;if(Array.isArray(o.video_versions)&&o.video_versions.length&&(!expectedCode||o.code===expectedCode)){media=o;return}for(const x of Object.values(o))walk(x,depth+1)}}
 for(const m of html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)){try{walk(JSON.parse(m[1]))}catch{}if(media)break}
 if(!media)return null;
 const data=media as Record<string,unknown>;let audio='';const dash=typeof data.video_dash_manifest==='string'?data.video_dash_manifest:'';
 for(const m of dash.matchAll(/<AdaptationSet\b([^>]*)>([\s\S]*?)<\/AdaptationSet>/g)){if(/(?:audio|mp4a)/i.test(m[1]+' '+m[2])){const base=m[2].match(/<BaseURL>([\s\S]*?)<\/BaseURL>/)?.[1]?.replace(/&amp;/g,'&').replace(/&quot;/g,'"');if(base&&allowedMedia(base)){audio=base;break}}}
 const formats=(data.video_versions as {url?:string;width?:number}[]).filter(v=>v.url&&allowedMedia(v.url)).sort((a,b)=>(a.width??0)-(b.width??0));
 const url=audio||formats[0]?.url;if(!url)return null;
 const caption=data.caption as {text?:string}|null;
 return {url,kind:audio?'audio':'video',caption:typeof caption?.text==='string'?caption.text.slice(0,4000):'',hasAudio:data.has_audio!==false};
}
