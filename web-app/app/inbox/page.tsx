import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';
import {feedbackOwner} from '../feedback-access';
import Inbox from './view';
export const dynamic='force-dynamic';
export default async function Page(){
 await requireChatGPTUser('/inbox');
 const owner=await feedbackOwner();
 if(!owner)return <main className="inbox-shell"><a className="wordmark" href="/">de-tok ✳</a><h1>This inbox is private.</h1><p>Sign in with the ChatGPT account that owns De-Tok.</p><a href={chatGPTSignOutPath('/inbox')} target="_top">Switch account</a></main>;
 return <main className="inbox-shell"><div className="inbox-header"><a className="wordmark" href="/">de-tok ✳</a><a href={chatGPTSignOutPath('/')} target="_top">Sign out</a></div><p className="eyebrow">FOR THE CREATOR</p><h1>Your feedback inbox</h1><p>Ideas, experiences and bugs from the people using De-Tok.</p><Inbox/></main>;
}
