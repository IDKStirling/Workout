import asyncio,sys,json
sys.path.insert(0,'qa')
from harness import *
MOB=(sys.argv[1] if len(sys.argv)>1 else 'm')=='m'
P='cm' if MOB else 'cd'
async def shot(pg,n,full=False,sel=None):
    await pg.wait_for_timeout(500)
    if sel:
        el=await pg.query_selector(sel); await el.screenshot(path=f'shots/{P}_{n}.png')
    else: await pg.screenshot(path=f'shots/{P}_{n}.png',full_page=full)
SETUP="""(()=>{const real=NOW;NOW=()=>new Date(2026,9,20);Object.assign(S.profile,{weightLb:200,heightFt:5,heightIn:11,age:15,sex:'male',exp:'beginner',nutrition:'bulk'});
[['bench',185,5],['inclinedb',60,8],['ohp',120,8],['dip',0,10],['lateral',20,10],['satriext',25,8],['pulldown',160,8],['row',150,8],['hack',270,8],['rdl',185,5],['clean',115,3],['legext',120,10],['adductor',140,10]].forEach(([id,w,r])=>setEnteredMax(id,w,r));
/* two weeks of history so the trend + coach have something to work with */
const mk=(date,day,mult,reps)=>{const sl=daySlots('ppl',day);const items=sl.map(s=>{const P=planSets(s);return {exId:s.exId,name:s.name,slot:s,sets:P.map((p,k)=>({rec:p,w:p.w==null?null:p.w,r:(reps&&reps[s.exId])?reps[s.exId][k]:p.reps,done:p.w!=null&&p.mode==='rec',effort:'solid'}))};}).filter(it=>it.sets.some(x=>x.done));
  const sess={id:'h'+date,progId:'ppl',dayId:day,name:day,date,start:0,end:3600000,items};finalizeSession(sess);sess.xp=100;S.xp+=100;S.sessions.unshift(sess);};
NOW=()=>new Date(2026,9,25);mk('2026-10-25','d1');NOW=()=>new Date(2026,10,1);mk('2026-11-01','d1');NOW=()=>new Date(2026,10,5);mk('2026-11-05','d5');NOW=()=>new Date(2026,10,3);mk('2026-11-03','d3',1,{hack:[5,5,3]});NOW=real;
commit();rerender();})()"""
async def main():
    async with async_playwright() as p:
        b,pg,errs=await new_page(p,mobile=MOB)
        await pg.evaluate(SETUP); await pg.wait_for_timeout(400)
        await pg.evaluate("go('plan')")
        await shot(pg,'plan_full',True)
        el=await pg.query_selector('.prep'); await el.screenshot(path=f'shots/{P}_before_warm.png')
        await pg.click('[data-act="prep-tab"][data-v="meal"]'); await pg.wait_for_timeout(300)
        el=await pg.query_selector('.prep'); await el.screenshot(path=f'shots/{P}_before_meal.png')
        el=await pg.query_selector('.exitem'); await el.screenshot(path=f'shots/{P}_exitem.png')
        await pg.click('[data-act="after-tab"][data-v="meal"]'); await pg.wait_for_timeout(300)
        el=await pg.query_selector('.prep.after'); await el.screenshot(path=f'shots/{P}_after_meal.png')
        await pg.click('[data-act="after-tab"][data-v="cool"]'); await pg.wait_for_timeout(300)
        el=await pg.query_selector('.prep.after'); await el.screenshot(path=f'shots/{P}_after_cool.png')
        # legs day (Tue)
        await pg.click('.wkd >> nth=2'); await pg.wait_for_timeout(300); await pg.click('[data-act="prep-tab"][data-v="warm"]')
        el=await pg.query_selector('.prep'); await el.screenshot(path=f'shots/{P}_legs_warm.png')
        await shot(pg,'legs_full',True)
        # max calculator
        await pg.evaluate("ACT['open-maxcalc']({dataset:{}})"); await pg.wait_for_timeout(600)
        await shot(pg,'maxcalc')
        await pg.evaluate("document.querySelector('.page .page-b').scrollTop=0")
        b2=await pg.query_selector('#mx-bench'); await b2.screenshot(path=f'shots/{P}_mxbench.png')
        # enter a new max via UI on squat-free exercise: seatedcurl reps mode
        await pg.evaluate("document.getElementById('mx-seatedcurl').scrollIntoView({block:'center'})")
        await pg.fill('#mx-seatedcurl [data-ch="mx-w"]','30'); await pg.dispatch_event('#mx-seatedcurl [data-ch="mx-w"]','change')
        await pg.fill('#mx-seatedcurl [data-ch="mx-r"]','8'); await pg.dispatch_event('#mx-seatedcurl [data-ch="mx-r"]','change')
        await pg.wait_for_timeout(400)
        c=await pg.evaluate("maxInfo('seatedcurl').cur"); print('seatedcurl max via UI:',c)
        el=await pg.query_selector('#mx-seatedcurl'); await el.screenshot(path=f'shots/{P}_mxcurl.png')
        # 1RM mode on pullup
        await pg.click('#mx-rdl [data-act="mx-mode"][data-v="1rm"]'); await pg.wait_for_timeout(200)
        await pg.fill('#mx-rdl [data-ch="mx-w"]','245'); await pg.dispatch_event('#mx-rdl [data-ch="mx-w"]','change'); await pg.wait_for_timeout(300)
        print('rdl after 1RM:',await pg.evaluate("JSON.stringify(maxInfo('rdl'))"))
        el=await pg.query_selector('#mx-rdl'); await el.screenshot(path=f'shots/{P}_mxrdl.png')
        await pg.evaluate("closePage()"); await pg.wait_for_timeout(400)
        # progress
        await pg.evaluate("go('progress')"); await pg.wait_for_timeout(500)
        await shot(pg,'progress',True)
        await pg.click('#v-progress [data-act="open-strength"][data-id="bench"]'); await pg.wait_for_timeout(700)
        await shot(pg,'strength_sheet')
        await pg.evaluate("document.querySelector('.sheet .sheet-b, .sheet .sb, .sheet')&&0")
        sh=await pg.query_selector('.sheet'); await sh.screenshot(path=f'shots/{P}_strength_sheet_el.png')
        await pg.evaluate("closeAllSheets()"); await pg.wait_for_timeout(300)
        # session: warmup + set card
        await pg.evaluate("go('plan')"); await pg.click('.wkd >> nth=0'); await pg.wait_for_timeout(200)
        await pg.evaluate("startSession('ppl','d1')"); await pg.wait_for_timeout(500)
        await shot(pg,'sess_warm',True)
        await pg.click('[data-act="warm-done"]'); await pg.wait_for_timeout(300)
        await shot(pg,'sess_bench')
        # finish a whole session quickly
        await pg.evaluate("S.active.items.forEach(it=>it.sets.forEach(s=>{if(s.w==null)s.w=20;s.r=s.r||8;s.done=true;}));commit();finishSession()"); await pg.wait_for_timeout(1200)
        await pg.evaluate("(()=>{const b=document.querySelector('.page .page-b');const c=b.querySelector('.coachcard');b.scrollTop=c.offsetTop-120;})()"); await shot(pg,'summary_coach')
        pgel=await pg.query_selector('.page .page-b'); 
        h=await pg.evaluate("document.querySelector('.page .page-b').scrollHeight"); print('summary height',h)
        await pg.evaluate("document.querySelector('.page .page-b').scrollTop=99999"); await pg.wait_for_timeout(300)
        await shot(pg,'summary_bottom')
        real=[e for e in errs if 'favicon' not in e]; print('ERRORS:',real[:6])
        await b.close()
asyncio.run(main())
