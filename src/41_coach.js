/* =========================================================
   STRENGTH COACH
   maxes · set-by-set prescription · ramp-up sets · plain-language
   overload advice · personalized strength projections.
   Rules: maxes and projections are always rounded DOWN; projections
   are estimates for motivation and never drive the training weights —
   recommendations come only from what was actually lifted.
   ========================================================= */

/* ---------- maxes (one source of truth, with history) ---------- */
function maxLogOf(id){S.maxLog=S.maxLog||{};return S.maxLog[id]||(S.maxLog[id]=[]);}
function recordMax(id,e,src,extra){
  e=Math.floor(e);if(!(e>0))return;
  const L=maxLogOf(id);const date=(extra&&extra.date)||ymd(NOW());
  const last=L[L.length-1];
  if(last&&last.date===date&&last.src===src&&src==='workout'){Object.assign(last,extra||{},{e});return;}
  if(last&&last.date===date&&last.src===src&&last.e===e&&(!extra||(last.w===extra.w&&last.r===extra.r)))return; /* exact duplicate */
  L.push(Object.assign({date,src},extra||{},{e}));
  if(L.length>80)L.splice(0,L.length-80);
}
function maxInfo(id){
  const L=((S.maxLog||{})[id]||[]).slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  if(!L.length)return {cur:0,prev:0,best:0,entries:[]};
  const c=L[L.length-1];let prev=0,prevDate=null;
  for(let i=L.length-2;i>=0;i--){if(L[i].e!==c.e){prev=L[i].e;prevDate=L[i].date;break;}}
  let best=0,bestDate=null;L.forEach(x=>{if(x.e>=best){best=x.e;bestDate=x.date;}});
  return {cur:c.e,curDate:c.date,curSrc:c.src,prev,prevDate,best,bestDate,entries:L};
}
function displayMax(id){return maxInfo(id).cur;}
/* a logged session beats the current max → it becomes the new max */
function recordWorkoutMax(id,e,date){e=Math.floor(e);if(e>maxInfo(id).cur){recordMax(id,e,'workout',{date});return true;}return false;}
/* user enters a max: a true 1RM (reps = 1) or weight × reps → estimated */
function setEnteredMax(id,w,r){
  const ex=getEx(id);if(!ex||ex.kind==='time')return 0;
  w=Number(w)||0;r=Math.min(15,parseInt(r,10)||0);
  if(!(r>0)||!(w>0||ex.kind==='bw'))return 0;
  if(ex.kind==='bw'&&!bodyweight())return -1;
  S.strength[id]={w,r,date:ymd(NOW())};
  const e=e1rm(loadOf(ex,w),r);recordMax(id,e,'entered',{w,r});
  /* the new max takes over: drop the old working estimate and old progression anchor */
  const m=exMem(id);m.e1rm=0;m.stall=0;Object.values(m.schemes||{}).forEach(sc=>{delete sc.lastW;delete sc.result;});
  return Math.floor(e);
}
function clearEnteredMax(id){delete S.strength[id];const L=maxLogOf(id);for(let i=L.length-1;i>=0;i--)if(L[i].src==='entered'&&L[i].date===ymd(NOW()))L.splice(i,1);}
/* migrate older saves: seed the log from entered numbers and logged history */
function seedMaxLog(){
  S.maxLog=S.maxLog||{};
  Object.entries(S.strength||{}).forEach(([id,s])=>{const ex=getEx(id);if(!ex||(S.maxLog[id]&&S.maxLog[id].length))return;
    if(s&&s.r>0&&(Number(s.w)>0||(ex.kind==='bw'&&bodyweight()>0)))recordMax(id,e1rm(loadOf(ex,Number(s.w)||0),s.r),'entered',{date:s.date||ymd(NOW()),w:s.w,r:s.r});});
  Object.entries(S.exState||{}).forEach(([id,m])=>{(m.history||[]).slice().sort((a,b)=>a.date<b.date?-1:1).forEach(h=>{if(h.e>maxInfo(id).cur)recordMax(id,h.e,'workout',{date:h.date});});});
}

