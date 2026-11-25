import asyncio,sys,json
sys.path.insert(0,'qa')
from harness import *
MOBILE = (sys.argv[1] if len(sys.argv)>1 else 'mobile')=='mobile'
P='m' if MOBILE else 'd'
log=[]
def ok(c,msg):
    log.append(('PASS ' if c else 'FAIL ')+msg); print(('  PASS ' if c else '  FAIL ')+msg)
async def shot(pg,name,full=False):
    await pg.wait_for_timeout(450); await pg.screenshot(path=f'shots/e_{P}_{name}.png',full_page=full)
async def click(pg,sel,i=0):
    els=await pg.query_selector_all(sel)
    if len(els)<=i: raise Exception('no element '+sel)
    await els[i].evaluate("e=>e.scrollIntoView({block:\"center\"})"); await els[i].click(); await pg.wait_for_timeout(260)
async def setch(pg,sel,v):
    await pg.fill(sel,v); await pg.dispatch_event(sel,'change'); await pg.wait_for_timeout(120)
async def main():
    async with async_playwright() as p:
        b,pg,errs=await new_page(p,mobile=MOBILE)
        await pg.wait_for_timeout(900)
        # ---------- first open + navigation ----------
        ok(await pg.evaluate("UI.view==='plan' && !document.querySelector('.sheet')"),'Opens straight to Workouts — no setup questions')
        nav=(await pg.inner_text('#navin')).split('\n'); nav=[n.strip() for n in nav if n.strip()]
        ok(nav==['Home','Workouts','Progress','Fuel','Toolkit'],f'Navigation is exactly Home · Workouts · Progress · Fuel · Toolkit ({nav})')
        body=await pg.evaluate("document.body.innerText")
        ok('Daily habits' not in body and 'My templates' not in body,'No Daily Habits, no Log screen')
        # ---------- settings via header gear ----------
        await click(pg,'#gearbtn'); ok(await pg.evaluate("UI.view==='profile'"),'Header gear opens Settings')
        for k,v in [('heightFt','5'),('heightIn','11'),('weightLb','200'),('age','15')]:
            await setch(pg,f'[data-ch="pf-num"][data-k="{k}"]',v)
        ok(await pg.evaluate("!!nutritionTargets(S.profile.nutrition)"),'Body stats in Settings produce nutrition targets')
        # ---------- Progress: baseline check-in ----------
        await click(pg,'.nb.progress'); ptxt=await pg.inner_text('#v-progress')
        ok('Set your starting maxes' in ptxt,'Progress starts by asking for starting maxes')
        await click(pg,'#v-progress [data-act="open-checkin"]'); await pg.wait_for_timeout(500)
        for id,w,r in [('bench','185','5'),('hack','270','8'),('pulldown','160','8'),('row','150','8')]:
            await pg.fill(f'[data-in="ck"][data-id="{id}"][data-f="w"]',w); await pg.fill(f'[data-in="ck"][data-id="{id}"][data-f="r"]',r)
        est=await pg.inner_text('#ckres-bench'); ok(est=='= 215','Check-in shows the estimated max live (185 × 5 = 215)')
        await shot(pg,'checkin')
        await click(pg,'[data-act="ck-save"]'); await pg.wait_for_timeout(600)
        st=json.loads(await pg.evaluate("JSON.stringify({c:S.checkins,b:maxInfo('bench').cur,view:UI.view})"))
        ok(len(st['c'])==1 and st['b']==215 and st['view']=='progress','Baseline saved as check-in #1 (bench 215)')
        ptxt=await pg.inner_text('#v-progress'); ok('NEXT CHECK-IN' in ptxt.upper() and '91 DAYS' in ptxt.upper(),'Next check-in is scheduled 3 months out')
        ok('STARTING MAX' in ptxt.upper() and await pg.evaluate("document.querySelectorAll('#v-progress svg.mc').length")==4,'One chart per exercise (4 lifts entered)')
        await shot(pg,'progress1',full=True)
        # ---------- Workouts ----------
        await click(pg,'.nb.plan'); await click(pg,'.wkd',0); ptxt=await pg.inner_text('#v-plan')
        ok('Ramp-up' not in ptxt and 'ramp' not in ptxt.lower(),'No ramp-up sets anywhere on the workout day')
        await click(pg,'#v-plan .pacc',0); w=await pg.inner_text('#v-plan .pacc.open')
        ok('Arm circles' in w and '5 min' in w,'Warm-up: short list of dynamic moves with reps')
        await click(pg,'#v-plan .pacc',1); sn=await pg.inner_text('#v-plan .pacc.open >> nth=1')
        ok('Banana' in sn and 'kcal' in sn and 'before' in sn,'Pre-workout snack with serving, calories and timing')
        sp=await pg.inner_text('.exitem .setplan'); ok('175 lb × 4' in sp and '81%' in sp and '2 left' in sp,'Every set calculated: weight × reps, % of max, effort')
        await shot(pg,'plan_mon',full=True)
        await click(pg,'.wkd',1); ptxt=await pg.inner_text('#v-plan'); ok('superset' in ptxt.lower() and 'Kelso Shrugs' in ptxt,'Day 2 shows Machine Row + Kelso superset')
        await click(pg,'.wkd',3); ptxt=await pg.inner_text('#v-plan'); ok('Recovery day' in ptxt,'Wednesday (Day 4) is a rest day')
        await click(pg,'[data-act="set-prog"][data-p="legends"]'); ltxt=await pg.inner_text('#v-plan'); ok('Platz' in ltxt and 'Week' in ltxt,'The Legend’s Split is still there with its 2-week calendar')
        await click(pg,'[data-act="set-prog"][data-p="ppl"]')
        ok(await pg.evaluate("PROGRAMS.length")==2,'Exactly two programs')
        # ---------- session ----------
        await click(pg,'.wkd',0); await click(pg,'#v-plan [data-act="start-day"]'); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("UI.view==='log'") and 'Workouts' in await pg.inner_text('.nb.on'),'Workout runs under the Workouts tab')
        wt=await pg.inner_text('#v-log'); ok('Warm up' in wt and 'Ramp' not in wt,'Session starts with the short warm-up (no ramp-up sets)')
        await click(pg,'[data-act="warm-done"]'); await shot(pg,'sess_bench',full=True)
        rec1=await pg.input_value('[data-in="set-w"][data-k="0"]'); reps1=await pg.input_value('[data-in="set-r"][data-k="0"]')
        ok(rec1=='175' and reps1=='4','Bench set 1 recommended 175 × 4 from the 215 max')
        await pg.fill('[data-in="set-r"][data-k="0"]','7'); await click(pg,'[data-act="set-done"][data-k="0"]'); await click(pg,'[data-act="set-effort"][data-k="0"][data-v="easy"]')
        rec2=await pg.input_value('[data-in="set-w"][data-k="1"]'); ok(int(rec2)>175,f'7 easy reps → set 2 recommendation rises ({rec2})')
        ok(await pg.evaluate("document.getElementById('restbar').classList.contains('show')"),'Rest timer starts after a set')
        await click(pg,'[data-act="rest-skip"]'); await click(pg,'[data-act="set-done"][data-k="1"]'); await click(pg,'[data-act="set-done"][data-k="2"]'); await click(pg,'[data-act="rest-skip"]')
        await click(pg,'[data-act="sess-next"]'); itxt=await pg.inner_text('#v-log'); ok('Test set' in itxt,'Lift with no max starts with a test set (no invented weight)')
        await pg.fill('[data-in="set-w"][data-k="0"]','50'); await pg.fill('[data-in="set-r"][data-k="0"]','7'); await click(pg,'[data-act="set-done"][data-k="0"]'); await click(pg,'[data-act="rest-skip"]')
        w2=await pg.input_value('[data-in="set-w"][data-k="1"]'); ok(w2!='' and int(w2)>0,f'After the test set, set 2 is recommended ({w2} lb)')
        await click(pg,'[data-act="sess-overview"]'); await click(pg,'[data-act="sess-jump"]',5)
        ok('technical failure' in await pg.inner_text('#v-log'),'Isolation exercise shows technical-failure instruction')
        await click(pg,'.excard [data-act="ex-detail"]'); await pg.wait_for_timeout(1500)
        ok(await pg.evaluate("!!document.querySelector('#demo3d canvas')"),'3D form demo still works')
        await click(pg,'.sheet [data-act="close-sheet"]'); await pg.wait_for_timeout(500)
        await click(pg,'[data-act="sess-finish"]'); await click(pg,'[data-act="sess-finish-yes"]'); await pg.wait_for_timeout(1500)
        stxt=await pg.inner_text('.page'); ok('exactly what to do' in stxt and 'Cooldown' in stxt,'Summary: what to do next time + cooldown & post-workout meal')
        await shot(pg,'summary')
        await click(pg,'.page [data-act="close-page"]'); await pg.wait_for_timeout(500)
        st=json.loads(await pg.evaluate("JSON.stringify({n:S.sessions.length,active:S.active,view:UI.view})"))
        ok(st['n']==1 and st['active'] is None and st['view']=='plan','Workout saved; back on Workouts')
        ok(await pg.evaluate("planSets(daySlots('ppl','d1')[0])[0].w")>=180,'Next bench session recommends more weight')
        # ---------- Toolkit ----------
        await click(pg,'.nb.tools'); ttxt=await pg.inner_text('#v-tools')
        ok(all(x in ttxt for x in ['Training','Recovery & health','Your stats','Settings']),'Toolkit tab groups its tools into subsections')
        for a in ['open-library','open-guide','open-legends','open-recovery','open-relief','open-supps','open-bodyweight','open-achievements']:
            await click(pg,f'#v-tools [data-act="{a}"]'); await pg.wait_for_timeout(450); await shot(pg,a)
            await click(pg,'.page [data-act="close-page"]'); await pg.wait_for_timeout(420)
        await click(pg,'#v-tools [data-act="open-history"]'); await pg.wait_for_timeout(450)
        await click(pg,'.page [data-act="del-session-btn"]'); await pg.wait_for_timeout(800)
        ok(await pg.evaluate("S.sessions.length")==0,'Workout history: delete with smooth animation')
        await click(pg,'[data-act="toast-undo"]'); await pg.wait_for_timeout(500); ok(await pg.evaluate("S.sessions.length")==1,'Undo restores it')
        await click(pg,'.page [data-act="close-page"]'); await pg.wait_for_timeout(420)
        # ---------- Fuel ----------
        await click(pg,'.nb.fuel')
        for t in ['cut','bulk','pre','recipes']:
            await click(pg,f'#v-fuel [data-act="fu-tab"][data-t="{t}"]'); await shot(pg,'fuel_'+t,full=True)
        await click(pg,'#v-fuel [data-act="fu-tab"][data-t="pre"]'); ftxt=await pg.inner_text('#v-fuel')
        ok(ftxt.count('kcal')>=5 and 'min before' in ftxt,'Pre-workout: one snack per training day with kcal and timing')
        await click(pg,'#v-fuel [data-act="fu-tab"][data-t="recipes"]'); await click(pg,'#v-fuel [data-act="recipe"]'); await pg.wait_for_timeout(400)
        ok('Ingredients' in await pg.inner_text('.sheet'),'Recipes open with ingredients'); await click(pg,'.sheet [data-act="close-sheet"]')
        # ---------- 3 months later: check-in due, compare ----------
        await pg.evaluate("S.checkins[0].date='2026-08-01';Object.values(S.maxLog).forEach(L=>L.forEach(x=>{if(x.src==='entered')x.date='2026-08-01';}));commit();")
        await click(pg,'.nb.home'); ok('3-month check-in is due' in await pg.inner_text('#v-home'),'Home reminds you when the 3-month check-in is due')
        await click(pg,'.nb.progress'); ok('Time for your 3-month check-in' in await pg.inner_text('#v-progress'),'Progress prompts for updated maxes after 3 months')
        await click(pg,'#v-progress [data-act="open-checkin"]'); await pg.wait_for_timeout(400)
        await pg.fill('[data-in="ck"][data-id="bench"][data-f="w"]','195'); await pg.fill('[data-in="ck"][data-id="bench"][data-f="r"]','5')
        await click(pg,'[data-act="ck-save"]'); await pg.wait_for_timeout(600)
        card=await pg.inner_text('.pcard[data-id="bench"]')
        ok('215' in card and '227' in card and '+12 lb' in card and '+5.6%' in card,'Bench card: previous 215 → new 227, +12 lb, +5.6%')
        ok(await pg.evaluate("document.querySelectorAll('.pcard[data-id=\"bench\"] svg.mc .dot').length")==2,'Bench chart now has Month 0 and Month 3 points')
        await shot(pg,'progress2',full=True)
        await click(pg,'.pcard[data-id="bench"]'); await pg.wait_for_timeout(400)
        ok('All check-ins' in await pg.inner_text('.sheet'),'Tap a lift to see every previous entry'); await click(pg,'.sheet [data-act="close-sheet"]')
        # ---------- light theme ----------
        await click(pg,'#gearbtn'); await click(pg,'[data-act="pf-theme"][data-v="light"]'); await click(pg,'.nb.plan'); await shot(pg,'plan_light',full=True)
        await click(pg,'.nb.progress'); await shot(pg,'progress_light',full=True)
        await click(pg,'#gearbtn'); await click(pg,'[data-act="pf-theme"][data-v="dark"]')
        real=[e for e in errs if 'favicon' not in e]
        ok(not real,'No console errors: '+('; '.join(real[:4]) if real else 'none'))
        await b.close()
    fails=[l for l in log if l.startswith('FAIL')]
    print(f"\n{len(log)-len(fails)}/{len(log)} passed" + ("" if not fails else "\nFAILURES:\n"+"\n".join(fails)))
asyncio.run(main())
