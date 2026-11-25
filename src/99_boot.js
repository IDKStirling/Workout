/* ---------- boot ---------- */
window.Demo=(typeof Demo!=='undefined'&&Demo)||null;
function boot(){
  loadState();try{seedMaxLog();migrateCheckins();}catch(e){}applyTheme();
  try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',applyTheme);}catch(e){}
  UI.view='plan';go('plan');
}
boot();
