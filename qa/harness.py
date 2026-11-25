import asyncio,json,sys,os
from playwright.async_api import async_playwright
THREE=open('node_modules/three/build/three.min.js','rb').read()
APP='file://'+os.path.abspath('index.html')
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
async def new_page(p,mobile=True,state=None,width=None):
    b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=ARGS)
    ctx=await b.new_context(viewport={'width':width or (390 if mobile else 1280),'height':844 if mobile else 860},device_scale_factor=2 if mobile else 1,has_touch=mobile,is_mobile=mobile)
    async def route(r):
        u=r.request.url
        if 'three.min.js' in u: await r.fulfill(body=THREE,content_type='application/javascript')
        elif 'fonts.g' in u: await r.fulfill(body='',content_type='text/css')
        else: await r.continue_()
    await ctx.route('**/*',route)
    pg=await ctx.new_page()
    errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    if state is not None:
        await pg.add_init_script("localStorage.setItem('trench2-state',%s)"%json.dumps(json.dumps(state)))
    await pg.goto(APP)
    await pg.wait_for_timeout(500)
    return b,pg,errs
