(function(){
'use strict';
var API='https://www.wixapis.com';
var CFG={clientId:'64e9ad6e-3da2-4f24-b3d2-1eb0ed4eb4ba',formId:'a091e694-6e1c-486f-87a1-153dda96ab73',
 t:{first:'first_name_fnq8zv',last:'last_name_y9md45',email:'email_ninjnq',phone:'phone_6qcr83',service:'service_needed_mng9wt',details:'project_details_3k7p0c'}};
/* ===== FALLBACK CONTENT =====
   Everything below is only used if the Wix CMS cannot be reached.
   The real content lives in the Wix dashboard (CMS): Projects, Team, Services, Settings, Reviews.
   Reviews come from Google (googleReview below), not from a CMS collection. */
var D={
 phone:'425.610.5620',tel:'+14256105620',email:'hello@arkaremodeling.com',address:'Kirkland, WA',hours:'Mon-Fri 8AM-5PM',
 ig:'https://www.instagram.com/arkaremodeling/',googleReview:'https://g.page/r/CbCpJO14ZycJEAE/review',pinterest:'https://www.pinterest.com/',
 igPosts:[],
 sample:true,
 hero:[],
 services:[
  {n:'Bathroom Remodeling',d:'Spa-inspired bathrooms with durable materials, smart layouts and flawless finishes.'},
  {n:'Kitchen Remodeling',d:'From custom cabinetry to lighting and counters, kitchens designed around how you live.'},
  {n:'Home Additions',d:'Add the space your family needs with an addition that blends seamlessly with your home.'},
  {n:'Basement Remodeling',d:'Turn an unused basement into a bright living area, office, gym or guest suite.'},
  {n:'Whole Home Remodeling',d:'One accountable team to renovate multiple rooms or your entire home.'},
  {n:'Outdoor Living Spaces',d:'Decks, patios and outdoor kitchens made for Pacific Northwest living.'},
  {n:'ADU and DADU Construction',d:'Accessory and detached dwelling units, from design and permits to move-in day.'}],
 projects:[
  {s:'lakeview-modern-kitchen',t:'Lakeview Modern Kitchen',l:'Kirkland, WA',scope:['Full kitchen remodel','Custom cabinetry','Quartz countertops','Lighting and electrical']},
  {s:'spa-style-primary-bath',t:'Spa-Style Primary Bath',l:'Sammamish, WA',scope:['Primary bathroom remodel','Walk-in shower and soaking tub','Heated tile floors','Custom vanity']},
  {s:'craftsman-home-addition',t:'Craftsman Home Addition',l:'Redmond, WA',scope:['Second-story addition','Structural framing','Interior finishes','Permits and inspections']},
  {s:'daylight-basement-suite',t:'Daylight Basement Suite',l:'Issaquah, WA',scope:['Basement finishing','Bathroom and wet bar','Egress windows','Flooring and lighting']},
  {s:'backyard-adu',t:'Backyard ADU',l:'West Seattle, WA',scope:['Detached ADU construction','Design and permitting','Utilities hookup','Full interior finish']},
  {s:'outdoor-living-retreat',t:'Outdoor Living Retreat',l:'Bainbridge Island, WA',scope:['Covered patio and deck','Outdoor kitchen','Landscape lighting','Fire feature']}],
 team:null,
 cities:{pri:['Redmond','Issaquah','Sammamish','Newcastle'],more:['Kirkland','Bellevue','Bainbridge Island','West Seattle','Bothell','Kenmore','Woodinville','Mercer Island']}
};
window.ARKA=D;
var NAV=[['Meet the Team','meet-the-team.html'],['Services','services.html'],['Projects','projects.html'],['Financing','financing.html'],['Homeowner Resources','homeowner-resources.html'],['Contact Us','contact.html']];
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pic(url,label,i){return url?'<img class="cover" loading="lazy" src="'+esc(url)+'" alt="'+esc(label)+'">':'<div class="ph" data-i="'+((i||0)%4)+'">'+esc(label)+'</div>'}
function here(){return location.pathname.split('/').pop()||'index.html'}
function slug(n){return String(n||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
/* ===== Wix visitor API ===== */
var tok=null;
function token(){
 if(tok&&tok.exp>Date.now())return Promise.resolve(tok.t);
 return fetch(API+'/oauth2/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:CFG.clientId,grantType:'anonymous'})}).then(function(r){if(!r.ok)throw new Error('auth');return r.json()}).then(function(j){tok={t:j.access_token,exp:Date.now()+(j.expires_in-120)*1000};return tok.t});
}
function api(method,path,body){
 return token().then(function(t){return fetch(API+path,{method:method,headers:{Authorization:t,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined})}).then(function(r){return r.json().then(function(j){if(!r.ok){var e=new Error((j&&j.message)||'Request failed');e.status=r.status;throw e}return j})});
}
/* ===== CMS (Wix Data) ===== */
function imgUrl(v){
 if(!v)return '';
 if(typeof v==='object')v=v.src||v.url||v.uri||'';
 if(typeof v!=='string'||!v)return '';
 var m=v.match(/^wix:image:\/\/v1\/([^\/#]+)/);
 if(m)return 'https://static.wixstatic.com/media/'+m[1];
 if(/^wix:(video|document|audio)/.test(v))return '';
 if(v.indexOf('//')===0)return 'https:'+v;
 return /^https?:/.test(v)?v:'';
}
function imgList(v){
 if(!v)return [];
 if(typeof v==='string')v=[v];
 if(!Array.isArray(v))return [];
 return v.map(imgUrl).filter(Boolean);
}
function items(coll){
 return api('POST','/wix-data/v2/items/query',{dataCollectionId:coll,query:{paging:{limit:100}}}).then(function(r){
  return (r.dataItems||[]).map(function(x){return x.data||{}}).filter(function(d){return d.show!==false}).sort(function(a,b){
   var x=typeof a.order==='number'?a.order:1e9,y=typeof b.order==='number'?b.order:1e9;return x-y});
 });
}
function list(s){return String(s||'').split(/\r?\n|,/).map(function(x){return x.trim()}).filter(Boolean)}
function loadCMS(){
 var get=function(c){return items(c).catch(function(){return null})};
 return Promise.all([get('Projects'),get('Team'),get('Services'),get('Settings'),get('Reviews')]).then(function(r){
  var p=r[0],tm=r[1],sv=r[2],st=r[3],rv=r[4];
  if(p&&p.length)D.projects=p.filter(function(x){return x.title}).map(function(x){
   var g=imgList(x.gallery);
   return {s:x.slug||slug(x.title),t:x.title,l:x.location||'',scope:list(x.scope),img:imgUrl(x.mainPhoto)||g[0]||'',gallery:g};
  });
  if(rv&&rv.length)D.reviews=rv.filter(function(x){return x.comment}).map(function(x){return {n:x.reviewerName||'',t:x.comment,st:typeof x.starRating==='number'?x.starRating:5,reply:x.replyText||'',date:x.createTime||''}});
  if(tm&&tm.length)D.team=tm.filter(function(x){return x.name}).map(function(x){return {n:x.name,r:x.role||'',b:x.bio||'',img:imgUrl(x.photo)}});
  if(sv&&sv.length)D.services=sv.filter(function(x){return x.name}).map(function(x){return {n:x.name,d:x.description||'',img:imgUrl(x.photo)}});
  if(st&&st.length){var s=st[0];
   if(s.phone)D.phone=s.phone;
   if(s.tel)D.tel=s.tel;
   if(s.email)D.email=s.email;
   if(s.address)D.address=s.address;
   if(s.hours)D.hours=s.hours;
   if(s.instagram)D.ig=s.instagram;
   if(s.pinterest)D.pinterest=s.pinterest;
   D.googleReview=s.googleReviewUrl||D.googleReview;
   if(s.citiesPriority||s.citiesMore)D.cities={pri:list(s.citiesPriority),more:list(s.citiesMore)};
   var hp=imgList(s.heroPhotos);if(hp.length)D.hero=hp;
   if(typeof s.sampleLabels==='boolean')D.sample=s.sampleLabels;
  }
 });
}
/* ===== header / footer ===== */
var navBound=false;
function chrome(){
 var inner=document.body.classList.contains('inner');
 var links=NAV.map(function(x){return '<a href="'+x[1]+'"'+(here()===x[1]?' class="on"':'')+'>'+x[0]+'</a>'}).join('');
 var h='<div class="nav'+(inner?' solid':'')+'" id="nav"><div class="nav-in"><div class="nav-bar"><a class="logo img" href="index.html"><img src="assets/arka-logo-white.png" alt="ARKA Remodeling"></a><button class="burger" id="burger" aria-label="Menu">&#9776;</button><nav class="menu" id="menu">'+links+'<a class="tel" href="tel:'+esc(D.tel)+'">'+esc(D.phone)+'</a><a class="cta" href="contact.html#estimate">Get a Quote</a></nav></div></div><div class="subbar">Licensed, Bonded &amp; Insured<i>&bull;</i>Design. Build. Remodeling<i>&bull;</i>'+esc(D.address)+'</div></div>';
 var f='<footer class="site"><div class="f-in"><div><div class="logo img" style="margin-bottom:14px"><img src="assets/arka-logo-white.png" alt="ARKA Remodeling"></div><p>ARKA Remodeling LLC<br>General Contractor in WA<br>Licensed, Bonded &amp; Insured</p></div><div><h4>Explore</h4>'+links+'</div><div><h4>Contact</h4><a href="tel:'+esc(D.tel)+'">'+esc(D.phone)+'</a><a href="mailto:'+esc(D.email)+'">'+esc(D.email)+'</a><a>'+esc(D.address)+'</a><a>'+esc(D.hours)+'</a><a href="'+esc(D.ig)+'" target="_blank" rel="noopener" aria-label="Instagram"><img class="ig-ico" src="assets/instagram-white.svg" alt=""></a></div></div><div class="f-bot">&copy; '+new Date().getFullYear()+' ARKA Remodeling LLC. All rights reserved.</div></footer><a class="fab" href="contact.html#estimate">Free Estimate</a>';
 var hd=$('#site-header'),ft=$('#site-footer');
 if(hd)hd.innerHTML=h;if(ft)ft.innerHTML=f;
 var nav=$('#nav'),bg=$('#burger'),mn=$('#menu');
 if(bg)bg.onclick=function(){mn.classList.toggle('open')};
 if(nav&&!inner){nav.classList.toggle('solid',window.scrollY>40);if(!navBound){navBound=true;window.addEventListener('scroll',function(){var n=$('#nav');if(n)n.classList.toggle('solid',window.scrollY>40)},{passive:true})}}
}
/* ===== hero slideshow ===== */
var heroTimer=null;
function hero(){
 var box=$('#slides');if(!box)return;
 if(heroTimer){clearInterval(heroTimer);heroTimer=null}
 var imgs=D.hero.length?D.hero:[0,1,2,3];
 box.innerHTML=imgs.map(function(u,i){return D.hero.length?'<div class="slide" style="background-image:url(\''+esc(u)+'\')"></div>':'<div class="slide ph'+i+'"></div>'}).join('');
 var s=box.children,k=0;s[0].classList.add('on');
 if(s.length>1)heroTimer=setInterval(function(){s[k].classList.remove('on');k=(k+1)%s.length;s[k].classList.add('on')},6000);
}
/* ===== renderers ===== */
function services(){
 var g=$('#svc-grid');
 if(g)g.innerHTML=D.services.map(function(s,i){return '<a class="svc" href="services.html#'+slug(s.n)+'">'+pic(s.img,s.n,i)+'<span>'+esc(s.n)+'</span></a>'}).join('');
 var l=$('#svc-list');
 if(l)l.innerHTML=D.services.map(function(s,i){return '<div class="svc-row" id="'+slug(s.n)+'"><div class="im">'+pic(s.img,s.n,i)+'</div><div><h2>'+esc(s.n)+'</h2><p>'+esc(s.d)+'</p><div class="btns"><a class="btn" href="contact.html#estimate">Get a Free Estimate</a></div></div></div>'}).join('');
}
function projects(detail){
 var c=$('#proj-car');
 if(c){c.innerHTML='<div class="arrows"><button type="button" id="pl" aria-label="Previous">&#8592;</button><button type="button" id="pr" aria-label="Next">&#8594;</button></div><div class="track" id="trk">'+D.projects.map(function(p,i){return '<a class="card" href="project.html?p='+encodeURIComponent(p.s)+'"><div class="im">'+pic(p.img,p.t,i)+'</div><h3>'+esc(p.t)+'</h3><div class="loc">'+esc(p.l)+'</div><span class="more">View More</span></a>'}).join('')+'</div>';
  var t=$('#trk');$('#pl').onclick=function(){t.scrollBy({left:-t.clientWidth*.8,behavior:'smooth'})};$('#pr').onclick=function(){t.scrollBy({left:t.clientWidth*.8,behavior:'smooth'})}}
 var g=$('#proj-grid');
 if(g)g.innerHTML=D.projects.map(function(p,i){return '<a class="pcard" href="project.html?p='+encodeURIComponent(p.s)+'"><div class="im">'+pic(p.img,p.t,i)+'</div><p>'+esc(p.t)+'<small>'+esc(p.l)+'</small></p></a>'}).join('');
 var d=$('#proj-detail');
 if(d&&detail){var q=new URLSearchParams(location.search).get('p');var p=D.projects.filter(function(x){return x.s===q})[0]||D.projects[0];
  if(!p){d.innerHTML='<p class="empty">Project not found. <a href="projects.html">Back to Projects</a></p>';return}
  var idx=D.projects.indexOf(p);
  document.title=p.t+' | ARKA Remodeling';
  var photos=(p.gallery&&p.gallery.length)?p.gallery:(p.img?[p.img]:[]);
  var n=Math.max(5,photos.length),slots=[];for(var k=0;k<n;k++)slots.push(k);
  d.innerHTML=(D.sample?'<span class="sample-note">Sample project &mdash; photos and details coming soon</span>':'')+'<div class="eyebrow">'+esc(p.l)+'</div><h1>'+esc(p.t)+'</h1><h3 style="margin-top:1.4em">Scope of work</h3><ul class="checks">'+p.scope.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul><div class="btns"><a class="btn" href="contact.html#estimate">Get a Free Estimate</a><a class="btn ghost" href="tel:'+esc(D.tel)+'">Call '+esc(D.phone)+'</a><a class="btn ghost" href="projects.html">All Projects</a></div><div class="gal">'+slots.map(function(k){return '<div class="im">'+pic(photos[k],p.t+' photo '+(k+1),idx+k)+'</div>'}).join('')+'</div>'}
}
function reviews(){
 var r=$('#reviews');if(!r)return;
 var link='<a class="btn ghost" href="'+esc(D.googleReview)+'" target="_blank" rel="noopener">See all reviews on Google</a>';
 if(!D.reviews||!D.reviews.length){r.innerHTML='<article><p>Read what homeowners say about working with ARKA on Google.</p><footer>'+link+'</footer></article>';return}
 r.innerHTML=D.reviews.slice(0,3).map(function(x){
  var reply=x.reply?'<p class="reply"><strong>ARKA replied:</strong> '+esc(x.reply)+'</p>':'';
  return '<article><div class="stars">'+new Array(Math.max(0,Math.min(5,Math.round(x.st)))+1).join('&#9733;')+'</div><p>&ldquo;'+esc(x.t)+'&rdquo;</p>'+reply+'<footer>'+esc(x.n)+'<small>Google review</small></footer></article>';
 }).join('')+'<div class="btns">'+link+'</div>';
}
function team(){
 var t=$('#team');if(!t||!D.team||!D.team.length)return;
 t.innerHTML=D.team.map(function(x,i){return '<div class="person"><div class="im">'+pic(x.img,'Photo: '+x.n,i)+'</div><div class="role">'+esc(x.r)+'</div><h3>'+esc(x.n)+'</h3><p>'+esc(x.b)+'</p></div>'}).join('');
}
function areas(){
 var a=$('#areas');if(!a)return;
 a.innerHTML=D.cities.pri.map(function(c){return '<span class="pill pri">'+esc(c)+'</span>'}).join('')+D.cities.more.map(function(c){return '<span class="pill">'+esc(c)+'</span>'}).join('');
}
/* Instagram embeds: one blockquote per post permalink in D.igPosts; embed.js (in the page head) turns them into posts. */
function build(){
 var b=$('#build');if(!b)return;
 if(!D.igPosts.length){b.innerHTML='<p class="empty">Follow along on Instagram for new project videos.</p>';return}
 b.innerHTML=D.igPosts.map(function(u){return '<blockquote class="instagram-media" data-instgrm-permalink="'+esc(u)+'" data-instgrm-version="14" style="max-width:540px;min-width:280px;width:100%"><a href="'+esc(u)+'" target="_blank" rel="noopener">View this post on Instagram</a></blockquote>'}).join('');
 if(window.instgrm&&window.instgrm.Embeds)window.instgrm.Embeds.process();
}
function links(){
 var as=document.querySelectorAll('a');
 for(var i=0;i<as.length;i++){var a=as[i],h=a.getAttribute('href')||'';
  if(h==='#'&&/review/i.test(a.textContent)&&D.googleReview){a.href=D.googleReview;a.target='_blank';a.rel='noopener'}
  if(/^https:\/\/www\.pinterest\.com\/?$/.test(h)&&D.pinterest)a.href=D.pinterest;
 }
}
/* ===== blog ===== */
function txt(n){return (n.nodes||[]).map(function(c){return c.type==='TEXT'?esc(c.textData&&c.textData.text):txt(c)}).join('')}
function rich(nodes){
 return (nodes||[]).map(function(n){
  if(n.type==='HEADING')return '<h2>'+txt(n)+'</h2>';
  if(n.type==='PARAGRAPH')return '<p>'+txt(n)+'</p>';
  if(n.type==='BLOCKQUOTE')return '<blockquote>'+txt(n)+'</blockquote>';
  if(n.type==='BULLETED_LIST')return '<ul>'+(n.nodes||[]).map(function(l){return '<li>'+txt(l)+'</li>'}).join('')+'</ul>';
  if(n.type==='ORDERED_LIST')return '<ol>'+(n.nodes||[]).map(function(l){return '<li>'+txt(l)+'</li>'}).join('')+'</ol>';
  return '';}).join('');
}
function fdate(s){try{return new Date(s).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}catch(e){return ''}}
function blog(){
 var f=$('#blog-feed'),a=$('#blog-post');
 if(f){
  var lim=parseInt(f.getAttribute('data-limit')||'20',10);
  f.innerHTML='<p class="loading">Loading articles&hellip;</p>';
  Promise.all([api('POST','/blog/v3/posts/query',{query:{sort:[{fieldName:'firstPublishedDate',order:'DESC'}],cursorPaging:{limit:lim}}}),api('POST','/blog/v3/categories/query',{query:{paging:{limit:100}}}).catch(function(){return{categories:[]}})]).then(function(r){
   var cats={};(r[1].categories||[]).forEach(function(c){cats[c.id]=c.label});
   var ps=r[0].posts||[];
   if(!ps.length){f.innerHTML='<p class="empty">New articles are coming soon.</p>';return}
   f.innerHTML=ps.map(function(p){return '<a class="post" href="article.html?slug='+encodeURIComponent(p.slug)+'"><span class="tag">'+esc(cats[(p.categoryIds||[])[0]]||'Homeowner Resources')+'</span><h3>'+esc(p.title)+'</h3><span class="date">'+fdate(p.firstPublishedDate)+'</span><span class="more" style="font-family:var(--ff-ui);font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;color:var(--navy)">Read article &rarr;</span></a>'}).join('');
  }).catch(function(){f.innerHTML='<p class="empty">Articles are unavailable right now. Please check back soon.</p>'});
 }
 if(a){
  var sl=new URLSearchParams(location.search).get('slug');
  if(!sl){a.innerHTML='<p class="empty">Article not found. <a href="homeowner-resources.html">Back to Homeowner Resources</a></p>';return}
  api('GET','/blog/v3/posts/slugs/'+encodeURIComponent(sl)+'?fieldsets=RICH_CONTENT&fieldsets=CONTENT_TEXT').then(function(r){
   var p=r.post;document.title=p.title+' | ARKA Remodeling';
   a.innerHTML='<div class="eyebrow">Homeowner Resources &middot; '+fdate(p.firstPublishedDate)+'</div><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">'+esc(p.title)+'</h1>'+rich(p.richContent&&p.richContent.nodes)+'<div class="btns"><a class="btn" href="contact.html#estimate">Get a Free Estimate</a><a class="btn ghost" href="homeowner-resources.html">All articles</a></div>';
  }).catch(function(){a.innerHTML='<p class="empty">Article not found. <a href="homeowner-resources.html">Back to Homeowner Resources</a></p>'});
 }
}
/* ===== estimate form ===== */
var formBound=false;
function form(){
 var f=$('#est-form');if(!f)return;
 var sel=$('#f-service');if(sel){var cur=sel.value;sel.innerHTML='<option value="">Select a service</option>'+D.services.map(function(s){return '<option>'+esc(s.n)+'</option>'}).join('');sel.value=cur}
 if(formBound)return;formBound=true;
 f.addEventListener('submit',function(e){
  e.preventDefault();
  var m=$('#f-msg'),b=f.querySelector('button');
  var ph=f.phone.value.replace(/\D/g,'');if(ph.length===10)ph='1'+ph;
  var v={};v[CFG.t.first]=f.first.value.trim();v[CFG.t.last]=f.last.value.trim();v[CFG.t.email]=f.email.value.trim();v[CFG.t.phone]='+'+ph;v[CFG.t.service]=f.service.value;
  if(f.details.value.trim())v[CFG.t.details]=f.details.value.trim();
  b.disabled=true;m.className='msg';m.textContent='Sending…';
  api('POST','/form-submission-service/v4/submissions',{submission:{formId:CFG.formId,submissions:v}}).then(function(){
   f.reset();m.className='msg ok';m.textContent='Thank you! Our team will contact you shortly to schedule your free estimate.';b.disabled=false;
  }).catch(function(){m.className='msg err';m.innerHTML='We could not send your request. Please check your details or call us at <a href="tel:'+esc(D.tel)+'">'+esc(D.phone)+'</a>.';b.disabled=false});
 });
}
function paint(detail){chrome();hero();services();projects(detail);reviews();team();areas();build();links();form()}
document.addEventListener('DOMContentLoaded',function(){
 paint(false);
 blog();
 function fin(){paint(true)}
 var to=setTimeout(fin,6000);
 loadCMS().then(function(){clearTimeout(to);fin()},function(){clearTimeout(to);fin()});
});
})();