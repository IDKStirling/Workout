/* =========================================================
   NUTRITION — ingredient table (per 100 g: kcal, protein, carbs, fat;
   USDA-based typical values) → every recipe's macros are computed, not typed
   ========================================================= */
const ING={
 milk_whole:[61,3.15,4.8,3.25],milk_2:[50,3.3,4.8,1.98],almond_milk:[15,.6,.6,1.2],choc_milk_lf:[63,3.2,10.4,1],
 whey:[387,77.4,9.7,4.8],greek_nf:[59,10.2,3.6,.4],cottage_2:[81,10.45,4.76,2.27],
 egg:[143,12.6,.7,9.5],egg_white:[52,10.9,.7,.2],
 chicken_breast:[120,22.5,0,2.6],chicken_thigh:[121,19.7,0,4.1],beef_90:[176,20,0,10],turkey_93:[150,18.7,0,8.3],
 salmon:[208,20.4,0,13.4],shrimp:[85,20.1,0,.5],tuna_water:[116,25.5,0,.8],deli_turkey:[105,19,3,1.8],
 oats:[379,13.2,67.7,6.5],rice_cooked:[130,2.7,28.2,.3],pasta_dry:[371,13,75,1.5],potato:[77,2,17.5,.1],
 bread_ww:[252,12.5,42.7,3.5],english_muffin_ww:[203,8.8,40.4,2.1],bagel:[257,10,50.5,1.6],tortilla:[312,8.3,51.6,8.1],
 rice_cake:[387,8.2,81.5,2.8],granola:[471,10,64,20],pretzels:[380,10,80,2.8],graham:[430,6.7,77.7,10.6],
 cookie_sandwich:[471,2.9,73.5,20.6],
 banana:[89,1.1,22.8,.3],blueberries:[57,.74,14.5,.33],strawberries:[32,.67,7.7,.3],mango:[60,.8,15,.4],
 pineapple:[50,.5,13.1,.1],apple:[52,.26,13.8,.17],orange_juice:[45,.7,10.4,.2],raisins:[299,3.1,79,.5],
 peanut_butter:[588,25,20,50],almonds:[579,21.2,21.6,49.9],chia:[486,16.5,42.1,30.7],choc_chips:[480,4.2,63,30],
 honey:[304,.3,82.4,0],maple:[260,0,67,.1],jam:[278,.4,69,.1],bbq_sauce:[172,.8,40.8,.6],
 olive_oil:[884,0,0,100],sesame_oil:[884,0,0,100],butter:[717,.85,.06,81],
 cheddar:[403,24.9,1.3,33.1],mozz_ps:[254,24.3,2.8,15.9],parmesan:[392,35.8,3.2,25.8],
 black_beans:[132,8.9,23.7,.5],avocado:[160,2,8.5,14.7],salsa:[36,1.5,6.6,.2],marinara:[50,1.5,8,1.5],
 soy_sauce:[53,8.1,4.9,.6],mustard:[60,3.7,5.8,3.3],lemon_juice:[22,.4,6.9,.2],garlic:[149,6.4,33,.5],
 broccoli:[34,2.8,6.6,.4],green_beans:[31,1.8,7,.2],bell_pepper:[31,1,6,.3],spinach:[23,2.9,3.6,.4],
 onion:[40,1.1,9.3,.1],romaine:[17,1.2,3.3,.3],tomato:[18,.9,3.9,.2],cucumber:[15,.65,3.6,.1],
 zero:[0,0,0,0]
};
/* item = [ingredientKey, grams, "exact measure + name"] */
function macros(items,mult){
  mult=mult||1;let k=0,p=0,c=0,f=0;
  items.forEach(([key,g])=>{const v=ING[key];if(!v)throw new Error('Unknown ingredient '+key);const r=g*mult/100;k+=v[0]*r;p+=v[1]*r;c+=v[2]*r;f+=v[3]*r;});
  return {kcal:Math.round(k),p:Math.round(p),c:Math.round(c),f:Math.round(f)};
}
const RECIPES=[
 /* ---------- SHAKES ---------- */
 {id:'pbshake',cat:'Shakes',tags:['bulk'],icon:'🥜',name:'Chocolate Peanut Butter Banana Shake',time:'5 min',serves:1,
  blurb:'Tastes like a peanut-butter-cup milkshake. The easiest 850 calories you’ll ever drink.',
  items:[['milk_whole',488,'2 cups (488 g) whole milk'],['whey',31,'1 scoop (31 g) chocolate whey'],['banana',118,'1 medium banana, frozen in chunks'],['peanut_butter',32,'2 tbsp (32 g) creamy peanut butter'],['oats',40,'½ cup (40 g) rolled oats'],['zero',0,'4–5 ice cubes']],
  steps:['Blend the dry oats alone for 10 seconds so they turn to powder — no grainy texture.','Add milk, whey, frozen banana, peanut butter and ice.','Blend 45–60 seconds until thick and smooth.']},
 {id:'cheesecake',cat:'Shakes',tags:['cut'],icon:'🍓',name:'Strawberry Cheesecake Shake',time:'5 min',serves:1,
  blurb:'Greek yogurt gives it the tang of real cheesecake; the graham cracker is the crust.',
  items:[['almond_milk',240,'1 cup (240 ml) unsweetened almond milk'],['whey',31,'1 scoop (31 g) vanilla whey'],['greek_nf',170,'¾ cup (170 g) nonfat plain Greek yogurt'],['strawberries',150,'1 heaping cup (150 g) frozen strawberries'],['graham',14,'1 graham cracker sheet (14 g)'],['zero',0,'½ tsp vanilla extract + a pinch of salt']],
  steps:['Blend almond milk, whey, yogurt, strawberries, vanilla and salt for 45 seconds.','Crumble half the graham cracker in and pulse twice.','Pour and crumble the rest on top.']},
 {id:'cookiescream',cat:'Shakes',tags:['bulk'],icon:'🍪',name:'Cookies & Cream Shake',time:'5 min',serves:1,
  blurb:'Vanilla shake with real cookie chunks — dessert that happens to have 49 g of protein.',
  items:[['milk_2',366,'1½ cups (366 g) 2% milk'],['whey',31,'1 scoop (31 g) vanilla whey'],['greek_nf',113,'½ cup (113 g) nonfat Greek yogurt'],['cookie_sandwich',34,'3 chocolate sandwich cookies (34 g)'],['zero',0,'4–5 ice cubes']],
  steps:['Blend milk, whey, yogurt and ice until smooth.','Add 2 cookies and pulse 3–4 times so chunks remain.','Crumble the third cookie on top.']},
 {id:'mango',cat:'Shakes',tags:['cut'],icon:'🥭',name:'Tropical Mango Smoothie',time:'5 min',serves:1,
  blurb:'Bright, cold and fruity — mango and pineapple with a squeeze of lime.',
  items:[['mango',140,'1 cup (140 g) frozen mango'],['pineapple',80,'½ cup (80 g) pineapple chunks'],['greek_nf',170,'¾ cup (170 g) nonfat Greek yogurt'],['whey',31,'1 scoop (31 g) vanilla whey'],['almond_milk',240,'1 cup (240 ml) unsweetened almond milk'],['lemon_juice',10,'2 tsp lime or lemon juice']],
  steps:['Add everything to the blender, liquid first.','Blend 45–60 seconds until smooth.','Add a splash more almond milk if it’s too thick.']},
 {id:'chocmilk',cat:'Shakes',tags:['bulk','cut'],icon:'🏈',name:'Post-Practice Chocolate Milk',time:'1 min',serves:1,
  blurb:'Cheap, proven recovery: fast carbs plus protein. Add the whey for a bigger protein hit.',
  items:[['choc_milk_lf',500,'2 cups (500 ml) lowfat chocolate milk'],['whey',31,'1 scoop (31 g) chocolate whey']],
  steps:['Shake both in a shaker bottle for 15 seconds.','Drink within an hour after training.']},
 /* ---------- BREAKFAST ---------- */
 {id:'pbjoats',cat:'Breakfast',tags:['bulk','cut'],icon:'🥣',name:'PB&J Overnight Oats',time:'5 min + overnight',serves:1,
  blurb:'Tastes like a peanut butter and jelly sandwich in a jar. Make it at night, grab it in the morning.',
  items:[['oats',40,'½ cup (40 g) rolled oats'],['milk_2',122,'½ cup (122 g) 2% milk'],['greek_nf',113,'½ cup (113 g) nonfat Greek yogurt'],['whey',15,'½ scoop (15 g) vanilla whey'],['chia',12,'1 tbsp (12 g) chia seeds'],['peanut_butter',16,'1 tbsp (16 g) peanut butter'],['jam',20,'1 tbsp (20 g) strawberry jam']],
  steps:['Stir oats, milk, yogurt, whey and chia together in a jar until no powder is left.','Swirl the peanut butter and jam on top.','Cover and refrigerate overnight (at least 4 hours). Eat cold.']},
 {id:'burrito',cat:'Breakfast',tags:['bulk'],icon:'🌯',name:'Big Breakfast Burrito',time:'12 min',serves:1,
  blurb:'Soft scrambled eggs, melty cheddar, black beans, salsa and avocado in a toasted tortilla.',
  items:[['tortilla',72,'1 large 10-inch flour tortilla (72 g)'],['egg',150,'3 large eggs'],['cheddar',28,'¼ cup (28 g) shredded cheddar'],['black_beans',60,'⅓ cup (60 g) black beans, rinsed'],['salsa',32,'2 tbsp (32 g) salsa'],['avocado',35,'¼ avocado (35 g), sliced'],['butter',5,'1 tsp (5 g) butter']],
  steps:['Warm the beans in a small pot or the microwave (45 sec).','Melt the butter in a nonstick pan over medium-low. Whisk the eggs with a pinch of salt and cook, stirring gently, until just set (2–3 min).','Turn off the heat and fold in the cheddar.','Warm the tortilla 15 seconds, fill with eggs, beans, salsa and avocado, and roll tight.','Toast seam-side down in the pan for 1 minute so it holds together.']},
 {id:'scramble',cat:'Breakfast',tags:['cut'],icon:'🍳',name:'Veggie Egg Scramble & Toast',time:'10 min',serves:1,
  blurb:'A huge, filling plate for under 400 calories — peppers, spinach and melty mozzarella.',
  items:[['egg',50,'1 large egg'],['egg_white',180,'¾ cup (180 g) liquid egg whites'],['spinach',30,'1 cup (30 g) baby spinach'],['bell_pepper',60,'½ bell pepper (60 g), diced'],['mozz_ps',28,'¼ cup (28 g) shredded part-skim mozzarella'],['bread_ww',32,'1 slice whole-wheat toast'],['salsa',32,'2 tbsp (32 g) salsa']],
  steps:['Coat a nonstick pan with cooking spray over medium heat. Cook the pepper 2–3 minutes.','Add spinach and stir until wilted (30 sec).','Pour in the whisked egg and egg whites; stir slowly until softly set.','Sprinkle the mozzarella on top, season with salt and pepper, and serve with toast and salsa.']},
 {id:'pancakes',cat:'Breakfast',tags:['bulk','cut'],icon:'🥞',name:'Banana Oat Protein Pancakes',time:'15 min',serves:1,
  blurb:'Fluffy, sweet banana pancakes with blueberries and real maple syrup. Makes 5–6 small pancakes.',
  items:[['oats',40,'½ cup (40 g) rolled oats'],['banana',118,'1 ripe medium banana'],['egg',100,'2 large eggs'],['whey',15,'½ scoop (15 g) vanilla whey'],['zero',0,'½ tsp baking powder, ½ tsp cinnamon, pinch of salt'],['maple',20,'1 tbsp (20 g) maple syrup'],['blueberries',74,'½ cup (74 g) blueberries']],
  steps:['Blend the oats into flour (10 sec).','Add banana, eggs, whey, baking powder, cinnamon and salt; blend 20 seconds. Let the batter rest 5 minutes.','Cook ¼-cup scoops on a greased nonstick pan over medium-low. Flip when bubbles form (about 2 min), then 1 more minute.','Top with blueberries and maple syrup.']},
 /* ---------- MEALS ---------- */
 {id:'bowl',cat:'Meals',tags:['bulk','cut'],icon:'🌶️',name:'Chicken Burrito Bowl',time:'25 min',serves:1,
  blurb:'Chipotle at home: chili-cumin chicken, lime rice, black beans, salsa, cheese and avocado.',
  items:[['chicken_breast',170,'6 oz (170 g) raw chicken breast'],['rice_cooked',158,'1 cup (158 g) cooked white rice'],['black_beans',86,'½ cup (86 g) black beans, rinsed'],['salsa',64,'¼ cup (64 g) salsa'],['cheddar',14,'2 tbsp (14 g) shredded cheddar'],['avocado',35,'¼ avocado (35 g)'],['olive_oil',4.5,'1 tsp olive oil'],['zero',0,'1 tsp chili powder, ½ tsp cumin, ½ tsp garlic powder, salt, ½ lime']],
  steps:['Rub the chicken with chili powder, cumin, garlic powder and salt.','Cook in the oil over medium-high, 5–6 minutes per side, until it reaches 165°F. Rest 5 minutes, then slice.','Squeeze the lime over the rice and fluff.','Build the bowl: rice, beans, chicken, salsa, cheese, avocado.']},
 {id:'honeygarlic',cat:'Meals',tags:['bulk'],icon:'🍯',name:'Honey Garlic Chicken & Rice',time:'25 min',serves:1,
  blurb:'Sticky, sweet-salty glazed chicken thighs over rice with broccoli. Takeout flavor, real-food macros.',
  items:[['chicken_thigh',170,'6 oz (170 g) boneless skinless chicken thighs'],['rice_cooked',237,'1½ cups (237 g) cooked white rice'],['broccoli',91,'1 cup (91 g) broccoli florets'],['honey',21,'1 tbsp (21 g) honey'],['soy_sauce',24,'1½ tbsp low-sodium soy sauce'],['garlic',6,'2 cloves garlic, minced'],['olive_oil',4.5,'1 tsp olive oil']],
  steps:['Whisk honey, soy sauce, garlic and 2 tbsp water.','Sear the thighs in the oil over medium-high, 5–6 minutes per side, to 175°F.','Pour the sauce into the pan for the last 2 minutes and flip the chicken until it’s sticky and glazed.','Steam the broccoli 4 minutes. Slice the chicken over the rice and spoon the sauce over everything.']},
 {id:'tacobowl',cat:'Meals',tags:['cut'],icon:'🌮',name:'Turkey Taco Bowl',time:'15 min',serves:1,
  blurb:'All the taco flavor over crunchy romaine — big portion, low calories, 45+ g protein.',
  items:[['turkey_93',170,'6 oz (170 g) 93% lean ground turkey'],['romaine',94,'2 cups (94 g) chopped romaine'],['tomato',90,'½ cup (90 g) diced tomato'],['black_beans',43,'¼ cup (43 g) black beans'],['salsa',64,'¼ cup (64 g) salsa'],['greek_nf',35,'2 tbsp (35 g) nonfat Greek yogurt (sour-cream swap)'],['cheddar',14,'2 tbsp (14 g) shredded cheddar'],['zero',0,'1 tsp chili powder, ½ tsp cumin, ½ tsp paprika, ¼ tsp garlic powder, salt']],
  steps:['Brown the turkey in a nonstick pan over medium-high, breaking it up, 6–7 minutes.','Add the spices and 3 tbsp water; simmer 2 minutes until saucy.','Pile onto the romaine with tomato, beans, salsa, yogurt and cheese.']},
 {id:'bolognese',cat:'Meals',tags:['bulk'],icon:'🍝',name:'Beef Bolognese Pasta',time:'25 min',serves:1,
  blurb:'Rich meat sauce with garlic and onion over pasta, finished with parmesan.',
  items:[['pasta_dry',85,'3 oz (85 g) dry spaghetti or rigatoni'],['beef_90',113,'4 oz (113 g) 90% lean ground beef'],['marinara',125,'½ cup (125 g) marinara sauce'],['onion',40,'¼ onion (40 g), finely diced'],['garlic',3,'1 clove garlic, minced'],['parmesan',10,'2 tbsp (10 g) grated parmesan'],['olive_oil',4.5,'1 tsp olive oil']],
  steps:['Boil the pasta in salted water according to the package.','Meanwhile cook the onion in the oil over medium for 3 minutes, add garlic for 30 seconds, then brown the beef (5 min).','Add the marinara and a splash of pasta water; simmer 5 minutes.','Toss with the drained pasta and top with parmesan.']},
 {id:'salmon',cat:'Meals',tags:['bulk','cut'],icon:'🐟',name:'Sheet-Pan Lemon Salmon & Potatoes',time:'35 min',serves:1,
  blurb:'Crispy paprika potatoes, garlicky lemon salmon and green beans — one pan, no fuss.',
  items:[['salmon',142,'5 oz (142 g) salmon fillet'],['potato',200,'200 g baby potatoes, halved'],['green_beans',100,'1 heaping cup (100 g) green beans'],['olive_oil',9,'2 tsp olive oil (divided)'],['lemon_juice',15,'1 tbsp lemon juice'],['garlic',3,'1 clove garlic, minced'],['zero',0,'½ tsp paprika, salt and pepper']],
  steps:['Heat the oven to 425°F. Toss the potatoes with 1 tsp oil, paprika and salt; roast 15 minutes.','Push the potatoes aside. Add the green beans (tossed in ½ tsp oil) and the salmon brushed with ½ tsp oil, garlic, lemon, salt and pepper.','Roast 12–14 minutes until the salmon flakes easily (145°F).']},
 {id:'stirfry',cat:'Meals',tags:['cut'],icon:'🍤',name:'Garlic Shrimp Stir-Fry',time:'15 min',serves:1,
  blurb:'Garlic-ginger shrimp with crisp broccoli and peppers in a light soy glaze.',
  items:[['shrimp',170,'6 oz (170 g) raw shrimp, peeled'],['broccoli',91,'1 cup (91 g) broccoli florets'],['bell_pepper',120,'1 bell pepper (120 g), sliced'],['rice_cooked',119,'¾ cup (119 g) cooked white rice'],['soy_sauce',16,'1 tbsp low-sodium soy sauce'],['honey',7,'1 tsp honey'],['sesame_oil',4.5,'1 tsp sesame oil'],['garlic',6,'2 cloves garlic, minced'],['zero',0,'1 tsp grated ginger']],
  steps:['Whisk soy sauce, honey, garlic, ginger and 2 tbsp water.','Heat the sesame oil in a large pan over high. Stir-fry broccoli and pepper 3 minutes.','Add the shrimp and cook 2–3 minutes until pink.','Pour in the sauce, toss 30 seconds, and serve over the rice.']},
 {id:'tunamelt',cat:'Meals',tags:['bulk','cut'],icon:'🥪',name:'Tuna Melt',time:'10 min',serves:1,
  blurb:'Crispy golden bread, creamy tuna and melted cheddar — a diner classic with 45 g protein.',
  items:[['tuna_water',113,'1 can (5 oz) tuna in water, drained (113 g)'],['greek_nf',35,'2 tbsp (35 g) nonfat Greek yogurt'],['mustard',5,'1 tsp Dijon mustard'],['bread_ww',64,'2 slices whole-wheat bread'],['cheddar',21,'1 slice (21 g) cheddar'],['butter',5,'1 tsp (5 g) butter'],['zero',0,'Squeeze of lemon, black pepper']],
  steps:['Mix tuna, yogurt, mustard, lemon and pepper.','Spread on one slice of bread, top with cheddar and the second slice.','Melt the butter in a pan over medium; cook 3 minutes per side until golden and the cheese melts.']},
 {id:'bbqwrap',cat:'Meals',tags:['bulk','cut'],icon:'🔥',name:'BBQ Chicken Wrap',time:'20 min',serves:1,
  blurb:'Smoky-sweet BBQ chicken, cheddar and crunchy lettuce in a warm tortilla.',
  items:[['chicken_breast',142,'5 oz (142 g) raw chicken breast'],['tortilla',72,'1 large 10-inch flour tortilla'],['bbq_sauce',34,'2 tbsp (34 g) BBQ sauce'],['cheddar',14,'2 tbsp (14 g) shredded cheddar'],['romaine',47,'1 cup (47 g) shredded romaine'],['tomato',45,'¼ cup (45 g) diced tomato']],
  steps:['Season and cook the chicken (5–6 min per side to 165°F), then chop it.','Toss the warm chicken in the BBQ sauce.','Warm the tortilla, fill with chicken, cheese, lettuce and tomato, and roll tight.']},
 /* ---------- SNACKS ---------- */
 {id:'yogurtbowl',cat:'Snacks',tags:['cut'],icon:'🫐',name:'Greek Yogurt Berry Crunch',time:'2 min',serves:1,
  items:[['greek_nf',227,'1 cup (227 g) nonfat Greek yogurt'],['blueberries',74,'½ cup (74 g) blueberries'],['granola',15,'2 tbsp (15 g) granola'],['honey',7,'1 tsp honey']],
  blurb:'Creamy, crunchy and sweet — 25 g protein for about 230 calories.',steps:['Spoon the yogurt into a bowl, top with blueberries and granola, drizzle with honey.']},
 {id:'cottage',cat:'Snacks',tags:['cut'],icon:'🍍',name:'Cottage Cheese & Pineapple',time:'1 min',serves:1,
  items:[['cottage_2',226,'1 cup (226 g) 2% cottage cheese'],['pineapple',82,'½ cup (82 g) pineapple chunks'],['zero',0,'Pinch of cinnamon']],
  blurb:'Sweet-and-salty classic. Slow-digesting protein — great before bed.',steps:['Top the cottage cheese with pineapple and a pinch of cinnamon.']},
 {id:'ricecakes',cat:'Snacks',tags:['bulk'],icon:'🍌',name:'PB Banana Rice Cakes',time:'2 min',serves:1,
  items:[['rice_cake',18,'2 plain rice cakes (18 g)'],['peanut_butter',32,'2 tbsp (32 g) peanut butter'],['banana',118,'1 medium banana, sliced'],['honey',7,'1 tsp honey']],
  blurb:'Crunchy, salty-sweet, and a perfect quick-carb snack 45–60 minutes before training.',steps:['Spread 1 tbsp peanut butter on each rice cake.','Top with banana slices and a drizzle of honey.']},
 {id:'rollups',cat:'Snacks',tags:['cut'],icon:'🧀',name:'Turkey & Cheese Roll-Ups',time:'3 min',serves:1,
  items:[['deli_turkey',85,'3 oz (85 g) sliced turkey breast'],['mozz_ps',28,'1 part-skim string cheese (28 g)'],['cucumber',52,'½ cup (52 g) cucumber spears'],['mustard',5,'1 tsp mustard']],
  blurb:'Grab-and-go protein for 200 calories.',steps:['Brush a little mustard on each turkey slice.','Roll each slice around a strip of string cheese and a cucumber spear.']},
 {id:'trailmix',cat:'Snacks',tags:['bulk'],icon:'🥨',name:'Sweet & Salty Trail Mix',time:'2 min',serves:1,
  items:[['almonds',28,'¼ cup (28 g) almonds'],['pretzels',15,'¼ cup (15 g) mini pretzels'],['raisins',20,'2 tbsp (20 g) raisins'],['choc_chips',15,'1 tbsp (15 g) semi-sweet chocolate chips']],
  blurb:'Easy calories to keep in your bag between school and practice.',steps:['Mix everything in a bag or container.']},
];
RECIPES.forEach(r=>{r.m=macros(r.items);});
const recipeById=id=>RECIPES.find(r=>r.id===id)||S.customRecipes.find(r=>r.id===id);

