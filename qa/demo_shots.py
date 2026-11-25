import asyncio,sys,json
sys.path.insert(0,'qa')
from harness import *
from PIL import Image, ImageDraw, ImageFont
IDS=sys.argv[1].split(',') if len(sys.argv)>1 and sys.argv[1]!='all' else None
VIEW=sys.argv[2] if len(sys.argv)>2 else None
STATE={'v':2,'profile':{'onboarded':True,'weightLb':200,'theme':'dark'}}
async def main():
    async with async_playwright() as p:
        b,pg,errs=await new_page(p,mobile=False,state=STATE)
        ids=IDS or await pg.evaluate("Object.keys(EX)")
        await pg.evaluate("""()=>{const h=document.createElement('div');h.id='qhost';h.className='demo';h.style.cssText='position:fixed;left:0;top:0;width:420px;height:340px;z-index:9999;aspect-ratio:auto';document.body.appendChild(h);}""")
        tiles=[]
        for id in ids:
            ok=await pg.evaluate(f"Demo.mount(document.getElementById('qhost'),'{id}')")
            scale=await pg.evaluate("Demo.rig.mScale||1")
            ms=[0,0.5,1] if scale==1 else [0,1,2,3,4,5]
            if VIEW: await pg.evaluate(f"Demo.setView({VIEW},6)")
            row=[]
            for m in ms:
                await pg.evaluate(f"Demo.setM({m*1.0})")
                await pg.evaluate("document.querySelector('#qhost .phase').style.display='none';document.querySelector('#qhost .dctl').style.display='none';document.querySelector('#qhost .hint').style.display='none'")
                el=await pg.query_selector('#qhost')
                path=f'shots/d_{id}_{m}.png'
                await el.screenshot(path=path);row.append(path)
            tiles.append((id,row))
        print('errors:',errs[:5])
        await b.close()
    # contact sheet
    W,H=420,340;maxc=max(len(r) for _,r in tiles)
    sheet=Image.new('RGB',(W*maxc,(H+22)*len(tiles)),(14,15,18));d=ImageDraw.Draw(sheet)
    for i,(id,row) in enumerate(tiles):
        d.text((6,i*(H+22)+4),id,fill=(255,140,90))
        for j,pth in enumerate(row):
            sheet.paste(Image.open(pth).convert('RGB').resize((W,H)),(j*W,i*(H+22)+22))
    out='shots/sheet_'+('_'.join(ids) if IDS and len(ids)<5 else 'all')+('_v'+VIEW if VIEW else '')+'.png'
    sheet.save(out);print('saved',out,sheet.size)
asyncio.run(main())
