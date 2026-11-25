/* =========================================================
   ENGINE — storage, state, schedules, weight recommendations,
   progressive overload, PRs, XP/ranks/badges, streaks, nutrition math
   ========================================================= */
const STORE_KEY='trench2-state';
const Store={
  mem:{},
  get(k){try{const v=localStorage.getItem(k);if(v!=null)return v;}catch(e){}return this.mem[k]??null;},
  set(k,v){this.mem[k]=v;try{localStorage.setItem(k,v);}catch(e){}try{if(window.storage&&window.storage.set)window.storage.set(k,v);}catch(e){}},
  del(k){delete this.mem[k];try{localStorage.removeItem(k);}catch(e){}}
};
const jparse=s=>{try{return JSON.parse(s);}catch(e){return null;}};

/* ---------- dates ---------- */
function ymd(d){d=d||new Date();const m=d.getMonth()+1,dd=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(dd<10?'0':'')+dd;}
function parseYmd(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);}
function addDays(d,n){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);return x;}
function dowIdx(d){return d.getDay();} /* Sun=0 .. Sat=6 — the week starts Sunday */
function weekStart(d){return addDays(d,-dowIdx(d));}
function daysBetween(a,b){return Math.round((parseYmd(ymd(b))-parseYmd(ymd(a)))/864e5);}
let NOW=()=>new Date(); /* overridable in tests */

/* ---------- state ---------- */
function defaultState(){
  return {v:2,
    profile:{name:'',goal:'muscle',exp:'intermediate',heightFt:null,heightIn:null,weightLb:null,age:null,sex:'',activity:'moderate',
      daysPerWeek:5,sessionLen:75,style:'athletic',lastMuscle:'',notif:{rest:true,reminders:true},theme:'dark',nutrition:'maintain',
      restSound:true,equipment:null},
    maxLog:{},            /* {exId:[{date,e,src:'entered'|'workout',w,r}]} — every max ever recorded */
    strength:{},          /* user-entered numbers: {exId:{w,r,date}} */
    exState:{},           /* engine memory per exercise */
    activeProgram:'ppl',
    legendsStart:null,    /* week start (ymd) of Legend's week 1 */
    overrides:{},         /* {progId:{dayId:{slotIdx:{sets,lo,hi,rest,exId}}}} */
    variantPick:{},       /* {progId:dayId:idx : exId} */
    customExercises:[],templates:[],customRecipes:[],
    sessions:[],active:null,bodyLog:[],
    xp:0,badges:{},
  };
}
let S=defaultState();
function loadState(){
  const raw=jparse(Store.get(STORE_KEY));
  if(raw&&raw.v===2){S=Object.assign(defaultState(),raw);S.profile=Object.assign(defaultState().profile,raw.profile||{});}
  else{S=defaultState();migrateOld();}
  return S;
}
function saveState(){Store.set(STORE_KEY,JSON.stringify(S));}
function migrateOld(){
  /* carry over maxes + bodyweight from the previous TRENCH version */
  const prs=jparse(Store.get('trench-prs'));
  if(prs&&typeof prs==='object'){Object.keys(prs).forEach(id=>{const p=prs[id];if(EX[id]&&p&&Number(p.weight)>0)S.strength[id]={w:Number(p.weight),r:Number(p.reps)||1,date:p.date||ymd()};});}
  const bw=jparse(Store.get('trench-bw'));if(bw&&Number(bw)>0)S.profile.weightLb=Number(bw);
}

/* ---------- exercise lookup (built-in + custom) ---------- */
function getEx(id){return EX[id]||S.customExercises.find(c=>c.id===id)||null;}
function allExercises(){return Object.values(EX).concat(S.customExercises);}

