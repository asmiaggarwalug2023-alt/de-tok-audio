import type {Discovery} from './topics';
const plain=(s:string)=>s.replace(/\bincident\b/gi,'new cases of').replace(/\bprevalence\b/gi,'how common it is').replace(/\bcorrelates\b/gi,'connections').replace(/\bintervention\b/gi,'approach').replace(/\brandomi[sz]ed controlled trial\b/gi,'a test comparing groups').replace(/\bprospective cohort study\b/gi,'a study following people over time').replace(/\bmeta.analysis\b/gi,'a comparison of earlier studies').replace(/\bassociation(?:s)?\b/gi,'link').replace(/\bcognitive (?:function(?:ing)?|performance)\b/gi,'memory and thinking').replace(/\bcardiovascular\b/gi,'heart').replace(/\bphysical activity\b/gi,'everyday movement').replace(/\bsedentary behavio[u]?r\b/gi,'time spent sitting').replace(/\bhypertension\b/gi,'high blood pressure').replace(/\bglyc(?:a)?emic control\b/gi,'blood sugar').replace(/\badolescents\b/gi,'teenagers').replace(/\bolder adults\b/gi,'older people').replace(/\bpediatric\b/gi,'children’s').replace(/\b(?:gut )?(?:microbiota|microbiome)\b/gi,'gut microbes').replace(/\bsleep quality\b/gi,'how well you sleep').replace(/\bdepressive symptoms\b/gi,'signs of depression').replace(/\bneurocognitive\b/gi,'brain').replace(/\befficacy\b/gi,'effectiveness').replace(/\bhealth-related quality of life\b/gi,'everyday wellbeing');
const lower=(s:string)=>s.replace(/^[A-Z](?=[a-z])/ ,c=>c.toLowerCase());
export function friendlyStudy(article:Discovery,_topicLabel:string){
 const original=article.title.trim().replace(/\.$/,'');const text=original+' '+article.abstract;
 const core=plain(original.replace(/\s*[:–—]\s*(?:a |an |the )?(?:systematic review|meta.analysis|randomi[sz]ed|cross.sectional|prospective|retrospective|longitudinal|cohort|scoping review|pilot study|study protocol)[\s\S]*$/i,'')).trim();
 const animal=/\b(mice|mouse|rats?|zebrafish|drosophila|animal model)\b/i.test(text),lab=animal||/\b(in vitro|cell culture|cell line)\b/i.test(text),protocol=/\bprotocol\b/i.test(original),review=/systematic review|meta.analysis|scoping review/i.test(original),observational=/association|associated|correlat|cohort|cross.sectional|longitudinal|prospective/i.test(text);
 let title='';
 const hooks:[RegExp,RegExp,string][]=[
 [/sleep|insomnia/i,/thyroid/i,'Your bedtime and your thyroid: could they be connected?'],
 [/sleep|insomnia/i,/screen|smartphone|social media|digital device/i,'One more scroll before bed: what might it mean for your sleep?'],
 [/sleep|insomnia/i,/caffeine|coffee/i,'Coffee now, wide awake later? Researchers are testing the connection.'],
 [/sleep|insomnia/i,/memor|learn/i,'Does a good night’s sleep help yesterday’s learning stick?'],
 [/sleep|insomnia/i,/pregnan/i,'Growing a baby, losing sleep? A closer look at nights during pregnancy.'],
 [/exercise|physical activity|walking/i,/memor|cognit/i,'Could moving your body be linked to a sharper memory?'],
 [/social media|smartphone|screen time/i,/anxiety|depress|mental health/i,'Is your phone time linked to how you feel? Let’s look at this study.'],
 [/microbiom|gut/i,/anxiety|depress|brain|mental health/i,'Could the tiny microbes in your gut be linked to your mood?'],
 [/diet|food|nutrition/i,/ultra.process/i,'What’s the research question behind ultra-processed snacks?'],
 [/menopaus/i,/sleep|insomnia/i,'Why do nights get tricky around menopause? This study takes a look.'],
 [/exercise|physical activity/i,/depress/i,'Movement and low mood: what connection are researchers exploring?'],
 [/sleep/i,/anxiety|depress/i,'Restless nights and heavy feelings: how might they fit together?']
 ];
 for(const [a,b,hook] of hooks)if(a.test(original)&&b.test(original)){title=hook;break}
 const link=core.match(/^(?:the )?(?:link|relationship|connection|correlation) between (.+?) and (.+)$/i),effect=core.match(/^(?:the )?(?:effect(?:s)?|impact|influence) of (.+?) on (.+)$/i),verb=core.match(/^(.+?)\s+(improves|reduces|increases|predicts|prevents|enhances|is associated with)\s+(.+)$/i);
 if(/caffeine|coffee/i.test(original)&&/timing|time of|bedtime/i.test(original)&&/sleep/i.test(original))title='How late is too late for coffee? This study asks about bedtime.';
 if(/sleep/i.test(original)&&/duration/i.test(original)&&/thyroid/i.test(original))title='Hours of sleep and thyroid health: does the connection change with sleep length?';
 if(!title){if(core.endsWith('?'))title=core;else if(link)title=`${link[1]} + ${lower(link[2])}: what’s the connection?`;else if(effect)title=`Could ${lower(effect[1])} make a difference to ${lower(effect[2])}?`;else if(verb)title=`${verb[1]} and ${lower(verb[3])}: is there a connection?`;else title=`Ever wondered about ${lower(core)}?`;}
 if(lab)title=`${animal?'A clue from animal research':'Inside the lab'}: ${lower(title)}`;
 const scope=protocol?'This is a study plan, so there are no completed results yet.':review?'This paper brings earlier studies together.':observational?'Researchers look for connections. That cannot prove one thing caused another.':'This paper investigates the question; the headline is an invitation to explore, not a proven benefit.';
 const focus=plain(core);const description=`Behind the hook: ${focus}. ${scope}${lab?' These results cannot be assumed to apply to people.':''} Peek at the original paper for who was studied and what actually happened.`;
 return {title,description};
}
