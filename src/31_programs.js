/* =========================================================
   PROGRAMS — exactly two: PPL Split (recommended) and The Legend's Split
   ========================================================= */
/* PPL — transcribed exactly from the plan. setsText/repsText are shown verbatim. */
const PPL_LEGS=[
  {id:'hack',n:'Heavy Hack Squats',setsText:'3',repsText:'5',rest:180},
  {id:'rdl',n:'Romanian Deadlifts',setsText:'2',repsText:'6',rest:150},
  {id:'legext',n:'Quad Extensions',setsText:'2',repsText:'8',rest:90},
  {id:'adductor',n:'Adductor Machine',setsText:'2',repsText:'8',rest:90},
  {id:'clean',n:'Power Cleans',setsText:'3',repsText:'6',rest:150,note:'Last on the list today, so you’ll be tired — use a lighter weight than you would fresh and end each set the moment bar speed drops.'},
];
const PPL_PROGRAM={
  id:'ppl',name:'PPL Split',badge:'RECOMMENDED',
  tag:'6-day week · 5 training days',
  desc:'Push · Pull · Legs, rest, an upper-body combination day, Legs again, rest. Heavy low-rep compounds with focused accessory work — every muscle hit twice a week.',
  muscle:'Chest, back, shoulders and arms each get trained twice a week, and legs get two full sessions — heavy 4–6 rep compounds for strength plus accessories for size.',
  football:'Heavy hack squats, RDLs and power cleans build the hip drive and explosiveness you use off the snap; heavy pressing and pulling build the upper-body strength you block with.',
  schedule:['d1','d2','d3','d4','d5','d6','d7'], /* Sun..Sat, fixed order — Sunday is Day 1 */
  days:[
    {id:'d1',label:'Day 1',name:'Push',type:'push',ex:[
      {id:'bench',n:'Bench Press',setsText:'3',repsText:'4',rest:180},
      {id:'inclinedb',n:'Incline Dumbbell Bench Press',setsText:'2',repsText:'7',rest:150},
      {id:'satriext',n:'Single-Arm Tricep Extensions',setsText:'2',repsText:'6–8 each arm',rest:75},
      {id:'ohp',n:'Dumbbell/Machine Shoulder Press',setsText:'2',repsText:'8',rest:120,variants:['ohp','ohp_db']},
      {id:'dip',n:'Dips',setsText:'3',repsText:'6',rest:120},
      {id:'lateral',n:'Lateral Raises',setsText:'2',repsText:'8',rest:75},
    ]},
    {id:'d2',label:'Day 2',name:'Pull',type:'pull',ex:[
      {id:'pulldown',n:'Lat Pulldown / Pull-Ups',setsText:'3',repsText:'6',rest:150,variants:['pulldown','pullup']},
      {id:'row',n:'Machine Row',setsText:'2',repsText:'6',rest:120,ss:'A'},
      {id:'kelso',n:'Kelso Shrugs',setsText:'Superset',repsText:'With Machine Rows',rest:120,ss:'A',sets:2,suggest:[8,12],
        note:'Done as a superset with the Machine Rows — row set, Kelso set, then rest. Your plan doesn’t list reps, so the app suggests 8–12 (editable).'},
      {id:'seatedcurl',n:'Seated Dumbbell Curls',setsText:'2',repsText:'6',rest:90},
      {id:'dbpreacher',n:'Dumbbell Preacher Curls',setsText:'2',repsText:'8',rest:75},
      {id:'reardelt',n:'Rear Delt Flyes',setsText:'2',repsText:'8',rest:75},
    ]},
    {id:'d3',label:'Day 3',name:'Legs',type:'legs',ex:PPL_LEGS},
    {id:'d4',label:'Day 4',name:'Rest',type:'rest',rest:true,ex:[]},
    {id:'d5',label:'Day 5',name:'Upper Body Combination (Push + Pull)',short:'Push + Pull',type:'upper',ex:[
      {id:'bench',n:'Bench Press',setsText:'3',repsText:'4',rest:180},
      {id:'pulldown',n:'Pull-Ups / Lat Pulldown',setsText:'3',repsText:'6',rest:150,variants:['pullup','pulldown'],defaultVariant:'pulldown'},
      {id:'inclinedb',n:'Incline Dumbbell Bench Press',setsText:'3',repsText:'7',rest:150},
      {id:'row',n:'Machine Row',setsText:'3',repsText:'6',rest:120},
      {id:'lateral',n:'Lateral Raises',setsText:'3',repsText:'8',rest:75},
      {id:'curl',n:'Machine Preacher Curls',setsText:'3',repsText:'8',rest:75},
      {id:'satriext',n:'Single-Arm Tricep Extensions',setsText:'3',repsText:'8',rest:75},
    ]},
    {id:'d6',label:'Day 6',name:'Legs',type:'legs',sameAs:'d3',ex:PPL_LEGS},
    {id:'d7',label:'Day 7',name:'Rest',type:'rest',rest:true,ex:[]},
  ]
};

