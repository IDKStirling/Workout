import os
SRC='src'
order_js=['30_exercises.js','31_programs.js','40_engine.js','41_coach.js','32_nutrition.js','33_content.js','50_muscles.js','60_three.js','70_ui_core.js','71_ui_log.js','72_ui_more.js','73_ui_coach.js','74_ui_progress.js','99_boot.js']
r=lambda f:open(os.path.join(SRC,f),encoding='utf-8').read()
html=r('00_head.html')+r('10_styles.css')+r('20_body.html')+'\n'.join(r(f) for f in order_js)+'\n</script>\n</body>\n</html>\n'
open('index.html','w',encoding='utf-8').write(html)
print('built index.html',len(html)//1024,'KB')