/* ---------- program / slot normalization ---------- */
function getProgram(id){return PROGRAMS.find(p=>p.id===id)||PROGRAMS[0];}
function activeProgram(){return getProgram(S.activeProgram);}
function parseRepsText(t){
  t=String(t||'').trim();
  let m=t.match(/^(\d+)\s*[–-]\s*(\d+)/);if(m)return {lo:+m[1],hi:+m[2]};
  m=t.match(/^(\d+)\s*sec/i);if(m)return {time:+m[1]};
  if(/^max/i.test(t))return {max:true};
  m=t.match(/^(\d+)/);if(m)return {lo:+m[1],hi:+m[1]};
  return null;
}
function slotKey(progId,dayId,idx){return progId+':'+dayId+':'+idx;}
function normSlot(raw,progId,dayId,idx){
  let sets,rep;
  if(raw.t){ /* Legend's format "5 × 12–15" */
    const m=raw.t.match(/^(\d+)\s*×\s*(.+)$/);sets=m?+m[1]:3;rep=parseRepsText(m?m[2]:'');
  }else{
    sets=raw.sets||parseInt(raw.setsText,10)||3;rep=parseRepsText(raw.repsText);
    if(!rep&&raw.suggest)rep={lo:raw.suggest[0],hi:raw.suggest[1],suggested:true};
  }
  rep=rep||{lo:8,hi:12};
  const ov=(((S.overrides[progId]||{})[dayId]||{})[idx])||{};
  const vk=slotKey(progId,dayId,idx);
  let exId=ov.exId||S.variantPick[vk]||raw.defaultVariant||raw.id;
  if(raw.variants&&!ov.exId&&!raw.variants.includes(exId))exId=raw.defaultVariant||raw.variants[0];
  const s={raw,progId,dayId,idx,exId,baseId:raw.id,name:raw.n,
    setsText:raw.t?raw.t.split('×')[0].trim():raw.setsText,repsText:raw.t?raw.t.split('×').slice(1).join('×').trim():raw.repsText,
    sets,lo:rep.lo??null,hi:rep.hi??null,time:rep.time||null,max:!!rep.max,suggested:!!rep.suggested,
    perSide:/each arm/i.test(raw.repsText||'')||!!(getEx(exId)||{}).perSide,
    rest:raw.rest||90,ss:raw.ss||null,note:raw.note||'',variants:raw.variants||null,edited:false};
  if(ov.sets){s.sets=ov.sets;s.edited=true;}
  if(ov.lo){s.lo=ov.lo;s.hi=ov.hi||ov.lo;s.time=null;s.max=false;s.edited=true;}
  if(ov.time){s.time=ov.time;s.lo=s.hi=null;s.edited=true;}
  if(ov.rest){s.rest=ov.rest;s.edited=true;}
  if(ov.exId){s.edited=true;s.swapped=true;}
  return s;
}
function daySlots(progId,dayId){
  const p=getProgram(progId);const d=p.days.find(x=>x.id===dayId);if(!d||d.rest)return[];
  return d.ex.map((raw,i)=>normSlot(raw,progId,dayId,i));
}
function getDay(progId,dayId){return getProgram(progId).days.find(d=>d.id===dayId)||null;}

/* ---------- schedule ---------- */
const REST_DAY={id:'rest',name:'Rest',rest:true,type:'rest',ex:[]};
function legendsWeekIdx(date){
  if(!S.legendsStart)S.legendsStart=ymd(weekStart(NOW()));
  const w=Math.floor(daysBetween(weekStart(parseYmd(S.legendsStart)),weekStart(date))/7);
  return ((w%2)+2)%2;
}
function dayForDate(progId,date){
  const p=getProgram(progId);date=date||NOW();const di=dowIdx(date);
  if(p.id==='ppl')return p.days.find(d=>d.id===p.schedule[di]);
  const code=p.schedule2wk[legendsWeekIdx(date)][di];
  if(code==='rest')return REST_DAY;
  return p.days.find(d=>d.id===code);
}
function weekPlan(progId,anchor){
  const mon=weekStart(anchor||NOW());
  return DOW.map((lab,i)=>{const dt=addDays(mon,i);return {date:dt,ymd:ymd(dt),dow:lab,day:dayForDate(progId,dt)};});
}
function sessionOn(dateStr){return S.sessions.filter(s=>s.date===dateStr);}