/* The Legend's Split — preserved verbatim from the previous version of the app */
const LEGENDS_PROGRAM_RAW={id:'legends',name:'Legends Split',tag:'Legends · 2-week rotation',desc:'The famous workouts laid out as a rotation — Platz legs, Arnold chest, 5×5, Herschel bodyweight, 20-rep squats, German Volume, Coleman heavy — all on your YMCA gear. Follow the 2-week calendar in ★ Legends (Platz only every 2 weeks) with rest days built in.',muscle:'A rotation of the most famous mass- and strength-building sessions ever — huge variety and volume, with the brutal leg days spaced two weeks apart so you actually recover.',football:'Old-school leg and posterior punishment for hip drive, plus a bodyweight conditioning day straight out of the NFL — with the rest days that keep it survivable.',days:[
   {id:'d1',name:'Platz Legs',sub:'Legs · high volume 🔥',type:'quads',ex:[
     {id:'hack',n:'Hack Squat',t:'5 × 12–15',note:'Platz’s signature. High volume — leave 1–2 reps in the tank.',rest:120},
     {id:'legpress',n:'Leg Press',t:'4 × 15',note:'Deep and controlled.',rest:120},
     {id:'legext',n:'Leg Extension',t:'4 × 15–20',note:'Burnout style — squeeze the top.',rest:60,ss:'A'},
     {id:'legcurl',n:'Seated Leg Curl',t:'4 × 12–15',note:'Balance the hamstrings.',rest:60,ss:'A'},
     {id:'calf2',n:'Leg Press Calf Raise',t:'4 × 20',note:'Full stretch, slow.',rest:60},
   ]},
   {id:'d2',name:'Arnold Chest',sub:'Chest · shoulders · triceps',type:'push',ex:[
     {id:'bench',n:'Bench Press',t:'5 × 8–12',note:'Spotter every set.',rest:120},
     {id:'chestpress',n:'Chest Press Machine',t:'4 × 10–12',note:'Chase the pump.',rest:90},
     {id:'fly',n:'Pec Fly Machine',t:'4 × 12–15',note:'Big stretch, constant tension.',rest:60},
     {id:'dip',n:'Dips',t:'3 × 8–10',note:'Assist if needed. Stop shy of failure.',rest:90,ss:'A'},
     {id:'tripush',n:'Triceps Press Machine',t:'3 × 15',note:'Full lockout.',rest:60,ss:'A'},
   ]},
   {id:'d3',name:'5×5 Strength',sub:'Full-body compounds',type:'quads',ex:[
     {id:'squat',n:'Back Squat',t:'5 × 5',note:'Add ~5 lb when all 5×5 are clean.',rest:180},
     {id:'bench',n:'Bench Press',t:'5 × 5',note:'Spotter every set.',rest:180},
     {id:'row',n:'Seated Row',t:'5 × 5',note:'Strong, controlled pulls.',rest:120},
     {id:'ohp',n:'Shoulder Press Machine',t:'5 × 5',note:'Safe overhead.',rest:120},
   ]},
   {id:'d4',name:'Herschel Walker Bodyweight',sub:'Bodyweight · conditioning',type:'upper',ex:[
     {id:'pushup',n:'Push-Ups',t:'5 × 25',note:'Chest to floor, tight core. Build the number up over weeks.',rest:60},
     {id:'chinup',n:'Chin-Ups',t:'5 × max',note:'Assist if needed. Full hang each rep.',rest:75},
     {id:'dip',n:'Dips',t:'5 × max',note:'Assist if needed.',rest:75},
     {id:'crunch',n:'Sit-Ups / Ab Crunch',t:'5 × 25',note:'Slow and controlled.',rest:45},
     {id:'plank',n:'Plank',t:'3 × 60 sec',note:'Brace hard.',rest:45},
   ]},
   {id:'d5',name:'20-Rep Squats',sub:'Legs · the breathing set 🔥',type:'quads',ex:[
     {id:'squat',n:'Back Squat',t:'2 × 20',note:'The breathing set — 2–3 big breaths between the last reps. Spotter / safeties up. Moderate weight, stop if form breaks.',rest:180},
     {id:'legpress',n:'Leg Press',t:'3 × 15',note:'Deep and controlled.',rest:90},
     {id:'legcurl',n:'Seated Leg Curl',t:'3 × 12',note:'Hamstrings.',rest:60,ss:'A'},
     {id:'calf2',n:'Leg Press Calf Raise',t:'3 × 20',note:'Full stretch.',rest:60,ss:'A'},
   ]},
   {id:'d6',name:'German Volume 10×10',sub:'Upper · pure volume',type:'upper',ex:[
     {id:'chestpress',n:'Chest Press Machine',t:'10 × 10',note:'~60% of your max, 60–90 sec rest. The last sets get hard.',rest:75},
     {id:'row',n:'Seated Row',t:'10 × 10',note:'Same weight all 10 sets. Keep it clean.',rest:75},
     {id:'lateral',n:'DB Lateral Raise',t:'3 × 15',note:'Side delts.',rest:60,ss:'A'},
     {id:'curl',n:'Bicep Curl Machine',t:'3 × 12',note:'No swinging.',rest:60,ss:'A'},
   ]},
   {id:'d7',name:'Coleman Heavy',sub:'Posterior · go heavier',type:'posterior',ex:[
     {id:'hack',n:'Hack Squat',t:'5 × 8',note:'Heavier today — "yeah buddy," but form first.',rest:150},
     {id:'legpress',n:'Leg Press',t:'4 × 8–10',note:'Load it up, full range.',rest:150},
     {id:'backext',n:'Back Extension',t:'4 × 10',note:'Flat back, squeeze the glutes.',rest:90},
     {id:'legcurl',n:'Seated Leg Curl',t:'4 × 10',note:'Hamstrings.',rest:75,ss:'A'},
     {id:'glutetrainer',n:'Glute Trainer',t:'3 × 12',note:'Drive the hips.',rest:75,ss:'A'},
   ]},
 ]};
