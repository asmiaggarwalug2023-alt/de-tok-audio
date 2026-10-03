import test from 'node:test';
import assert from 'node:assert/strict';
import {runStatementSearches} from '../app/batch-search.mjs';
test('statements search independently with bounded concurrency and continue after a failure',async()=>{
 const updates=[];let active=0,maxActive=0;
 await runStatementSearches({claims:[{claim:'A',query:'sleep'},{claim:'B',query:'nutrition'},{claim:'C',query:'exercise'}],signal:new AbortController().signal,onUpdate:(index,data)=>updates.push({index,...data}),fetcher:async(_url,options)=>{
  active++;maxActive=Math.max(maxActive,active);
  const query=JSON.parse(options.body).query;await new Promise(resolve=>setTimeout(resolve,5));active--;
  return {ok:query!=='nutrition',json:async()=>query==='nutrition'?{error:'Unavailable'}:{papers:[{id:query}],total:1}};
 }});
 assert.equal(maxActive,2);
 assert.deepEqual(updates.filter(u=>u.status!=='searching').map(u=>[u.index,u.status]).sort((a,b)=>a[0]-b[0]),[[0,'complete'],[1,'error'],[2,'complete']]);
});
test('a stalled statement yields a visible timeout instead of blocking the batch',async()=>{
 const updates=[];
 await runStatementSearches({claims:[{claim:'Slow',query:'sleep'}],signal:new AbortController().signal,timeoutMs:5,onUpdate:(_index,data)=>updates.push(data),fetcher:async(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))))});
 assert.equal(updates.at(-1).status,'error');assert.match(updates.at(-1).error,/too long/);
});
test('cancelling a batch suppresses stale updates',async()=>{
 const controller=new AbortController(),updates=[];
 await runStatementSearches({claims:[{claim:'A',query:'sleep'},{claim:'B',query:'nutrition'}],signal:controller.signal,onUpdate:(index,data)=>{updates.push({index,...data});controller.abort()},fetcher:async()=>({ok:true,json:async()=>({papers:[],total:0})})});
 assert(updates.every(u=>u.status==='searching'));
});
