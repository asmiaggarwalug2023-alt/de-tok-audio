import {pipeline,env} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';
env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
self.onmessage=async event=>{try{
 const {audio,language='english',quality='accurate'}=event.data;
 const size=quality==='fast'?'base':'small';
 const model=`onnx-community/whisper-${size}${language==='english'?'.en':''}`;
 self.postMessage({status:'progress',message:quality==='fast'?'Loading the speech model…':'Loading the more accurate speech model. The first download is larger; keep this tab open…'});
 const transcriber=await pipeline('automatic-speech-recognition',model,{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress'&&typeof p.progress==='number')self.postMessage({status:'progress',message:`Loading speech model: ${Math.round(p.progress)}%`})}});
 self.postMessage({status:'progress',message:'Transcribing speech. This can take several minutes on your device…'});
 const options={chunk_length_s:30,stride_length_s:5,do_sample:false};
 // English-only Whisper models do not accept multilingual task/language tokens.
 if(language!=='english'){options.task='transcribe';if(language==='hindi')options.language='hindi';}
 const result=await transcriber(audio,options);
 self.postMessage({status:'done',text:result.text});
 await transcriber.dispose();
 }catch(error){self.postMessage({status:'error',message:error?.message||'Speech processing failed.'})}};
