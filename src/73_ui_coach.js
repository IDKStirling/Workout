/* =========================================================
   WORKOUT-DAY UI
   warm-up · pre-workout snack · set-by-set plan · cooldown · post-workout meal
   ========================================================= */
function mealKeyFor(progId,day){if(!day||day.rest)return null;if(progId==='ppl')return PRE_SNACK[day.id]?day.id:null;return {quads:'d3',push:'d1',upper:'d5',posterior:'d6',pull:'d2',legs:'d3'}[day.type]||'d1';}
function mealMode(){return {cut:'cut',bulk:'bulk'}[S.profile.nutrition]||'base';}
const MODE_LBL={cut:'Cutting',base:'Maintain',bulk:'Bulking'};

/* ---------- small building blocks ---------- */
function dosesList(rows){return `<div class="dose">${rows.map(([n,d,c])=>`<div><span class="dn">${esc(n)}${c?`<span class="dc">${esc(c)}</span>`:''}</span><span class="dd">${esc(d)}</span></div>`).join('')}</div>`;}
function macroLine(m){return `<div class="mline"><b>${num(m.kcal)} kcal</b><span>${m.p} g protein</span><span>${m.c} g carbs</span><span>${m.f} g fat</span></div>`;}
/* a collapsible row with an icon, title and one-line summary */
function pacc(ico,title,sub,body,cls){return `<div class="acc pacc${cls?' '+cls:''}"><button data-act="acc"><span class="ico">${ico}</span><span class="grow"><b>${esc(title)}</b><small>${esc(sub)}</small></span>${icon('chev','chev')}</button><div class="acc-b">${body}</div></div>`;}

/* ---------- warm-up (dynamic movements only) ---------- */
function warmupHTML(type){const W=WARMUP_PLAN[type]||WARMUP_PLAN.upper;return dosesList(W.moves)+`<div class="note" style="margin-top:8px">Move smoothly — this should get you warm, not tired.</div>`;}
function warmupSub(type){const W=WARMUP_PLAN[type]||WARMUP_PLAN.upper;return `${W.dur} · ${W.moves.length} moves`;}

/* ---------- pre-workout snack ---------- */
function snackHTML(key){const sn=PRE_SNACK[key];if(!sn)return '';const mode=mealMode();
  return `${itemsList(sn.items)}${macroLine(sn.m)}<div class="note" style="margin-top:6px">⏱ Eat it ${esc(sn.timing)} training, with a glass of water.${mode==='bulk'?' Bulking? Add a glass of milk (+150 kcal).':''}</div>`;}

/* ---------- cooldown & post-workout meal ---------- */
function cooldownHTML(type){const C=COOLDOWN[type]||COOLDOWN.upper;const st=STRETCHES[type]||STRETCHES.upper;
  return `<div class="note">${esc(C.walk)}</div>${dosesList(st.map(x=>[x.n,x.hold]))}<div class="note" style="margin-top:8px">Hold still and breathe — no bouncing.</div>`;}
function postMealHTML(key){
  const pm=POSTWORKOUT[key];if(!pm)return '';const mode=mealMode();const items=pm[mode];const m=mode==='cut'?pm.mCut:mode==='bulk'?pm.mBulk:pm.mBase;const pt=postTargets(key,mode);
  return `<div class="mealh"><b>${esc(pm.title)}</b><span class="mealt">⏱ ${esc(pm.timing)} · ${MODE_LBL[mode].toLowerCase()} portion</span></div>
   ${itemsList(items)}${macroLine(m)}
   <div class="note" style="margin-top:6px">Aim for about <b>${pt.p} g protein</b> and <b>${pt.c} g carbs</b> after training.</div>
   <div class="alts">${pm.alts.map(a=>{const r=a.recipe?recipeById(a.recipe):null;return `<div class="altm"${r?` data-act="recipe" data-id="${r.id}"`:''}><span>Or: <b>${esc(a.title)}</b></span><span class="note mono">${a.m.kcal} kcal · ${a.m.p} g P${r?' ›':''}</span></div>`;}).join('')}</div>`;
}
function beforeHTML(progId,day){
  const key=mealKeyFor(progId,day);const sn=PRE_SNACK[key];
  return `<div class="eyebrow pgrp">Before you train</div>
   ${pacc(icon('fire'),'Warm-up',warmupSub(day.type),warmupHTML(day.type))}
   ${sn?pacc('<span class="emo">🍌</span>','Pre-workout snack',`${sn.title} · ${sn.timing}`,snackHTML(key)):''}`;
}
function afterHTML(progId,day,done){
  const key=mealKeyFor(progId,day);const C=COOLDOWN[day.type]||COOLDOWN.upper;const pm=POSTWORKOUT[key];
  return `<div class="eyebrow pgrp"${done?' style="color:var(--good)"':''}>${done?'Workout done — now this':'After you train'}</div>
   ${pacc(icon('moon'),'Cooldown',`${C.dur} · walk + stretches`,cooldownHTML(day.type),'after')}
   ${pm?pacc('<span class="emo">🍽️</span>','Post-workout meal',`${pm.title} · ${pm.timing.replace(' after training','')}`,postMealHTML(key),'after'):''}`;
}

/* ---------- set-by-set plan under each exercise ---------- */
function setPlanHTML(slot){
  const ex=getEx(slot.exId);if(!ex)return '';const P=prescribe(slot);const adv=coachAdvice(slot);
  if(P.mode==='calibrate'||P.mode==='pending')return `<div class="setplan"><div class="sp-empty">No max yet — your first set is a quick test set.</div></div>`;
  const rows=P.sets.map((s,k)=>{
    const w=slot.time?`${s.time} sec`:slot.max?'Max reps':s.mode==='bw-noweight'?'Bodyweight':fmtW(ex,s.w,{short:true})+` × ${s.reps}`;
    return `<div class="sp-row"><span class="sp-n">${k+1}</span><span class="sp-w">${w}</span><span class="sp-p">${s.pct!=null?s.pct+'%':''}</span><span class="sp-d">${esc(s.diff.short)}</span><span class="sp-r">${s.rest?fmtRest(s.rest):''}</span></div>`;}).join('');
  const show=adv&&['up','down','reps'].includes(adv.kind);
  return `<div class="setplan"><div class="sp-head"><span></span><span>Weight × reps</span><span>% max</span><span>Effort</span><span>Rest</span></div>${rows}${show?`<div class="sp-coach ${adv.kind}">${{up:'↑',reps:'+1',down:'↓'}[adv.kind]} ${esc(adv.head)}</div>`:''}</div>`;
}
Object.assign(ACT,{'open-maxcalc':()=>openCheckin()}); /* older links */
/* shown once above the exercise list when any lift has no max yet */
function noMaxBanner(slots){const miss=slots.filter(s=>{const f=planSets(s)[0]||{};return f.mode==='calibrate'||f.mode==='pending';}).length;
  return miss?`<div class="callout" style="margin-bottom:10px">${miss===slots.length?'No maxes yet.':`${miss} of ${slots.length} exercises have no max yet.`} <button class="lnk" style="color:var(--accent);font-weight:650" data-act="open-checkin">Enter your maxes</button> and every set is calculated for you.</div>`:'';}
