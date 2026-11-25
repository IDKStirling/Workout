const fs=require('fs');const vm=require('vm');
const ctx={console,Math,JSON,Date,localStorage:{_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=v},removeItem(k){delete this._[k]}}};
ctx.window=ctx;vm.createContext(ctx);
['30_exercises.js','31_programs.js','40_engine.js','41_coach.js'].forEach(f=>vm.runInContext(fs.readFileSync('src/'+f,'utf8'),ctx,{filename:f}));
const R=c=>vm.runInContext(c,ctx);
let fails=0;const ok=(cond,msg)=>{console.log((cond?'  PASS ':'  FAIL ')+msg);if(!cond)fails++;};
R(`NOW=()=>new Date(2026,10,8)`); // Sun Nov 8 2026
R(`S=defaultState();S.profile.weightLb=200;S.profile.heightFt=5;S.profile.heightIn=11;S.profile.age=15;S.profile.sex='male';S.profile.activity='moderate'`);

console.log('Schedule');
const wk=R(`weekPlan('ppl').map(x=>x.dow+':'+x.day.name).join(', ')`);console.log('  '+wk);
ok(wk==='Sun:Push, Mon:Pull, Tue:Legs, Wed:Rest, Thu:Upper Body Combination (Push + Pull), Fri:Legs, Sat:Rest','PPL week order Sun→Sat, Sunday = Day 1');
R(`S.legendsStart='2026-11-09'`);
const l1=R(`weekPlan('legends',new Date(2026,10,9)).map(x=>x.day.name).join(' | ')`);
const l2=R(`weekPlan('legends',new Date(2026,10,16)).map(x=>x.day.name).join(' | ')`);
console.log('  L wk1: '+l1);console.log('  L wk2: '+l2);
ok(l1==='Rest | Platz Legs | Rest | Arnold Chest | Rest | 5×5 Strength | Herschel Walker Bodyweight','Legend week 1 matches calendar (Sun→Sat, Platz still Monday)');
ok(l2==='Rest | 20-Rep Squats | Rest | German Volume 10×10 | Rest | Coleman Heavy | Herschel Walker Bodyweight','Legend week 2 matches calendar');
ok(R(`[9,11,13,14].map(d=>dayForDate('legends',new Date(2026,10,d)).name).join('|')`)==='Platz Legs|Arnold Chest|5×5 Strength|Herschel Walker Bodyweight','Legend days keep their original weekdays (Mon/Wed/Fri/Sat)');
ok(R(`weekPlan('legends',new Date(2026,10,23))[1].day.name`)==='Platz Legs','Platz returns every 2 weeks');

ok(R(`dayForDate('ppl',new Date(2026,10,8)).id`)==='d1','Today (Sunday) is PPL Day 1');
console.log('Slots');
const sl=R(`daySlots('ppl','d2').map(s=>s.exId+' sets='+s.sets+' '+(s.lo)+'-'+(s.hi)+(s.ss?' ss'+s.ss:'')+(s.suggested?' (suggested)':'')).join(' | ')`);console.log('  '+sl);
ok(/kelso sets=2 8-12 ssA \(suggested\)/.test(sl)&&/row sets=2 6-6 ssA/.test(sl),'Machine Row + Kelso superset, Kelso reps flagged as suggested');
ok(R(`daySlots('ppl','d1')[2].perSide && daySlots('ppl','d1')[2].lo===6 && daySlots('ppl','d1')[2].hi===8`),'Single-arm tri ext 6–8 each arm parsed as per-side range');
ok(R(`daySlots('legends','d4').find(s=>s.exId==='plank').time===60`),'Legend plank 3 × 60 sec parsed as time');
ok(R(`daySlots('legends','d4').find(s=>s.exId==='chinup').max===true`),'Legend 5 × max parsed as max reps');

console.log('No numbers → calibrate, never invent');
const cal=R(`JSON.stringify(planSets(daySlots('ppl','d1')[0]))`);console.log('  '+cal);
ok(/calibrate/.test(cal)&&!/"w":\d/.test(cal),'Bench with no data asks for a test set instead of a number');

console.log('With numbers (bench 185×5)');
R(`S.strength.bench={w:185,r:5,date:'2026-11-01'}`);
const b=R(`JSON.stringify(planSets(daySlots('ppl','d1')[0]).map(x=>x.w+'x'+x.reps+'@RIR'+x.rir))`);console.log('  e1RM='+R(`Math.floor(knownE1RM('bench'))`)+'  sets '+b);
ok(R(`planSets(daySlots('ppl','d1')[0]).every(x=>x.w%5===0 && x.w<=Math.floor(knownE1RM('bench')))`),'Weights on 5-lb steps, below the max');
ok(R(`(()=>{const p=planSets(daySlots('ppl','d1')[0]);return p[0].w>=p[1].w&&p[1].w>=p[2].w&&p[0].rir===2&&p[2].rir===1})()`),'Compounds: 2→1 RIR, later sets account for fatigue');
R(`S.strength.lateral={w:25,r:10}`);
const lat=R(`JSON.stringify(planSets(daySlots('ppl','d5')[4]).map(x=>x.w+'@RIR'+x.rir))`);console.log('  laterals 3×8: '+lat);
ok(R(`planSets(daySlots('ppl','d5')[4]).slice(-1)[0].rir===0`),'Isolation: last set to technical failure');
R(`S.strength.clean={w:135,r:3}`);
const cl=R(`JSON.stringify(planSets(daySlots('ppl','d3')[4]).map(x=>x.w+'@RIR'+x.rir))`);console.log('  cleans 3×6: '+cl);
ok(R(`planSets(daySlots('ppl','d3')[4]).every(x=>x.rir===4)`),'Power cleans never near failure (RIR 4 every set)');

