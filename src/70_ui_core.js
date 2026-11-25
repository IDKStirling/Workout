/* =========================================================
   UI CORE — helpers, icons, navigation, sheets, pages, toasts,
   delete animations, Home, My Workout Plan
   ========================================================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const num=n=>Math.round(n||0).toLocaleString('en-US');
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WDAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function fmtDate(s,long){const d=parseYmd(s);return (long?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]:WDAY[d.getDay()])+', '+MON[d.getMonth()]+' '+d.getDate();}
function fmtDur(ms){const m=Math.max(1,Math.round(ms/60000));return m<60?m+' min':Math.floor(m/60)+'h '+(m%60)+'m';}
const IC={
 home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',plan:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
 log:'<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',progress:'<path d="M4 19V11M10 19V5M16 19v-6M2 21h20"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',
 trash:'<path class="lid" d="M4 7h16M10 4h4"/><path d="M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
 swap:'<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',play:'<path d="M7 5l12 7-12 7z" fill="currentColor"/>',pause:'<path d="M8 5v14M16 5v14"/>',
 chev:'<path d="M9 6l6 6-6 6"/>',back:'<path d="M15 6l-6 6 6 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',food:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M8 7h7"/>',pill:'<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M10 7.5l4.5 6.5"/>',
 pulse:'<path d="M3 12h4l2-5 3 10 2-5h7"/>',trophy:'<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',upload:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',cube:'<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M21 7l-9 5-9-5"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 calc:'<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 tools:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>'
};
const icon=(n,cls)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${cls?` class="${cls}"`:''}>${IC[n]||''}</svg>`;
function ringSVG(p,size,cls,stroke){size=size||64;stroke=stroke||7;const r=(size-stroke)/2,c=2*Math.PI*r;p=Math.max(0,Math.min(1,p||0));
  return `<svg class="ring ${cls||''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="bgc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="${stroke}"/><circle class="fgc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p)}"/></svg>`;}

/* ---------- UI state ---------- */
const UI={view:'plan',planSel:null,sheets:[],pages:[],toastT:null,toastUndo:null,restored:null,libQ:'',libG:'All',libP:'all',fuelTab:'overview',preDay:'d1',preMode:null,recCat:'All',progEx:null};
function commit(){saveState();}

/* ---------- theme ---------- */
function applyTheme(){const t=S.profile.theme||'system';if(t==='system')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);
  const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#0B0C0F';}

/* ---------- navigation ---------- */
/* five tabs. The live workout ('log') lives under Workouts; Settings ('profile') opens from the header gear. */
const NAV=[['home','Home','home'],['plan','Workouts','log'],['progress','Progress','progress'],['fuel','Fuel','food'],['tools','Toolkit','tools']];
function renderNav(){
  $('#navin').innerHTML=NAV.map(([v,l,i])=>{const on=UI.view===v||(v==='plan'&&UI.view==='log');return `<button class="nb ${v}${on?' on':''}" data-act="go" data-v="${v}" aria-label="${l}"><span class="ni">${icon(i)}</span>${l}${v==='plan'&&S.active?'<i class="livedot"></i>':''}</button>`;}).join('');
  const g=$('#gearbtn');if(g){g.innerHTML=icon('gear');g.classList.toggle('on',UI.view==='profile');}
}
function go(v){if(v==='plan'&&S.active)v='log';if(v==='log'&&!S.active)v='plan';UI.view=v;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='v-'+v));renderView(v);renderNav();window.scrollTo(0,0);}
function renderView(v){v=v||UI.view;({home:renderHome,plan:renderPlan,log:renderLog,progress:renderProgress,fuel:renderFuel,tools:renderTools,profile:renderProfile}[v]||renderPlan)();}
function rerender(){renderView();renderNav();const pg=UI.pages[UI.pages.length-1];if(pg)pg.render(pg.body,pg);}

