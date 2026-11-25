/* =========================================================
   CONTENT carried over from the previous version (Supplements, Relief,
   warm-ups, stretches) + progression guide + equipment
   ========================================================= */
const STRETCHES={
 quads:[{n:'Standing Quad Stretch',hold:'20s / leg',cue:'Heel to glute, knees together, stand tall.'},{n:'Kneeling Hip-Flexor',hold:'20s / leg',cue:'Tuck hips, tall chest.'},{n:'Deep Squat Hold',hold:'30s',cue:'Sit deep, elbows pushing knees out.'},{n:'Calf Stretch (wall)',hold:'20s / leg',cue:'Back heel down, lean in.'},{n:'Figure-4 Glute',hold:'20s / side',cue:'Ankle over knee, sit back.'}],
 push:[{n:'Doorway Chest Stretch',hold:'30s',cue:'Forearm on frame, step through.'},{n:'Cross-Body Shoulder',hold:'20s / arm',cue:'Pull arm across, relax the shoulder.'},{n:'Overhead Triceps',hold:'20s / arm',cue:'Elbow up, hand down the spine.'},{n:'Behind-Back Clasp',hold:'20s',cue:'Clasp behind back and lift.'},{n:'Neck Side Stretch',hold:'15s / side',cue:'Ear toward shoulder, gentle.'}],
 posterior:[{n:'Standing Hamstring',hold:'20s / leg',cue:'Soft knee, flat back.'},{n:'Figure-4 Glute',hold:'20s / side',cue:'Ankle over knee, sit back.'},{n:'Pigeon Pose',hold:'30s / side',cue:'Front shin forward, sink hips.'},{n:"Child's Pose",hold:'30s',cue:'Hips to heels, arms long.'},{n:'Calf Stretch (wall)',hold:'20s / leg',cue:'Back heel down, lean in.'}],
 pull:[{n:'Lat Stretch',hold:'20s / side',cue:'Reach overhead, lean away.'},{n:'Biceps Wall Stretch',hold:'20s / arm',cue:'Palm on wall behind you, turn away.'},{n:'Rear-Delt Cross-Body',hold:'20s / arm',cue:'Pull arm across, relax.'},{n:'Thread-the-Needle',hold:'30s / side',cue:'On all fours, thread one arm under.'},{n:'Trap / Neck Stretch',hold:'20s / side',cue:'Ear to shoulder, light pull.'}],
 upper:[{n:'Doorway Chest Stretch',hold:'30s',cue:'Forearm on frame, step through.'},{n:'Lat Stretch',hold:'20s / side',cue:'Reach overhead, lean away.'},{n:'Cross-Body Shoulder',hold:'20s / arm',cue:'Pull arm across, relax.'},{n:'Overhead Triceps',hold:'20s / arm',cue:'Elbow up, hand down the spine.'},{n:'Trap / Neck Stretch',hold:'20s / side',cue:'Ear to shoulder, light pull.'}],
 legs:[{n:'Standing Quad Stretch',hold:'30s / leg',cue:'Heel to glute, knees together, stand tall.'},{n:'Standing Hamstring',hold:'30s / leg',cue:'Heel on a bench, hinge forward with a flat back.'},{n:'Adductor Rock-Backs',hold:'10 / side',cue:'Kneel, one leg out to the side, rock hips back gently.'},{n:'Kneeling Hip-Flexor',hold:'30s / leg',cue:'Tuck hips, tall chest.'},{n:'Calf Stretch (wall)',hold:'20s / leg',cue:'Back heel down, lean in.'}],
};
/* ---------- warm-ups: short, dynamic only, matched to the muscles trained that day ---------- */
const WARMUP_PLAN={
 push:{dur:'5 min',moves:[['Arm circles','10 forward + 10 back'],['Band shoulder dislocates','10 slow'],['Band pull-aparts','15'],['Scapular push-ups','10'],['Easy push-ups','8']]},
 pull:{dur:'5 min',moves:[['Arm swings across the body','10'],['Cat-cow','8 slow'],['Band pull-aparts','15'],['Scap pull-ups on the bar','8'],['Light straight-arm pulldown','12']]},
 legs:{dur:'6 min',moves:[['Leg swings, front to back','10 / leg'],['Leg swings, side to side','10 / leg'],['Bodyweight squats','10'],['Walking lunges','6 / leg'],['Glute bridges','10'],['Squat jumps, soft landing','3']]},
 upper:{dur:'5 min',moves:[['Arm circles','10 forward + 10 back'],['Band shoulder dislocates','10 slow'],['Band pull-aparts','15'],['Scap pull-ups on the bar','8'],['Easy push-ups','8']]},
 quads:{dur:'5 min',moves:[['Leg swings, front to back','10 / leg'],['Leg swings, side to side','10 / leg'],['Bodyweight squats','12'],['Walking lunges','6 / leg'],['High knees','20 sec']]},
 posterior:{dur:'5 min',moves:[['Leg swings, front to back','10 / leg'],['Bodyweight hip hinges','10'],['Glute bridges','12'],['Inchworms','5'],['Walking lunges','6 / leg']]},
};
/* ---------- after training: cooldown (static stretches come from STRETCHES for the same day type) ---------- */
const COOLDOWN={
 push:{dur:'8–10 min',walk:'3 min easy walk or slow bike — let your heart rate come down before stretching',mobility:[['Thoracic extension over a foam roller','8 slow reps','Hands behind head, extend over the roller'],['Wall angels','8','Slow, ribs down']]},
 pull:{dur:'8–10 min',walk:'3 min easy walk — breathe slowly through your nose',mobility:[['Dead hang','1 × 20 sec','Let the lats and spine decompress'],['Foam roll lats and upper back','60 sec / side','Slow passes, pause on tight spots']]},
 legs:{dur:'10–12 min',walk:'5 min easy walk or slow bike — flush the legs after heavy squats and cleans',mobility:[['90/90 hip switches','6 / side','Sit tall, rotate knees side to side'],['Foam roll quads and adductors','60 sec / leg','Slow passes'],['Couch stretch','30 sec / leg','Back knee on the floor, shin up the wall or bench, squeeze glute']]},
 upper:{dur:'8–10 min',walk:'3 min easy walk or rower at a crawl',mobility:[['Thoracic extension over a foam roller','8 slow reps','Hands behind head'],['Dead hang','1 × 20 sec','Relax the shoulders']]},
 quads:{dur:'10 min',walk:'5 min easy walk or slow bike',mobility:[['90/90 hip switches','6 / side','Sit tall'],['Foam roll quads','60 sec / leg','Slow passes']]},
 posterior:{dur:'10 min',walk:'4 min easy walk',mobility:[['Foam roll glutes and hamstrings','60 sec / leg','Slow passes'],['Cat-cow','8 slow reps','Ease the lower back']]},
};
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