const LEGENDS_PROGRAM=Object.assign({},LEGENDS_PROGRAM_RAW,{
  name:'The Legend’s Split',tag:'2-week rotation · rest days built in',
  /* Sun..Sat. Same training weekdays as the original calendar (Mon/Wed/Fri/Sat), rest Sunday now opens the week */
  schedule2wk:[['rest','d1','rest','d2','rest','d3','d4'],['rest','d5','rest','d6','rest','d7','d4']],
  days:LEGENDS_PROGRAM_RAW.days.map(d=>Object.assign({},d,{label:d.name}))
});

const LEGCAL=[
 {week:'Week 1',days:[['Mon','Platz Legs','hot'],['Tue','Rest','rest'],['Wed','Arnold Chest',''],['Thu','Rest','rest'],['Fri','5×5 Strength',''],['Sat','Herschel Walker Bodyweight','light'],['Sun','Rest','rest']]},
 {week:'Week 2',days:[['Mon','20-Rep Squats','hot'],['Tue','Rest','rest'],['Wed','German Volume 10×10',''],['Thu','Rest','rest'],['Fri','Coleman Heavy',''],['Sat','Herschel Walker Bodyweight','light'],['Sun','Rest','rest']]},
];

const LEGENDS=[
 {name:'Tom Platz — Leg Day',quote:'"The Quad Father"',
  legend:'Platz built maybe the greatest legs in history on brutal, high-volume squatting — famously squatting for reps until his legs simply gave out.',
  workout:['Barbell Squats — 8–10 sets, reps climbing from 5 up past 20 (plus a legendary high-rep burnout set)','Hack Squats — 5 × 10–15','Leg Extensions — 6 × 10–15','Leg Curls — 8 × 10–20','Standing Calf Raises — to failure'],
  scaled:['Pick ONE squat challenge: 2–3 × 20 with a weight you’d normally hit ~12 with, big breaths between reps','Then Leg Press 3 × 12, Leg Extension 3 × 15, Seated Leg Curl 3 × 12','Rack it the moment form slips — a fun beat-down, not a max-out. Use the safeties.']},
 {name:'Arnold — Golden-Era Chest',quote:'"The Oak"',
  legend:'Arnold built his chest on huge volume and a love of the bench, flyes, and dips — chasing the pump every session.',
  workout:['Bench Press — 5 × 8–12','Incline Bench — 5 × 8–12','Dumbbell Flyes — 5 × 10–12','Dips — 5 × to failure','Dumbbell Pullovers — 5 × 15'],
  scaled:['Bench 4 × 8, Incline or Chest Press machine 3 × 10, Pec Fly 3 × 12, Dips 3 × as many as you can','Big volume, but stop each set 1–2 reps short of failure','A great "pump" day once in a while — not every chest session']},
 {name:'Ronnie Coleman — Heavy Day',quote:'"Yeah buddy — lightweight!"',
  legend:'8× Mr. Olympia who trained heavier than most powerlifters — 800-lb squats and deadlifts, leg presses buried under plates.',
  workout:['Heavy compound lifts in the 8–12 range with enormous loads','Squats, deadlifts, presses, rows — all loaded near the max','Full intensity, year-round, zero shortcuts'],
  scaled:['The lesson isn’t the weight — it’s the intensity and showing up every session','Work your compounds hard in the 6–10 range and add weight slowly','Do NOT chase Ronnie’s numbers — that’s a lifetime pro. Patience and form build the beast.']},
 {name:'Herschel Walker — Bodyweight',quote:'NFL & bodyweight legend',
  legend:'The NFL powerhouse who reportedly barely touched weights — he built his frame with thousands of push-ups, sit-ups, and pull-ups every single day, plus sprints.',
  workout:['Push-ups, sit-ups, pull-ups, and dips — hundreds to thousands of reps daily','Spread across sets all day long','Sprint work on top'],
  scaled:['A perfect no-gym / rest-day option: 5 rounds through the day of 25 push-ups, 25 sit-ups, max pull-ups','Build the numbers up gradually over weeks','Add a few short sprints — pure football conditioning']},
 {name:'The 20-Rep Squat — "Super Squats"',quote:'Old-school size builder',
  legend:'A near-mythical mass program: one all-out set of 20 squats with your 10-rep weight, gulping air between the grinding final reps. Lifters gained serious size fast.',
  workout:['1 × 20 back squats — heavy, 2–3 big breaths between the last reps','Straight into a light Dumbbell Pullover × 20','2–3×/week, adding a little weight each session'],
  scaled:['Try 1–2 × 20 with a moderate weight (something you could do ~15 with)','Always with a spotter or the rack safeties set','Brutal but effective — stop when form breaks, not just when it burns']},
 {name:'German Volume Training — 10 × 10',quote:'The "ten sets of ten"',
  legend:'A classic size protocol: ten sets of ten reps on one big lift with short rests. Simple, humbling, and great for packing on muscle.',
  workout:['Pick one main lift per muscle','10 sets × 10 reps at about 60% of your max','~60–90 sec rest — the last sets get very hard'],
  scaled:['Try it on ONE lift (leg press or chest press are perfect) with a lighter weight than you think you need','Keep every rep clean — the challenge is the volume, not the load','A fun change-up every few weeks']},
 {name:'5 × 5 — The Strength Classic',quote:'Reg Park & Bill Starr',
  legend:'The timeless strength template Arnold’s mentor Reg Park used — five sets of five on the big compounds, adding a little weight each week.',
  workout:['Squat, Bench, and Row (or Overhead Press) — 5 × 5','Add ~5 lbs when all 5 × 5 are clean','3 days a week'],
  scaled:['This one’s actually great to run as-is for a young lifter building a base','Start lighter than feels necessary and let the weight climb slowly','The most proven way to get strong — boring, and it works']},
];

const PROGRAMS=[PPL_PROGRAM,LEGENDS_PROGRAM];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
