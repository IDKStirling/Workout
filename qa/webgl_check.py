import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
        pg = await b.new_page()
        await pg.set_content("<canvas id=c></canvas>")
        r = await pg.evaluate("""()=>{const g=document.getElementById('c').getContext('webgl');if(!g)return 'NO WEBGL';const d=g.getExtension('WEBGL_debug_renderer_info');return 'WEBGL OK: '+(d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):'?')}""")
        print(r)
        # can we reach cdnjs for three.js?
        try:
            resp = await pg.goto("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", timeout=15000)
            print("cdnjs status:", resp.status)
        except Exception as e:
            print("cdnjs fail:", str(e)[:120])
        await b.close()
asyncio.run(main())
