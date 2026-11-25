const WARMUPS={
 quads:{raise:'3–4 min easy bike or treadmill',moves:['Leg swings — 10 / leg','Bodyweight squats — 15','Walking lunges — 10 / leg','Glute bridges — 15','Band monster walks — 10 / side'],ramp:'Work up to your squat: empty bar × 10, then 1–2 lighter sets before working weight.'},
 push:{raise:'3–4 min bike or rower',moves:['Arm circles — 15 each way','Band pull-aparts — 15','Scapular push-ups — 12','Band shoulder dislocates — 10','Push-ups — 10'],ramp:'On your first press: empty bar / light set × 10, then 1–2 builders before working weight.'},
 posterior:{raise:'3–4 min easy bike or treadmill',moves:['Leg swings — 10 / leg','Bodyweight hip hinges — 12','Glute bridges — 15','Band monster walks — 10 / side','Walking lunges — 10 / leg'],ramp:'On the back extension: a few slow bodyweight reps to groove the hinge before adding a plate.'},
 pull:{raise:'3–4 min bike or rower',moves:['Band pull-aparts — 15','Dead hang — 20 sec','Scap pull-ups — 8','Light face pulls — 15','Cat-cow — 8'],ramp:'On your first pull: 1–2 lighter sets before working weight.'},
 upper:{raise:'3–4 min bike or rower',moves:['Arm circles — 15 each way','Band pull-aparts — 15','Scapular push-ups — 12','Light face pulls — 15','Dead hang — 20 sec'],ramp:'On your first big press and pull: 1–2 lighter sets before working weight.'},
};

const STRETCHES={
 quads:[{n:'Standing Quad Stretch',hold:'20s / leg',cue:'Heel to glute, knees together, stand tall.'},{n:'Kneeling Hip-Flexor',hold:'20s / leg',cue:'Tuck hips, tall chest.'},{n:'Deep Squat Hold',hold:'30s',cue:'Sit deep, elbows pushing knees out.'},{n:'Calf Stretch (wall)',hold:'20s / leg',cue:'Back heel down, lean in.'},{n:'Figure-4 Glute',hold:'20s / side',cue:'Ankle over knee, sit back.'}],
 push:[{n:'Doorway Chest Stretch',hold:'30s',cue:'Forearm on frame, step through.'},{n:'Cross-Body Shoulder',hold:'20s / arm',cue:'Pull arm across, relax the shoulder.'},{n:'Overhead Triceps',hold:'20s / arm',cue:'Elbow up, hand down the spine.'},{n:'Behind-Back Clasp',hold:'20s',cue:'Clasp behind back and lift.'},{n:'Neck Side Stretch',hold:'15s / side',cue:'Ear toward shoulder, gentle.'}],
 posterior:[{n:'Standing Hamstring',hold:'20s / leg',cue:'Soft knee, flat back.'},{n:'Figure-4 Glute',hold:'20s / side',cue:'Ankle over knee, sit back.'},{n:'Pigeon Pose',hold:'30s / side',cue:'Front shin forward, sink hips.'},{n:"Child's Pose",hold:'30s',cue:'Hips to heels, arms long.'},{n:'Calf Stretch (wall)',hold:'20s / leg',cue:'Back heel down, lean in.'}],
 pull:[{n:'Lat Stretch',hold:'20s / side',cue:'Reach overhead, lean away.'},{n:'Biceps Wall Stretch',hold:'20s / arm',cue:'Palm on wall behind you, turn away.'},{n:'Rear-Delt Cross-Body',hold:'20s / arm',cue:'Pull arm across, relax.'},{n:'Thread-the-Needle',hold:'30s / side',cue:'On all fours, thread one arm under.'},{n:'Trap / Neck Stretch',hold:'20s / side',cue:'Ear to shoulder, light pull.'}],
 upper:[{n:'Doorway Chest Stretch',hold:'30s',cue:'Forearm on frame, step through.'},{n:'Lat Stretch',hold:'20s / side',cue:'Reach overhead, lean away.'},{n:'Cross-Body Shoulder',hold:'20s / arm',cue:'Pull arm across, relax.'},{n:'Overhead Triceps',hold:'20s / arm',cue:'Elbow up, hand down the spine.'},{n:'Trap / Neck Stretch',hold:'20s / side',cue:'Ear to shoulder, light pull.'}],
};