/* ---------- set-by-set prescription ---------- */
function setDifficulty(ex,rir,slot){
  if(slot&&slot.time)return {short:'steady hold',long:'Hold with perfect form — stop when your hips sag',rpe:'RPE 8'};
  if(slot&&slot.max)return {short:'1 short of max',long:'As many good reps as possible — stop 1 rep before form breaks',rpe:'RPE 9'};
  if(ex.kind==='power')return {short:'fast & crisp',long:'Fast and crisp — rack it before the bar slows down',rpe:'RPE 6–7'};
  if(rir<=.05)return {short:'to failure',long:'All-out — the last rep you can do with perfect form',rpe:'RPE 10'};
  if(rir<=1.1)return {short:'1 left',long:'Very hard — 1 good rep left in the tank',rpe:'RPE 9'};
  if(rir<1.9)return {short:'1–2 left',long:'Hard — 1–2 good reps left in the tank',rpe:'RPE 8–9'};
  return {short:'2 left',long:'Hard but smooth — 2 good reps left in the tank',rpe:'RPE 8'};
}
function fmtRest(sec){if(!sec)return '';const m=Math.floor(sec/60),s=sec%60;return m?(m+':'+(s<10?'0':'')+s):s+'s';}
function prescribe(slot){
  const ex=getEx(slot.exId);if(!ex)return {sets:[],mode:'none'};
  const P=planSets(slot);const E=maxInfo(slot.exId).cur||knownE1RM(slot.exId);
  const sets=P.map((s,k)=>{
    const load=s.w!=null&&s.mode==='rec'?loadOf(ex,s.w):0;
    const pct=E>0&&load>0&&!slot.time&&!slot.max?Math.floor(load/E*100):null;
    const last=k===P.length-1;
    const restTxt=last?(slot.ss?'rest '+fmtRest(slot.rest)+' after the superset':'then next exercise'):(slot.ss?'go to partner, then rest '+fmtRest(slot.rest):'rest '+fmtRest(slot.rest));
    return Object.assign({},s,{pct,diff:setDifficulty(ex,s.rir!=null?s.rir:plannedRIR(ex.kind,k,P.length),slot),rest:last&&!slot.ss?0:slot.rest,restTxt});
  });
  return {sets,mode:P[0]?P[0].mode:'none',E,ex};
}

/* ---------- movement-specific ramp-up (warm-up) sets before heavy lifts ---------- */
function rampSets(slot,earlier){
  const ex=getEx(slot.exId);if(!ex||slot.time)return null;
  if(!(ex.kind==='compound'||ex.kind==='power'||ex.kind==='bw'))return null;
  const sameMuscle=(earlier||[]).some(p=>{const pe=getEx(p.exId);return pe&&pe!==ex&&(pe.kind==='compound'||pe.kind==='power'||pe.kind==='bw')&&(pe.group===ex.group||pe.primary.concat(pe.secondary||[]).some(m=>ex.primary.includes(m)));});
  if(ex.kind==='bw')return {sets:[],text:sameMuscle?'1 easy set of 3–4 reps':'1–2 easy sets of 3–5 reps (use the assist if you need it)'};
  const f=planSets(slot)[0]||{};const T=f.reps||slot.lo||8;
  if(f.mode!=='rec'||!(f.w>0))return {sets:[],text:ex.kind==='power'?'Empty bar × 5, then a light set × 3 — technique first':ex.equip==='barbell'?'Empty bar × 10, then a light set × 5 before your test set':'A light set × 8, then a medium set × 4 before your test set'};
  const W=f.w,inc=ex.inc||5;let plan;
  if(ex.kind==='power')plan=[[0,5],[.5,3],[.7,2]];
  else if(sameMuscle)plan=ex.equip==='barbell'?[[0,8],[.6,5]]:[[.6,5]];
  else if(ex.equip==='barbell')plan=T<=5?[[0,10],[.5,5],[.7,3],[.85,1]]:T<=8?[[0,10],[.5,6],[.75,3]]:[[0,10],[.6,6]];
  else plan=T<=8?[[.5,8],[.75,3]]:[[.5,10]];
  const min=ex.equip==='barbell'?45:5;const out=[];
  plan.forEach(([p,r])=>{let w=p===0?45:Math.max(min,floorTo(W*p,inc));if(w>=W)return;if(out.length&&w<=out[out.length-1].w)return;out.push({w,r,pct:p===0?null:Math.round(p*100)});});
  return {sets:out,text:'',W};
}