/* ---------- sheets (bottom) & pages (full screen) ---------- */
function openSheet(title,body,opts){
  opts=opts||{};const wrap=document.createElement('div');wrap.className='sheet-wrap';
  wrap.innerHTML=`<div class="sheet"><div class="sheet-h"><h3>${title}</h3><button class="ibtn" data-act="close-sheet" aria-label="Close">${icon('x')}</button></div><div class="sheet-b"></div></div>`;
  $('#layers').appendChild(wrap);const b=wrap.querySelector('.sheet-b');
  if(typeof body==='function')body(b);else b.innerHTML=body;
  requestAnimationFrame(()=>requestAnimationFrame(()=>wrap.classList.add('show')));
  wrap.addEventListener('click',e=>{if(e.target===wrap)closeSheet();});
  UI.sheets.push({wrap,onClose:opts.onClose});document.body.style.overflow='hidden';
  bindSwipes(b);return b;
}
function closeSheet(){const s=UI.sheets.pop();if(!s)return;s.wrap.classList.remove('show');if(s.onClose)s.onClose();setTimeout(()=>s.wrap.remove(),400);if(!UI.sheets.length&&!UI.pages.length)document.body.style.overflow='';}
function closeAllSheets(){while(UI.sheets.length)closeSheet();}
function openPage(title,render){
  const el=document.createElement('div');el.className='page';
  el.innerHTML=`<div class="page-top"><button class="ibtn" data-act="close-page" aria-label="Back">${icon('back')}</button><h3>${title}</h3></div><div class="page-b"><div class="wrap"></div></div>`;
  $('#layers').appendChild(el);const pg={el,body:el.querySelector('.page-b .wrap'),render};UI.pages.push(pg);
  render(pg.body,pg);bindSwipes(pg.body);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')));document.body.style.overflow='hidden';return pg;
}
function closePage(){const pg=UI.pages.pop();if(!pg)return;pg.el.classList.remove('show');setTimeout(()=>pg.el.remove(),380);if(!UI.sheets.length&&!UI.pages.length)document.body.style.overflow='';renderView();}

/* ---------- toast with undo ---------- */
function toast(msg,opts){
  opts=opts||{};const t=$('#toast');clearTimeout(UI.toastT);
  t.innerHTML=`<span>${msg}</span>`+(opts.undo?`<button class="undo" data-act="toast-undo">Undo</button><i class="tbar"></i>`:'');
  UI.toastUndo=opts.undo||null;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');
  const ms=opts.undo?5000:(opts.ms||2200);
  if(opts.undo){const bar=t.querySelector('.tbar');if(bar.animate)bar.animate([{width:'100%'},{width:'0%'}],{duration:ms,easing:'linear',fill:'forwards'});}
  UI.toastT=setTimeout(()=>{t.classList.remove('show');UI.toastUndo=null;},ms);
}