const RECOVER_AFTER=['Sauna 10–15 min — hydrate before & after, step out if dizzy','Foam roll the muscles you trained — 20–30 sec on tight spots','Water all day, extra around the sauna','Sleep 8–10 hrs tonight — where the growth happens'];


const RECIPES=[
 {icon:'🍫',name:'Chocolate Mass-Builder',macro:'~680 cal<br>~42 g protein',ing:['1 cup whole milk','1 scoop chocolate protein powder','1 banana','½ cup rolled oats','2 tbsp peanut butter','1 tbsp cocoa powder','Handful of ice'],steps:'Blend 30–45 sec until smooth. The best post-workout or before-bed shake for putting on size.'},
 {icon:'🥜',name:'Choc-PB Recovery',macro:'~550 cal<br>~40 g protein',ing:['1 cup chocolate milk','1 scoop chocolate protein powder','1 tbsp peanut butter','½ frozen banana'],steps:'Blend till smooth. Fast carbs + protein right after a hard session.'},
 {icon:'🥛',name:'Simple Chocolate Shake',macro:'~320 cal<br>~38 g protein',ing:['1.5 cups milk','1 scoop chocolate protein powder','Ice'],steps:'Shaker bottle or blender. The no-excuses option when time is short.'},
 {icon:'🍪',name:'Cookies & Cream Gainer',macro:'~620 cal<br>~45 g protein',ing:['1 cup whole milk','1 scoop vanilla protein powder','½ cup Greek yogurt','¼ cup oats','2 crushed chocolate cookies','Ice'],steps:'Blend, leaving a few cookie chunks. Tastes like dessert, builds like a meal.'},
 {icon:'🍌',name:'PB-Banana Power',macro:'~600 cal<br>~40 g protein',ing:['1 cup whole milk','1 scoop vanilla or chocolate protein','1 large banana','2 tbsp peanut butter','½ cup oats','Ice'],steps:'Blend until creamy. A classic mass-gainer that always goes down easy.'},
 {icon:'🍓',name:'Strawberry Vanilla',macro:'~400 cal<br>~38 g protein',ing:['1 cup milk','1 scoop vanilla protein','1 cup frozen strawberries','½ cup Greek yogurt','Drizzle of honey'],steps:'Blend till smooth. Light, fruity, and high in protein.'},
 {icon:'☕',name:'Mocha Recovery',macro:'~360 cal<br>~37 g protein',ing:['1 cup milk','1 scoop chocolate protein','½ cup cold brew or chilled coffee','1 tsp cocoa','Ice'],steps:'Blend. A little caffeine kick with the protein — good earlier in the day.'},
 {icon:'🥭',name:'Tropical Mango',macro:'~430 cal<br>~36 g protein',ing:['1 cup milk or coconut water','1 scoop vanilla protein','1 cup frozen mango','½ banana','½ cup Greek yogurt'],steps:'Blend till smooth. Refreshing change-up from the chocolate shakes.'},
 {icon:'🥪',name:'PB & Jelly Protein',macro:'~520 cal<br>~42 g protein',ing:['1 cup milk','1 scoop vanilla protein','2 tbsp peanut butter','½ cup frozen mixed berries','Ice'],steps:'Blend. Tastes like a PB&J — surprisingly good and protein-packed.'},
 {icon:'🏈',name:'Post-Practice Chocolate Milk',macro:'~320 cal<br>~16 g protein',ing:['2 cups cold chocolate milk'],steps:'No blender needed. Dietitian-backed recovery drink — cheap and proven.'},
];

const DEFAULT_CHECKS=[
 {id:'warmup',label:'Warm up (10 min)'},{id:'lifts',label:'Log my main lifts'},{id:'neck',label:'Neck routine'},
 {id:'shake',label:'Drink a protein shake'},{id:'protein',label:'Hit my protein target'},{id:'sleep',label:'8–10 hrs sleep'},
];