/* ---------- strength math (never rounds a max UP) ---------- */
const e1rm=(w,r)=>w>0&&r>0?(r<=1?w:w*(1+r/30)):0;   /* Epley; a single is the max itself */
/* power cleans: technique-limited, so working weights come from a %-of-max table, not the rep formula */
const POWER_PCT=[0,.85,.82,.78,.75,.72,.68,.65,.62];
function powerPct(r){return POWER_PCT[Math.min(8,Math.max(1,Math.round(r)||1))];}
/* conservative max estimate from ONE logged set (only counts reps in reserve the lifter reported) */
function setMaxEstimate(ex,s){
  if(!ex||!s||!s.done||!(s.r>0)||ex.kind==='time')return 0;
  const load=loadOf(ex,s.w);if(!(load>0))return 0;
  if(ex.kind==='power'){const adj=s.effort==='broke'?.08:s.effort==='slow'?.05:0;return load/Math.min(.95,powerPct(s.r)+adj);}
  /* 'solid' = the planned reps in reserve for that set (same assumption the weight calculator uses) */
  const planned=s.rec&&s.rec.rir!=null?s.rec.rir:1;
  const rir=s.effort==='max'?0:s.effort==='easy'?Math.max(2,planned+1):s.effort==='solid'?planned:0;
  return e1rm(load,Math.min(15,s.r+rir));
}
const floorTo=(x,inc)=>Math.floor(x/inc+1e-9)*inc;
function plannedRIR(kind,k,n){
  if(kind==='power')return 4;
  if(kind==='isolation')return k===n-1?0:1;
  if(n<=1)return 1.5;
  return 2-(k/(n-1));               /* compounds: 2 RIR on set 1 → 1 RIR on the last set */
}
function fatigueFactor(kind,k){
  if(kind==='power')return 1;
  if(kind==='isolation')return Math.max(.85,1-.05*k);
  return Math.max(.88,1-.03*k);
}
function effortRIR(effort,planned,kind){
  if(kind==='power')return effort==='broke'?1:effort==='slow'?2:4;
  if(effort==='easy')return 3;if(effort==='max')return 0;return planned;
}
function bodyweight(){return Number(S.profile.weightLb)||0;}
function loadOf(ex,w){return ex.kind==='bw'?bodyweight()+(Number(w)||0):Number(w)||0;}
function clampWeight(ex,w){
  if(ex.kind==='bw'){const bw=bodyweight();if(!bw)return 0;let add=floorTo(w-bw,ex.inc||5);return Math.max(add,-Math.max(0,bw-40));}
  let x=floorTo(w,ex.inc||5);
  if(ex.equip==='barbell')x=Math.max(45,x);
  if(ex.equip==='dumbbell')x=Math.min(100,Math.max(5,x));
  if(ex.equip==='machine'||ex.equip==='cable')x=Math.max(5,x);
  return x;
}
function schemeKey(slot){return slot.time?'t'+slot.time:slot.max?'max':(slot.lo+'-'+slot.hi);}
function exMem(id){return S.exState[id]||(S.exState[id]={e1rm:0,schemes:{},stall:0,history:[]});}
/* best available 1RM estimate for an exercise (total load for bodyweight moves) */
function knownE1RM(id){
  const m=S.exState[id];if(m&&m.e1rm>0)return m.e1rm;
  const s=S.strength[id];const ex=getEx(id);
  if(s&&s.r>0&&ex&&(Number(s.w)>0||(ex.kind==='bw'&&bodyweight()>0)))return e1rm(loadOf(ex,Number(s.w)||0),s.r);
  return 0;
}
function targetReps(slot){
  if(slot.time||slot.max)return null;
  if(slot.lo===slot.hi)return slot.lo;
  const sc=(exMem(slot.exId).schemes||{})[schemeKey(slot)];
  return Math.min(slot.hi,Math.max(slot.lo,(sc&&sc.repTarget)||slot.lo));
}
/* planned recommendation for every set of a slot (before the session starts) */
function planSets(slot){
  const ex=getEx(slot.exId);const n=slot.sets;const out=[];
  if(!ex)return out;
  if(slot.time){const sc=exMem(slot.exId).schemes[schemeKey(slot)];const t=(sc&&sc.nextTime)||slot.time;for(let k=0;k<n;k++)out.push({k,reps:null,time:t,w:null,mode:'time'});return out;}
  if(slot.max){for(let k=0;k<n;k++)out.push({k,reps:null,max:true,w:ex.kind==='bw'?0:null,mode:'max'});return out;}
  const T=targetReps(slot);const E=knownE1RM(slot.exId);
  if(ex.kind==='bw'&&!bodyweight()){for(let k=0;k<n;k++)out.push({k,reps:T,w:0,mode:'bw-noweight',rir:plannedRIR(ex.kind,k,n)});return out;}
  if(!E){for(let k=0;k<n;k++)out.push({k,reps:T,w:null,mode:k===0?'calibrate':'pending',rir:plannedRIR(ex.kind,k,n)});return out;}
  const base=[];for(let k=0;k<n;k++){const rir=plannedRIR(ex.kind,k,n);base.push(ex.kind==='power'?E*powerPct(T):E/(1+(T+rir)/30)*fatigueFactor(ex.kind,k));}
  /* progression guard (progressive overload memory) */
  const sc=exMem(slot.exId).schemes[schemeKey(slot)];
  let w0=base[0],why='From your numbers';
  if(sc&&sc.lastW!=null){
    const last=loadOf(ex,sc.lastW);const inc=ex.progInc||ex.inc||5;
    if(sc.result==='up'){w0=Math.min(Math.max(base[0],last+inc),last*1.15+inc);why='Progress: +'+inc+' lb';}
    else if(sc.result==='repeat'){w0=last;why='Repeat — own this weight';}
    else if(sc.result==='hold'){w0=Math.min(base[0],last);why='Hold — build reps back up';}
    else if(sc.result==='deload'){w0=last*.9;why='Reset −10% to break the plateau';}
  }
  /* coming back after 2+ weeks off this lift: start 10% lighter (never chase the old number) */
  const lastH=(exMem(slot.exId).history||[]).slice(-1)[0];let layoff=false;
  if(lastH&&daysBetween(parseYmd(lastH.date),NOW())>14){layoff=true;const ref=sc&&sc.lastW!=null?Math.min(w0,loadOf(ex,sc.lastW)):w0;w0=ref*.9;why='Back after a break — 10% lighter';}
  const ratio=w0/base[0];
  for(let k=0;k<n;k++){out.push({k,reps:T,w:clampWeight(ex,base[k]*ratio),rir:plannedRIR(ex.kind,k,n),mode:'rec',why:k===0?why:'',layoff});}
  /* never let a later set recommend more than set 1 */
  for(let k=1;k<n;k++)if(out[k].w>out[0].w)out[k].w=out[0].w;
  return out;
}
/* live adjustment after a completed set: returns recommended weight for set k+1 */
function adjustNext(slot,setsLog,k){
  const ex=getEx(slot.exId);const done=setsLog[k];if(!ex||!done||!done.done)return null;
  if(slot.time||slot.max)return null;
  const n=slot.sets;if(k+1>=n)return null;
  const T=targetReps(slot);
  const rirNow=effortRIR(done.effort||'solid',plannedRIR(ex.kind,k,n),ex.kind);
  const loadNow=loadOf(ex,done.w);if(!(loadNow>0)||!(done.r>0))return null;
  const eSet=e1rm(loadNow,done.r+rirNow);
  let next=eSet/(1+(T+plannedRIR(ex.kind,k+1,n))/30)*(fatigueFactor(ex.kind,k+1)/fatigueFactor(ex.kind,k));
  next=Math.min(next,loadNow*1.10);next=Math.max(next,loadNow*.80);
  if(ex.kind==='power'){
    if(done.effort==='broke')next=loadNow*.9;
    else if(done.effort==='slow')next=Math.min(next,loadNow*.95);
    else next=Math.min(next,loadNow); /* cleans never climb within a session */
  }
  if(ex.kind==='bw'&&!bodyweight())return 0;
  return clampWeight(ex,next);
}
/* evaluate one exercise after a session → progressive overload decision */
function evaluateSlot(slot,setsLog){
  const ex=getEx(slot.exId);const done=setsLog.filter(s=>s.done&&s.r>0);
  if(!ex||!done.length)return null;
  const mem=exMem(slot.exId);const key=schemeKey(slot);const sc=mem.schemes[key]||(mem.schemes[key]={});
  if(slot.time){const best=Math.max(...done.map(s=>s.r));sc.nextTime=best>=slot.time?best+5:slot.time;sc.result=best>=slot.time?'up':'repeat';return sc.result;}
  /* session e1RM from the best set, using effort-adjusted reps in reserve */
  let best=0;done.forEach((s,i)=>{const rir=effortRIR(s.effort||'solid',plannedRIR(ex.kind,i,slot.sets),ex.kind);const v=ex.kind==='power'?setMaxEstimate(ex,Object.assign({},s,{effort:s.effort||'fast'})):e1rm(loadOf(ex,s.w),s.r+rir);if(v>best)best=v;});
  sc.lastReps=done.map(s=>s.r);sc.partial=done.length<slot.sets;
  if(slot.max){if(best>0)mem.e1rm=best;sc.result=done.length>=slot.sets?'up':'repeat';sc.lastW=done[0].w;sc.bestReps=Math.max(...done.map(s=>s.r));return sc.result;}
  const T=targetReps(slot);const reps=done.map(s=>s.r);const short=reps.map(r=>Math.max(0,(slot.lo===slot.hi?T:slot.lo)-r));
  const allSets=done.length>=slot.sets;let result;
  if(slot.lo!==slot.hi){ /* double progression */
    if(allSets&&reps.every(r=>r>=slot.hi)){result='up';sc.repTarget=slot.lo;}
    else if(short.some(x=>x>=2)){result='hold';sc.repTarget=slot.lo;}
    else{result='repeat';sc.repTarget=Math.min(slot.hi,Math.min(...reps)+1);}
  }else if(ex.kind==='power'){
    if(done.some(s=>s.effort==='broke'))result='hold';
    else if(allSets&&done.every(s=>s.effort!=='slow')&&short.every(x=>x===0))result='up';
    else result='repeat';
  }else{
    const missed=short.filter(x=>x>0);
    const grinded=ex.kind!=='isolation'&&done[done.length-1].effort==='max';
    if(!allSets&&missed.length===0)result='repeat'; /* skipped sets: keep the weight, no stall */
    else if(allSets&&missed.length===0&&!grinded)result='up';
    else if(allSets&&missed.length===0&&grinded)result='repeat';
    else if(missed.length===1&&missed[0]===1)result='repeat';
    else result='hold';
    if(allSets&&reps[0]>=T+3&&result!=='hold')result='up';
  }
  /* light weights: a fixed jump can be 15–25% (5 lb on a 25-lb dumbbell) — earn it with extra reps first */
  sc.needReps=null;
  if(result==='up'&&slot.lo===slot.hi&&ex.kind!=='power'&&ex.kind!=='bw'){
    const incPct=(ex.progInc||ex.inc||5)/Math.max(1,loadOf(ex,done[0].w));
    if(incPct>.08){const need=ex.kind==='isolation'?T+2:T+1;const ok=ex.kind==='isolation'?reps[reps.length-1]>=need:reps.every(r=>r>=need);if(!ok){result='repeat';sc.needReps=need;}}
  }
  if(result==='hold'){mem.stall=(mem.stall||0)+1;if(mem.stall>=2){result='deload';mem.stall=0;}}
  else if(result==='up')mem.stall=0;
  sc.result=result;sc.lastW=done[0].w;sc.date=ymd(NOW());
  /* working e1RM moves toward what you actually did (capped so one great day can't spike it) */
  const prev=mem.e1rm||knownE1RM(slot.exId)||best;
  mem.e1rm=best>prev?Math.min(best,prev*1.15):(result==='deload'?best:Math.max(best,prev*.95));
  return result;
}