/* ---------- plain-language progressive-overload advice ---------- */
function coachAdvice(slot){
  const ex=getEx(slot.exId);if(!ex)return null;
  const P=planSets(slot);const f=P[0]||{};const sc=(exMem(slot.exId).schemes||{})[schemeKey(slot)];
  const wT=w=>fmtW(ex,w,{short:true})+(ex.perHand?' each':'');const unit=ex.perHand?' lb per hand':' lb';
  const lastReps=sc&&sc.lastReps?sc.lastReps.join(', '):'';
  if(slot.time){
    if(sc&&sc.result==='up')return {kind:'up',head:`Add 5 seconds → ${sc.nextTime} sec holds`,detail:'You held the full time on your best set. Small jumps keep your form perfect.'};
    if(sc)return {kind:'same',head:`Same hold → ${slot.time} sec`,detail:'Hit the full time with a flat back before adding more.'};
    return {kind:'start',head:`${slot.sets} × ${slot.time} sec holds`,detail:'Squeeze glutes and abs; end the set when your hips sag.'};
  }
  if(slot.max){
    if(sc&&sc.bestReps)return {kind:'reps',head:`Beat ${sc.bestReps} reps on your first set`,detail:'Max-rep sets: stop 1 rep before your form breaks. Once you get 15+ on every set, add 5 lb.'};
    return {kind:'start',head:'Max reps — stop 1 short of failure',detail:'Your first session sets the number to beat.'};
  }
  if(f.mode==='bw-noweight')return {kind:'test',head:'Add your body weight in Profile',detail:'It’s needed to calculate added or assisted weight. For now: bodyweight reps.'};
  if(f.mode==='calibrate'||f.mode==='pending')return {kind:'test',head:'Enter your max — or do one test set',detail:'Add a max in the Max Calculator and every set is calculated for you. No max? Your first set is a test set and the rest are worked out from it.'};
  if(f.layoff)return {kind:'down',head:`Welcome back — start 10% lighter → ${wT(f.w)} × ${f.reps}`,detail:'It’s been more than 2 weeks since you did this lift. Ease back in; you’ll be back to full strength in 1–2 sessions.'};
  if(!sc||sc.result==null)return {kind:'start',head:`Start at ${wT(f.w)} × ${f.reps}`,detail:'Calculated from your max. During the workout, each set adjusts to how the last one felt.'};
  const last=sc.lastW;const delta=f.w-last;
  if(sc.result==='up'){const add=delta>0?delta:(ex.progInc||ex.inc||5);
    return {kind:'up',head:`Add ${add}${unit} → ${wT(f.w)} × ${f.reps}`,detail:slot.lo!==slot.hi?`You hit ${slot.hi} reps on every set (${lastReps}). Go up and start back at ${slot.lo} reps.`:ex.kind==='power'?`Every rep was fast at ${wT(last)}. Small jump — speed and technique come first.`:`You got every rep at ${wT(last)} (${lastReps}). Time to go up.`};}
  if(sc.result==='repeat'){
    if(slot.lo!==slot.hi&&f.reps>slot.lo)return {kind:'reps',head:`Same weight, add a rep → ${wT(f.w)} × ${f.reps}`,detail:`Last time: ${lastReps}. Get ${f.reps} on every set. Once you hit ${slot.hi} on all sets, the weight goes up.`};
    if(sc.needReps)return {kind:'reps',head:`Same weight → ${wT(f.w)} · earn the jump`,detail:`Adding ${ex.progInc||ex.inc||5}${unit} is a big jump on a light weight. ${ex.kind==='isolation'?`Get ${sc.needReps} reps on your last set (taken to failure)`:`Get ${sc.needReps} reps on every set`}, then the weight goes up. Last time: ${lastReps}.`};
    return {kind:'same',head:`Same weight → ${wT(f.w)} × ${f.reps}`,detail:ex.kind==='power'?'Some reps slowed down. Repeat this weight until every rep is fast.':sc.partial?'Not every set was logged last time, so the weight stays the same.':`Last time: ${lastReps}. Own this weight — every rep, every set — then it goes up.`};
  }
  if(sc.result==='hold'){
    if(f.w<last)return {kind:'down',head:`Drop to ${wT(f.w)} × ${f.reps} for now`,detail:`You came up 2+ reps short at ${wT(last)} (${lastReps}). A little lighter so you hit every rep — it climbs right back once you do. Miss again and the app resets 10%.`};
    return {kind:'same',head:`Keep ${wT(f.w)} — build the reps back`,detail:`You came up 2+ reps short last time (${lastReps}). Same weight next session. If it happens twice in a row, the app drops the weight 10% so you can build back past it.`};}
  if(sc.result==='deload')return {kind:'down',head:`Drop 10% → ${wT(f.w)} × ${f.reps}`,detail:'Two tough sessions in a row on this lift. A 10% reset clears the fatigue — you’ll usually pass your old weight in 2–3 sessions. Check sleep and food too.'};
  return null;
}

