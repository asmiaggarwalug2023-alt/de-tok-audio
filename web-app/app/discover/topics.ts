export const topics=[
 {id:'mental',label:'Mental health',query:'mental health anxiety depression',terms:/mental health|anxiety|depress|psychiatr|psycholog|wellbeing/i,icon:'◌',prompt:'New questions about feeling better.'},
 {id:'sleep',label:'Sleep & rest',query:'sleep insomnia circadian',terms:/sleep|insomnia|circadian|restless/i,icon:'☾',prompt:'What happens when we switch off?'},
 {id:'nutrition',label:'Food & nutrition',query:'nutrition diet gut microbiome',terms:/nutri|diet|food|gut|microbiom|vitamin/i,icon:'♧',prompt:'Follow the science behind your plate.'},
 {id:'movement',label:'Movement & fitness',query:'exercise physical activity fitness',terms:/exercis|physical activity|fitness|sport|muscle|walking/i,icon:'◇',prompt:'Small movements. Interesting discoveries.'},
 {id:'brain',label:'Brain health',query:'brain cognition neuroscience memory',terms:/brain|cognit|neuro|memory|dementia/i,icon:'✳',prompt:'What is the brain teaching us today?'},
 {id:'ageing',label:'Healthy ageing',query:'healthy aging longevity older adults',terms:/aging|ageing|longevity|older adult|geriatric|senesc/i,icon:'❋',prompt:'Research about living well, for longer.'},
 {id:'reproductive',label:'Reproductive health',query:'reproductive health menstruation menopause fertility',terms:/reproduct|menstr|menopaus|fertil|pregnan|pcos|ovari/i,icon:'◎',prompt:'A closer look at bodies and life stages.'},
 {id:'public',label:'Public health',query:'public health prevention community wellbeing',terms:/public health|prevent|community health|wellbeing|well-being|vaccin/i,icon:'✚',prompt:'Wellbeing beyond the individual.'}
];
export type Discovery={id:string;title:string;abstract:string;journal:string;date:string;dateLabel:string;url:string;authors:string;countries:string[];hasAbstract:boolean;source?:string};
