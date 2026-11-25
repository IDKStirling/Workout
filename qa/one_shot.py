import asyncio,sys
sys.path.insert(0,'qa')
from harness import *
id,ms,az=sys.argv[1],[float(x) for x in sys.argv[2].split(',')],sys.argv[3]
async def main():
    async with async_playwright() as p:
        b,pg,errs=await new_page(p,mobile=False,state={'v':2,'profile':{'onboarded':True,'weightLb':200}})
        await pg.evaluate("""()=>{const h=document.createElement('div');h.id='qhost';h.className='demo';h.style.cssText='position:fixed;left:0;top:0;width:520px;height:520px;z-index:9999;aspect-ratio:auto';document.body.appendChild(h);}""")
        await pg.evaluate(f"Demo.mount(document.getElementById('qhost'),'{id}')")
        if az!='def': await pg.evaluate(f"Demo.setView({az},4)")
        for m in ms:
            await pg.evaluate(f"Demo.setM({m})")
            info=await pg.evaluate("""(()=>{const J=Demo._J;return null})()""")
            await (await pg.query_selector('#qhost')).screenshot(path=f'shots/one_{id}_{m}_{az}.png')
        print(errs[:3]);await b.close()
asyncio.run(main())
