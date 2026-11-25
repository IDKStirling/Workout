/* =========================================================
   PROGRESS — quarterly max check-ins
   1. enter maxes (baseline)  2. saved  3. prompted again after 3 months
   4. compared with the previous check-in  5. charts update.
   Only numbers the user actually entered are charted — nothing is simulated.
   ========================================================= */
const CHECKIN_DAYS=91;
function checkins(){S.checkins=S.checkins||[];return S.checkins;}
/* older saves: every date a max was entered becomes a check-in */
function migrateCheckins(){if(S.checkins&&S.checkins.length)return;const d=new Set();Object.values(S.maxLog||{}).forEach(L=>L.forEach(x=>{if(x.src==='entered')d.add(x.date);}));S.checkins=[...d].sort().map(date=>({date}));}
function checkinStatus(){const c=checkins();if(!c.length)return {state:'none'};const last=c[c.length-1].date;const due=addDays(parseYmd(last),CHECKIN_DAYS);const left=daysBetween(NOW(),due);
  return {state:left<=0?'due':'wait',last,due,left,frac:Math.min(1,Math.max(0,1-left/CHECKIN_DAYS))};}
/* one point per check-in date: what was entered that day */
function seriesFor(id){
  const by={};((S.maxLog||{})[id]||[]).forEach(x=>{if(x.src==='entered')by[x.date]=x;});
  const c=checkins();const base=c.length?c[0].date:Object.keys(by).sort()[0];
  return Object.keys(by).sort().map(d=>({date:d,e:by[d].e,w:by[d].w,r:by[d].r,m:Math.max(0,Math.round(daysBetween(parseYmd(base),parseYmd(d))/30.44))}));
}
function checkinExercises(){
  const p=activeProgram();const ids=[];const add=id=>{const e=getEx(id);if(e&&e.kind!=='time'&&!ids.includes(id))ids.push(id);};
  (p.id==='legends'?['d1','d2','d3','d4','d5','d6','d7']:['d1','d2','d3','d5']).forEach(d=>{const day=getDay(p.id,d);if(day&&!day.rest)daySlots(p.id,d).forEach(s=>add(s.exId));});
  Object.keys(S.maxLog||{}).forEach(id=>{if(seriesFor(id).length)add(id);});
  const main=ids.filter(id=>getEx(id).kind!=='isolation'),acc=ids.filter(id=>getEx(id).kind==='isolation');
  return {main,acc};
}
const pctTxt=(a,b)=>{if(!(b>0))return '';const v=(a-b)/b*100;return (v>=0?'+':'')+(Math.round(v*10)/10)+'%';};
const lbTxt=d=>(d>=0?'+':'')+num(d)+' lb';

/* ---------- one simple chart per exercise ---------- */
function maxChart(ser,big){
  const W=320,H=big?150:ser.length>1?112:78,pl=10,pr=10,pt=24,pb=24;
  const st=checkinStatus();const lastM=ser.length?ser[ser.length-1].m:0;const nextM=lastM+3;
  const mMax=Math.max(3,nextM);const X=m=>pl+m/mMax*(W-pl-pr);
  const vs=ser.map(p=>p.e);let mn=Math.min(...vs),mx=Math.max(...vs);const pad=Math.max(10,(mx-mn)*.25);mn-=pad;mx+=pad;
  const Y=v=>H-pb-(v-mn)/(mx-mn)*(H-pb-pt);
  const path=ser.map((p,i)=>(i?'L':'M')+X(p.m).toFixed(1)+','+Y(p.e).toFixed(1)).join(' ');
  const months=[...new Set(ser.map(p=>p.m).concat([nextM]))].sort((a,b)=>a-b);
  const lastP=ser[ser.length-1];
  return `<div class="mcwrap"><svg class="chart mc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Max over time">
    <line class="base" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/>
    <line class="nextl" x1="${X(nextM)}" x2="${X(nextM)}" y1="${pt-8}" y2="${H-pb}"/>
    ${months.map(m=>`<text x="${X(m)}" y="${H-7}" text-anchor="${m===mMax?'end':m===0?'start':'middle'}" class="${m===nextM?'nx':''}">${m===nextM?'Next':'Month '+m}</text>`).join('')}
    ${ser.length>1?`<path class="ln" d="${path}"/>`:''}
    ${ser.map((p,i)=>{const lab=i===0||i===ser.length-1;return `<circle class="dot${i===ser.length-1?' last':''}" cx="${X(p.m)}" cy="${Y(p.e)}" r="${i===ser.length-1?5:4}"/>${lab?`<text class="vl" x="${X(p.m)}" y="${Y(p.e)-10}" text-anchor="${p.m===0&&ser.length>1?'start':'middle'}">${num(p.e)}</text>`:''}<circle class="hit" data-act="mc-pt" data-tip="${esc(`Month ${p.m} · ${fmtDate(p.date)}: ${num(p.e)} lb`)}" cx="${X(p.m)}" cy="${Y(p.e)}" r="14"/>`;}).join('')}
  </svg><div class="mctip note">${lastP?`Month ${lastP.m} · ${fmtDate(lastP.date)}: ${num(lastP.e)} lb`:''}</div></div>`;
}
Object.assign(ACT,{'mc-pt':el=>{const t=el.closest('.mcwrap').querySelector('.mctip');if(t)t.textContent=el.dataset.tip;}});
document.addEventListener('pointerover',e=>{const el=e.target.closest&&e.target.closest('.mc .hit');if(el)ACT['mc-pt'](el);});

