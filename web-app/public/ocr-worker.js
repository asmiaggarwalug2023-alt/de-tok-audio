importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js');
self.onmessage=async e=>{let worker;try{
 worker=await Tesseract.createWorker(e.data.language==='hin'?'hin+eng':'eng',1,{logger:m=>{if(m.status)self.postMessage({status:'progress',message:`${m.status} · ${Math.round((m.progress||0)*100)}%`})}});
 const {data}=await worker.recognize(e.data.image);
 self.postMessage({status:'done',text:data.text,confidence:data.confidence});
 }catch(error){self.postMessage({status:'error',message:error?.message||'Text recognition failed.'})}finally{await worker?.terminate()}};