const SUPPS=[
 {n:'Whey / Protein Powder',tag:'Foundation',benefits:['An easy way to hit your daily protein when whole food comes up short','Supports muscle repair and growth after hard training'],use:'About 1 scoop (~25g) in a shake or with milk. It’s just concentrated food — real meals still come first.'},
 {n:'Creatine Monohydrate',tag:'Most researched',benefits:['The single most studied sports supplement there is','Builds strength, power, and size over time','Improves recovery between hard sets — exactly what a lineman wants'],use:'3–5g every day (timing doesn’t matter — no need to “load”), with plenty of water. Get plain monohydrate, not fancy blends. It’s well-studied and considered safe, but clear it with your doctor and parents first.'},
 {n:'Vitamin D3',tag:'Daily health',benefits:['A lot of people run low, especially through winter','Supports bone strength, muscle function, and immune health'],use:'One standard daily dose with food. Ask your doctor to check your levels first.'},
 {n:'Omega-3 (Fish Oil)',tag:'Recovery',benefits:['Helps recovery and joint health from heavy training','Good for heart and brain health too'],use:'One daily dose with a meal.'},
 {n:'Electrolytes / Hydration',tag:'Hot practices',benefits:['Replaces the salt and minerals you sweat out in summer practices','Supports performance and helps keep cramps away'],use:'During or after long, hot sessions. Plain water is still the base — this is for the sweaty days.'},
];

const SUPP_AVOID=[
 'Pre-workout stimulants & energy drinks — too much caffeine for under-18, and they spike heart rate and blood pressure.',
 'Fat burners / “thermogenics” — risky and pointless, especially when the goal is to ADD size.',
 '“Testosterone boosters” & hormone products — not for teens; usually useless and sometimes unsafe.',
 'SARMs, prohormones, anything labeled “anabolic” — illegal, banned in sports, and genuinely dangerous.',
 'Anything promising fast, dramatic results, or that isn’t third-party tested.',
];