/* ---------- formatting ---------- */
function fmtW(ex,w,opts){
  opts=opts||{};if(!ex)return '';
  if(ex.kind==='time')return '';
  if(w==null)return '—';
  if(ex.kind==='bw'){if(!bodyweight()&&!w)return 'Bodyweight';const a=Number(w)||0;if(Math.abs(a)<5)return 'Bodyweight';return a>0?'+'+a+' lb':'Assist '+(-a)+' lb';}
  return w+' lb'+(ex.perHand&&!opts.short?' each':'');
}
function statusChip(result){return {up:['↑','Add weight'],repeat:['=','Repeat'],hold:['•','Hold'],deload:['↓','Reset −10%']}[result]||null;}

/* ---------- sessions, volume, PRs ---------- */
function setVolume(ex,s){if(!ex||!s.done||ex.kind==='time')return 0;const mult=(ex.perHand||ex.perSide)?2:1;return loadOf(ex,s.w)*(s.r||0)*mult;}
function exBests(id,excludeSessionId){
  let bestE=0,bestW=0;const ex=getEx(id);
  S.sessions.forEach(ss=>{if(ss.id===excludeSessionId)return;ss.items.forEach(it=>{if(it.exId!==id)return;it.sets.forEach(s=>{if(!s.done||!(s.r>0))return;const l=loadOf(ex,s.w);bestE=Math.max(bestE,setMaxEstimate(ex,s));bestW=Math.max(bestW,l);});});});
  return {e:Math.floor(bestE),w:bestW};
}
function finalizeSession(sess){
  let vol=0,sets=0,prs=[];const results={};
  sess.items.forEach(it=>{
    const ex=getEx(it.exId);it.sets.forEach(s=>{if(s.done){sets++;vol+=setVolume(ex,s);}});
    const before=exBests(it.exId,sess.id);
    let sessE=0,sessW=0;it.sets.forEach(s=>{if(s.done&&s.r>0){const l=loadOf(ex,s.w);sessE=Math.max(sessE,setMaxEstimate(ex,s));sessW=Math.max(sessW,l);}});
    if(ex&&ex.kind!=='time'&&sessE>0&&(before.e>0||before.w>0)){
      if(Math.floor(sessE)>before.e)prs.push({exId:it.exId,type:'e1rm',val:Math.floor(sessE)});
      else if(sessW>before.w)prs.push({exId:it.exId,type:'weight',val:sessW});
    }
    if(it.slot)results[it.exId]=evaluateSlot(it.slot,it.sets);
    const mem=exMem(it.exId);mem.history=(mem.history||[]).concat([{date:sess.date,e:Math.floor(sessE),w:sessW}]).slice(-40);
    if(ex&&ex.kind!=='time'&&sessE>0&&recordWorkoutMax(it.exId,sessE,sess.date))(sess.newMaxes=sess.newMaxes||[]).push({exId:it.exId,e:Math.floor(sessE)});
  });
  sess.volume=Math.round(vol);sess.setCount=sets;sess.prs=prs;sess.results=results;
  return sess;
}