const YMCA_EQUIPMENT=[
 '4 squat/bench combo racks','Smith machine','Glute trainer','2 leg presses','Hack squat','Chin/dip station','Bicep curl machine',
 'Abdominal crunch machine','Back extension','Seated row','2 lat pulldown machines','Hip adductor/abductor','Pec fly / rear delt machine',
 'Chest press machine','Shoulder press machine','Leg extension','Seated leg curl','Triceps press machine','Bench press',
 'Curl bars 20–110 lb','EZ curl bars 20–110 lb','Dumbbells 5–100 lb','Matrix upper/lower/core cable machine','Cardio equipment'
];
const PROGRESSION_GUIDE=[
 {h:'When to add weight',p:'When you hit every prescribed rep on every set with good form and you still had a rep or two left on your heavy compounds. The app does this automatically: hit 3 × 4 on bench cleanly and next session’s recommendation goes up.'},
 {h:'How much to add',p:'The smallest jump available: +5 lb for upper-body barbell and machine lifts and for dumbbells (the next dumbbell up), +10 lb for leg press, hack squat, RDL and squat. If you smash the target by 3+ reps, the app can jump a little more — but never more than about 15% at once.'},
 {h:'When to add reps (double progression)',p:'For rep ranges like 6–8 each arm, keep the weight and add reps first. Once every set reaches the top of the range (8), add weight and start back at the bottom (6). For fixed targets like 3 × 4, the weight goes up and the reps stay the same.'},
 {h:'How effort works',p:'After each set, tap how it felt: Easy, Solid or Max. Heavy compounds (bench, hack squat, RDL, rows, presses) should finish with 1–2 reps in reserve — the app plans 2 left on your first set and 1 left on your last. Isolation lifts (laterals, curls, extensions, Kelso shrugs) can go to technical failure on the final set: the last rep you can do with perfect form. Power cleans are different: they stop the moment bar speed or technique slows, and are never taken to failure.'},
 {h:'Inside a workout',p:'Every set you log updates the next one. Beat your reps easily and the next set nudges up (never more than 10%). Fall short and it comes down. Later sets are planned a little lighter to account for fatigue.'},
 {h:'Tracking improvement',p:'Each session saves your best set and an estimated max (calculated from weight × reps and always rounded down). Progress shows your strength trend per lift, weekly volume and every personal best.'},
 {h:'When to repeat or lower the weight',p:'Miss one rep on one set → repeat the weight next time. Miss more than that → hold and build the reps back. Stall two sessions in a row → the app resets you about 10% lighter so you can build back past the sticking point. Also drop the weight any time your form breaks down, you’re sick, or you slept badly.'},
 {h:'Avoiding plateaus',p:'Sleep 8–10 hours, eat enough protein, add weight in small jumps, and don’t grind ugly reps. Small, steady jumps beat big ones that stall. If a lift stalls repeatedly, use the 10% reset, check your technique in the exercise demo, or swap to a similar exercise for a few weeks.'},
];