function exProgressCard(id){
  const ex=getEx(id);const ser=seriesFor(id);if(!ser.length)return '';
  const cur=ser[ser.length-1],prev=ser.length>1?ser[ser.length-2]:null,first=ser[0];
  const d=prev?cur.e-prev.e:0;const cls=d>0?'gup':d<0?'gdn':'';
  return `<div class="pcard" data-act="open-pex" data-id="${id}">
    <div class="pch"><div style="flex:1;min-width:0"><div class="t">${esc(ex.name)}</div><div class="s">${ser.length} check-in${ser.length>1?'s':''}${ex.kind==='bw'?' · incl. body weight':''}</div></div>${icon('chev','chev')}</div>
    ${prev?`<div class="pcstats"><div><span>Previous</span><b>${num(prev.e)}</b></div><div><span>New</span><b>${num(cur.e)}</b></div><div><span>Gained</span><b class="${cls}">${lbTxt(d)}</b></div><div><span>Change</span><b class="${cls}">${pctTxt(cur.e,prev.e)}</b></div></div>`
      :`<div class="pcstats one"><div><span>Starting max</span><b>${num(cur.e)} lb</b></div><div><span>Set on</span><b>${fmtDate(cur.date)}</b></div></div>`}
    ${maxChart(ser)}
    ${ser.length>2?`<div class="note" style="margin-top:2px">Since Month 0: <b class="${cur.e>=first.e?'gup':'gdn'}">${lbTxt(cur.e-first.e)} (${pctTxt(cur.e,first.e)})</b></div>`:''}
  </div>`;
}
function renderProgress(){
  const st=checkinStatus();const {main,acc}=checkinExercises();const ids=main.concat(acc).filter(id=>seriesFor(id).length);
  let status;
  if(st.state==='none')status=`<div class="card hero"><div class="tag">Start here</div><h2>Set your starting maxes</h2><div class="meta">Enter your current maxes once. Every 3 months you’ll enter them again and see exactly how much stronger you got.</div><button class="btn pri lg block" style="margin-top:14px" data-act="open-checkin">${icon('calc')} Enter my maxes</button></div>`;
  else if(st.state==='due')status=`<div class="card hero"><div class="tag">Check-in due</div><h2>Time for your 3-month check-in</h2><div class="meta">Last check-in: ${fmtDate(st.last)}. Enter your new maxes to see how far you’ve come.</div><button class="btn pri lg block" style="margin-top:14px" data-act="open-checkin">${icon('calc')} Enter new maxes</button></div>`;
  else status=`<div class="card ckstat"><div class="eyebrow">Next check-in</div><div class="ckrow"><b>${fmtDate(ymd(st.due))}</b><span>in ${st.left} day${st.left===1?'':'s'}</span></div><div class="xpbar"><i style="width:${Math.round(st.frac*100)}%"></i></div>
    <div class="note" style="margin-top:8px">Keep training — your weights update after every workout. <button class="lnk" data-act="open-checkin">Update early</button></div></div>`;
  const c=checkins();
  $('#v-progress').innerHTML=`<div class="ptitle">Progress</div><div class="psub">Enter your maxes every 3 months and watch them climb.</div>
   <div style="margin-top:14px">${status}</div>
   ${ids.length?`<div class="sec"><div class="sec-h"><h3>Your lifts</h3></div><div class="pcards">${ids.map(exProgressCard).join('')}</div></div>`:''}
   ${c.length?`<div class="sec"><div class="sec-h"><h3>Check-in history</h3><span class="note">${c.length}</span></div><div style="display:flex;flex-direction:column;gap:8px">${c.slice().reverse().map((k,i)=>{const n=Object.keys(S.maxLog||{}).filter(id=>(S.maxLog[id]||[]).some(x=>x.src==='entered'&&x.date===k.date)).length;const m=Math.round(daysBetween(parseYmd(c[0].date),parseYmd(k.date))/30.44);
      return swipeRow(`<div class="row tap" style="border-radius:16px;border:1px solid var(--hair)" data-act="open-ck" data-d="${k.date}"><span class="ico">${icon('cal')}</span><div class="grow"><div class="t">${i===c.length-1?'Baseline':'Month '+m} · ${fmtDate(k.date)}</div><div class="s">${n} lift${n===1?'':'s'}</div></div><button class="trash ibtn" data-act="del-ck-btn" data-d="${k.date}" aria-label="Delete">${icon('trash')}</button></div>`,'del-ck',{data:`data-d="${k.date}"`,restored:UI.restored===k.date});}).join('')}</div></div>`:''}`;
  bindSwipes($('#v-progress'));
}