/* ---------- XP, levels, ranks ---------- */
const RANKS=[[1,'Rookie'],[3,'Walk-On'],[6,'Starter'],[9,'Varsity'],[13,'All-Conference'],[17,'All-State'],[22,'All-American'],[28,'Captain'],[35,'Pro'],[45,'Hall of Fame']];
function levelFromXP(xp){let L=1,need=200,acc=0;while(xp>=acc+need){acc+=need;L++;need=200+50*(L-1);}return {level:L,into:xp-acc,need,rank:rankFor(L)};}
function rankFor(L){let r=RANKS[0][1];RANKS.forEach(([lv,n])=>{if(L>=lv)r=n;});return r;}
function nextRank(L){const n=RANKS.find(([lv])=>lv>L);return n?{level:n[0],name:n[1]}:null;}
function sessionXP(sess,streak){
  let xp=100+4*sess.setCount+40*sess.prs.length+5*Math.min(streak||0,20);
  const planned=sess.items.reduce((a,it)=>a+(it.slot?it.slot.sets:it.sets.length),0);
  if(sess.setCount>=planned&&planned>0)xp+=25;
  return xp;
}

/* ---------- streak (rest days never break it) ---------- */
function isTrainingDay(date){const d=dayForDate(S.activeProgram,date);return d&&!d.rest;}
function streakInfo(){
  const done=new Set(S.sessions.map(s=>s.date));let streak=0;const today=NOW();
  for(let i=0;i<400;i++){
    const d=addDays(today,-i);const k=ymd(d);
    if(done.has(k)){streak++;continue;}  /* any completed workout counts */
    if(!isTrainingDay(d))continue;
    if(i===0)continue; /* today isn't over yet */
    break;
  }
  const best=Math.max(S.bestStreak||0,streak);S.bestStreak=best;
  return {streak,best};
}