console.log('Live adjustment within a session');
R(`var slot=daySlots('ppl','d1')[0]; var plan=planSets(slot); var log=plan.map(p=>({w:p.w,r:null,done:false}));`);
R(`log[0]={w:plan[0].w,r:7,done:true,effort:'easy'}`);
const up=R(`adjustNext(slot,log,0)`);console.log('  rec '+R('plan[1].w')+' → after 7 easy reps: '+up);
ok(up>R('plan[1].w')&&up<=R('plan[0].w*1.1'),'Beat the target easily → next set goes up (capped at +10%)');
R(`log[0]={w:plan[0].w,r:2,done:true,effort:'max'}`);
const dn=R(`adjustNext(slot,log,0)`);console.log('  after only 2 grinder reps: '+dn);
ok(dn<R('plan[1].w'),'Missed reps → next set comes down');
R(`var cs=daySlots('ppl','d3')[4]; var cp=planSets(cs); var clog=cp.map(p=>({w:p.w,done:false}));clog[0]={w:cp[0].w,r:6,done:true,effort:'fast'}`);
ok(R(`adjustNext(cs,clog,0)<=cp[0].w`),'Cleans: even fast reps never raise weight mid-session');
R(`clog[0]={w:cp[0].w,r:6,done:true,effort:'broke'}`);
ok(R(`adjustNext(cs,clog,0)<cp[0].w`),'Cleans: technique broke → drop weight');

console.log('Progressive overload across sessions');
R(`var p0=planSets(slot); var w0=p0[0].w; evaluateSlot(slot,p0.map(p=>({w:p.w,r:4,done:true,effort:'solid'})));`);
const nxt=R(`planSets(slot)[0]`);console.log('  hit 3×4 at '+R('w0')+' → next: '+nxt.w+' ('+nxt.why+')');
ok(nxt.w===R('w0')+5,'Hit all reps with reserve → +5 lb next time');
R(`var w1=planSets(slot)[0].w; evaluateSlot(slot,[{w:w1,r:4,done:true},{w:w1,r:4,done:true},{w:w1,r:3,done:true,effort:'max'}])`);
ok(R(`planSets(slot)[0].w===w1`),'Missed one rep on one set → repeat weight');
R(`evaluateSlot(slot,[{w:w1,r:3,done:true},{w:w1,r:2,done:true},{w:w1,r:2,done:true}])`);
const h=R(`planSets(slot)[0]`);ok(h.w<=R('w1'),'Missed badly → hold');
R(`evaluateSlot(slot,[{w:w1,r:3,done:true},{w:w1,r:2,done:true},{w:w1,r:2,done:true}])`);
const d=R(`planSets(slot)[0]`);console.log('  after 2 stalled sessions: '+d.w+' ('+d.why+')');
ok(d.w<=Math.floor(R('w1')*0.9/5)*5+0.01,'Two stalls in a row → deload ~10%');

console.log('Double progression (6–8 each arm)');
R(`S.strength.satriext={w:30,r:8}; var ts=daySlots('ppl','d1')[2]; var tp=planSets(ts);`);
console.log('  start target reps '+R('tp[0].reps')+' @ '+R('tp[0].w'));
R(`evaluateSlot(ts,[{w:tp[0].w,r:7,done:true},{w:tp[1].w,r:6,done:true}])`);
ok(R(`planSets(ts)[0].reps===7 && planSets(ts)[0].w===tp[0].w`),'Below top of range → same weight, aim +1 rep');
R(`evaluateSlot(ts,[{w:tp[0].w,r:8,done:true},{w:tp[0].w,r:8,done:true}])`);
ok(R(`planSets(ts)[0].reps===6 && planSets(ts)[0].w>tp[0].w`),'Top of range on all sets → add weight, reset to 6 reps');

console.log('Bodyweight moves');
R(`S.strength.pullup={w:0,r:3}`);
const pu=R(`fmtW(EX.pullup,planSets(daySlots('ppl','d2')[0].exId==='pulldown'?normSlot(Object.assign({},PPL_PROGRAM.days[1].ex[0],{defaultVariant:'pullup'}),'ppl','d2',0):daySlots('ppl','d2')[0])[0].w)`);
console.log('  3 bodyweight pull-ups max → 3×6 recommendation: '+pu);
ok(/Assist/.test(pu),'Weak pull-ups → assisted recommendation');

console.log('Nutrition');
const t=R(`JSON.stringify({m:eer(),cut:nutritionTargets('cut'),bulk:nutritionTargets('bulk')})`);console.log('  '+t);
ok(R(`nutritionTargets('cut').delta>=-350 && nutritionTargets('bulk').delta<=400`),'Teen: small deficit / controlled surplus');
ok(R(`(()=>{const x=nutritionTargets('bulk');return Math.abs(x.protein*4+x.carbs*4+x.fat*9-x.cal)<12})()`),'Macros add up to calories');

console.log('XP / ranks');
ok(R(`levelFromXP(0).rank==='Rookie' && levelFromXP(5000).level>10`),'Levels and ranks scale');
console.log(fails?`\n${fails} FAILED`:'\nALL ENGINE TESTS PASSED');process.exit(fails?1:0);