/* ---------- the check-in form ---------- */
function ckRowHTML(id){
  const ex=getEx(id);const ser=seriesFor(id);const last=ser[ser.length-1];const dr=(UI.ckDraft||{})[id]||{};
  const est=ckEstimate(id,dr);
  return `<div class="ckr" id="ck-${id}"><div class="ckn"><b>${esc(ex.name)}</b><small>${last?`Last: ${num(last.e)} lb · ${fmtDate(last.date)}`:'No max yet'}${ex.perHand?' · per hand':''}</small></div>
   <div class="ckin"><input class="nin" type="number" inputmode="decimal" placeholder="${ex.kind==='bw'?'+/− lb':'lb'}" data-in="ck" data-id="${id}" data-f="w" value="${dr.w??''}" aria-label="${esc(ex.name)} weight"><span>×</span><input class="nin" type="number" inputmode="numeric" placeholder="reps" data-in="ck" data-id="${id}" data-f="r" value="${dr.r??''}" aria-label="${esc(ex.name)} reps"><em class="ckres" id="ckres-${id}">${est}</em></div></div>`;
}
function ckEstimate(id,dr){const ex=getEx(id);const r=parseInt(dr.r,10);const w=dr.w===''||dr.w==null?(ex.kind==='bw'?0:NaN):parseFloat(dr.w);
  if(!(r>0)||isNaN(w))return '';if(r>15)return 'max 15 reps';if(ex.kind==='bw'&&!bodyweight())return 'add body wt';const e=Math.floor(e1rm(loadOf(ex,w),r));return e>0?'= '+num(e):'';}
