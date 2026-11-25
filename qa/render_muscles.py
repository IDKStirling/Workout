import asyncio,sys,json
from playwright.async_api import async_playwright
SRC=open('src/30_exercises.js').read()+open('src/50_muscles.js').read()
CSS="""
body{margin:0;background:#0E0F12;font:12px Inter,system-ui,sans-serif;color:#ddd}
.grid{display:flex;flex-wrap:wrap;gap:10px;padding:10px}
.cell{background:#16181D;border-radius:10px;padding:6px;width:260px}
.cell h4{margin:2px 4px 4px;font-size:11px}
.mmap{display:flex;gap:4px}.mmap figure{margin:0;flex:1}.mmap figcaption{font-size:9px;text-align:center;color:#888}
.msvg{width:100%;display:block}
.sil{fill:#232731}.mu path{fill:#3a414d;stroke:#16181D;stroke-width:1.1}
.mu.neutral path{fill:#323843}
.mu.prim path{fill:#FF3B30}.mu.sec path{fill:url(#mhatch)}
.mh-bg{fill:#5a3a33}.mh-ln{fill:#FF8A5B}
"""
async def main(which):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        pg=await b.new_page(viewport={'width':1400,'height':900},device_scale_factor=1.5)
        await pg.set_content(f"<style>{CSS}</style><div class=grid id=g></div><script>{SRC}</script>")
        if which=='blank':
            await pg.evaluate("""()=>{document.getElementById('g').innerHTML='<div class=cell style=width:520px><div class=mmap><figure>'+muscleSVG('front',[],[])+'</figure><figure>'+muscleSVG('back',[],[])+'</figure></div></div>'}""")
        elif which=='keys':
            await pg.evaluate("""()=>{const ks=Object.keys(MUSCLE_NAMES);document.getElementById('g').innerHTML=ks.map(k=>'<div class=cell style=width:170px><h4>'+k+'</h4><div class=mmap><figure>'+muscleSVG('front',[k],[])+'</figure><figure>'+muscleSVG('back',[k],[])+'</figure></div></div>').join('')}""")
        else:
            await pg.evaluate("""()=>{document.getElementById('g').innerHTML=Object.values(EX).map(e=>'<div class=cell><h4>'+e.name+'</h4>'+muscleMapHTML(e,true)+'</div>').join('')}""")
        await pg.screenshot(path=f'shots/muscles_{which}.png',full_page=True)
        await b.close()
asyncio.run(main(sys.argv[1]))