/* ---------- delete animation: slide + fade, then collapse so nothing jumps ---------- */
const reduceMotion=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateRemove(el,done){
  if(!el||!el.animate||reduceMotion()){if(el)el.remove();if(done)done();return;}
  const cs=getComputedStyle(el),h=el.getBoundingClientRect().height;el.style.pointerEvents='none';
  const fg=el.querySelector('.sw-fg');const startX=fg?getComputedStyle(fg).transform:'none';
  const a1=el.animate([{opacity:1,transform:'translateX(0) scale(1)'},{opacity:0,transform:'translateX(-36px) scale(.97)'}],{duration:210,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  a1.onfinish=()=>{el.style.overflow='hidden';
    const a2=el.animate([{height:h+'px',marginTop:cs.marginTop,marginBottom:cs.marginBottom,paddingTop:cs.paddingTop,paddingBottom:cs.paddingBottom},
      {height:'0px',marginTop:'0px',marginBottom:'0px',paddingTop:'0px',paddingBottom:'0px'}],{duration:240,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
    a2.onfinish=()=>{el.remove();if(done)done();};};
}
function deleteWithUndo(el,{remove,restore,msg,id}){
  const token=remove();commit();
  animateRemove(el,()=>rerender());
  toast(msg,{undo:()=>{restore(token);UI.restored=id||null;commit();rerender();setTimeout(()=>UI.restored=null,600);}});
}
/* swipe-to-delete on any .swipe[data-del] row */
function bindSwipes(root){
  root.querySelectorAll('.swipe[data-del]:not([data-bound])').forEach(row=>{
    row.dataset.bound='1';const fg=row.querySelector('.sw-fg');let x0=null,y0=0,dx=0,drag=false;
    row.addEventListener('pointerdown',e=>{if(e.button>0)return;x0=e.clientX;y0=e.clientY;dx=0;drag=false;fg.style.transition='none';});
    row.addEventListener('pointermove',e=>{if(x0==null)return;const mx=e.clientX-x0,my=e.clientY-y0;
      if(!drag&&Math.abs(mx)>10&&Math.abs(mx)>Math.abs(my)*1.4){drag=true;try{row.setPointerCapture(e.pointerId);}catch(_){}}
      if(!drag)return;dx=Math.min(0,mx);fg.style.transform=`translateX(${dx}px)`;row.classList.toggle('armed',dx<-90);});
    const end=()=>{if(x0==null)return;x0=null;fg.style.transition='';
      if(drag&&dx<-90){fg.style.transform='translateX(-110%)';row.dataset.swiped='1';const fn=ACT[row.dataset.del];if(fn)setTimeout(()=>fn(row),120);}
      else{fg.style.transform='';}
      if(drag){row.dataset.justSwiped='1';setTimeout(()=>delete row.dataset.justSwiped,300);}drag=false;row.classList.remove('armed');};
    row.addEventListener('pointerup',end);row.addEventListener('pointercancel',end);
  });
}
const swipeRow=(inner,del,attrs)=>`<div class="swipe${attrs&&attrs.restored?' enter':''}" data-del="${del}" ${attrs&&attrs.data||''}><div class="sw-bg">${icon('trash')}</div><div class="sw-fg">${inner}</div></div>`;

/* ---------- action dispatcher ---------- */
const ACT={};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el)return;
  if(el.closest('[data-just-swiped]'))return;
  const fn=ACT[el.dataset.act];if(fn){e.preventDefault();fn(el,e);}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(UI.sheets.length)closeSheet();else if(UI.pages.length)closePage();}});
Object.assign(ACT,{
  go:el=>{closeAllSheets();while(UI.pages.length)closePage();go(el.dataset.v);},
  'close-sheet':()=>closeSheet(),'close-page':()=>closePage(),
  'toast-undo':()=>{const f=UI.toastUndo;UI.toastUndo=null;$('#toast').classList.remove('show');if(f)f();},
  acc:el=>el.parentElement.classList.toggle('open'),
});

/* ---------- input dispatch ---------- */
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.in&&IN[t.dataset.in])IN[t.dataset.in](t,e);});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.ch&&IN[t.dataset.ch])IN[t.dataset.ch](t,e);});
const IN={};

/* =========================================================
   HOME — summary of the day
   ========================================================= */
