import asyncio,sys
sys.path.insert(0,'qa')
from harness import *
async def main():
    async with async_playwright() as p:
        b,pg,errs=await new_page(p,mobile=True)
        await pg.screenshot(path='shots/s_onboard0.png')
        print('errors after load:',errs)
        await b.close()
asyncio.run(main())
