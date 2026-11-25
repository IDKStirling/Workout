/* =========================================================
   ANATOMICAL MUSCLE DIAGRAMS — front & back
   Paths are drawn for one side and mirrored (x → 200 − x).
   Primary = solid red, Secondary = hatched orange.
   ========================================================= */
const BODY_SIL={
 /* silhouette pieces (left half; mirrored automatically) */
 torso:'M100,66 L91,66 C88,74 78,79 62,83 C50,86 44,94 44,108 C44,118 50,126 60,128 C64,150 67,176 69,198 C69,210 65,222 63,234 C67,244 82,250 100,252 Z',
 arm:'M46,102 C40,124 44,154 50,176 C50,200 54,224 60,246 C58,260 60,278 66,290 C72,293 77,289 77,281 C77,268 75,257 74,247 C79,224 78,200 72,178 C70,158 68,140 65,127 C58,126 50,118 46,102 Z',
 leg:'M63,232 C57,262 60,300 72,332 C68,348 68,364 72,380 C74,392 76,400 78,406 L76,418 C78,428 92,430 96,425 L95,406 C97,390 99,370 96,352 C94,344 93,338 93,332 C95,306 97,280 99,252 Z',
};
const MUSCLE_SHAPES={
 front:[
  {m:'uppertraps',d:'M88,66 C84,73 74,78 62,82 L80,83 C85,79 88,74 89,69 Z'},
  {m:'fdelt',d:'M64,85 C70,83 77,84 81,88 C77,99 69,113 61,124 C57,114 57,98 64,85 Z'},
  {m:'sdelt',d:'M60,86 C52,89 46,96 46,108 C46,117 50,124 56,128 C56,114 56,98 60,86 Z'},
  {m:'upperchest',d:'M98,86 L83,87 C79,92 74,99 70,106 C80,104 90,105 98,108 Z'},
  {m:'chest',d:'M98,110 C89,107 79,106 69,108 C66,114 66,122 71,128 C80,136 90,139 98,139 Z'},
  {m:null,d:'M66,130 C70,134 74,140 76,146 C72,148 68,146 66,142 Z M68,147 C72,151 76,156 77,162 C73,163 69,160 67,156 Z'}, /* serratus */
  {m:'biceps',d:'M60,130 C54,140 54,158 58,170 C62,175 68,173 70,167 C72,151 70,137 66,128 Z'},
  {m:'brachialis',d:'M54,146 C51,156 52,167 57,175 C55,166 55,156 57,146 Z'},
  {m:'forearms',d:'M55,180 C51,198 55,224 62,244 L73,244 C77,224 77,198 72,178 C66,182 60,182 55,180 Z'},
  {m:'abs',d:'M88,142 L98,142 L98,160 L88,160 C87,154 87,148 88,142 Z M88,163 L98,163 L98,181 L88,181 C87,175 87,169 88,163 Z M88,184 L98,184 L98,202 L89,202 C88,196 88,190 88,184 Z M89,205 L98,205 L98,234 C94,232 91,226 90,218 C89,213 89,209 89,205 Z'},
  {m:'obliques',d:'M85,142 C78,144 72,152 71,164 C71,184 74,204 81,222 L87,219 C85,196 85,170 86,142 Z'},
  {m:'quads',d:'M65,238 C60,266 63,300 74,326 C78,322 79,312 78,300 C76,276 73,254 69,240 Z M71,238 C77,258 82,286 83,318 C85,323 88,323 89,316 C89,288 86,260 80,244 C77,240 74,238 71,238 Z M86,290 C92,298 94,312 91,326 C87,330 83,327 83,318 C83,306 84,296 86,290 Z'},
  {m:'adductors',d:'M82,248 C89,250 95,254 97,258 C96,278 93,292 89,300 C86,282 83,264 80,250 Z'},
  {m:'calves',d:'M90,352 C95,362 96,380 93,396 C90,392 88,378 88,364 Z M76,352 C72,364 72,380 75,394 C78,386 79,370 78,356 Z'},
  {m:null,d:'M80,352 C84,368 84,388 83,402 L87,402 C88,386 87,368 85,352 Z'}, /* tibialis */
 ],
 back:[
  {m:'uppertraps',d:'M98,58 C93,68 82,77 60,85 C72,89 85,92 98,95 Z'},
  {m:'midtraps',d:'M98,97 C86,95 75,95 67,98 C75,112 86,130 98,162 Z'},
  {m:'rdelt',d:'M58,87 C64,86 70,89 72,95 C68,106 62,116 57,124 C52,114 51,98 58,87 Z'},
  {m:'sdelt',d:'M55,88 C48,94 45,104 46,114 C47,121 50,125 54,128 C52,114 52,100 55,88 Z'},
  {m:null,d:'M68,100 C76,104 83,112 87,124 C79,129 71,127 65,121 C63,113 64,106 68,100 Z'}, /* infraspinatus / teres */
  {m:'lats',d:'M60,120 C64,140 70,170 78,204 C86,207 92,199 96,187 C93,166 90,148 87,130 C80,128 70,124 60,120 Z'},
  {m:'lowerback',d:'M90,165 C88,184 88,206 90,226 L98,228 L98,166 Z'},
  {m:'triceps',d:'M51,128 C47,142 49,160 55,175 C61,178 67,176 69,170 C69,152 67,138 64,128 C59,130 55,130 51,128 Z'},
  {m:'forearms',d:'M54,180 C51,200 55,226 62,244 L73,244 C76,224 76,200 72,180 C66,183 60,183 54,180 Z'},
  {m:null,d:'M64,226 C64,216 70,208 80,206 C88,206 94,210 97,214 L97,222 C88,219 76,220 64,228 Z'}, /* glute medius */
  {m:'glutes',d:'M66,226 C61,244 66,264 82,270 C92,270 98,264 98,254 L98,226 C88,221 76,221 66,226 Z'},
  {m:'hams',d:'M66,274 C64,294 68,314 76,330 L84,330 C84,308 82,290 81,274 C76,272 70,272 66,274 Z M84,274 C86,294 88,314 88,330 L93,330 C95,310 95,290 94,274 C91,272 87,272 84,274 Z'},
  {m:'adductors',d:'M95,262 C97,272 97,284 95,296 C93,286 91,274 91,264 Z'},
  {m:'calves',d:'M85,346 C94,350 96,368 92,386 C88,388 86,380 85,370 Z M81,346 C73,352 71,370 76,384 C80,386 82,376 82,364 Z M77,388 C79,397 82,404 86,406 C90,404 92,397 92,390 C87,392 82,392 77,388 Z'},
 ]
};
function mirrorPath(d){
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,(m,x,y)=>(200-parseFloat(x)).toFixed(1).replace(/\.0$/,'')+','+y);
}
function muscleSVG(view,primary,secondary,opts){
  opts=opts||{};primary=primary||[];secondary=secondary||[];
  const sil=['torso','arm','leg'].map(k=>`<path d="${BODY_SIL[k]}"/><path d="${mirrorPath(BODY_SIL[k])}"/>`).join('');
  const parts=MUSCLE_SHAPES[view].map(s=>{
    const cls=s.m?(primary.includes(s.m)?'mu prim':secondary.includes(s.m)?'mu sec':'mu'):'mu neutral';
    return `<g class="${cls}"${s.m?` data-m="${s.m}"`:''}><path d="${s.d}"/><path d="${mirrorPath(s.d)}"/></g>`;
  }).join('');
  const hatch=`<pattern id="mhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="6" height="6" class="mh-bg"/><rect width="2.6" height="6" class="mh-ln"/></pattern>`;
  return `<svg class="msvg" viewBox="0 0 200 440" role="img" aria-label="${view} view muscles"><defs>${hatch}</defs>`+
    `<ellipse class="sil" cx="100" cy="36" rx="18" ry="24"/><g class="sil">${sil}<rect x="89" y="54" width="22" height="16" rx="4"/></g>${parts}</svg>`;
}
/* does an exercise need the back view? (any targeted muscle visible mostly from behind) */
const BACK_ONLY=['rdelt','uppertraps','midtraps','lats','lowerback','triceps','glutes','hams'];
const FRONT_ONLY=['upperchest','chest','fdelt','biceps','brachialis','abs','obliques','quads'];
function muscleMapHTML(ex,compact){
  const p=ex.primary||[],s=ex.secondary||[];const all=p.concat(s);
  const needFront=all.some(m=>FRONT_ONLY.includes(m)||['sdelt','forearms','adductors','calves'].includes(m))||!all.length;
  const needBack=all.some(m=>BACK_ONLY.includes(m)||['sdelt','forearms','adductors','calves'].includes(m));
  const views=[];if(needFront)views.push(['front','Front']);if(needBack)views.push(['back','Back']);
  if(!compact&&views.length===1)views.push(views[0][0]==='front'?['back','Back']:['front','Front']);
  return `<div class="mmap${compact?' compact':''}">`+views.map(([v,l])=>`<figure><figcaption>${l}</figcaption>${muscleSVG(v,p,s)}</figure>`).join('')+`</div>`;
}
function muscleLegendHTML(ex){
  const chip=(m,cls)=>`<span class="mchip ${cls}">${MUSCLE_NAMES[m]||m}</span>`;
  return `<div class="mlegend"><div><span class="mkey prim"></span><b>Primary</b>${ex.primary.map(m=>chip(m,'prim')).join('')}</div>`+
   (ex.secondary.length?`<div><span class="mkey sec"></span><b>Secondary</b>${ex.secondary.map(m=>chip(m,'sec')).join('')}</div>`:'')+`</div>`;
}