function todayInfo(){
  const prog=activeProgram();const day=dayForDate(prog.id);const done=sessionOn(ymd());
  return {prog,day,done:done.find(s=>s.progId===prog.id&&s.dayId===day.id)||done[0]||null};
}
function weekStats(){
  const plan=weekPlan(S.activeProgram);const train=plan.filter(x=>!x.day.rest);const days=new Set(plan.map(x=>x.ymd));
  const done=new Set(S.sessions.filter(s=>days.has(s.date)).map(s=>s.date)).size;
  return {planned:train.length,done:Math.min(done,Math.max(done,train.length))};
}
function renderHome(){
  const {prog,day,done}=todayInfo();const st=streakInfo();const wk=weekStats();
  const name=S.profile.name?', '+esc(S.profile.name.split(' ')[0]):'';
  const hr=NOW().getHours();const greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  let hero;
  if(S.active)hero=`<div class="card hero"><div class="tag">In progress</div><h2>${esc(S.active.name)}</h2><div class="meta">${S.active.items.reduce((a,it)=>a+it.sets.filter(s=>s.done).length,0)} sets done · started ${fmtDur(Date.now()-S.active.start)} ago</div><button class="btn pri lg block" style="margin-top:14px" data-act="go" data-v="log">${icon('play')} Resume workout</button></div>`;
  else if(day.rest)hero=`<div class="card hero rest"><div class="tag">Today · Rest day</div><h2>Recovery day</h2><div class="meta">Next: ${esc(nextTrainingLabel(prog.id))}</div><button class="btn good block" style="margin-top:14px" data-act="open-recovery">${icon('moon')} What to do today</button></div>`;
  else if(done)hero=`<div class="card hero rest"><div class="tag">Today · Done</div><h2>${esc(day.short||day.name)} ✓</h2><div class="meta">Nice work. Next: ${esc(nextTrainingLabel(prog.id))}</div></div>`;
  else{const slots=daySlots(prog.id,day.id);hero=`<div class="card hero"><div class="tag">Today’s workout · ${esc(day.label||prog.name)}</div><h2>${esc(day.short||day.name)}</h2><div class="meta">${slots.length} exercises · about ${estMinutes(prog.id,day.id)} min</div><button class="btn pri lg block" style="margin-top:14px" data-act="start-day" data-p="${prog.id}" data-d="${day.id}">${icon('play')} Start workout</button><button class="lnk" style="margin-top:10px;width:100%;text-align:center" data-act="go" data-v="plan">See the plan</button></div>`;}
  const key=mealKeyFor(prog.id,day);const sn=!day.rest&&!done&&!S.active?PRE_SNACK[key]:null;
  const cs=checkinStatus();
  const prompt=cs.state==='none'?`<div class="row tap" data-act="open-checkin"><span class="ico">${icon('calc')}</span><div class="grow"><div class="t">Enter your maxes</div><div class="s">Takes a minute — then every set is calculated for you</div></div>${icon('chev','chev')}</div>`
    :cs.state==='due'?`<div class="row tap" data-act="open-checkin"><span class="ico">${icon('calc')}</span><div class="grow"><div class="t">Your 3-month check-in is due</div><div class="s">Enter new maxes and see your progress</div></div>${icon('chev','chev')}</div>`:'';
  $('#v-home').innerHTML=`
   <div class="eyebrow">${fmtDate(ymd(),true)}</div><div class="ptitle" style="margin-top:4px">${greet}${name}</div>
   <div style="margin-top:14px">${hero}</div>
   <div class="tiles two"><div class="tile"><div class="v">${wk.done}/${wk.planned}</div><div class="l">Workouts this week</div></div><div class="tile"><div class="v">🔥 ${st.streak}</div><div class="l">Day streak</div></div></div>
   ${prompt||sn?`<div class="list" style="margin-top:10px">${prompt}${sn?`<div class="row tap" data-act="open-fuel" data-tab="pre"><span class="ico emo">🍌</span><div class="grow"><div class="t">Pre-workout snack</div><div class="s">${esc(sn.title)} · ${esc(sn.timing)}</div></div>${icon('chev','chev')}</div>`:''}</div>`:''}`;
}

/* =========================================================
   MY WORKOUT PLAN — the landing screen
   ========================================================= */