const RELIEF=[
 {area:'Neck',why:'Linemen load the neck hard — contact, heavy carries, and hunching over a phone all stack up.',
  stretch:[
   {n:'Upper-trap stretch',d:'Ear toward shoulder, gently pull with the same-side hand. 20–30s each side.'},
   {n:'Levator stretch',d:'Turn your head ~45° down toward your armpit, gentle pull on the back of the head. 20–30s each.'},
   {n:'Chin tucks',d:'Pull your chin straight back (make a double chin), hold 3s. 10 reps — resets posture.'}],
  strengthen:[
   {n:'Neck isometrics',d:'Press your palm into your forehead, then each side, then behind your head — resist hard without moving. 10s × 3 each way.'},
   {n:'Towel / band holds',d:'Light, controlled neck holds front-back-sides — this builds the armor that protects against hits.'}],
  daily:['Keep the phone up at eye level — chin-poking is the #1 cause.','Don’t shrug your traps up during presses; keep the shoulders down.','Foam-roll the upper back and traps, not the neck itself.']},

 {area:'Shoulder',why:'Pressing way more than you pull (the classic lineman trap) leaves the front tight and the rotator cuff weak.',
  stretch:[
   {n:'Cross-body stretch',d:'Pull one arm across your chest, relax the shoulder down. 20–30s each.'},
   {n:'Doorway pec stretch',d:'Forearm on the door frame, step through until the chest opens. 20–30s each.'},
   {n:'Sleeper stretch (gentle)',d:'On your side, arm out front bent 90°, ease the forearm down. Never force it. 20–30s.'}],
  strengthen:[
   {n:'Band pull-aparts',d:'Arms straight, pull a band apart to your chest, squeeze the shoulder blades. 2–3 × 15.'},
   {n:'Face pulls',d:'Cable/band to your forehead, elbows high, squeeze the rear shoulders. 3 × 15.'},
   {n:'External rotations',d:'Elbow pinned to your side, rotate a band outward. 3 × 15 each — straight at the rotator cuff.'},
   {n:'Scap push-ups',d:'In a push-up plank, just pinch and spread the shoulder blades. 2 × 12.'}],
  daily:['Pull as much as you press — add a pull set for every press if the shoulder gripes.','If bench or overhead pinches, shorten the range or drop weight; don’t grind through a pinch.','Warm the cuff up with band work before pressing days.']},

 {area:'Knee',why:'Usually it’s the tendon (jumper’s knee) or kneecap tracking — and weak hips/quads are often the real driver.',
  stretch:[
   {n:'Quad stretch',d:'Heel to glute, knees together, stand tall. 20–30s each.'},
   {n:'Hip-flexor stretch',d:'Half-kneel, tuck the hips under, tall chest. 20–30s each.'},
   {n:'Calf stretch',d:'Back heel down, lean into a wall — tight calves overload the knee. 20–30s each.'}],
  strengthen:[
   {n:'Wall sit / Spanish squat hold',d:'Sit against a wall at ~90°, hold 30–45s × 3. Isometrics calm a cranky knee tendon down fast.'},
   {n:'Step-downs',d:'Stand on a low step, slowly lower the other heel to tap the floor, drive back up. 3 × 10 each, controlled.'},
   {n:'Terminal knee extensions',d:'Band behind the knee, straighten the leg against it and squeeze the quad. 3 × 15.'},
   {n:'Hip / glute work',d:'Strong hips fix a lot of knee pain — glute bridges, the glute trainer, and the hip abductor all help.'},
   {n:'Tibialis raises',d:'Heels down, toes up against a wall, lift the toes. 3 × 20 — balances the shin.'}],
  daily:['Knees track over the toes on squats/leg press — don’t let them cave in.','Add depth and load slowly; most knee pain is "too much, too soon."','Do a few bodyweight reps to warm the knees before loading.']},

 {area:'Joints (elbows, wrists, general)',why:'General joint achiness is usually a volume problem — too much, too soon — or cranky tendons from heavy pressing and curling.',
  stretch:[
   {n:'Wrist rocks',d:'On all fours, palms down, rock gently forward/back, then flip to the backs of the hands. 30s each — huge for pressing.'},
   {n:'Forearm stretch',d:'Arm straight, gently pull the hand back, then down. 20–30s each.'},
   {n:'Mobilize above & below',d:'Loose ankles take stress off knees; a loose upper back takes stress off elbows/shoulders.'}],
  strengthen:[
   {n:'Eccentric wrist curls',d:'For sore elbows: curl a light weight up with help, lower it slowly. 3 × 15 — rebuilds the tendon.'},
   {n:'Grip / forearm work',d:'Light and controlled — stronger tendons handle more.'},
   {n:'Even out push & pull',d:'Match your pressing volume with pulling to pull stress off the elbows and shoulders.'}],
  daily:['When a joint aches, pull volume back for a week (a deload) instead of pushing through.','Full range but controlled — no bouncing or slamming into lockout.','Heat before, ice after if it’s achy. Sleep and omega-3s genuinely help inflammation.']},

 {area:'Foot',why:'Arch/heel pain (plantar fascia) and achy feet come from tight calves, weak foot muscles, and ramping running up too fast.',
  stretch:[
   {n:'Calf stretch (both)',d:'Straight back leg for the upper calf, then bend that knee for the lower calf. 20–30s each.'},
   {n:'Plantar-fascia stretch',d:'Pull your toes back toward your shin until the arch stretches. 20–30s, a few times a day.'},
   {n:'Roll the arch',d:'Roll a ball or a frozen water bottle under the arch for 1–2 min.'},
   {n:'Big-toe mobility',d:'Gently pull the big toe up and back. 20s.'}],
  strengthen:[
   {n:'Slow calf raises',d:'Up on both feet, down slow on one. 3 × 12 — the single best fix for foot and heel pain.'},
   {n:'Toe yoga / short foot',d:'Lift just the big toe while the others stay down, then reverse. 2 × 10 — wakes up the arch.'},
   {n:'Towel scrunches',d:'Scrunch a towel toward you with your toes. 2 × 15.'},
   {n:'Tibialis raises',d:'Toes up against a wall — balances the lower leg.'}],
  daily:['Wear supportive shoes; don’t live barefoot on hard floors all day.','Build running and conditioning volume up gradually.','A frozen-water-bottle roll after a long day calms the arch right down.']},
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

const LEGCAL=[
 {week:'Week 1',days:[['Mon','Platz Legs','hot'],['Tue','Rest','rest'],['Wed','Arnold Chest',''],['Thu','Rest','rest'],['Fri','5×5 Strength',''],['Sat','Herschel Walker Bodyweight','light'],['Sun','Rest','rest']]},
 {week:'Week 2',days:[['Mon','20-Rep Squats','hot'],['Tue','Rest','rest'],['Wed','German Volume 10×10',''],['Thu','Rest','rest'],['Fri','Coleman Heavy',''],['Sat','Herschel Walker Bodyweight','light'],['Sun','Rest','rest']]},
];