function openCheckin(){
  closeAllSheets();UI.ckDraft={};const first=!checkins().length;
  openPage(first?'Starting maxes':'3-month check-in',b=>{
    const {main,acc}=checkinExercises();
    b.innerHTML=`<div class="callout">Enter a recent set you did with good form — <b>weight × reps</b>. Use <b>1 rep</b> if it was a true max. The app works out your max and rounds it down.</div>
     <div class="note" style="margin-top:8px">No need to max out for this — a set of 3–10 good reps is accurate and safer. Leave a lift blank to skip it.</div>
     <div class="eyebrow" style="margin:16px 0 8px">Main lifts</div><div class="cklist">${main.map(ckRowHTML).join('')}</div>
     ${acc.length?`<div class="acc" style="margin-top:12px"><button data-act="acc">Smaller lifts (${acc.length})${icon('chev','chev')}</button><div class="acc-b"><div class="cklist">${acc.map(ckRowHTML).join('')}</div></div></div>`:''}
     <button class="btn pri lg block" style="margin-top:16px" data-act="ck-save">Save check-in</button>`;
  });
}
Object.assign(IN,{ck:t=>{const id=t.dataset.id;UI.ckDraft=UI.ckDraft||{};const d=UI.ckDraft[id]||(UI.ckDraft[id]={});d[t.dataset.f]=t.value;const o=document.getElementById('ckres-'+id);if(o)o.textContent=ckEstimate(id,d);}});
Object.assign(ACT,{
  'open-checkin':()=>openCheckin(),
  'ck-save':()=>{
    const D=UI.ckDraft||{};const saved=[];let needBW=false,bad=false;
    Object.entries(D).forEach(([id,d])=>{const ex=getEx(id);const r=parseInt(d.r,10);const wBlank=d.w===''||d.w==null;
      if(!(r>0)&&wBlank)return;if(!(r>0)||r>15||(wBlank&&ex.kind!=='bw')){bad=true;return;}
      const e=setEnteredMax(id,wBlank?0:parseFloat(d.w),r);if(e===-1){needBW=true;return;}if(e>0)saved.push(id);});
    if(bad){toast('Check your numbers — each lift needs a weight and 1–15 reps');return;}
    if(needBW&&!saved.length){toast('Add your body weight in Settings for bodyweight lifts');return;}
    if(!saved.length){toast('Enter at least one lift');return;}
    const c=checkins();const today=ymd();if(!c.length||c[c.length-1].date!==today)c.push({date:today});
    commit();UI.ckDraft={};while(UI.pages.length)closePage();go('progress');
    toast(`Saved ${saved.length} lift${saved.length>1?'s':''}. Next check-in: ${fmtDate(ymd(addDays(NOW(),CHECKIN_DAYS)))}`);},
  'open-ck':el=>{const d=el.dataset.d;const rows=Object.keys(S.maxLog||{}).map(id=>({id,x:(S.maxLog[id]||[]).filter(x=>x.src==='entered'&&x.date===d).pop()})).filter(o=>o.x);
    openSheet('Check-in · '+fmtDate(d),`<div class="list">${rows.map(({id,x})=>`<div class="row"><div class="grow"><div class="t">${esc(getEx(id).name)}</div><div class="s">${x.r===1?'1-rep max':`from ${fmtW(getEx(id),x.w,{short:true})} × ${x.r}`}</div></div><b>${num(x.e)} lb</b></div>`).join('')}</div>`);},
  'del-ck':row=>delCheckin(row,row.dataset.d),
  'del-ck-btn':(el,e)=>{e.stopPropagation();delCheckin(el.closest('.swipe'),el.dataset.d);},
  'open-pex':el=>openProgressEx(el.dataset.id),
});
function delCheckin(row,date){
  deleteWithUndo(row,{id:date,msg:'Check-in deleted',remove:()=>{const i=checkins().findIndex(k=>k.date===date);const k=checkins().splice(i,1)[0];const removed={};
      Object.keys(S.maxLog||{}).forEach(id=>{const L=S.maxLog[id];removed[id]=L.filter(x=>x.src==='entered'&&x.date===date);S.maxLog[id]=L.filter(x=>!(x.src==='entered'&&x.date===date));});return {i,k,removed};},
    restore:t=>{checkins().splice(t.i,0,t.k);Object.entries(t.removed).forEach(([id,arr])=>{S.maxLog[id]=(S.maxLog[id]||[]).concat(arr).sort((a,b)=>a.date<b.date?-1:1);});}});
}
function openProgressEx(id){
  const ex=getEx(id);const ser=seriesFor(id);const pj=projectStrength(id);
  openSheet(ex.name,`<div class="card">${maxChart(ser,true)}</div>
   <div class="sec"><div class="sec-h"><h3>All check-ins</h3></div><div class="list">${ser.slice().reverse().map((p,i,a)=>{const pv=a[i+1];return `<div class="row"><div class="grow"><div class="t">Month ${p.m} · ${fmtDate(p.date)}</div><div class="s">${p.r===1?'1-rep max':`from ${fmtW(ex,p.w,{short:true})} × ${p.r}`}</div></div><div style="text-align:right"><b>${num(p.e)} lb</b>${pv?`<div class="note ${p.e>=pv.e?'gup':'gdn'}" style="font-size:12px">${lbTxt(p.e-pv.e)}</div>`:''}</div></div>`;}).join('')}</div></div>
   ${pj?`<div class="card" style="margin-top:12px"><div class="eyebrow">Next check-in estimate</div><div style="margin-top:4px;font-size:15px">Likely around <b>${num(pj.at[3].mid)} lb</b> <span class="note">(${num(pj.at[3].lo)}–${num(pj.at[3].hi)})</span></div><div class="note" style="margin-top:4px">An estimate from your experience, age and training — not a promise. Your real check-in is what counts.</div></div>`:''}
   <button class="btn ghost block" style="margin-top:12px" data-act="ex-detail" data-ex="${id}">${icon('cube')} Form demo & muscles</button>`);
}

/* =========================================================
   TOOLKIT — every extra tool, grouped
   ========================================================= */