/* ---------- badges / milestones ---------- */
function totalVolume(){return S.sessions.reduce((a,s)=>a+(s.volume||0),0);}
function prCount(){return S.sessions.reduce((a,s)=>a+((s.prs||[]).length),0);}
const BADGES=[
  {id:'first',name:'First Session',desc:'Finish your first workout',icon:'🏁',prog:()=>[S.sessions.length,1]},
  {id:'s3',name:'On a Roll',desc:'3-day training streak',icon:'🔥',prog:()=>[streakInfo().best,3]},
  {id:'s7',name:'Locked In',desc:'7-day training streak',icon:'⚡',prog:()=>[streakInfo().best,7]},
  {id:'s14',name:'Unbreakable',desc:'14-day training streak',icon:'🛡️',prog:()=>[streakInfo().best,14]},
  {id:'w10',name:'Ten Down',desc:'Complete 10 workouts',icon:'💪',prog:()=>[S.sessions.length,10]},
  {id:'w25',name:'Grinder',desc:'Complete 25 workouts',icon:'🏋️',prog:()=>[S.sessions.length,25]},
  {id:'w50',name:'Iron Regular',desc:'Complete 50 workouts',icon:'🏆',prog:()=>[S.sessions.length,50]},
  {id:'w100',name:'Centurion',desc:'Complete 100 workouts',icon:'👑',prog:()=>[S.sessions.length,100]},
  {id:'pr1',name:'New PR',desc:'Set your first personal best',icon:'📈',prog:()=>[prCount(),1]},
  {id:'pr10',name:'PR Machine',desc:'Set 10 personal bests',icon:'🚀',prog:()=>[prCount(),10]},
  {id:'v100k',name:'100K Club',desc:'Lift 100,000 lb total',icon:'🧱',prog:()=>[totalVolume(),100000]},
  {id:'v1m',name:'Million Pound Club',desc:'Lift 1,000,000 lb total',icon:'💎',prog:()=>[totalVolume(),1000000]},
  {id:'pplweek',name:'Full PPL Week',desc:'Finish all 5 PPL training days in one week',icon:'🗓️',prog:()=>[bestPPLWeek(),5]},
  {id:'legend',name:'Legend Rookie',desc:'Finish a Legend’s Split session',icon:'⭐',prog:()=>[S.sessions.filter(s=>s.progId==='legends').length,1]},
  {id:'platz',name:'Platz Survivor',desc:'Finish Platz Legs',icon:'🦵',prog:()=>[S.sessions.filter(s=>s.progId==='legends'&&s.dayId==='d1').length,1]},
];
function bestPPLWeek(){const wk={};S.sessions.filter(s=>s.progId==='ppl').forEach(s=>{const k=ymd(weekStart(parseYmd(s.date)));wk[k]=wk[k]||new Set();wk[k].add(s.dayId);});return Math.max(0,...Object.values(wk).map(x=>x.size));}
function checkBadges(){const fresh=[];BADGES.forEach(b=>{const [v,t]=b.prog();if(v>=t&&!S.badges[b.id]){S.badges[b.id]=ymd(NOW());fresh.push(b);}});return fresh;}
function nextMilestone(){
  let best=null;BADGES.forEach(b=>{if(S.badges[b.id])return;const [v,t]=b.prog();const p=Math.min(1,v/t);if(!best||p>best.p)best={b,p,v,t};});return best;
}

