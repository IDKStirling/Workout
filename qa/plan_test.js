const fs=require('fs');const vm=require('vm');
const ctx={console,Math,JSON,Date,localStorage:{_:{},getItem(k){return null},setItem(){},removeItem(){}}};ctx.window=ctx;vm.createContext(ctx);
['30_exercises.js','31_programs.js','40_engine.js','32_nutrition.js'].forEach(f=>vm.runInContext(fs.readFileSync('src/'+f,'utf8'),ctx,{filename:f}));
const R=c=>vm.runInContext(c,ctx);let bad=0;
const people=[['15yo 5\'11" 200lb moderate','{weightLb:200,heightFt:5,heightIn:11,age:15,sex:"male",activity:"moderate"}'],
 ['15yo 5\'11" 200lb high (in season)','{weightLb:200,heightFt:5,heightIn:11,age:15,sex:"male",activity:"high"}'],
 ['14yo 5\'6" 135lb light','{weightLb:135,heightFt:5,heightIn:6,age:14,sex:"male",activity:"light"}'],
 ['adult 35yo 5\'10" 185lb moderate','{weightLb:185,heightFt:5,heightIn:10,age:35,sex:"male",activity:"moderate"}'],
 ['adult 28yo F 5\'5" 140lb moderate','{weightLb:140,heightFt:5,heightIn:5,age:28,sex:"female",activity:"moderate"}']];
people.forEach(([lab,p])=>{R(`S=defaultState();Object.assign(S.profile,${p})`);console.log(lab+'  maintenance '+R('eer()'));
 ['cut','bulk'].forEach(m=>{const o=JSON.parse(R(`(()=>{const t=nutritionTargets('${m}');return JSON.stringify({t,b:buildMealPlan('${m}',t)})})()`));
  const off=o.b.sum.kcal-o.t.cal;if(Math.abs(off)>150)bad++;
  console.log(`   ${m.padEnd(4)} target ${o.t.cal} (≥${o.t.protein}P) → ${o.b.sum.kcal} kcal ${o.b.sum.p}P ${o.b.sum.c}C ${o.b.sum.f}F  [${Math.abs(off)>150?'OFF':'ok'} ${off>0?'+':''}${off}]  meals: ${o.b.plan.map(x=>x.recipe+'×'+x.servings).join(' ')}  adds: ${o.b.adds.map(a=>a.a.id+'×'+a.n).join(' ')||'—'}`);});});
console.log(bad?bad+' plan(s) off target':'ALL PLANS WITHIN 150 kcal');
