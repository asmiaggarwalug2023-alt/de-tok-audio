import {feedbackOwner} from '../../../feedback-access';
import {getFeedbackStore} from '../../../../db/index';
const unavailable=()=>Response.json({error:'The inbox is unavailable. Please try again.'},{status:503,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
 if(!await feedbackOwner())return Response.json({error:'Only the De-Tok creator can open this inbox.'},{status:403});
 try{const cursor=Number(new URL(request.url).searchParams.get('before'))||Date.now()+1;const result=await getFeedbackStore().prepare('SELECT id, message, category, created_at AS createdAt, read FROM feedback WHERE created_at < ? ORDER BY created_at DESC LIMIT 50').bind(cursor).all();return Response.json({messages:result.results},{headers:{'Cache-Control':'no-store'}})}catch{return unavailable()}
}
export async function PATCH(request:Request){
 if(!await feedbackOwner())return Response.json({error:'Only the De-Tok creator can update this inbox.'},{status:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin.'},{status:403});
 try{const body=await request.json() as {id?:unknown;read?:unknown};if(typeof body.id!=='string'||body.id.length>100||typeof body.read!=='boolean')return Response.json({error:'Invalid message.'},{status:400});await getFeedbackStore().prepare('UPDATE feedback SET read = ? WHERE id = ?').bind(body.read?1:0,body.id).run();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}})}catch{return unavailable()}
}