/* ---------- PRE-WORKOUT: one per PPL training day ---------- */
/* ---------- PRE-WORKOUT SNACKS — one quick snack per training day ---------- */
const PRE_SNACK={
 d1:{title:'Banana + peanut butter',timing:'30–60 min before',items:[['banana',118,'1 medium banana'],['peanut_butter',16,'1 tbsp peanut butter']]},
 d2:{title:'Greek yogurt + honey',timing:'45–60 min before',items:[['greek_nf',170,'1 cup (170 g) nonfat Greek yogurt'],['honey',21,'1 tbsp honey, stirred in']]},
 d3:{title:'Bagel with jam',timing:'60–90 min before',items:[['bagel',105,'1 plain bagel, toasted'],['jam',20,'1 tbsp jam']]},
 d5:{title:'Apple, string cheese + pretzels',timing:'30–60 min before',items:[['apple',182,'1 medium apple'],['mozz_ps',28,'1 string cheese'],['pretzels',28,'1 small handful (28 g) pretzels']]},
 d6:{title:'Oatmeal with banana + honey',timing:'60 min before',items:[['oats',40,'½ cup (40 g) oats, microwaved with water'],['banana',59,'½ banana, sliced'],['honey',7,'1 tsp honey']]},
};
Object.values(PRE_SNACK).forEach(p=>{p.m=macros(p.items);});