/* ---------- strength projections (ranges, never promises) ---------- */
function projectable(ex){return !!ex&&(ex.kind==='compound'||ex.kind==='power'||ex.kind==='bw')&&!['pushup','backext'].includes(ex.id);}
function trainingFreq(id){
  const per=p=>{const days=p.id==='legends'?p.schedule2wk.flat():p.schedule;let n=0;
    days.forEach(d=>{const dd=getDay(p.id,d);if(dd&&!dd.rest&&daySlots(p.id,d).some(s=>s.exId===id||(s.variants||[]).includes(id)))n++;});return p.id==='legends'?n/2:n;};
  return per(activeProgram())||Math.max(...PROGRAMS.map(per))||1;
}
function trainingConsistency(){
  if(!S.sessions.length)return {c:.85,assumed:true};
  const first=S.sessions.reduce((a,s)=>s.date<a?s.date:a,S.sessions[0].date);
  const span=daysBetween(parseYmd(first),NOW())+1;if(span<14)return {c:.85,assumed:true};
  const win=Math.min(28,span);const dates=new Set(S.sessions.map(s=>s.date));let planned=0,done=0;
  for(let i=0;i<win;i++){const d=addDays(NOW(),-i);const k=ymd(d);if(i===0&&!dates.has(k))continue;if(isTrainingDay(d))planned++;if(dates.has(k))done++;}
  return {c:Math.max(0,Math.min(1,planned?done/planned:1)),assumed:false,done,planned,win};
}
const PROJ_STD={bench:[1.0,1.5],squat:[1.25,1.75],rdl:[1.25,1.75],clean:[.75,1.1]}; /* 1RM ÷ body weight: intermediate, advanced */
function projectStrength(id){
  const ex=getEx(id);if(!projectable(ex))return null;
  const mi=maxInfo(id);const E=mi.cur;if(!(E>0))return null;
  const p=S.profile;const exp=p.exp||'intermediate';const age=Number(p.age)||0;const sex=p.sex||'';
  const firstS=S.sessions.length?S.sessions.reduce((a,s)=>s.date<a?s.date:a,S.sessions[0].date):null;
  const loggedMo=firstS?Math.max(0,daysBetween(parseYmd(firstS),NOW())/30.4):0;
  const T0={beginner:3,intermediate:12,advanced:30}[exp]+loggedMo;
  const lower=ex.primary.some(m=>['quads','hams','glutes'].includes(m));
  const R=ex.kind==='power'?{beg:3.0,adv:.5}:lower?{beg:4.5,adv:.8}:{beg:3.5,adv:.6};
  /* growth: teenagers get stronger from maturing as well as training */
  const matM=age<=13?.4:age<=17?.6:age<=19?.3:0,matF=age<=15?.3:age<=17?.15:0;
  const mat=!age?0:sex==='male'?matM:sex==='female'?matF:(matM+matF)/2;
  const ageF=age>=40?.85:1;
  /* relative strength: the stronger you already are, the slower it comes */
  const bw=bodyweight();const std=PROJ_STD[id];let relF=1,rel=null;
  if(std&&bw){const k=sex==='female'?.65:1;rel=E/bw;const I=std[0]*k,A=std[1]*k;relF=rel<I*.75?1.15:rel<=I?1+.15*(I-rel)/(I*.25):rel>=A?.7:1-.3*(rel-I)/(A-I);}
  const fq=trainingFreq(id);const fF=fq>=3?1.05:fq>=2?1:fq>=1.5?.92:.8;
  const C=trainingConsistency();const cF=.35+.65*C.c;
  const rate=i=>(R.adv+(R.beg-R.adv)*Math.exp(-(T0+i)/10)+mat)*relF*fF*cF*ageF/100;
  /* his own trend, once there is enough of it */
  const pts={};mi.entries.forEach(x=>{pts[x.date]=Math.max(pts[x.date]||0,x.e);});
  (exMem(id).history||[]).forEach(h=>{if(h.e>0)pts[h.date]=Math.max(pts[h.date]||0,h.e);});
  const dates=Object.keys(pts).sort();const hist=dates.map(d=>({date:d,e:pts[d]}));
  let scaleH=1,obs=null,span=0;
  if(hist.length>=3){const t0=parseYmd(dates[0]);const xs=dates.map(d=>daysBetween(t0,parseYmd(d)));span=xs[xs.length-1];
    if(span>=21){const n=xs.length,mx=xs.reduce((a,b)=>a+b)/n,my=hist.reduce((a,b)=>a+b.e,0)/n;let sxy=0,sxx=0;xs.forEach((x,i)=>{sxy+=(x-mx)*(hist[i].e-my);sxx+=(x-mx)**2;});
      const slope=sxx?sxy/sxx:0;obs=slope*30.4/E;const r0=rate(0);const wH=Math.min(.6,span/120*.6);scaleH=(1-wH)+wH*(Math.max(0,Math.min(2*r0,obs))/r0);}}
  const lo=[E],mid=[E],hi=[E];
  for(let i=0;i<12;i++){const r=rate(i)*scaleH;lo.push(lo[i]*(1+r*.45));mid.push(mid[i]*(1+r));hi.push(hi[i]*(1+r*1.45));}
  for(let i=1;i<=12;i++){hi[i]=Math.min(hi[i],E*1.6);mid[i]=Math.min(mid[i],E*1.45,hi[i]);lo[i]=Math.min(lo[i],mid[i]);}
  const fl=v=>Math.floor(v/5)*5;const at={};[3,6,12].forEach(m=>{at[m]={lo:Math.max(E,fl(lo[m])),mid:Math.max(E,fl(mid[m])),hi:Math.max(E,fl(hi[m]))};});
  const expLabel={beginner:'newer lifter',intermediate:'intermediate lifter',advanced:'experienced lifter'}[exp];
  const factors=[`Experience: ${expLabel} — about ${Math.round(T0)} months of training`];
  if(mat>0)factors.push(`Age ${age}: still developing, so growth adds strength on top of training`);
  else if(!age)factors.push('Add your age in Profile for a sharper estimate');
  factors.push(`Trains this lift ${fq%1?fq.toFixed(1):fq}× a week`);
  factors.push(C.assumed?'Consistency: assumes about 85% of planned workouts until 2 weeks are logged':`Consistency: ${Math.round(C.c*100)}% of planned workouts in the last ${C.win} days`);
  if(rel!=null)factors.push(`Current strength: ${rel.toFixed(2)}× body weight${relF<1?' — gains come slower as you get stronger':''}`);
  if(obs!=null&&span>=21)factors.push(`Your trend so far: ${obs>=0?'+':''}${Math.round(obs*E)} lb per month over ${hist.length} data points`);
  return {E,lo,mid,hi,at,factors,hist,bwNote:ex.kind==='bw'};
}