const TOOLKIT=[
  ['Training',[['open-library','cube','Exercise library','3D form demos and muscles'],['open-guide','up','How progression works','When and how much weight to add'],['open-legends','star','The Legends','Calendar and the stories behind it']]],
  ['Recovery & health',[['open-recovery','moon','Rest-day recovery','Sleep, walking, mobility, food'],['open-relief','pulse','Aches & pains','Neck, shoulder, knee, joint, foot'],['open-supps','pill','Supplements','Safe, proven basics']]],
  ['Your stats',[['open-history','list','Workout history','Every session you’ve logged'],['open-bodyweight','target','Body weight','Weigh-ins and trend'],['open-achievements','trophy','Achievements','Rank, streaks and badges']]],
  ['Settings',[['go-settings','gear','Profile & settings','Body stats, goal, theme, your data']]],
];
function renderTools(){
  $('#v-tools').innerHTML=`<div class="ptitle">Toolkit</div><div class="psub">Everything extra, in one place.</div>
   ${TOOLKIT.map(([h,rows])=>`<div class="sec"><div class="sec-h"><h3>${esc(h)}</h3></div><div class="list">${rows.map(([a,i,t,s])=>`<div class="row tap" data-act="${a}"><span class="ico">${icon(i)}</span><div class="grow"><div class="t">${esc(t)}</div><div class="s">${esc(s)}</div></div>${icon('chev','chev')}</div>`).join('')}</div></div>`).join('')}`;
}
function bodyWeightPage(b){
  const bw=S.bodyLog.slice().sort((a,c)=>a.date<c.date?-1:1);
  b.innerHTML=`<button class="btn pri block" data-act="bw-add">${icon('plus')} Log a weigh-in</button>
   <div class="card" style="margin-top:12px">${lineChart(bw.map(x=>({x:x.date.slice(5).replace('-','/'),y:x.w})))}</div>
   ${bw.length?`<div style="display:flex;flex-direction:column;gap:6px;margin-top:12px">${bw.slice().reverse().map(x=>swipeRow(`<div class="row" style="border-radius:12px;padding:10px 12px;background:var(--raised)"><div class="grow"><b>${x.w} lb</b> <span class="note">${fmtDate(x.date)}</span></div><button class="trash ibtn" data-act="bw-del-btn" data-d="${x.date}">${icon('trash')}</button></div>`,'bw-del',{data:`data-d="${x.date}"`,restored:UI.restored===x.date})).join('')}</div>`:'<div class="note" style="margin-top:10px">Weigh in once a week, same time of day.</div>'}`;
  bindSwipes(b);
}
function achievementsPage(b){
  const L=levelFromXP(S.xp);const nr=nextRank(L.level);const st=streakInfo();
  b.innerHTML=`<div class="card hero"><div class="hero-row"><div style="position:relative">${ringSVG(L.into/L.need,84,'',8)}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><div style="font-family:var(--disp);font-weight:700;font-size:22px;line-height:1">${L.level}</div><div class="eyebrow" style="font-size:9px">level</div></div></div></div>
    <div style="flex:1"><div class="tag">Rank</div><h2>${esc(L.rank)}</h2><div class="meta">${num(S.xp)} XP · ${L.need-L.into} to level ${L.level+1}${nr?` · ${esc(nr.name)} at Lv ${nr.level}`:''}</div></div></div></div>
   <div class="tiles"><div class="tile"><div class="v">🔥 ${st.streak}</div><div class="l">Current streak</div></div><div class="tile"><div class="v">${st.best}</div><div class="l">Best streak</div></div><div class="tile"><div class="v">${S.sessions.length}</div><div class="l">Workouts</div></div></div>
   <div class="sec"><div class="sec-h"><h3>Badges</h3><span class="note">${Object.keys(S.badges).length}/${BADGES.length}</span></div><div class="bgrid">${BADGES.map(bd=>{const [v,t]=bd.prog();const got=!!S.badges[bd.id];return `<div class="bdg${got?' got':''}"><div class="e">${bd.icon}</div><div class="n">${esc(bd.name)}</div><div class="note" style="font-size:10.5px;margin-top:2px">${esc(bd.desc)}</div>${got?'':`<div class="p"><i style="width:${Math.min(100,Math.round(v/t*100))}%"></i></div>`}</div>`;}).join('')}</div></div>
   <div class="note" style="margin-top:12px">Ranks and badges are just for motivation — everything in the app is free.</div>`;
}
Object.assign(ACT,{
  'open-history':()=>openPage('Workout history',b=>{b.innerHTML=historyHTML();bindSwipes(b);}),
  'open-bodyweight':()=>openPage('Body weight',bodyWeightPage),
  'open-achievements':()=>openPage('Achievements',achievementsPage),
  'go-settings':()=>{while(UI.pages.length)closePage();go('profile');},
});