/* ---------- nutrition math (DRI estimated energy requirement equations) ---------- */
const ACTIVITY=[
  {id:'light',label:'Light',desc:'School or desk day, a couple of workouts a week',pa:{boy:1.00,girl:1.00,man:1.00,woman:1.00}},
  {id:'moderate',label:'Moderate',desc:'4–5 lifting sessions a week',pa:{boy:1.13,girl:1.16,man:1.11,woman:1.12}},
  {id:'high',label:'High',desc:'Lifting plus sports practice most days',pa:{boy:1.26,girl:1.31,man:1.25,woman:1.27}},
  {id:'veryhigh',label:'Very high',desc:'Two-a-days or a full-time athlete',pa:{boy:1.42,girl:1.56,man:1.48,woman:1.45}},
];
function bodyMetrics(p){
  p=p||S.profile;const inches=(Number(p.heightFt)||0)*12+(Number(p.heightIn)||0);
  const ok=inches>0&&Number(p.weightLb)>0&&Number(p.age)>0;
  return {ok,inches,m:inches*.0254,kg:(Number(p.weightLb)||0)*.45359237,lb:Number(p.weightLb)||0,age:Number(p.age)||0};
}
function eer(p){
  p=p||S.profile;const b=bodyMetrics(p);if(!b.ok)return null;
  const act=ACTIVITY.find(a=>a.id===p.activity)||ACTIVITY[1];
  const teen=b.age<19;
  const male=()=>teen?88.5-61.9*b.age+act.pa.boy*(26.7*b.kg+903*b.m)+25:662-9.53*b.age+act.pa.man*(15.91*b.kg+539.6*b.m);
  const female=()=>teen?135.3-30.8*b.age+act.pa.girl*(10.0*b.kg+934*b.m)+25:354-6.91*b.age+act.pa.woman*(9.36*b.kg+726*b.m);
  const v=p.sex==='male'?male():p.sex==='female'?female():(male()+female())/2;
  return Math.round(v/10)*10;
}
function nutritionTargets(mode,p){
  p=p||S.profile;const maint=eer(p);if(!maint)return null;const b=bodyMetrics(p);const teen=b.age<18;
  let cal=maint,delta=0;
  if(mode==='cut'){delta=teen?-Math.min(350,Math.round(maint*.10)):-Math.max(300,Math.min(600,Math.round(maint*.20)));}
  else if(mode==='bulk'){delta=Math.max(250,Math.min(teen?400:400,Math.round(maint*.10)));}
  cal=Math.round((maint+delta)/10)*10;
  const pPerLb=mode==='cut'?0.9:0.8;
  const protein=Math.round(Math.min(b.lb*pPerLb,b.lb>0?b.lb*pPerLb:0));
  const fat=Math.round(Math.max(cal*.25/9,b.lb*.3));
  const carbs=Math.max(0,Math.round((cal-protein*4-fat*9)/4));
  return {maint,cal,delta,protein,fat,carbs,teen,mode};
}
