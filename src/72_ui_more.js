/* =========================================================
   PROGRESS · PROFILE · LIBRARY · EXERCISE DETAIL · FUEL · TOOLKIT PAGES
   ========================================================= */
/* ---------- charts ---------- */
function barChart(vals,labels,opts){
  opts=opts||{};const W=320,H=150,pl=34,pb=20,pt=10;const max=Math.max(1,...vals);const bw=(W-pl-8)/vals.length;
  const ticks=[0,.5,1].map(f=>Math.round(max*f));
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${ticks.map(t=>{const y=H-pb-(t/max)*(H-pb-pt);return `<line class="grid" x1="${pl}" x2="${W}" y1="${y}" y2="${y}"/><text x="${pl-5}" y="${y+3}" text-anchor="end">${t>=1000?Math.round(t/1000)+'k':t}</text>`;}).join('')}
   ${vals.map((v,i)=>{const h=(v/max)*(H-pb-pt);const x=pl+i*bw+bw*.18;return `<rect class="bar${i===vals.length-1?'':''}${v?'':' dim'}" x="${x}" y="${H-pb-Math.max(h,2)}" width="${bw*.64}" height="${Math.max(h,2)}" rx="4"/><text x="${x+bw*.32}" y="${H-5}" text-anchor="middle">${labels[i]}</text>`;}).join('')}</svg>`;
}
function lineChart(pts,opts){
  opts=opts||{};if(pts.length<2)return `<div class="empty">${pts.length?'One data point so far — log another session to see the trend.':'No data yet.'}</div>`;
  const W=320,H=160,pl=38,pb=22,pt=12,pr=10;const ys=pts.map(p=>p.y);let mn=Math.min(...ys),mx=Math.max(...ys);if(mx-mn<10){mn-=5;mx+=5;}const pad=(mx-mn)*.12;mn=Math.floor(mn-pad);mx=Math.ceil(mx+pad);
  const X=i=>pl+i*(W-pl-pr)/(pts.length-1),Y=v=>H-pb-(v-mn)/(mx-mn)*(H-pb-pt);
  const d=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+','+Y(p.y).toFixed(1)).join(' ');
  const step=Math.ceil(pts.length/5);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="cgrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
   ${[mn,(mn+mx)/2,mx].map(t=>`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${pl-5}" y="${Y(t)+3}" text-anchor="end">${Math.round(t)}</text>`).join('')}
   <path class="area" d="${d} L${X(pts.length-1)},${H-pb} L${X(0)},${H-pb} Z"/><path class="ln" d="${d}"/>
   ${pts.map((p,i)=>`<circle class="pt" cx="${X(i)}" cy="${Y(p.y)}" r="3.5"/>${i%step===0||i===pts.length-1?`<text x="${X(i)}" y="${H-6}" text-anchor="middle">${p.x}</text>`:''}`).join('')}</svg>`;
}
function delBW(row,d){deleteWithUndo(row,{id:d,msg:'Weigh-in removed',remove:()=>{const i=S.bodyLog.findIndex(b=>b.date===d);return {i,b:S.bodyLog.splice(i,1)[0]};},restore:t=>S.bodyLog.splice(t.i,0,t.b)});}
Object.assign(ACT,{
  'bw-add':()=>openSheet('Log body weight',`<div class="field"><label>Weight (lb)</label><input class="inp" type="number" inputmode="decimal" id="bw-in" value="${S.profile.weightLb||''}"></div><button class="btn pri block lg" style="margin-top:14px" data-act="bw-save">Save</button>`),
  'bw-save':()=>{const v=parseFloat($('#bw-in').value);if(!(v>0)){toast('Enter a weight');return;}const d=ymd();S.bodyLog=S.bodyLog.filter(b=>b.date!==d);S.bodyLog.push({date:d,w:v});S.profile.weightLb=v;UI.restored=d;commit();closeSheet();rerender();UI.restored=null;toast('Weigh-in saved');},
  'bw-del':row=>delBW(row,row.dataset.d),'bw-del-btn':el=>delBW(el.closest('.swipe'),el.dataset.d),
});

/* ---------- PROFILE ---------- */
function progExIds(){const set=new Set();PROGRAMS.forEach(p=>p.days.forEach(d=>(d.ex||[]).forEach(e=>{set.add(e.id);(e.variants||[]).forEach(v=>set.add(v));})));return [...set];}
function renderProfile(){
  const p=S.profile;
  const segBtns=(key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button class="${String(p[key])===String(v)?'on':''}" data-act="pf-set" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  $('#v-profile').innerHTML=`<div class="ptitle">Settings</div><div class="psub">Your details make the weights and nutrition personal.</div>
   <div class="sec"><div class="sec-h"><h3>You</h3></div><div class="card">
    <div class="field" style="margin-top:0"><label>Name</label><input class="inp" placeholder="Your name" value="${esc(p.name)}" data-ch="pf-name"></div>
    <div class="frow"><div class="field"><label>Height (ft)</label><input class="inp" type="number" data-ch="pf-num" data-k="heightFt" value="${p.heightFt??''}"></div><div class="field"><label>(in)</label><input class="inp" type="number" data-ch="pf-num" data-k="heightIn" value="${p.heightIn??''}"></div></div>
    <div class="frow"><div class="field"><label>Weight (lb)</label><input class="inp" type="number" inputmode="decimal" data-ch="pf-num" data-k="weightLb" value="${p.weightLb??''}"></div><div class="field"><label>Age</label><input class="inp" type="number" data-ch="pf-num" data-k="age" value="${p.age??''}"></div></div>
    <div class="field"><label>Sex (optional)</label>${segBtns('sex',[['male','Male'],['female','Female'],['','Not set']])}</div>
    <div class="field"><label>Activity level</label><select class="inp" data-ch="pf-sel" data-k="activity">${ACTIVITY.map(a=>`<option value="${a.id}"${p.activity===a.id?' selected':''}>${a.label} — ${a.desc}</option>`).join('')}</select></div></div></div>
   <div class="sec"><div class="sec-h"><h3>Training</h3></div><div class="card">
    <div class="field" style="margin-top:0"><label>Experience</label>${segBtns('exp',[['beginner','< 6 mo'],['intermediate','6 mo–2 yr'],['advanced','2+ yr']])}</div>
    <div class="field"><label>Nutrition goal</label>${segBtns('nutrition',[['cut','Cutting'],['maintain','Maintain'],['bulk','Bulking']])}</div></div></div>
   <div class="sec"><div class="sec-h"><h3>App</h3></div><div class="list">
    <div class="row"><div class="grow"><div class="t">Theme</div></div><div class="seg" style="width:210px">${[['system','Auto'],['dark','Dark'],['light','Light']].map(([v,l])=>`<button class="${p.theme===v?'on':''}" data-act="pf-theme" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div class="row"><div class="grow"><div class="t">Rest timer sound</div><div class="s">Beeps and vibrates when rest is up</div></div><button class="switch${p.notif.rest?' on':''}" data-act="pf-notif" data-k="rest"></button></div></div></div>
   ${S.customExercises.length?`<div class="sec"><div class="sec-h"><h3>Custom exercises</h3></div><div style="display:flex;flex-direction:column;gap:8px">${S.customExercises.map(c=>swipeRow(`<div class="row" style="border-radius:16px;border:1px solid var(--hair)"><div class="grow"><div class="t">${esc(c.name)}</div><div class="s">${esc(c.group)} · ${esc(c.equip)}</div></div><button class="trash ibtn" data-act="cx-del-btn" data-id="${c.id}">${icon('trash')}</button></div>`,'cx-del',{data:`data-id="${c.id}"`,restored:UI.restored===c.id})).join('')}</div></div>`:''}
   <div class="sec"><div class="sec-h"><h3>Your data</h3></div><div class="note" style="margin-bottom:10px">Saved on this device only. Export a backup to move it to another phone.</div>
    <div class="frow"><button class="btn ghost" data-act="data-export">${icon('download')} Export</button><button class="btn ghost" data-act="data-import">${icon('upload')} Import</button></div>
    <button class="btn danger block" style="margin-top:10px" data-act="data-reset">Reset all data</button></div>
   <div class="note" style="margin-top:14px;text-align:center">TRENCH is free — every feature, for everyone.</div>`;
  bindSwipes($('#v-profile'));
}
Object.assign(IN,{
  'pf-name':t=>{S.profile.name=t.value.trim();commit();},
  'pf-num':t=>{const v=parseFloat(t.value);S.profile[t.dataset.k]=isNaN(v)?null:v;if(t.dataset.k==='weightLb'&&v>0){const d=ymd();S.bodyLog=S.bodyLog.filter(b=>b.date!==d);S.bodyLog.push({date:d,w:v});}commit();renderProfile();},
  'pf-sel':t=>{S.profile[t.dataset.k]=t.value;commit();renderProfile();},
});
Object.assign(ACT,{
  'pf-set':el=>{let v=el.dataset.v;if(['daysPerWeek','sessionLen'].includes(el.dataset.k))v=+v;S.profile[el.dataset.k]=v;commit();renderProfile();},
  'pf-theme':el=>{S.profile.theme=el.dataset.v;commit();applyTheme();renderProfile();},
  'pf-notif':el=>{S.profile.notif[el.dataset.k]=!S.profile.notif[el.dataset.k];commit();el.classList.toggle('on');},
  'pf-equip':el=>{const a=S.profile.equipment||(S.profile.equipment=YMCA_EQUIPMENT.slice());const i=a.indexOf(el.dataset.v);if(i>=0)a.splice(i,1);else a.push(el.dataset.v);commit();el.classList.toggle('on');},
  'data-export':()=>{const blob=new Blob([JSON.stringify(S,null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='trench-backup-'+ymd()+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);toast('Backup downloaded');},
  'data-import':()=>{const inp=document.createElement('input');inp.type='file';inp.accept='application/json,.json';inp.onchange=()=>{const f=inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const d=jparse(rd.result);if(!d||d.v!==2){toast('That file isn’t a TRENCH backup');return;}S=Object.assign(defaultState(),d);S.profile=Object.assign(defaultState().profile,d.profile||{});commit();applyTheme();rerender();toast('Backup restored');};rd.readAsText(f);};inp.click();},
  'data-reset':()=>openSheet('Reset everything?',`<p class="note">Deletes all workouts, maxes and settings on this device. Export a backup first if you might want it back.</p><div class="frow" style="margin-top:14px"><button class="btn ghost" data-act="close-sheet">Cancel</button><button class="btn danger" data-act="data-reset-yes">Reset</button></div>`),
  'data-reset-yes':()=>{Store.del(STORE_KEY);S=defaultState();commit();closeAllSheets();applyTheme();go('plan');toast('All data reset');},
  'cx-new':()=>openCustomExercise(),
  'cx-del':row=>delCustomEx(row,row.dataset.id),'cx-del-btn':el=>delCustomEx(el.closest('.swipe'),el.dataset.id),
});
function delCustomEx(row,id){deleteWithUndo(row,{id,msg:'Exercise deleted',remove:()=>{const i=S.customExercises.findIndex(c=>c.id===id);return {i,c:S.customExercises.splice(i,1)[0]};},restore:t=>S.customExercises.splice(t.i,0,t.c)});}
function openCustomExercise(){
  const d={name:'',group:'Chest',equip:'machine',kind:'compound',primary:[],secondary:[]};
  openSheet('New exercise',b=>{const draw=()=>{b.innerHTML=`<div class="field"><label>Name</label><input class="inp" id="cx-n" value="${esc(d.name)}" placeholder="e.g. Smith Machine Incline Press"></div>
    <div class="frow"><div class="field"><label>Group</label><select class="inp" id="cx-g">${EX_GROUPS.map(g=>`<option${d.group===g?' selected':''}>${g}</option>`).join('')}</select></div><div class="field"><label>Equipment</label><select class="inp" id="cx-e">${['machine','barbell','dumbbell','cable','bodyweight'].map(g=>`<option${d.equip===g?' selected':''}>${g}</option>`).join('')}</select></div></div>
    <div class="field"><label>Type (sets the failure rules)</label><select class="inp" id="cx-k">${[['compound','Compound — stop 1–2 reps short'],['isolation','Isolation — last set to technical failure'],['bw','Bodyweight'],['time','Timed hold']].map(([v,l])=>`<option value="${v}"${d.kind===v?' selected':''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label>Primary muscles</label><div class="chips" style="flex-wrap:wrap">${Object.keys(MUSCLE_NAMES).map(m=>`<button class="chip${d.primary.includes(m)?' on':''}" data-cxm="primary" data-m="${m}">${MUSCLE_NAMES[m]}</button>`).join('')}</div></div>
    <div class="field"><label>Secondary muscles</label><div class="chips" style="flex-wrap:wrap">${Object.keys(MUSCLE_NAMES).map(m=>`<button class="chip${d.secondary.includes(m)?' on':''}" data-cxm="secondary" data-m="${m}">${MUSCLE_NAMES[m]}</button>`).join('')}</div></div>
    <button class="btn pri lg block" style="margin-top:16px" id="cx-save">Save exercise</button>`;
    const sync=()=>{d.name=b.querySelector('#cx-n').value;d.group=b.querySelector('#cx-g').value;d.equip=b.querySelector('#cx-e').value;d.kind=b.querySelector('#cx-k').value;};
    b.querySelectorAll('[data-cxm]').forEach(c=>c.onclick=()=>{sync();const a=d[c.dataset.cxm];const i=a.indexOf(c.dataset.m);if(i>=0)a.splice(i,1);else a.push(c.dataset.m);draw();});
    b.querySelector('#cx-save').onclick=()=>{sync();if(!d.name.trim()){toast('Name it first');return;}if(!d.primary.length){toast('Pick at least one primary muscle');return;}
      const id='c_'+uid();S.customExercises.push({id,name:d.name.trim(),group:d.group,equip:d.equip,kind:d.kind,inc:5,progInc:5,primary:d.primary.slice(),secondary:d.secondary.filter(m=>!d.primary.includes(m)),cues:[],mistakes:[],custom:true,setup:'',ymca:''});
      UI.restored=id;commit();closeSheet();rerender();UI.restored=null;toast('Exercise added');};};draw();});
}

/* ---------- EXERCISE DETAIL (3D demo + muscles + form) ---------- */
function openExercise(id){
  const ex=getEx(id);if(!ex)return;const known=displayMax(id);const hist=(exMem(id).history||[]).slice(-4).reverse();const alts=exAlternatives(id);
  const b=openSheet(esc(ex.name),`
    <div class="chips"><span class="chip">${esc(ex.group)}</span><span class="chip">${esc(ex.equip)}</span><span class="chip">${{compound:'Compound · 1–2 reps in reserve',isolation:'Isolation · last set to technical failure',power:'Power · never to failure',bw:'Bodyweight',time:'Timed hold'}[ex.kind]}</span></div>
    ${ex.custom?'<div class="card note" style="margin-top:12px">Custom exercise — no 3D demo, but muscles, progress and recommendations all work.</div>':`<div class="demo" id="demo3d" style="margin-top:12px"></div>`}
    <div class="sec" style="margin-top:18px"><div class="sec-h"><h3>Muscles worked</h3></div><div class="card">${muscleMapHTML(ex)}${muscleLegendHTML(ex)}</div></div>
    ${ex.setup?`<div class="sec"><div class="sec-h"><h3>Setup</h3></div><div class="card"><p style="margin:0;font-size:14px">${esc(ex.setup)}</p>${ex.ymca?`<div class="note" style="margin-top:8px">🏢 ${esc(ex.ymca)}</div>`:''}</div></div>`:''}
    ${ex.cues&&ex.cues.length?`<div class="sec"><div class="sec-h"><h3>How to do it</h3></div><ol class="cues">${ex.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ol></div>`:''}
    ${ex.mistakes&&ex.mistakes.length?`<div class="sec"><div class="sec-h"><h3>Common mistakes & fixes</h3></div><div class="mist">${ex.mistakes.map(([m,f])=>`<div><div class="bad">✕ ${esc(m)}</div><div class="fix">✓ ${esc(f)}</div></div>`).join('')}</div></div>`:''}
    ${ex.safety?`<div class="callout warn" style="margin-top:14px">⚠️ ${esc(ex.safety)}</div>`:''}
    <div class="sec"><div class="sec-h"><h3>Your numbers</h3></div><div class="card"><div style="display:flex;justify-content:space-between"><span class="note">Estimated max (rounded down)</span><b>${known?known+' lb':'Not set'}</b></div>
     ${hist.length?hist.map(h=>`<div class="mono" style="font-size:12.5px;color:var(--muted);margin-top:6px">${h.date} · top ${num(h.w)} lb · est. ${h.e}</div>`).join(''):'<div class="note" style="margin-top:6px">No sessions logged yet.</div>'}</div></div>
    ${alts.length?`<div class="sec"><div class="sec-h"><h3>Alternatives</h3></div><div class="chips" style="flex-wrap:wrap">${alts.map(a=>`<button class="chip" data-act="ex-detail" data-ex="${a.id}">${esc(a.name)}</button>`).join('')}</div></div>`:''}`,
    {onClose:()=>{if(window.Demo)Demo.unmount();}});
  if(!ex.custom){const host=b.querySelector('#demo3d');setTimeout(()=>{if(window.Demo&&host.isConnected)Demo.mount(host,id);else host.innerHTML='<div class="fallback">3D demo unavailable on this device — follow the steps and muscle map below.</div>';},420);}
}
Object.assign(ACT,{'ex-detail':(el,e)=>{if(e&&e.target.closest('[data-act="slot-edit"]'))return;openExercise(el.dataset.ex);}});

/* ---------- LIBRARY ---------- */
function libraryPage(b){
  const inProg=pid=>{const s=new Set();getProgram(pid).days.forEach(d=>(d.ex||[]).forEach(e=>{s.add(e.id);(e.variants||[]).forEach(v=>s.add(v));}));return s;};
  const draw=()=>{const ppl=inProg('ppl'),leg=inProg('legends');
    const list=allExercises().filter(x=>(UI.libG==='All'||x.group===UI.libG)&&(UI.libP==='all'||(UI.libP==='ppl'&&ppl.has(x.id))||(UI.libP==='legends'&&leg.has(x.id))||(UI.libP==='custom'&&x.custom))&&(!UI.libQ||(x.name+' '+x.primary.map(m=>MUSCLE_NAMES[m]).join(' ')).toLowerCase().includes(UI.libQ.toLowerCase())));
    b.innerHTML=`<div style="position:relative"><input class="inp" id="lib-q" placeholder="Search exercise or muscle" value="${esc(UI.libQ)}" style="padding-left:40px"><span style="position:absolute;left:12px;top:13px;width:18px;color:var(--faint)">${icon('search')}</span></div>
     <div class="seg" style="margin-top:10px">${[['all','All'],['ppl','PPL'],['legends','Legend’s'],['custom','Custom']].map(([v,l])=>`<button class="${UI.libP===v?'on':''}" data-libp="${v}">${l}</button>`).join('')}</div>
     <div class="chips" style="margin-top:10px">${['All'].concat(EX_GROUPS).map(g=>`<button class="chip${UI.libG===g?' on':''}" data-libg="${g}">${g}</button>`).join('')}</div>
     <div class="eyebrow" style="margin:14px 0 8px">${list.length} exercises</div>
     <div class="list">${list.map(x=>`<div class="row tap" data-act="ex-detail" data-ex="${x.id}"><div style="width:44px;flex:0 0 auto">${muscleSVG((x.primary||[]).some(m=>BACK_ONLY.includes(m))?'back':'front',x.primary,x.secondary)}</div><div class="grow"><div class="t">${esc(x.name)}</div><div class="s">${esc(x.group)} · ${esc(x.equip)} · ${x.primary.map(m=>MUSCLE_NAMES[m]).join(', ')}</div></div>${icon('chev','chev')}</div>`).join('')||'<div class="empty">No matches</div>'}</div>
     <button class="btn ghost block" style="margin-top:12px" data-act="cx-new">${icon('plus')} Custom exercise</button>`;
    const q=b.querySelector('#lib-q');q.oninput=()=>{UI.libQ=q.value;draw();const n=b.querySelector('#lib-q');n.focus();n.setSelectionRange(UI.libQ.length,UI.libQ.length);};
    b.querySelectorAll('[data-libg]').forEach(c=>c.onclick=()=>{UI.libG=c.dataset.libg;draw();});
    b.querySelectorAll('[data-libp]').forEach(c=>c.onclick=()=>{UI.libP=c.dataset.libp;draw();});};
  draw();
}

/* ---------- FUEL ---------- */
function macroGrid(m,label){return `<div class="macro4"><div><b>${num(m.kcal)}</b><span>${label||'kcal'}</span></div><div><b>${m.p}g</b><span>protein</span></div><div><b>${m.c}g</b><span>carbs</span></div><div><b>${m.f}g</b><span>fat</span></div></div>
  <div class="mbar"><i class="p" style="width:${m.p*4/Math.max(1,m.kcal)*100}%"></i><i class="c" style="width:${m.c*4/Math.max(1,m.kcal)*100}%"></i><i class="f" style="width:${m.f*9/Math.max(1,m.kcal)*100}%"></i></div>`;}
function itemsList(items,mult){return `<ul class="items">${items.map(([k,g,l])=>`<li>${esc(mult&&mult!==1&&g?l+'  ×'+mult:l)}</li>`).join('')}</ul>`;}
function statsForm(){const p=S.profile;return `<div class="callout warn">Add your height, weight and age to get personalized targets.</div><div class="card" style="margin-top:10px">
  <div class="frow"><div class="field" style="margin-top:0"><label>Height (ft)</label><input class="inp" type="number" data-ch="fu-num" data-k="heightFt" value="${p.heightFt??''}"></div><div class="field" style="margin-top:0"><label>(in)</label><input class="inp" type="number" data-ch="fu-num" data-k="heightIn" value="${p.heightIn??''}"></div></div>
  <div class="frow"><div class="field"><label>Weight (lb)</label><input class="inp" type="number" data-ch="fu-num" data-k="weightLb" value="${p.weightLb??''}"></div><div class="field"><label>Age</label><input class="inp" type="number" data-ch="fu-num" data-k="age" value="${p.age??''}"></div></div>
  <div class="field"><label>Activity</label><select class="inp" data-ch="fu-act">${ACTIVITY.map(a=>`<option value="${a.id}"${p.activity===a.id?' selected':''}>${a.label} — ${a.desc}</option>`).join('')}</select></div></div>`;}
Object.assign(IN,{'fu-num':t=>{const v=parseFloat(t.value);S.profile[t.dataset.k]=isNaN(v)?null:v;commit();if(eer())rerender();},'fu-act':t=>{S.profile.activity=t.value;commit();rerender();}});
function targetsCard(mode){
  const t=nutritionTargets(mode);if(!t)return statsForm();const m={kcal:t.cal,p:t.protein,c:t.carbs,f:t.fat};
  return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="eyebrow">${{cut:'Cutting target',bulk:'Bulking target',maintain:'Maintenance target'}[mode]}</div><span class="note">maintenance ≈ ${num(t.maint)}</span></div>
    <div style="margin-top:10px">${macroGrid(m,'kcal / day')}</div>
    <div class="note" style="margin-top:10px">${mode==='cut'?`${t.delta} kcal below maintenance — aim to lose about 0.5–1% of body weight a week.`:mode==='bulk'?`+${t.delta} kcal over maintenance — aim to gain about 0.25–0.5 lb a week.`:'Matches what you burn.'} Weigh in weekly and adjust by ~200 kcal if you’re off pace.</div>
    ${t.teen&&mode==='cut'?'<div class="callout warn" style="margin-top:10px">Still growing? Keep the cut small and check with your doctor and parents first.</div>':''}</div>`;
}
function mealPlanHTML(mode){
  const t=nutritionTargets(mode);if(!t)return '';const mp=buildMealPlan(mode,t);
  return `<div class="sec"><div class="sec-h"><h3>Full-day meal plan</h3><span class="note">${num(mp.sum.kcal)} kcal</span></div>
   <div class="list">${mp.plan.map(m=>{const r=recipeById(m.recipe);return `<div class="row tap" data-act="recipe" data-id="${r.id}" data-mult="${m.servings}"><span class="ico">${r.icon}</span><div class="grow"><div class="s">${esc(m.slot)}</div><div class="t">${esc(r.name)}${m.servings!==1?` <span class="tagx">×${m.servings}</span>`:''}</div></div><div class="note mono" style="text-align:right">${Math.round(r.m.kcal*m.servings)}<br>${Math.round(r.m.p*m.servings)}g P</div></div>`;}).join('')}
   ${mp.adds.map(a=>`<div class="row"><span class="ico">➕</span><div class="grow"><div class="s">Add-on</div><div class="t">${esc(a.a.label)}${a.n>1?` <span class="tagx">×${a.n}</span>`:''}</div></div><div class="note mono" style="text-align:right">${a.a.m.kcal*a.n}<br>${a.a.m.p*a.n}g P</div></div>`).join('')}</div>
   <div class="card" style="margin-top:10px">${macroGrid(mp.sum,'kcal planned')}<div class="note" style="margin-top:8px">Target ${num(t.cal)} kcal · ≥${t.protein} g protein. Servings adjust automatically to your numbers — tap any meal for the full recipe.</div></div></div>`;
}
function fuelModeBtn(mode){const on=S.profile.nutrition===mode;return on?`<span class="rec-badge">✓ YOUR PLAN</span>`:`<button class="lnk" data-act="fu-mode" data-v="${mode}">Make this my plan</button>`;}
function renderFuel(){
  const tabs=[['cut','Cutting'],['bulk','Bulking'],['pre','Pre-workout'],['recipes','Recipes']];
  if(!tabs.some(([k])=>k===UI.fuelTab))UI.fuelTab=S.profile.nutrition==='cut'?'cut':'bulk';
  const T=UI.fuelTab;let body='';
  if(T==='cut'||T==='bulk'){const cut=T==='cut';
    const tips=cut?['Keep lifting heavy — it tells your body to keep its muscle.','Fill half your plate with vegetables.','Watch drinks: soda, juice and energy drinks add up fast.','If your strength drops two weeks in a row, eat 100–200 kcal more.']
      :['Drink some calories: whole milk with meals (+150 kcal a cup).','Add 1 tbsp olive oil to rice or pasta (+120 kcal) or peanut butter to oats.','Eat every 3–4 hours, including a snack before bed.','Not gaining after two weeks? Add about 200 kcal a day.'];
    const snacks=cut?['Apple + 1 string cheese (~165 kcal)','Baby carrots + ¼ cup hummus (~140 kcal)','3 cups air-popped popcorn (~95 kcal)','2 hard-boiled eggs (~140 kcal, 12 g protein)']
      :['Trail mix, ¼ cup (~175 kcal)','PB & banana on a rice cake (~250 kcal)','Whole milk + granola (~350 kcal)','Greek yogurt + honey + almonds (~300 kcal)'];
    body=`<div class="sec-h" style="margin-top:0"><p class="note" style="margin:0;flex:1">${cut?'Lose fat and keep your muscle — a small calorie deficit with plenty of protein.':'Build muscle with little fat gain — a small calorie surplus with plenty of protein.'}</p></div>
     <div style="margin:8px 0 10px;text-align:right">${fuelModeBtn(T)}</div>
     ${targetsCard(T)}${mealPlanHTML(T)}
     <div class="sec"><div class="acc"><button data-act="acc">${cut?'Cutting tips':'Easy ways to eat more'}${icon('chev','chev')}</button><div class="acc-b"><ul class="items">${tips.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>
     <div class="acc"><button data-act="acc">Snack ideas${icon('chev','chev')}</button><div class="acc-b"><ul class="items">${snacks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></div>`;}
  if(T==='pre'){const p=activeProgram();const days=p.id==='ppl'?['d1','d2','d3','d5','d6'].map(d=>getDay('ppl',d)):p.days.filter(d=>!d.rest);
    body=`<p class="note" style="margin-top:0">One quick snack before each workout — enough energy to train hard without a full meal.</p>
     <div style="display:flex;flex-direction:column;gap:10px">${days.map(d=>{const key=mealKeyFor(p.id,d);const sn=PRE_SNACK[key];return `<div class="card snack"><div class="eyebrow">${esc(p.id==='ppl'?d.label+' · '+(d.short||d.name):d.name)}</div><div class="mealh" style="margin-top:4px"><b>${esc(sn.title)}</b><span class="mealt">⏱ ${esc(sn.timing)}</span></div>${itemsList(sn.items)}${macroLine(sn.m)}</div>`;}).join('')}</div>
     <div class="note" style="margin-top:12px">Drink a glass of water with it.${S.profile.nutrition==='bulk'?' Bulking? Add a glass of milk (+150 kcal).':''}</div>`;}
  if(T==='recipes'){const cats=['All','Shakes','Breakfast','Meals','Snacks'];const c=cats.includes(UI.recCat)?UI.recCat:'All';
    const list=RECIPES.concat(S.customRecipes).filter(r=>c==='All'||r.cat===c);
    body=`<div class="chips">${cats.map(x=>`<button class="chip${c===x?' on':''}" data-act="fu-cat" data-c="${x}">${x}</button>`).join('')}</div>
     <div class="rcpgrid" style="margin-top:12px">${list.map(r=>r.custom?swipeRow(rcpCard(r),'rcp-del',{data:`data-id="${r.id}"`,restored:UI.restored===r.id}):rcpCard(r)).join('')}</div>
     <button class="btn ghost block" style="margin-top:12px" data-act="rcp-new">${icon('plus')} Add your own recipe</button>`;}
  $('#v-fuel').innerHTML=`<div class="ptitle">Fuel</div><div class="psub">Cutting, bulking and what to eat around training.</div>
   <div class="tabs" style="margin-top:14px">${tabs.map(([k,l])=>`<button class="${T===k?'on':''}" data-act="fu-tab" data-t="${k}">${l}</button>`).join('')}</div><div style="margin-top:14px">${body}</div>`;
  bindSwipes($('#v-fuel'));
}
function rcpCard(r){return `<div class="rcp" data-act="recipe" data-id="${r.id}"><span class="em">${r.icon||'🍽️'}</span><span class="n">${esc(r.name)}</span><span class="k">${r.m.kcal} kcal · ${r.m.p}g P</span></div>`;}
function openRecipe(id,mult){
  const r=recipeById(id);if(!r)return;let k=mult||1;
  openSheet(esc(r.name),b=>{const draw=()=>{const m=r.items?macros(r.items,k):{kcal:Math.round(r.m.kcal*k),p:Math.round(r.m.p*k),c:Math.round(r.m.c*k),f:Math.round(r.m.f*k)};
    b.innerHTML=`${r.blurb?`<p style="margin:0 0 12px;font-size:14px">${esc(r.blurb)}</p>`:''}<div class="chips"><span class="chip">${esc(r.cat||'Custom')}</span>${r.time?`<span class="chip">⏱ ${esc(r.time)}</span>`:''}${(r.tags||[]).map(t=>`<span class="chip">${t==='cut'?'Cut-friendly':'Bulk-friendly'}</span>`).join('')}</div>
     <div class="card" style="margin-top:12px"><div style="display:flex;align-items:center;justify-content:space-between"><b>Servings</b><div style="display:flex;align-items:center;gap:10px"><button class="ibtn" id="rk-m">${icon('minus')}</button><b class="mono">×${k}</b><button class="ibtn" id="rk-p">${icon('plus')}</button></div></div><div style="margin-top:12px">${macroGrid(m)}</div></div>
     ${r.items?`<div class="sec"><div class="sec-h"><h3>Ingredients</h3></div><div class="card">${itemsList(r.items,k)}</div></div>`:r.ing?`<div class="sec"><div class="sec-h"><h3>Ingredients</h3></div><div class="card"><ul class="items">${r.ing.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>`:''}
     ${r.steps&&r.steps.length?`<div class="sec"><div class="sec-h"><h3>Steps</h3></div><ol class="cues">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`:''}`;
    b.querySelector('#rk-m').onclick=()=>{k=Math.max(.5,k-.5);draw();};b.querySelector('#rk-p').onclick=()=>{k=Math.min(4,k+.5);draw();};};draw();});
}
Object.assign(ACT,{
  'open-fuel':el=>{if(el&&el.dataset&&el.dataset.tab)UI.fuelTab=el.dataset.tab;closeAllSheets();while(UI.pages.length)closePage();go('fuel');},
  'fu-tab':el=>{UI.fuelTab=el.dataset.t;renderFuel();},
  'fu-mode':el=>{S.profile.nutrition=el.dataset.v;commit();rerender();},
  'fu-cat':el=>{UI.recCat=el.dataset.c;rerender();},
  recipe:el=>openRecipe(el.dataset.id,parseFloat(el.dataset.mult)||1),
  'rcp-del':row=>{const id=row.dataset.id;deleteWithUndo(row,{id,msg:'Recipe deleted',remove:()=>{const i=S.customRecipes.findIndex(r=>r.id===id);return {i,r:S.customRecipes.splice(i,1)[0]};},restore:t=>S.customRecipes.splice(t.i,0,t.r)});},
  'rcp-new':()=>openSheet('Your recipe',`<div class="field"><label>Name</label><input class="inp" id="cr-n"></div><div class="field"><label>Ingredients (one per line, with amounts)</label><textarea class="inp" id="cr-i" placeholder="1 cup (244 g) whole milk"></textarea></div>
    <div class="frow"><div class="field"><label>kcal</label><input class="inp" type="number" id="cr-k"></div><div class="field"><label>Protein g</label><input class="inp" type="number" id="cr-p"></div><div class="field"><label>Carbs g</label><input class="inp" type="number" id="cr-c"></div><div class="field"><label>Fat g</label><input class="inp" type="number" id="cr-f"></div></div>
    <div class="field"><label>Steps</label><textarea class="inp" id="cr-s"></textarea></div><button class="btn pri lg block" style="margin-top:14px" data-act="rcp-save">Save recipe</button>`),
  'rcp-save':()=>{const n=$('#cr-n').value.trim();if(!n){toast('Name it first');return;}const v=id=>parseFloat($(id).value)||0;const id='r'+uid();
    S.customRecipes.unshift({id,name:n,cat:'Custom',custom:true,icon:'🍽️',tags:[],ing:$('#cr-i').value.split('\n').map(x=>x.trim()).filter(Boolean),steps:$('#cr-s').value.split('\n').map(x=>x.trim()).filter(Boolean),m:{kcal:v('#cr-k'),p:v('#cr-p'),c:v('#cr-c'),f:v('#cr-f')}});
    UI.recCat='All';UI.restored=id;commit();closeSheet();rerender();UI.restored=null;toast('Recipe saved');},
});

/* ---------- RECOVERY ---------- */
function recoveryHTML(dk){
  const R=RECOVERY[dk]||RECOVERY.d4;const t=nutritionTargets(S.profile.nutrition);
  return `<div class="seg">${[['d4','Day 4'],['d7','Day 7']].map(([v,l])=>`<button class="${dk===v?'on':''}" data-act="rec-day" data-v="${v}">${l} · Rest</button>`).join('')}</div>
   <div class="card hero rest" style="margin-top:12px"><div class="tag">Rest day</div><h2 style="font-size:21px">${esc(R.title)}</h2><div class="meta">${esc(R.focus)}</div></div>
   ${t?`<div class="card" style="margin-top:10px"><div class="eyebrow">Today’s targets</div><div style="margin-top:8px">${macroGrid({kcal:t.cal,p:t.protein,c:t.carbs,f:t.fat},'kcal')}</div><div class="note" style="margin-top:8px">Same as a training day — your muscles rebuild today.</div></div>`:''}
   ${RECOVERY.sections.map((s,i)=>`<div class="acc${i<3?' open':''}" style="margin-top:8px"><button data-act="acc"><span style="font-size:18px">${s.icon}</span>${esc(s.h)}${icon('chev','chev')}</button><div class="acc-b"><ul class="items">${s.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>`).join('')}`;
}
Object.assign(ACT,{
  'open-recovery':el=>{UI.recDay=el.dataset.day||(S.activeProgram==='ppl'?(dayForDate('ppl').id==='d7'?'d7':'d4'):(dowIdx(NOW())===0?'d7':'d4'));openPage('Rest-Day Recovery',b=>{b.innerHTML=recoveryHTML(UI.recDay);});},
  'rec-day':el=>{UI.recDay=el.dataset.v;rerender();},
  'open-library':()=>openPage('Exercise Library',libraryPage),
  'open-guide':()=>openPage('Progression Guide',b=>{
    const active=daySlots(S.activeProgram,(activeProgram().days.find(d=>!d.rest)||{}).id||'d1');
    b.innerHTML=`<div class="callout"><b>The short version:</b> hit all your reps with good form → the weight goes up next time. Miss → repeat or hold. Stall twice → reset 10% and build back.</div>
     ${PROGRESSION_GUIDE.map((g,i)=>`<div class="acc${i<2?' open':''}" style="margin-top:8px"><button data-act="acc">${esc(g.h)}${icon('chev','chev')}</button><div class="acc-b"><p style="margin:0;font-size:14px;line-height:1.55">${esc(g.p)}</p></div></div>`).join('')}
     <div class="sec"><div class="sec-h"><h3>Where your lifts stand</h3></div><div class="list">${progExIds().map(id=>{const e=getEx(id);const m=S.exState[id];const sc=m&&Object.values(m.schemes||{}).sort((a,b)=>(a.date||'')<(b.date||'')?1:-1)[0];const c=sc?statusChip(sc.result):null;
       return `<div class="row"><div class="grow"><div class="t" style="font-size:13.5px">${esc(e.name)}</div><div class="s">${displayMax(id)?'est. max '+displayMax(id)+' lb':knownE1RM(id)?'ready':'needs a test set'}</div></div>${c?`<span class="st ${sc.result}" style="font-size:12.5px;font-weight:650">${c[0]} ${c[1]}</span>`:'<span class="note">—</span>'}</div>`;}).join('')}</div></div>`;}),
  'open-supps':()=>openPage('Supplements',b=>{b.innerHTML=`<div class="callout"><b>Food first.</b> Talk to your doctor and your parents before starting anything — especially as a young athlete. Only buy products that are <b>third-party tested</b> (NSF Certified for Sport or Informed Sport).</div>
     <div class="sec"><div class="sec-h"><h3>Safe, proven basics</h3></div>${SUPPS.map(s=>`<div class="card"><div style="display:flex;justify-content:space-between;gap:10px"><b style="font-family:var(--disp);font-size:16px">${esc(s.n)}</b><span class="tagx">${esc(s.tag)}</span></div><ul class="items">${s.benefits.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="note" style="margin-top:8px;border-left:2px solid var(--accent-line);padding-left:10px">${esc(s.use)}</div></div>`).join('')}</div>
     <div class="sec"><div class="sec-h"><h3>Skip these</h3></div><div class="list">${SUPP_AVOID.map(a=>`<div class="row"><span style="color:var(--bad);font-weight:800">✕</span><div class="grow s" style="color:var(--muted)">${esc(a)}</div></div>`).join('')}</div></div>
     <p class="note" style="margin-top:14px">None of this replaces real food, water and sleep — that’s where almost all of the results come from.</p>`;}),
  'open-relief':()=>openPage('Aches & Pains',b=>{b.innerHTML=`<div class="callout">Everyday mobility and strengthening fixes for normal training aches. <b>Different story for</b> sharp pain, swelling, a joint that locks or gives out, numbness or tingling, or pain right after a hit — get those checked by a doctor or physio.</div>
     ${RELIEF.map((r,i)=>`<div class="acc${i===0?' open':''}" style="margin-top:8px"><button data-act="acc">${esc(r.area)}${icon('chev','chev')}</button><div class="acc-b"><p class="note" style="margin-top:0">${esc(r.why)}</p>
       <div class="eyebrow" style="color:var(--accent);margin-top:10px">Loosen / stretch</div><ul class="items">${r.stretch.map(x=>`<li><span><b>${esc(x.n)}</b> — ${esc(x.d)}</span></li>`).join('')}</ul>
       <div class="eyebrow" style="color:var(--good);margin-top:12px">Strengthen / fix</div><ul class="items">${r.strengthen.map(x=>`<li><span><b>${esc(x.n)}</b> — ${esc(x.d)}</span></li>`).join('')}</ul>
       <div class="eyebrow" style="margin-top:12px">Day to day</div><ul class="items">${r.daily.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>`).join('')}`;}),
  'open-legends':()=>openPage('The Legend’s Split',b=>{b.innerHTML=`<div class="callout"><b>For inspiration, not for copying.</b> These come from legends of lifting and football. The Legend’s Split adapts them to your YMCA gear with youth-safe rules; the original workouts are here for the history.</div>
     ${S.activeProgram!=='legends'?`<button class="btn ghost block" style="margin-top:12px" data-act="set-prog" data-p="legends">${icon('star')} Make The Legend’s Split my program</button>`:'<div class="rec-badge" style="margin-top:12px">ACTIVE PROGRAM</div>'}
     <div class="sec"><div class="sec-h"><h3>The Legends Week</h3><span class="note">2-week cycle</span></div><p class="note" style="margin-top:0">These sessions are savage, so they’re spread out with real rest days. Platz legs only comes back every 2 weeks — the two brutal leg days sit on opposite weeks.</p>
       ${LEGCAL.map(w=>`<div class="eyebrow" style="margin:12px 0 6px;color:var(--accent)">${esc(w.week)}</div><div class="list">${w.days.map(d=>`<div class="row" style="${d[2]==='rest'?'opacity:.55':''}"><span class="mono note" style="width:36px">${d[0]}</span><div class="grow t" style="${d[2]==='hot'?'color:var(--accent)':d[2]==='light'?'color:var(--good)':''}">${esc(d[1])}${d[2]==='hot'?' 🔥':''}</div></div>`).join('')}</div>`).join('')}</div>
     <div class="sec"><div class="sec-h"><h3>The stories</h3></div>${LEGENDS.map((g,i)=>`<div class="acc${i===0?' open':''}" style="margin-top:8px"><button data-act="acc">${esc(g.name)}${icon('chev','chev')}</button><div class="acc-b"><div class="mono" style="color:var(--accent);font-size:12px">${esc(g.quote)}</div><p class="note">${esc(g.legend)}</p>
       <div class="eyebrow" style="color:var(--accent)">The workout</div><ul class="items">${g.workout.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="eyebrow" style="color:var(--good);margin-top:10px">Try it — scaled & safe</div><ul class="items">${g.scaled.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>`).join('')}</div>`;}),
});
