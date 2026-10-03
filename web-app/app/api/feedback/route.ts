import {getFeedbackStore} from '../../../db/index';
export async function POST(request:Request){
 try{
  const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return Response.json({error:'Please send feedback from De-Tok.'},{status:403});
  if(Number(request.headers.get('content-length')||0)>12000)return Response.json({error:'Feedback is too long.'},{status:413});
  if(request.headers.get('cookie')?.includes('detok_feedback_cooldown='))return Response.json({error:'Please wait a minute before sending another message.'},{status:429});
  const raw=await request.text();if(raw.length>12000)return Response.json({error:'Feedback is too long.'},{status:413});
  const body=JSON.parse(raw) as {message?:unknown;category?:unknown;website?:unknown};
  if(body.website)return Response.json({ok:true});
  if(typeof body.message!=='string'||body.message.trim().length<5||body.message.length>2000)return Response.json({error:'Please write 5–2000 characters.'},{status:400});
  const category=['Idea','Bug','Experience'].includes(String(body.category))?String(body.category):'Experience';
  await getFeedbackStore().prepare('INSERT INTO feedback (id, message, category, created_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(),body.message.trim(),category,Date.now()).run();
  return Response.json({ok:true},{status:201,headers:{'Cache-Control':'no-store','Set-Cookie':'detok_feedback_cooldown=1; Max-Age=60; Path=/api/feedback; HttpOnly; Secure; SameSite=Strict'}});
 }catch(error){console.error('Feedback save failed',error instanceof Error?error.message:'unknown');return Response.json({error:'Your feedback wasn’t saved. Please try again; your message is still here.'},{status:503})}
}