/* ---------- POST-WORKOUT MEALS (one per training day; cut / maintain / bulk) ---------- */
const RECOVERY_SHAKE={title:'Recovery shake',timing:'Right after training — best if dinner is 2+ hours away',items:[['choc_milk_lf',250,'1 cup (250 ml) low-fat chocolate milk'],['whey',31,'1 scoop (31 g) chocolate whey'],['banana',118,'1 medium banana — blend with ice']]};
const POSTWORKOUT={
 d1:{title:'Teriyaki Chicken & Broccoli Rice Bowl',timing:'Within 1–2 hours after training',why:'Rebuilds the chest, shoulders and triceps you just trained — lean protein, plus rice to refill what heavy pressing burned.',
  base:[['chicken_breast',170,'6 oz (170 g) raw chicken breast, sliced and pan-seared'],['rice_cooked',237,'1½ cups (237 g) cooked white rice'],['broccoli',91,'1 cup (91 g) broccoli florets, steamed'],['soy_sauce',16,'1 tbsp soy sauce'],['honey',14,'2 tsp (14 g) honey — whisk with the soy sauce and garlic for the glaze'],['garlic',3,'1 clove garlic, minced'],['sesame_oil',4.5,'1 tsp sesame oil']],
  cut:[['chicken_breast',170,'6 oz (170 g) raw chicken breast, sliced and seared with cooking spray'],['rice_cooked',158,'1 cup (158 g) cooked white rice'],['broccoli',182,'2 cups (182 g) broccoli florets, steamed'],['soy_sauce',16,'1 tbsp soy sauce'],['honey',7,'1 tsp honey'],['garlic',3,'1 clove garlic, minced']],
  bulk:[['chicken_breast',198,'7 oz (198 g) raw chicken breast, sliced and pan-seared'],['rice_cooked',316,'2 cups (316 g) cooked white rice'],['broccoli',91,'1 cup (91 g) broccoli florets'],['soy_sauce',16,'1 tbsp soy sauce'],['honey',21,'1 tbsp (21 g) honey'],['garlic',3,'1 clove garlic, minced'],['sesame_oil',9,'2 tsp sesame oil'],['milk_whole',244,'1 cup (244 g) whole milk on the side']],
  alts:[RECOVERY_SHAKE,{title:'Honey Garlic Chicken',timing:'Within 1–2 hours',recipe:'honeygarlic'}]},
 d2:{title:'Chicken Marinara Pasta',timing:'Within 1–2 hours after training',why:'Lots of back and arm volume drains your stored carbs — pasta refills them while chicken covers the protein.',
  base:[['pasta_dry',85,'3 oz (85 g) dry penne or spaghetti'],['chicken_breast',142,'5 oz (142 g) raw chicken breast, diced and browned'],['marinara',125,'½ cup (125 g) marinara sauce'],['spinach',30,'1 cup (30 g) baby spinach, stirred in to wilt'],['parmesan',10,'2 tbsp (10 g) grated parmesan']],
  cut:[['pasta_dry',56,'2 oz (56 g) dry penne'],['chicken_breast',142,'5 oz (142 g) raw chicken breast, diced'],['marinara',125,'½ cup (125 g) marinara sauce'],['spinach',60,'2 cups (60 g) baby spinach'],['parmesan',5,'1 tbsp (5 g) grated parmesan']],
  bulk:[['pasta_dry',113,'4 oz (113 g) dry penne'],['chicken_breast',170,'6 oz (170 g) raw chicken breast, diced'],['marinara',125,'½ cup (125 g) marinara sauce'],['olive_oil',4.5,'1 tsp olive oil to brown the chicken'],['spinach',30,'1 cup (30 g) baby spinach'],['parmesan',15,'3 tbsp (15 g) grated parmesan'],['milk_whole',244,'1 cup (244 g) whole milk']],
  alts:[RECOVERY_SHAKE,{title:'Garlic Shrimp Stir-Fry',timing:'Within 1–2 hours',recipe:'stirfry'}]},
 d3:{title:'Salmon, Roasted Potatoes & Green Beans',timing:'Within 1–2 hours after training',why:'Leg day empties your energy stores more than any other session — big carbs from potatoes, protein and omega-3 fats from salmon.',
  base:[['salmon',170,'6 oz (170 g) raw salmon fillet, baked at 400°F for 12–14 min'],['potato',300,'1 large potato (300 g), cubed and roasted at 425°F for 25 min'],['olive_oil',4.5,'1 tsp olive oil for the potatoes'],['green_beans',100,'1 cup (100 g) green beans'],['lemon_juice',15,'1 tbsp lemon juice, plus salt, pepper and garlic powder']],
  cut:[['salmon',142,'5 oz (142 g) raw salmon fillet, baked'],['potato',213,'1 medium potato (213 g), roasted with cooking spray'],['green_beans',150,'1½ cups (150 g) green beans'],['lemon_juice',15,'1 tbsp lemon juice, salt and pepper']],
  bulk:[['salmon',170,'6 oz (170 g) raw salmon fillet, baked'],['potato',400,'1 extra-large potato (400 g), roasted'],['olive_oil',9,'2 tsp olive oil'],['green_beans',100,'1 cup (100 g) green beans'],['lemon_juice',15,'1 tbsp lemon juice'],['choc_milk_lf',250,'1 cup (250 ml) low-fat chocolate milk']],
  alts:[{title:'Chicken burrito bowl',timing:'Within 1–2 hours',recipe:'bowl'},{title:'Chocolate milk + PB&J',timing:'Right after, when you’re on the go',items:[['choc_milk_lf',250,'1 cup (250 ml) low-fat chocolate milk'],['bread_ww',64,'2 slices whole-wheat bread'],['peanut_butter',16,'1 tbsp (16 g) peanut butter'],['jam',20,'1 tbsp (20 g) strawberry jam']]}]},
 d5:{title:'Shrimp & Veggie Fried Rice',timing:'Within 1–2 hours after training',why:'Your longest session — this rebuilds chest, back and shoulders, and it’s one pan in about 10 minutes.',
  base:[['shrimp',170,'6 oz (170 g) raw peeled shrimp'],['rice_cooked',237,'1½ cups (237 g) cooked rice — day-old rice fries best'],['egg',50,'1 large egg, scrambled in the pan'],['bell_pepper',75,'½ cup (75 g) diced bell pepper'],['onion',40,'¼ cup (40 g) diced onion'],['soy_sauce',24,'1½ tbsp soy sauce'],['sesame_oil',4.5,'1 tsp sesame oil']],
  cut:[['shrimp',170,'6 oz (170 g) raw peeled shrimp'],['rice_cooked',158,'1 cup (158 g) cooked rice'],['egg_white',60,'¼ cup (60 g) liquid egg whites'],['bell_pepper',150,'1 cup (150 g) diced bell pepper'],['onion',40,'¼ cup (40 g) diced onion'],['soy_sauce',24,'1½ tbsp soy sauce'],['sesame_oil',2.3,'½ tsp sesame oil']],
  bulk:[['shrimp',198,'7 oz (198 g) raw peeled shrimp'],['rice_cooked',316,'2 cups (316 g) cooked rice'],['egg',100,'2 large eggs, scrambled in'],['bell_pepper',75,'½ cup (75 g) diced bell pepper'],['onion',40,'¼ cup (40 g) diced onion'],['soy_sauce',24,'1½ tbsp soy sauce'],['sesame_oil',9,'2 tsp sesame oil'],['milk_whole',244,'1 cup (244 g) whole milk']],
  alts:[RECOVERY_SHAKE,{title:'Greek yogurt bowl',timing:'Within 1 hour',recipe:'yogurtbowl'}]},
 d6:{title:'Chicken Quesadilla with Black Beans & Salsa',timing:'Within 1–2 hours after training',why:'Second leg day — carbs from the tortilla and beans refill your legs, chicken and cheese cover protein. Tastes like a Friday-night treat.',
  base:[['tortilla',72,'1 large 10-inch flour tortilla'],['chicken_breast',142,'5 oz (142 g) raw chicken breast, cooked and shredded'],['cheddar',28,'¼ cup (28 g) shredded cheddar'],['bell_pepper',50,'⅓ cup (50 g) sautéed bell pepper'],['black_beans',86,'½ cup (86 g) black beans, rinsed and warmed'],['salsa',64,'¼ cup (64 g) salsa for dipping']],
  cut:[['tortilla',49,'1 medium 8-inch flour tortilla (49 g)'],['chicken_breast',142,'5 oz (142 g) raw chicken breast, cooked and shredded'],['mozz_ps',21,'3 tbsp (21 g) shredded part-skim mozzarella'],['bell_pepper',75,'½ cup (75 g) sautéed bell pepper'],['black_beans',86,'½ cup (86 g) black beans'],['salsa',64,'¼ cup (64 g) salsa']],
  bulk:[['tortilla',144,'2 large 10-inch flour tortillas'],['chicken_breast',170,'6 oz (170 g) raw chicken breast, cooked and shredded'],['cheddar',42,'⅓ cup (42 g) shredded cheddar'],['bell_pepper',50,'⅓ cup (50 g) sautéed bell pepper'],['black_beans',130,'¾ cup (130 g) black beans'],['avocado',50,'⅓ avocado (50 g), sliced'],['salsa',64,'¼ cup (64 g) salsa']],
  alts:[{title:'BBQ Chicken Wrap',timing:'Within 1–2 hours',recipe:'bbqwrap'},RECOVERY_SHAKE]},
};
Object.values(POSTWORKOUT).forEach(p=>{p.mBase=macros(p.base);p.mCut=macros(p.cut);p.mBulk=macros(p.bulk);p.alts.forEach(a=>{a.m=a.recipe?recipeById(a.recipe).m:macros(a.items);});});
/* how much protein and carbs this post-workout meal should carry, scaled to body weight */
function postTargets(dayKey,mode){
  const lb=Number(S.profile.weightLb)||0;const legs=dayKey==='d3'||dayKey==='d6';
  if(!lb)return {p:'30–45',c:legs?'70–120':'50–100',personal:false};
  const kg=lb/2.2046;const t=typeof nutritionTargets==='function'?nutritionTargets(mode==='base'?'maintain':mode):null;
  const pr=t?Math.max(25,Math.min(60,Math.round(t.protein/4/5)*5)):Math.max(25,Math.min(50,Math.round(kg*.4/5)*5));
  const cr=(mode==='cut'?.5:mode==='bulk'?1.1:.8)+(legs?.2:0);
  return {p:pr,c:Math.round(kg*cr/5)*5,personal:true};
}