function exNext(slot){
  const ex=getEx(slot.exId);if(!ex)return {w:'',st:''};
  const p=planSets(slot);const f=p[0]||{};
  if(slot.time)return {w:(f.time||slot.time)+' sec',st:''};
  if(slot.max)return {w:ex.kind==='bw'?'Bodyweight':'—',st:'max reps'};
  if(f.mode==='calibrate')return {w:'Test set',st:'calibrate'};
  if(f.mode==='bw-noweight')return {w:'Bodyweight',st:''};
  const sc=(exMem(slot.exId).schemes||{})[schemeKey(slot)];const chip=sc?statusChip(sc.result):null;
  return {w:fmtW(ex,f.w,{short:true})+(slot.lo!==slot.hi?` × ${f.reps}`:''),st:chip?`<span class="st ${sc.result}">${chip[0]} ${chip[1]}</span>`:''};
}
function exRowHTML(slot,i){
  const ex=getEx(slot.exId);
  const variant=slot.variants?` · <span style="color:var(--accent)">${esc(ex.name)}</span>`:'';
  const presc=slot.edited&&!slot.swapped?`${slot.sets} × ${slot.time?slot.time+' sec':slot.lo===slot.hi?slot.lo:slot.lo+'–'+slot.hi}`:`${esc(slot.setsText)} × ${esc(slot.repsText)}`;
  return `<div class="exitem"><div class="exrow" data-act="ex-detail" data-ex="${slot.exId}">
    <span class="num">${i+1}</span><div class="grow" style="flex:1;min-width:0"><div class="nm">${esc(slot.swapped?ex.name:slot.name)}${slot.edited?'<span class="edited">edited</span>':''}</div>
    <div class="pr">${presc}${slot.suggested?' · 8–12 suggested':''}${variant}</div></div>
    <button class="ibtn sm" data-act="slot-edit" data-p="${slot.progId}" data-d="${slot.dayId}" data-i="${slot.idx}" aria-label="Edit">${icon('edit')}</button></div>${setPlanHTML(slot)}</div>`;
}
function slotsHTML(slots){
  let out='',i=0;
  while(i<slots.length){
    const s=slots[i];
    if(s.ss){const grp=[];while(i<slots.length&&slots[i].ss===s.ss){grp.push([slots[i],i]);i++;}
      out+=`<div class="ssgrp"><div class="sslabel">Superset — alternate sets, rest after both</div>${grp.map(([g,k])=>exRowHTML(g,k)).join('')}</div>`;}
    else{out+=exRowHTML(s,i);i++;}
  }
  return out;
}
function renderPlan(){
  const prog=activeProgram();const wp=weekPlan(prog.id);const todayY=ymd();
  if(!UI.planSel||!wp.find(x=>x.ymd===UI.planSel))UI.planSel=todayY;
  const sel=wp.find(x=>x.ymd===UI.planSel)||wp[0];const doneDates=new Set(S.sessions.map(s=>s.date));
  const day=sel.day;const isToday=sel.ymd===todayY;
  let detail='';
  if(day.rest){
    const rk=prog.id==='ppl'?day.id:(dowIdx(sel.date)===0?'d7':'d4');
    detail=`<div class="card hero rest"><div class="tag">${esc(prog.id==='ppl'?day.label:sel.dow)} · Rest</div><h2>Recovery day</h2><div class="meta">${esc((RECOVERY[rk]||RECOVERY.d4).focus)}</div><button class="btn good block" style="margin-top:12px" data-act="open-recovery" data-day="${rk}">${icon('moon')} Recovery plan</button></div>`;
  }else{
    const slots=daySlots(prog.id,day.id);const doneThat=S.sessions.find(s=>s.date===sel.ymd&&s.progId===prog.id&&s.dayId===day.id);
    const startBtn=S.active?`<button class="btn pri lg block" data-act="go" data-v="log">${icon('play')} Resume workout</button>`
      :doneThat?`<button class="btn ghost block" data-act="sess-detail" data-id="${doneThat.id}">✓ Done — view workout</button>`
      :`<button class="btn ${isToday?'pri lg':'ghost'} block" data-act="start-day" data-p="${prog.id}" data-d="${day.id}">${icon('play')} ${isToday?'Start workout':'Start this workout'}</button>`;
    detail=`<div class="dayhead"><div><div class="eyebrow">${esc(day.label||sel.dow)}${day.sameAs?' · same as Day 3':''}${isToday?' · Today':''}</div><h2>${esc(day.name)}</h2><div class="note">${slots.length} exercises · about ${estMinutes(prog.id,day.id)} min</div></div></div>
      <div style="margin-top:12px">${startBtn}</div>
      <div class="sec">${beforeHTML(prog.id,day)}</div>
      <div class="sec"><div class="eyebrow pgrp">The workout</div>${noMaxBanner(slots)}<div class="exlist">${slotsHTML(slots)}</div>
       <div class="note" style="margin-top:8px">Weights come from your maxes and adjust after every set. Tap an exercise for its form demo.</div></div>
      <div class="sec">${afterHTML(prog.id,day,!!doneThat)}</div>`;
  }
  const lw=prog.id==='legends'?legendsWeekIdx(sel.date):0;
  $('#v-plan').innerHTML=`
   <div class="ptitle">Workouts</div>
   <div class="seg" style="margin-top:14px">${PROGRAMS.map(p=>`<button class="${p.id===prog.id?'on':''}" data-act="set-prog" data-p="${p.id}">${esc(p.id==='ppl'?'PPL Split':'The Legend’s Split')}${p.badge?' <span class="rec-badge" style="margin-left:4px">REC</span>':''}</button>`).join('')}</div>
   <div class="sec" style="margin-top:16px"><div class="sec-h"><h3>This week</h3>${prog.id==='legends'?`<button class="lnk" data-act="legends-week">Week ${lw+1} of 2 ⇄</button>`:''}</div>
    <div class="wk">${wp.map(x=>{const cls=['wkd',x.day.rest?'rest':'',doneDates.has(x.ymd)?'done':'',x.ymd===todayY?'today':'',x.ymd===UI.planSel?'sel':''].join(' ');
      const lab=x.day.rest?'Rest':prog.id==='ppl'?{push:'Push',pull:'Pull',legs:'Legs',upper:'P+P'}[x.day.type]:shortLegend(x.day.name);
      return `<button class="${cls}" data-act="plan-sel" data-d="${x.ymd}"><span class="d">${x.dow}</span><span class="n">${esc(lab)}</span><span class="dot"></span></button>`;}).join('')}</div></div>
   <div class="sec">${detail}</div>
   <div class="sec"><div class="acc"><button data-act="acc">About ${esc(prog.name)}${icon('chev','chev')}</button><div class="acc-b">
     <p class="note" style="margin-top:0">${esc(prog.desc)}</p>
     <div class="note" style="margin-top:8px;color:var(--text)">💪 <b>Muscle:</b> ${esc(prog.muscle)}</div><div class="note" style="margin-top:6px;color:var(--text)">🏈 <b>Football:</b> ${esc(prog.football)}</div>
     ${prog.id==='legends'?`<button class="btn ghost block" style="margin-top:10px" data-act="open-legends">${icon('star')} Calendar & stories</button>`:''}</div></div></div>`;
}
function shortLegend(n){return {'Platz Legs':'Platz','Arnold Chest':'Arnold','5×5 Strength':'5×5','Herschel Walker Bodyweight':'BW','20-Rep Squats':'20s','German Volume 10×10':'GVT','Coleman Heavy':'Ronnie'}[n]||n.split(' ')[0];}
function nextTrainingLabel(pid){for(let i=1;i<8;i++){const d=dayForDate(pid,addDays(NOW(),i));if(!d.rest)return (i===1?'Tomorrow':WDAY[addDays(NOW(),i).getDay()])+': '+(d.short||d.name);}return '';}
function estMinutes(pid,did){const sl=daySlots(pid,did);let sec=0;sl.forEach(s=>{sec+=s.sets*(45+(s.ss?s.rest/2:s.rest));});return Math.round(sec/60/5)*5+10;}
Object.assign(ACT,{
  'plan-sel':el=>{UI.planSel=el.dataset.d;renderPlan();},
  'set-prog':el=>{if(S.activeProgram===el.dataset.p)return;S.activeProgram=el.dataset.p;if(el.dataset.p==='legends'&&!S.legendsStart)S.legendsStart=ymd(weekStart(NOW()));commit();renderPlan();renderNav();
    toast(el.dataset.p==='ppl'?'PPL Split is your program':'The Legend’s Split is your program — PPL is one tap away');},
  'legends-week':()=>{const cur=legendsWeekIdx(NOW());S.legendsStart=ymd(addDays(weekStart(NOW()),cur===0?-7:0));commit();renderPlan();toast('This week is now Week '+(legendsWeekIdx(NOW())+1));},
});
/* edit a slot: swap, sets, reps, rest — never alters the built-in program, only your overrides */
function openSlotEdit(progId,dayId,idx){
  const raw=getDay(progId,dayId).ex[idx];const slot=normSlot(raw,progId,dayId,idx);const ex=getEx(slot.exId);
  const ov=(((S.overrides[progId]=S.overrides[progId]||{})[dayId]=S.overrides[progId][dayId]||{})[idx])||{};
  const draft=Object.assign({sets:slot.sets,lo:slot.lo,hi:slot.hi,time:slot.time,rest:slot.rest,exId:ov.exId||null},{});
  const b=openSheet('Edit exercise',bb=>{
    const r=()=>{bb.innerHTML=`<div class="card"><div class="eyebrow">As written in your plan</div><div style="font-weight:650;margin-top:4px">${esc(raw.n)} — ${esc(raw.t||raw.setsText+' × '+raw.repsText)}</div></div>
      <div class="field"><label>Exercise</label><button class="btn block" style="justify-content:space-between" data-act="slot-swap" data-p="${progId}" data-d="${dayId}" data-i="${idx}"><span>${esc((getEx(draft.exId||slot.exId)||ex).name)}</span>${icon('swap')}</button></div>
      ${slot.variants?`<div class="field"><label>Variation</label><div class="seg">${slot.variants.map(v=>`<button class="${(draft.exId||slot.exId)===v?'on':''}" data-act="slot-var" data-v="${v}">${esc(getEx(v).name.replace('Seated ',''))}</button>`).join('')}</div></div>`:''}
      <div class="frow"><div class="field"><label>Sets</label><input class="inp" type="number" min="1" max="12" id="se-sets" value="${draft.sets}"></div>
      ${slot.time?`<div class="field"><label>Seconds</label><input class="inp" type="number" id="se-time" value="${draft.time}"></div>`:`<div class="field"><label>Reps (low)</label><input class="inp" type="number" id="se-lo" value="${draft.lo??''}"></div><div class="field"><label>Reps (high)</label><input class="inp" type="number" id="se-hi" value="${draft.hi??''}"></div>`}</div>
      <div class="field"><label>Rest between sets (sec)</label><input class="inp" type="number" step="15" id="se-rest" value="${draft.rest}"></div>
      <div class="frow" style="margin-top:16px"><button class="btn ghost" data-act="slot-reset" data-p="${progId}" data-d="${dayId}" data-i="${idx}">Reset to plan</button><button class="btn pri" data-act="slot-save" data-p="${progId}" data-d="${dayId}" data-i="${idx}">Save</button></div>`;};
    r();UI.slotDraft={draft,r,slot,progId,dayId,idx};});
}
Object.assign(ACT,{
  'slot-edit':(el,e)=>{e.stopPropagation();openSlotEdit(el.dataset.p,el.dataset.d,+el.dataset.i);},
  'slot-var':el=>{const D=UI.slotDraft;D.draft.exId=null;S.variantPick[slotKey(D.progId,D.dayId,D.idx)]=el.dataset.v;commit();D.slot.exId=el.dataset.v;D.r();rerender();},
  'slot-swap':el=>{const D=UI.slotDraft;openExPicker('Swap exercise',D.draft.exId||D.slot.exId,id=>{D.draft.exId=id;D.r();});},
  'slot-save':el=>{const D=UI.slotDraft;const o={};const sets=parseInt($('#se-sets').value,10);const rest=parseInt($('#se-rest').value,10);
    if(sets&&sets!==D.slot.sets)o.sets=Math.min(12,Math.max(1,sets));if(rest&&rest!==D.slot.rest)o.rest=rest;
    if(D.slot.time){const t=parseInt($('#se-time').value,10);if(t&&t!==D.slot.time)o.time=t;}
    else{const lo=parseInt($('#se-lo').value,10),hi=parseInt($('#se-hi').value,10);if(lo&&(lo!==D.slot.lo||(hi||lo)!==D.slot.hi)){o.lo=lo;o.hi=Math.max(lo,hi||lo);}}
    if(D.draft.exId&&D.draft.exId!==D.slot.baseId)o.exId=D.draft.exId;
    const O=S.overrides[D.progId][D.dayId];if(Object.keys(o).length)O[D.idx]=o;else delete O[D.idx];
    commit();closeSheet();rerender();toast('Saved to your plan');},
  'slot-reset':el=>{const D=UI.slotDraft;delete S.overrides[D.progId][D.dayId][D.idx];delete S.variantPick[slotKey(D.progId,D.dayId,D.idx)];commit();closeSheet();rerender();toast('Back to the original plan');},
});
/* searchable exercise picker (fast add / swap) */
function openExPicker(title,currentId,onPick){
  let q='',g='All';const cur=currentId?getEx(currentId):null;
  openSheet(title,b=>{
    const draw=()=>{const alts=cur?exAlternatives(currentId):[];
      const list=allExercises().filter(x=>(g==='All'||x.group===g)&&(!q||x.name.toLowerCase().includes(q.toLowerCase())));
      b.innerHTML=`<div style="position:relative"><input class="inp" id="pk-q" placeholder="Search exercises" value="${esc(q)}" style="padding-left:40px"><span style="position:absolute;left:12px;top:13px;width:18px;color:var(--faint)">${icon('search')}</span></div>
        <div class="chips" style="margin-top:10px">${['All'].concat(EX_GROUPS).map(x=>`<button class="chip${g===x?' on':''}" data-pkg="${x}">${x}</button>`).join('')}</div>
        ${alts.length&&!q&&g==='All'?`<div class="eyebrow" style="margin:14px 0 8px">Suggested alternatives</div><div class="list">${alts.map(x=>pickRow(x)).join('')}</div>`:''}
        <div class="eyebrow" style="margin:14px 0 8px">${list.length} exercises</div><div class="list">${list.map(x=>pickRow(x)).join('')||'<div class="empty">No matches</div>'}</div>`;
      const qi=b.querySelector('#pk-q');qi.oninput=()=>{q=qi.value;draw();const n=b.querySelector('#pk-q');n.focus();n.setSelectionRange(q.length,q.length);};
      b.querySelectorAll('[data-pkg]').forEach(c=>c.onclick=()=>{g=c.dataset.pkg;draw();});
      b.querySelectorAll('[data-pick]').forEach(r=>r.onclick=()=>{closeSheet();onPick(r.dataset.pick);});};
    const pickRow=x=>`<div class="row tap" data-pick="${x.id}"><div class="grow"><div class="t">${esc(x.name)}</div><div class="s">${esc(x.group)} · ${esc(x.equip)} · ${(x.primary||[]).map(m=>MUSCLE_NAMES[m]).join(', ')}</div></div>${x.id===currentId?'<span class="tagx">current</span>':icon('plus','chev')}</div>`;
    draw();});
}
