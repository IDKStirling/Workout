import asyncio,sys
sys.path.insert(0,'qa')
from harness import *
MOB=(sys.argv[1] if len(sys.argv)>1 else 'm')=='m'
P='sm' if MOB else 'sd'
async def shot(pg,n,full=False):
    await pg.wait_for_timeout(450); await pg.screenshot(path=f'shots/{P}_{n}.png',full_page=full)
async def main():
    async with async_playwright() as p:
        b,pg,errs=await new_page(p,mobile=MOB)
        await pg.wait_for_timeout(700)
        for v in ['home','plan','progress','fuel','tools']:
            await pg.evaluate(f"go('{v}')"); await shot(pg,'new_'+v,True)
        await pg.evaluate("go('profile')"); await shot(pg,'settings',True)
        # check-in page (first time)
        await pg.evaluate("go('progress')"); await pg.click('#v-progress [data-act="open-checkin"]'); await pg.wait_for_timeout(500)
        await pg.fill('[data-in="ck"][data-id="bench"][data-f="w"]','185'); await pg.fill('[data-in="ck"][data-id="bench"][data-f="r"]','5')
        await shot(pg,'checkin')
        await pg.evaluate("ACT['close-page']&&0"); await pg.evaluate("closePage()"); await pg.wait_for_timeout(300)
        # test data: two real-looking check-ins 3 months apart (test only)
        await pg.evaluate("""(()=>{Object.assign(S.profile,{weightLb:200,heightFt:5,heightIn:11,age:15,sex:'male',exp:'beginner',nutrition:'bulk'});
          const real=NOW;NOW=()=>new Date(2026,7,8);[['bench',165,5],['hack',230,8],['pulldown',140,8],['row',130,8],['rdl',165,5],['clean',95,3]].forEach(([i,w,r])=>setEnteredMax(i,w,r));S.checkins=[{date:'2026-08-08'}];
          NOW=real;[['bench',185,5],['hack',270,8],['pulldown',160,8],['row',150,8],['rdl',185,5],['clean',115,3],['inclinedb',60,8]].forEach(([i,w,r])=>setEnteredMax(i,w,r));S.checkins.push({date:'2026-11-08'});commit();go('progress');})()""")
        await shot(pg,'progress',True)
        await pg.click('#v-progress [data-act="open-pex"][data-id="bench"]'); await pg.wait_for_timeout(500); await shot(pg,'pex')
        await pg.evaluate("closeAllSheets()"); await pg.wait_for_timeout(300)
        await pg.evaluate("go('plan')"); await shot(pg,'plan',True)
        accs=await pg.query_selector_all('#v-plan .pacc')
        for a in accs: await a.evaluate("e=>e.classList.add('open')")
        await shot(pg,'plan_open',True)
        await pg.evaluate("go('home')"); await shot(pg,'home',True)
        await pg.evaluate("go('fuel')"); await shot(pg,'fuel_bulk',True)
        await pg.click('[data-act="fu-tab"][data-t="pre"]'); await shot(pg,'fuel_pre',True)
        await pg.evaluate("startSession('ppl','d1')"); await pg.wait_for_timeout(400); await shot(pg,'sess_warm')
        nav=await pg.inner_text('#navin'); print('NAV:',nav.replace('\n',' | '))
        await pg.click('[data-act="warm-done"]'); await shot(pg,'sess_bench')
        print('ERRORS:',[e for e in errs if 'favicon' not in e][:5])
        await b.close()
asyncio.run(main())