/* ---------- FULL-DAY MEAL PLANS (flex meals scale in ½-serving steps to hit your target) ---------- */
const MEALPLANS={
 cut:[{slot:'Breakfast',recipe:'scramble',flex:false},{slot:'Lunch',recipe:'bowl',flex:true},{slot:'Pre-workout',recipe:'cottage',flex:false},
      {slot:'Post-workout',recipe:'cheesecake',flex:true},{slot:'Dinner',recipe:'stirfry',flex:true},{slot:'Evening',recipe:'yogurtbowl',flex:true}],
 bulk:[{slot:'Breakfast',recipe:'burrito',flex:false},{slot:'Lunch',recipe:'honeygarlic',flex:true},{slot:'Pre-workout',recipe:'ricecakes',flex:true},
      {slot:'Post-workout',recipe:'pbshake',flex:true},{slot:'Dinner',recipe:'bolognese',flex:true},{slot:'Before bed',recipe:'pbjoats',flex:true}],
};
const ADDONS=[
 {id:'bagel',label:'1 plain bagel with 1 tbsp honey',items:[['bagel',105],['honey',21]],modes:['cut','bulk']},
 {id:'oats',label:'½ cup oats cooked in 1 cup 2% milk + 1 tsp honey',items:[['oats',40],['milk_2',244],['honey',7]],modes:['cut','bulk']},
 {id:'rice',label:'1 cup cooked white rice with lunch or dinner',items:[['rice_cooked',158]],modes:['cut','bulk']},
 {id:'pb',label:'2 tbsp peanut butter (on toast or in a shake)',items:[['peanut_butter',32]],modes:['bulk']},
 {id:'milk',label:'1 cup whole milk',items:[['milk_whole',244]],modes:['bulk']},
 {id:'oj',label:'1 cup orange juice',items:[['orange_juice',248]],modes:['cut','bulk']},
 {id:'banana',label:'1 medium banana',items:[['banana',118]],modes:['cut','bulk']},
];
ADDONS.forEach(a=>a.m=macros(a.items));
function buildMealPlan(mode,t){
  const target=t&&t.cal?t.cal:t,protT=t&&t.protein?t.protein:0;
  const plan=MEALPLANS[mode].map(m=>Object.assign({},m,{servings:1}));const adds=[];
  const tot=()=>{const s={kcal:0,p:0,c:0,f:0};plan.forEach(m=>{const r=recipeById(m.recipe).m;['kcal','p','c','f'].forEach(k=>s[k]+=r[k]*m.servings);});adds.forEach(a=>['kcal','p','c','f'].forEach(k=>s[k]+=a.m[k]));return s;};
  const dens=m=>{const r=recipeById(m.recipe).m;return r.p/r.kcal;};
  if(target){
    for(let g=0;g<40;g++){
      const T=tot();const D=target-T.kcal;if(Math.abs(D)<100)break;
      if(D>0){
        if(T.p<protT*.95){const f=plan.filter(m=>m.flex&&m.servings<2).sort((a,b)=>dens(b)-dens(a))[0];if(f){f.servings+=.5;continue;}}
        const used=id=>adds.filter(a=>a.id===id).length;
        const opt=ADDONS.filter(a=>a.modes.includes(mode)&&used(a.id)<2&&a.m.kcal<=D+80).sort((a,b)=>b.m.kcal-a.m.kcal)[0];
        if(opt){adds.push(opt);continue;}
        const f=plan.filter(m=>m.flex&&m.servings<2).sort((a,b)=>recipeById(a.recipe).m.kcal-recipeById(b.recipe).m.kcal)[0];
        if(f&&recipeById(f.recipe).m.kcal*.5<=D+80){f.servings+=.5;continue;}
        break;
      }else{
        const f=plan.filter(m=>m.flex&&m.servings>.5).sort((a,b)=>dens(a)-dens(b))[0];if(!f)break;
        const before=Math.abs(D);f.servings-=.5;if(Math.abs(target-tot().kcal)>=before){f.servings+=.5;break;}
      }
    }
  }
  /* final polish: swap half a serving for a smaller side if that lands closer */
  if(target&&Math.abs(target-tot().kcal)>=100){
    let best=Math.abs(target-tot().kcal),move=null;
    plan.filter(m=>m.flex&&m.servings>.5).forEach(m=>{ADDONS.filter(a=>a.modes.includes(mode)).forEach(a=>{
      m.servings-=.5;adds.push(a);const d=Math.abs(target-tot().kcal);adds.pop();m.servings+=.5;
      if(d<best){best=d;move={m,a};}});});
    if(move){move.m.servings-=.5;adds.push(move.a);}
  }
  const sum=tot();Object.keys(sum).forEach(k=>sum[k]=Math.round(sum[k]));
  const addGroups={};adds.forEach(a=>{addGroups[a.id]=addGroups[a.id]||{a,n:0};addGroups[a.id].n++;});
  return {plan,adds:Object.values(addGroups),sum};
}

