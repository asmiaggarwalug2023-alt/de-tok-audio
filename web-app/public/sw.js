self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.method==='GET' && new URL(event.request.url).origin===self.location.origin) event.respondWith(fetch(event.request));});
