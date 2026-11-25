/* =========================================================
   WORKOUT SESSION — start, history, focused session flow,
   rest timer, session summary
   ========================================================= */
function makeItem(slot){
  const plan=planSets(slot);const ex=getEx(slot.exId);
  return {exId:slot.exId,name:slot.swapped||!slot.name?ex.name:slot.name,slot,ss:slot.ss,rest:slot.rest,notes:'',
    sets:plan.map(p=>({rec:p,w:p.w,r:p.time!=null?p.time:(p.reps!=null?p.reps:null),effort:ex&&ex.kind==='power'?'fast':'solid',done:false,wEdited:false}))};
}
function startSession(progId,dayId,opts){
  if(S.active){toast('Finish or discard your current session first');go('log');return;}
  opts=opts||{};let sess;
  {const day=getDay(progId,dayId);sess={id:uid(),progId,dayId,name:day.short||day.name,label:day.label,type:day.type,date:ymd(),start:Date.now(),items:daySlots(progId,dayId).map(makeItem),i:0,warmDone:false};}
  S.active=sess;commit();closeAllSheets();while(UI.pages.length)closePage();go('log');
}
function synthSlot(exId,sets,lo,hi,rest,progId,dayId,idx){
  const ex=getEx(exId);const time=ex&&ex.kind==='time'?(lo||45):null;
  return {exId,baseId:exId,name:ex?ex.name:exId,setsText:String(sets),repsText:time?time+' sec':(lo===hi?String(lo):lo+'–'+hi),sets,lo:time?null:lo,hi:time?null:hi,time,max:false,perSide:!!(ex&&ex.perSide),rest:rest||90,ss:null,note:'',progId,dayId,idx};
}
Object.assign(ACT,{
  'start-day':el=>startSession(el.dataset.p,el.dataset.d),
});