/* ---------- REST-DAY RECOVERY (Days 4 and 7) ---------- */
const RECOVERY={
 d4:{title:'Day 4 — Mid-week recovery',focus:'Your legs worked hard yesterday and Push + Pull is tomorrow. Today is about moving blood, not adding fatigue.'},
 d7:{title:'Day 7 — Full reset',focus:'Six days down. Today you refuel, sleep, and set up the week so tomorrow’s heavy bench feels strong.'},
 sections:[
  {h:'Sleep',icon:'😴',items:['Teens: 8–10 hours. Adults: 7–9. This is when the muscle actually gets built.','Same bedtime and wake time all week — weekends included.','Cool, dark room; phone off and away 30–60 minutes before bed.','A 20–30 minute nap before 3 pm is fine if you’re short on sleep.']},
  {h:'Walking & light cardio',icon:'🚶',items:['20–40 minute easy walk (aim for 7–9k steps today).','Or 15–20 minutes on the bike at an easy, conversational pace.','Keep it easy: if you can’t talk in full sentences, slow down.']},
  {h:'Stretching & mobility (10–12 min)',icon:'🧘',items:['Couch / hip-flexor stretch — 45 sec each side','Hamstring stretch (one leg on a bench) — 45 sec each side','Adductor rock-backs — 10 each side','Doorway pec stretch — 45 sec','Lat stretch on a rack or door frame — 30 sec each side','Thoracic open-book — 8 each side','Ankle knee-to-wall — 10 each side','Easy foam rolling on quads, glutes, lats and upper back — 30–60 sec per area']},
  {h:'Hydration',icon:'💧',items:['Baseline: about half your body weight (lb) in ounces of water — a 200 lb athlete ≈ 100 oz.','Add 16–24 oz on hot days or if you’re sweating at practice.','Check your urine: pale yellow means you’re hydrated.']},
  {h:'Rest-day nutrition',icon:'🍽️',items:['Don’t slash food on rest days — recovery happens today. Eat close to your normal target.','On a bulk, keep the surplus; on a cut, keep the same moderate deficit — no bigger.','Fill half the plate with fruit and vegetables for vitamins and fiber.','Good rest-day meals: Turkey Taco Bowl, Sheet-Pan Salmon, Tuna Melt (see Recipes).']},
  {h:'Protein',icon:'🥩',items:['Same daily protein target as training days.','Spread it over 4–5 meals of roughly 25–40 g each.','Slow protein before bed helps overnight: Greek yogurt or cottage cheese.']},
  {h:'Recovery strategies',icon:'🔋',items:['Light foam rolling and the mobility routine above.','A warm shower or bath before bed helps you fall asleep.','Get some daylight outside — it helps you sleep better tonight.','Day 7: plan and prep the week’s meals and pack your gym bag for tomorrow’s Push day.']},
  {h:'Avoid today',icon:'⛔',items:['Heavy lifting or "just a quick chest pump"','Hard conditioning, sprints or HIIT','Max-effort pickup games','Late nights and skipping meals','Energy drinks and other stimulants']},
 ]
};
