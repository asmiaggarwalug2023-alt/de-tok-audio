import {env} from 'cloudflare:workers';
import {getChatGPTUser} from './chatgpt-auth';
export async function feedbackOwner(){
 const user=await getChatGPTUser();
 const allowed=env.FEEDBACK_OWNER_EMAIL?.trim().toLowerCase();
 return user&&allowed&&user.email.trim().toLowerCase()===allowed?user:null;
}
