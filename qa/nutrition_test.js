const fs=require('fs');const vm=require('vm');
const ctx={console,Math,JSON,Date,localStorage:{_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=v},removeItem(k){}}};ctx.window=ctx;vm.createContext(ctx);
['30_exercises.js','31_programs.js','40_engine.js','32_nutrition.js'].forEach(f=>vm.runInContext(fs.readFileSync('src/'+f,'utf8'),ctx,{filename:f}));
const R=c=>vm.runInContext(c,ctx);let bad=0;
console.log('RECIPES (kcal | P/C/F | 4-4-9 check)');
JSON.parse(R(`JSON.stringify(RECIPES.map(r=>({n:r.name,c:r.cat,t:r.tags,m:r.m})))`)).forEach(r=>{
  const atw=r.m.p*4+r.m.c*4+r.m.f*9;const dev=Math.abs(atw-r.m.kcal)/r.m.kcal;
  if(dev>0.12){bad++;}
  console.log(`  ${dev>0.12?'!!':'  '} ${r.n.padEnd(38)} ${String(r.m.kcal).padStart(4)} kcal | ${r.m.p}P ${r.m.c}C ${r.m.f}F | ${r.c} [${r.t}]`);
});
console.log('\nPRE-WORKOUT');
JSON.parse(R(`JSON.stringify(Object.entries(PRE_SNACK).map(([k,p])=>({k,t:p.title,m:p.m,tm:p.timing})))`)).forEach(p=>console.log(`  ${p.k} ${p.t.padEnd(34)} ${p.m.kcal} kcal (${p.m.p}P ${p.m.c}C ${p.m.f}F) · ${p.tm}`));
const snOK=R(`Object.values(PRE_SNACK).every(p=>p.m.kcal>=120&&p.m.kcal<=400&&p.m.c>=20&&p.m.f<=12)`);
console.log('  every snack is a light, carb-first snack (120–400 kcal, ≥20 g carbs, ≤12 g fat):',snOK);if(!snOK)bad++;
const pwOK=R(`Object.values(POSTWORKOUT).every(p=>p.mCut.kcal<p.mBase.kcal&&p.mBulk.kcal>p.mBase.kcal)`);
console.log('  post-workout meals: cut < maintain < bulk for every day:',pwOK);if(!pwOK)bad++;
console.log('\nMEAL PLANS (15yo, 5\'11", 200 lb, moderate)');
R(`S=defaultState();Object.assign(S.profile,{weightLb:200,heightFt:5,heightIn:11,age:15,sex:'male',activity:'moderate'})`);
['cut','bulk'].forEach(m=>{const o=JSON.parse(R(`(()=>{const t=nutritionTargets('${m}');const b=buildMealPlan('${m}',t.cal);return JSON.stringify({t,b})})()`));
  console.log(`  ${m.toUpperCase()} target ${o.t.cal} kcal (${o.t.protein}P ${o.t.carbs}C ${o.t.fat}F) → plan ${o.b.sum.kcal} kcal (${o.b.sum.p}P ${o.b.sum.c}C ${o.b.sum.f}F)`);
  o.b.plan.forEach(x=>console.log(`     ${x.slot.padEnd(13)} ${x.recipe} ×${x.servings}`));
  if(Math.abs(o.b.sum.kcal-o.t.cal)>250)bad++;});
console.log(bad?`\n${bad} ISSUE(S)`:'\nNUTRITION CHECKS PASSED');