/* the live workout screen (under the Workouts tab). With no workout running it hands back to Workouts. */
function renderLog(){if(S.active){renderSession();return;}stopRestTimer(true);go('plan');}
function historyHTML(limit){
  if(!S.sessions.length)return `<div class="card empty">No workouts yet. Your first one shows up here.</div>`;
  return `<div style="display:flex;flex-direction:column;gap:8px">${S.sessions.slice(0,limit||999).map(s=>swipeRow(
    `<div class="row tap" style="border-radius:16px;border:1px solid var(--hair)" data-act="sess-detail" data-id="${s.id}"><span class="ico">${s.prs&&s.prs.length?'🏅':icon('log')}</span><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${fmtDate(s.date)} · ${fmtDur((s.end||s.start)-s.start)} · ${num(s.volume)} lb${s.prs&&s.prs.length?' · '+s.prs.length+' PR':''}</div></div><button class="trash ibtn" data-act="del-session-btn" data-id="${s.id}" aria-label="Delete">${icon('trash')}</button></div>`,
    'del-session',{data:`data-id="${s.id}"`,restored:UI.restored===s.id})).join('')}</div>${limit&&S.sessions.length>limit?`<button class="btn ghost block" style="margin-top:10px" data-act="all-history">Show all</button>`:''}`;
}
function deleteSession(row,id){
  deleteWithUndo(row,{id,msg:'Workout deleted',remove:()=>{const i=S.sessions.findIndex(s=>s.id===id);const s=S.sessions.splice(i,1)[0];S.xp=Math.max(0,S.xp-(s.xp||0));return {i,s};},
    restore:t=>{S.sessions.splice(t.i,0,t.s);S.xp+=t.s.xp||0;}});
}
Object.assign(ACT,{
  'del-session':row=>deleteSession(row,row.dataset.id),
  'del-session-btn':(el,e)=>{e.stopPropagation();deleteSession(el.closest('.swipe'),el.dataset.id);},
  'all-history':()=>openPage('Workout history',b=>{b.innerHTML=historyHTML();bindSwipes(b);}),
  'sess-detail':el=>openSessionDetail(el.dataset.id),
});
function openSessionDetail(id){
  const s=S.sessions.find(x=>x.id===id);if(!s)return;
  openSheet(esc(s.name),`<div class="note">${fmtDate(s.date,true)} · ${fmtDur((s.end||s.start)-s.start)} · ${num(s.volume)} lb · ${s.setCount} sets</div>
   ${(s.prs||[]).map(p=>`<div class="prline"><b>NEW PR</b><span>${esc(getEx(p.exId).name)} — ${p.type==='e1rm'?'est. max '+p.val+' lb':p.val+' lb'}</span></div>`).join('')}
   ${s.items.map(it=>{const ex=getEx(it.exId);return `<div class="card" style="margin-top:10px"><div style="font-weight:650">${esc(it.name)}</div>${it.sets.filter(x=>x.done).map((x,k)=>`<div class="mono" style="font-size:13px;color:var(--muted);margin-top:4px">Set ${k+1}: ${ex&&ex.kind==='time'?x.r+' sec':fmtW(ex,x.w)+' × '+x.r} · ${x.effort}</div>`).join('')||'<div class="note">No sets logged</div>'}${it.notes?`<div class="note" style="margin-top:6px">📝 ${esc(it.notes)}</div>`:''}</div>`;}).join('')}`);
}
/* ---------- focused session ---------- */
function sessDay(A){const d=PROGRAMS.some(p=>p.id===A.progId)?getDay(A.progId,A.dayId):null;return d||{id:'x',type:A.type||'upper',rest:false};}
function curItem(){const A=S.active;return A.items[A.i];}
function ssGroup(i){const A=S.active;const it=A.items[i];if(!it||!it.ss)return [i];let a=i,b=i;while(a>0&&A.items[a-1].ss===it.ss)a--;while(b<A.items.length-1&&A.items[b+1].ss===it.ss)b++;const g=[];for(let k=a;k<=b;k++)g.push(k);return g;}
function itemDone(it){return it.sets.length>0&&it.sets.every(s=>s.done);}
function sessionTimerText(){const A=S.active;if(!A)return '';const m=Math.floor((Date.now()-A.start)/60000),s=Math.floor((Date.now()-A.start)/1000)%60;return m+':'+(s<10?'0':'')+s;}
function renderSession(){
  const A=S.active;const el=$('#v-log');
  const dots=A.items.map((it,i)=>`<i class="${itemDone(it)?'done':i===A.i?'cur':''}"></i>`).join('');
  let body='';
  if(!A.warmDone&&WARMUP_PLAN[A.type]){
    body=`<div class="excard"><div class="eyebrow">Step 1 · ${esc(WARMUP_PLAN[A.type].dur)}</div><h2 style="font-size:21px;margin-top:4px">Warm up</h2>
      <div style="margin-top:6px">${warmupHTML(A.type)}</div>
      <button class="btn pri lg block" style="margin-top:14px" data-act="warm-done">Done — first exercise</button></div>`;}
  else if(!A.items.length){body=`<div class="excard"><h2>Empty workout</h2><p class="note">Add exercises as you go — search the full library.</p><button class="btn pri block" style="margin-top:10px" data-act="sess-add">${icon('plus')} Add exercise</button></div>`;}
  else body=itemCardHTML(A.i);
  const allDone=A.items.length&&A.items.every(itemDone);
  el.innerHTML=`<div class="sess-top"><div class="r1"><div class="nm"><b>${esc(A.name)}</b><span id="sesstime">${sessionTimerText()}</span><span id="sesscount"> · ${A.items.reduce((a,it)=>a+it.sets.filter(s=>s.done).length,0)}/${A.items.reduce((a,it)=>a+it.sets.length,0)} sets</span></div>
     <button class="ibtn" data-act="sess-overview" aria-label="All exercises">${icon('list')}</button><button class="btn sm ${allDone?'good':''}" data-act="sess-finish">Finish</button></div>
     <div class="dots">${dots}</div></div>${body}
   ${A.warmDone&&A.items.length?`<div class="sess-nav"><button class="btn ghost" style="flex:1" data-act="sess-prev" ${A.i===0?'disabled':''}>${icon('back')} Prev</button><button class="btn ${itemDone(curItem())?'pri':'ghost'}" style="flex:1.4" data-act="sess-next">${A.i>=A.items.length-1?'Finish workout':'Next exercise'} ${icon('chev')}</button></div>`:''}
   ${allDone?`<div style="margin-top:14px">${afterHTML(A.progId,sessDay(A),true)}</div>`:''}
   <div style="display:flex;gap:10px;margin-top:14px"><button class="btn ghost sm" style="flex:1" data-act="sess-add">${icon('plus')} Add exercise</button><button class="btn danger sm" style="flex:1" data-act="sess-discard">${icon('trash')} Discard</button></div>`;
  clearInterval(UI.sessTick);UI.sessTick=setInterval(()=>{const t=$('#sesstime');if(t&&S.active)t.textContent=sessionTimerText();else clearInterval(UI.sessTick);},1000);
  resumeRestTimer();
}
function itemCardHTML(i){
  const A=S.active;const it=A.items[i];const ex=getEx(it.exId);const sl=it.slot;
  const grp=ssGroup(i);const partner=grp.length>1?grp.filter(k=>k!==i).map(k=>A.items[k].name).join(' & '):'';
  const firstOpen=it.sets.findIndex(s=>!s.done);
  const kindNote=ex.kind==='power'?'Stop each set the moment bar speed or technique slows. Never to failure.':ex.kind==='isolation'?'Last set: go to technical failure — the last rep you can do with perfect form.':ex.kind==='time'?'Hold with perfect form; end the set when your hips sag.':'Leave 1–2 reps in the tank on every set.';
  const unit=ex.kind==='time'?'sec':'reps';const Emax=maxInfo(it.exId).cur||knownE1RM(it.exId);
  const pctOf=w=>{if(!(Emax>0)||w==null||ex.kind==='time'||sl.max)return '';const l=loadOf(ex,w);return l>0?' · '+Math.floor(l/Emax*100)+'%':'';};
  const rows=it.sets.map((s,k)=>{
    const r=s.rec||{};let recTxt;
    if(ex.kind==='time')recTxt=`<b>${r.time||sl.time} sec</b><span>target</span>`;
    else if(r.max)recTxt=`<b>Max reps</b><span>stop 1 short</span>`;
    else if(r.mode==='calibrate'&&!s.done&&s.w==null)recTxt=`<b>Test set</b><span>${r.reps} reps</span>`;
    else if(r.mode==='pending'&&s.w==null)recTxt=`<b>After set 1</b><span>${r.reps} reps</span>`;
    else recTxt=`<b>${fmtW(ex,s.w!=null?s.w:r.w,{short:true})}${s.adj?' <span class="adj">↻</span>':''}</b><span>× ${r.reps??''}${r.rir!=null&&ex.kind!=='power'?' · '+(r.rir===0?'to failure':r.rir>=1.9?'2 left':r.rir>1.1?'1–2 left':'1 left'):ex.kind==='power'?' · crisp':''}${pctOf(s.w!=null?s.w:r.w)}</span>`;
    const wIn=ex.kind==='time'?`<div class="note" style="text-align:center">—</div>`:`<input class="nin" type="number" inputmode="decimal" step="any" placeholder="${ex.kind==='bw'?'+/− lb':'lb'}" data-in="set-w" data-i="${i}" data-k="${k}" value="${s.w==null?'':s.w}" aria-label="Weight set ${k+1}">`;
    const effortRow=s.done&&ex.kind!=='time'?`<div class="effort">${ex.kind==='power'?'Bar speed:':'How did it feel?'} ${(ex.kind==='power'?[['fast','Fast'],['slow','Slowed'],['broke','Form broke']]:[['easy','Easy'],['solid','Solid'],['max','Max']]).map(([v,l])=>`<button class="${s.effort===v?'on':''}" data-act="set-effort" data-i="${i}" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`:'';
    const calib=(r.mode==='calibrate'&&k===0&&!s.done)?`<div class="calnote">No numbers yet for this lift. Pick a weight you could do about ${(r.reps||8)+3} clean reps with, do ${r.reps} reps, then rate it — every set after this is recommended from what you actually did.</div>`:'';
    const bwNote=(r.mode==='bw-noweight'&&k===0&&!s.done)?`<div class="calnote">Add your body weight in Profile to get assisted/weighted recommendations. For now: bodyweight, track reps.</div>`:'';
    return `<div class="setrow${s.done?' done':k===firstOpen?' cur':''}" data-set="${k}"><span class="sn">${k+1}</span><div class="rec">${recTxt}</div>${wIn}
      <input class="nin" type="number" inputmode="numeric" placeholder="${unit}" data-in="set-r" data-i="${i}" data-k="${k}" value="${s.r==null?'':s.r}" aria-label="${unit} set ${k+1}">
      <button class="ck" data-act="set-done" data-i="${i}" data-k="${k}" aria-label="Complete set ${k+1}">${icon('check')}</button>${calib}${bwNote}${effortRow}</div>`;}).join('');
  return `<div class="excard" data-item="${i}">
    <div class="exh"><div style="flex:1;min-width:0"><div class="eyebrow">Exercise ${i+1} of ${A.items.length}</div><h2>${esc(it.name)}</h2>
      <div class="presc">${esc(sl.setsText)} × ${esc(sl.repsText)}${sl.suggested?' · suggested 8–12':''}${ex.perHand?' · weight per hand':''}${sl.perSide?' · each side':''}</div></div>
      <button class="ibtn" data-act="ex-detail" data-ex="${it.exId}" aria-label="Form demo">${icon('cube')}</button><button class="ibtn" data-act="sess-swap" data-i="${i}" aria-label="Swap exercise">${icon('swap')}</button></div>
    ${sl.variants?`<div class="seg" style="margin-top:12px">${sl.variants.map(v=>`<button class="${it.exId===v?'on':''}" data-act="sess-var" data-i="${i}" data-v="${v}">${esc(getEx(v).name)}</button>`).join('')}</div>`:''}
    ${partner?`<div class="ssban">${icon('swap')}<span><b>Superset ${esc(it.ss)}</b> with ${esc(partner)} — do one set of each, then rest ${it.rest}s.</span></div>`:''}
    <div class="cuebox">${esc(kindNote)}${sl.note?' '+esc(sl.note):''}</div>
    <div class="sets"><div class="sethead"><span>Set</span><span>Target</span><span>${ex.kind==='bw'?'Added':'Weight'}</span><span>${unit}</span><span></span></div>${rows}</div>
    <div class="setops"><button class="btn sm ghost" data-act="set-add" data-i="${i}">${icon('plus')} Set</button>${it.sets.length>1?`<button class="btn sm ghost" data-act="set-rm" data-i="${i}">${icon('minus')} Set</button>`:''}<span style="flex:1"></span><span class="note" style="align-self:center">${icon('timer','').replace('<svg','<svg style="width:14px;height:14px;vertical-align:-2px"')} Rest ${fmtRest(it.rest)}</span></div>
    <textarea class="inp" style="margin-top:10px;min-height:46px" placeholder="Notes (seat height, how it felt…)" data-in="item-note" data-i="${i}">${esc(it.notes)}</textarea>
  </div>`;
}
Object.assign(IN,{
  'set-w':t=>{const s=S.active.items[+t.dataset.i].sets[+t.dataset.k];const v=parseFloat(t.value);s.w=isNaN(v)?null:v;s.wEdited=true;commit();},
  'set-r':t=>{const s=S.active.items[+t.dataset.i].sets[+t.dataset.k];const v=parseInt(t.value,10);s.r=isNaN(v)?null:v;commit();},
  'item-note':t=>{S.active.items[+t.dataset.i].notes=t.value;commit();},
});
function refreshCard(i){const card=document.querySelector(`.excard[data-item="${i}"]`);if(!card){renderSession();return;}const tmp=document.createElement('div');tmp.innerHTML=itemCardHTML(i);const n=tmp.firstElementChild;n.style.animation='none';card.replaceWith(n);
  const top=document.querySelector('.sess-top');if(top){const A=S.active;top.querySelector('.dots').innerHTML=A.items.map((it,k)=>`<i class="${itemDone(it)?'done':k===A.i?'cur':''}"></i>`).join('');
    const c=$('#sesscount');if(c)c.textContent=` · ${A.items.reduce((a,it)=>a+it.sets.filter(s=>s.done).length,0)}/${A.items.reduce((a,it)=>a+it.sets.length,0)} sets`;
    const fb=top.querySelector('[data-act="sess-finish"]');if(fb)fb.classList.toggle('good',A.items.length&&A.items.every(itemDone));}}
function scrollToSet(i,k){setTimeout(()=>{const r=document.querySelector(`.excard[data-item="${i}"] .setrow[data-set="${k}"]`);if(r)r.scrollIntoView({block:'center',behavior:reduceMotion()?'auto':'smooth'});},60);}
function applyAdjust(i,k){
  const it=S.active.items[i];const next=it.sets[k+1];if(!next||next.done)return;
  const adj=adjustNext(it.slot,it.sets,k);
  if(adj!=null&&!next.wEdited){const old=next.w;if(old!==adj)next.adj=true;next.w=adj;
    const ex=getEx(it.exId);
    if(old>0&&ex&&ex.kind!=='bw'&&ex.kind!=='time'){const ratio=adj/old;it.sets.forEach((x,j)=>{if(j>k+1&&!x.done&&!x.wEdited&&x.w>0){const nw=Math.min(adj,clampWeight(ex,x.w*ratio));if(nw!==x.w){x.w=nw;x.adj=true;}}});}}
}
Object.assign(ACT,{
  'warm-done':()=>{S.active.warmDone=true;commit();renderSession();},
  'set-done':el=>{
    const i=+el.dataset.i,k=+el.dataset.k;const A=S.active;const it=A.items[i];const s=it.sets[k];const ex=getEx(it.exId);
    if(s.done){s.done=false;commit();refreshCard(i);return;}
    const card=el.closest('.setrow');const wv=card.querySelector('[data-in="set-w"]');const rv=card.querySelector('[data-in="set-r"]');
    if(wv&&wv.value!=='')s.w=parseFloat(wv.value);
    if(rv&&rv.value!=='')s.r=parseInt(rv.value,10);
    if(!(s.r>0)){toast(ex.kind==='time'?'Enter how many seconds you held':'Enter your reps first');rv&&rv.focus();return;}
    if(ex.kind!=='time'&&ex.kind!=='bw'&&!(s.w>0)){toast('Enter the weight you used');wv&&wv.focus();return;}
    if(ex.kind==='bw'&&s.w==null)s.w=0;
    s.done=true;s.at=Date.now();
    /* calibration: first set seeds every later set */
    if(s.rec&&s.rec.mode==='calibrate'){it.sets.forEach((x,j)=>{if(j>k&&!x.done&&x.w==null){x.rec=Object.assign({},x.rec,{mode:'rec'});}});}
    applyAdjust(i,k);
    if(s.rec&&s.rec.mode==='calibrate'&&it.sets[k+1]&&it.sets[k+1].w!=null){it.sets.forEach((x,j)=>{if(j>k+1&&!x.done&&x.w==null)x.w=it.sets[k+1].w;});}
    commit();ensureAudio();
    const grp=ssGroup(i);const pos=grp.indexOf(i);
    if(grp.length>1&&pos<grp.length-1&&A.items[grp[pos+1]].sets[k]&&!A.items[grp[pos+1]].sets[k].done){A.i=grp[pos+1];commit();renderSession();toast('Superset → '+A.items[A.i].name);return;}
    if(grp.length>1&&pos===grp.length-1){const first=grp[0];if(A.items[first].sets.some(x=>!x.done)){A.i=first;commit();renderSession();}else refreshCard(i);startRest(it.rest,'Superset '+it.ss+' done');return;}
    refreshCard(i);
    if(it.sets.some(x=>!x.done)){startRest(it.rest,'Set '+(k+1)+' of '+it.sets.length+' logged');scrollToSet(i,k+1);}
    else{const nx=A.items[i+1];startRest(it.rest,nx?'Next: '+nx.name:'Last exercise done');toast(nx?'Exercise complete — next up: '+nx.name:'All exercises done — tap Finish');}
  },
  'set-effort':el=>{const i=+el.dataset.i,k=+el.dataset.k;const it=S.active.items[i];it.sets[k].effort=el.dataset.v;applyAdjust(i,k);commit();refreshCard(i);},
  'set-add':el=>{const i=+el.dataset.i;const it=S.active.items[i];const last=it.sets[it.sets.length-1];it.sets.push({rec:Object.assign({},last.rec,{k:it.sets.length}),w:last.w,r:last.r,effort:last.effort==='max'?'solid':last.effort,done:false,wEdited:false});commit();refreshCard(i);},
  'set-rm':el=>{const i=+el.dataset.i;const it=S.active.items[i];const rows=document.querySelectorAll(`.excard[data-item="${i}"] .setrow`);const row=rows[rows.length-1];
    animateRemove(row,()=>{it.sets.pop();commit();refreshCard(i);});},
  'sess-prev':()=>{S.active.i=Math.max(0,S.active.i-1);commit();renderSession();window.scrollTo(0,0);},
  'sess-next':()=>{const A=S.active;if(A.i>=A.items.length-1){ACT['sess-finish']();return;}A.i++;commit();renderSession();window.scrollTo(0,0);},
  'sess-var':el=>{const i=+el.dataset.i;const A=S.active;const it=A.items[i];if(it.sets.some(s=>s.done)){toast('Switch variation before logging sets');return;}
    S.variantPick[slotKey(it.slot.progId,it.slot.dayId,it.slot.idx)]=el.dataset.v;it.slot.exId=el.dataset.v;A.items[i]=Object.assign(makeItem(it.slot),{name:it.name});commit();renderSession();},
  'sess-swap':el=>{const i=+el.dataset.i;const it=S.active.items[i];
    openExPicker('Swap exercise',it.exId,id=>{const sl=Object.assign({},it.slot,{exId:id,swapped:true,variants:null});const ni=makeItem(sl);ni.name=getEx(id).name;ni.sets.forEach((s,k)=>{if(it.sets[k]&&it.sets[k].done)Object.assign(s,it.sets[k]);});
      S.active.items[i]=ni;commit();renderSession();toast('Swapped for today — edit the plan to make it permanent');});},
  'sess-add':()=>openExPicker('Add exercise',null,id=>{const A=S.active;const ex=getEx(id);const sl=synthSlot(id,3,ex.kind==='time'?45:8,ex.kind==='time'?45:12,ex.kind==='isolation'?75:120,A.progId,A.dayId,'x'+A.items.length);
    A.items.push(makeItem(sl));A.i=A.items.length-1;A.warmDone=true;commit();renderSession();}),
  'sess-overview':()=>{const A=S.active;openSheet('Exercises',`<div class="list">${A.items.map((it,i)=>`<div class="row tap" data-act="sess-jump" data-i="${i}"><span class="ico">${itemDone(it)?'✅':i===A.i?'▶️':String(i+1)}</span><div class="grow"><div class="t">${esc(it.name)}</div><div class="s">${it.sets.filter(s=>s.done).length}/${it.sets.length} sets${it.ss?' · superset '+it.ss:''}</div></div></div>`).join('')}</div>`);},
  'sess-jump':el=>{S.active.i=+el.dataset.i;S.active.warmDone=true;commit();closeSheet();renderSession();window.scrollTo(0,0);},
  'sess-discard':()=>{const A=S.active;openSheet('Discard workout?',`<p class="note">This session and its ${A.items.reduce((a,it)=>a+it.sets.filter(s=>s.done).length,0)} logged sets will be removed.</p><div class="frow" style="margin-top:14px"><button class="btn ghost" data-act="close-sheet">Keep going</button><button class="btn danger" data-act="sess-discard-yes">Discard</button></div>`);},
  'sess-discard-yes':()=>{const keep=S.active;S.active=null;stopRestTimer(true);commit();closeSheet();go('log');toast('Workout discarded',{undo:()=>{S.active=keep;commit();go('log');}});},
  'sess-finish':()=>{const A=S.active;const left=A.items.reduce((a,it)=>a+it.sets.filter(s=>!s.done).length,0);const logged=A.items.reduce((a,it)=>a+it.sets.filter(s=>s.done).length,0);
    if(!logged){toast('Log at least one set first');return;}
    if(left>0){openSheet('Finish workout?',`<p class="note">${left} set${left===1?' is':'s are'} not logged. Unlogged sets won’t count toward progression.</p><div class="frow" style="margin-top:14px"><button class="btn ghost" data-act="close-sheet">Keep going</button><button class="btn pri" data-act="sess-finish-yes">Finish</button></div>`);return;}
    finishSession();},
  'sess-finish-yes':()=>{closeSheet();finishSession();},
});
function finishSession(){
  const A=S.active;stopRestTimer(true);
  const sess=JSON.parse(JSON.stringify(A));sess.end=Date.now();
  sess.items=sess.items.filter(it=>it.sets.some(s=>s.done));
  const before={L:levelFromXP(S.xp),streak:streakInfo().streak};
  finalizeSession(sess);
  S.sessions.unshift(sess);S.active=null;
  const st=streakInfo();const gain=sessionXP(sess,st.streak);sess.xp=gain;S.xp+=gain;
  const after=levelFromXP(S.xp);const badges=checkBadges();commit();
  openSummary(sess,{before,after,gain,streak:st,badges});go('log');
}
function openSummary(sess,x){
  const leveled=x.after.level>x.before.L.level;const ms=nextMilestone();
  const msgs=['Work banked. Recovery starts now.','Strong session. That’s how linemen are built.','Another brick in the wall.','Consistency wins — see you next session.'];
  openPage('Session complete',b=>{b.innerHTML=`<div class="sumhero"><div class="bigcheck">${icon('check')}</div><h1 style="font-size:26px">${esc(sess.name)} done</h1><p class="note" style="margin-top:6px">${msgs[sess.setCount%msgs.length]}</p></div>
    <div class="statgrid"><div class="tile"><div class="v">${fmtDur(sess.end-sess.start)}</div><div class="l">Duration</div></div><div class="tile"><div class="v">${num(sess.volume)}</div><div class="l">Total volume (lb)</div></div>
     <div class="tile"><div class="v">${sess.setCount}</div><div class="l">Sets completed</div></div><div class="tile"><div class="v">${sess.prs.length}</div><div class="l">New PRs</div></div></div>
    ${sess.prs.map(p=>{const nm=(sess.newMaxes||[]).some(n=>n.exId===p.exId);return `<div class="prline"><b>NEW PR</b><span>${esc(getEx(p.exId).name)} — ${p.type==='e1rm'?'est. max '+p.val+' lb':p.val+' lb'}${nm?' · max & projections updated':''}</span></div>`;}).join('')}
    <div class="card" style="margin-top:14px"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:26px">🔥</span><div style="flex:1"><div style="font-weight:700;font-size:16px">${x.streak.streak}-day streak</div><div class="note">Keep the streak alive — rest days never break it.</div></div></div></div>
    <div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between"><b>+${x.gain} XP</b><span class="note">Lv ${x.after.level} · ${esc(x.after.rank)}</span></div><div class="xpbar"><i id="sumxp" style="width:${Math.round((leveled?0:x.before.L.into/x.before.L.need)*100)}%"></i></div><div class="note" style="margin-top:6px">${x.after.need-x.after.into} XP to level ${x.after.level+1}</div></div>
    ${leveled?`<div class="levelup" style="margin-top:10px">⚡ Level Up — Level ${x.after.level}${x.after.rank!==x.before.L.rank?' · '+esc(x.after.rank):''}</div>`:''}
    ${x.badges.map(bd=>`<div class="prline" style="background:var(--accent-soft);border-color:var(--accent-line)"><span style="font-size:20px">${bd.icon}</span><span><b style="color:var(--accent)">BADGE</b> ${esc(bd.name)} — ${esc(bd.desc)}</span></div>`).join('')}
    ${ms?`<div class="card" style="margin-top:10px"><div class="eyebrow">${ms.p>=.6?'Your next milestone is close':'Next milestone'}</div><div style="font-weight:650;margin-top:4px">${ms.b.icon} ${esc(ms.b.name)} — ${esc(ms.b.desc)}</div><div class="xpbar"><i style="width:${Math.round(ms.p*100)}%"></i></div></div>`:''}
    ${(sess.newMaxes||[]).filter(n=>!sess.prs.some(p=>p.exId===n.exId)).map(n=>`<div class="prline" style="background:var(--good-soft);border-color:color-mix(in srgb,var(--good) 40%,transparent)"><b style="color:var(--good)">NEW MAX</b><span>${esc(getEx(n.exId).name)} — est. max ${num(n.e)} lb · projections updated</span></div>`).join('')}
    <div class="sec"><div class="sec-h"><h3>Next time — exactly what to do</h3></div>${sess.items.filter(it=>it.slot).map(it=>{const a=coachAdvice(it.slot);return a?`<div class="coachcard ${a.kind}"><div class="eyebrow">${esc(it.name)}</div><b>${esc(a.head)}</b><div class="note">${esc(a.detail)}</div></div>`:'';}).join('')}</div>
    <div style="margin-top:14px">${afterHTML(sess.progId,sessDay(sess),true)}</div>
    <button class="btn pri lg block" style="margin-top:16px" data-act="close-page">Done</button>`;
    setTimeout(()=>{const xb=b.querySelector('#sumxp');if(xb)xb.style.width=Math.round(x.after.into/x.after.need*100)+'%';},350);});
}

/* ---------- rest timer ---------- */
let audioCtx=null;
function ensureAudio(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(e){}}
function beep(){if(!S.profile.notif||!S.profile.notif.rest)return;try{ensureAudio();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=880;o.connect(g);g.connect(audioCtx.destination);g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.25,audioCtx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.5);o.start();o.stop(audioCtx.currentTime+.55);}catch(e){}
  try{if(navigator.vibrate)navigator.vibrate([180,90,180]);}catch(e){}}
function startRest(sec,label){if(!S.active)return;S.active.rest={end:Date.now()+sec*1000,total:sec,label};commit();resumeRestTimer();}
function resumeRestTimer(){
  const bar=$('#restbar');const R=S.active&&S.active.rest;clearInterval(UI.restTick);
  if(!R){bar.classList.remove('show','done');document.body.classList.remove('resting');return;}
  bar.classList.remove('done');
  const draw=()=>{const left=Math.max(0,Math.ceil((R.end-Date.now())/1000));
    if(left<=0){clearInterval(UI.restTick);bar.classList.add('done');bar.innerHTML=`<div class="t">0:00</div><div class="l"><b>Rest Complete</b>Next Set — let’s go</div><button data-act="rest-skip">OK</button>`;beep();S.active.rest=null;commit();setTimeout(()=>{bar.classList.remove('show');document.body.classList.remove('resting');},3500);return;}
    bar.innerHTML=`<div class="t">${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}</div><div class="l"><b>Rest</b>${esc(R.label||'')}</div><button data-act="rest-add">+15s</button><button data-act="rest-skip">Skip</button><i class="fill" style="width:${(1-left/R.total)*100}%"></i>`;};
  draw();bar.classList.add('show');document.body.classList.add('resting');UI.restTick=setInterval(draw,500);
}
function stopRestTimer(hide){clearInterval(UI.restTick);if(S.active)S.active.rest=null;if(hide){$('#restbar').classList.remove('show','done');document.body.classList.remove('resting');}}
Object.assign(ACT,{
  'rest-add':()=>{const R=S.active&&S.active.rest;if(!R)return;R.end+=15000;R.total+=15;commit();resumeRestTimer();},
  'rest-skip':()=>{stopRestTimer(true);commit();},
});
