/* =========================================================
   3D EXERCISE DEMOS (Three.js r128)
   Anatomical figure + inverse kinematics: hands are solved onto the
   bar/handles and feet onto the floor/platform every frame, so contact
   with the equipment is exact. Each exercise has its own machine,
   start/finish keyframes, tempo, phase labels and a traced movement path.
   ========================================================= */
const Demo=(function(){
  if(typeof THREE==='undefined')return null;
  const D=Math.PI/180,V=(x,y,z)=>new THREE.Vector3(x||0,y||0,z||0);
  const lerp=(a,b,t)=>a+(b-a)*t,lv=(a,b,t)=>V(lerp(a.x,b.x,t),lerp(a.y,b.y,t),lerp(a.z,b.z,t));
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  let fixedM=null,R=null,scene,cam,host,raf=0,J,M,MM={},body,machine,pathObj,rig,cur=null,t=0,playing=true,speed=1,last=0,az=0,el=0,dist=3,tgt=V(),view=0,drag=null,sway=true,ro=null,ui={};
  const SPH=new THREE.SphereGeometry(1,22,16);

  /* ---------- materials ---------- */
  function mats(){
    const S=(c,r,m)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m||0});
    M={skin:S(0xc8b9aa,.6),shorts:S(0x2a2e36,.85),shoe:S(0x1b1d22,.7),sole:S(0xd6dae0,.8),
      frame:S(0x3a3f48,.58,.42),chrome:S(0xaab1bb,.22,.95),pad:S(0x17191e,.9),plate:S(0x1d1f24,.55,.25),rim:S(0xFF5A26,.5,.1),
      stack:S(0x2d3139,.48,.55),cable:S(0x0c0d0f,.6),grip:S(0x26282d,.95),accent:S(0xFF5A26,.45,.2)};
    ['upperchest','chest','fdelt','sdelt','rdelt','uppertraps','midtraps','lats','lowerback','biceps','brachialis','triceps','forearms','abs','obliques','glutes','quads','hams','adductors','calves']
      .forEach(k=>{MM[k]=M.skin.clone();});
  }
  /* ---------- body ---------- */
  function lathe(prof,mat,seg){const g=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),seg||22);const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;return m;}
  function ell(rx,ry,rz,mat,x,y,z,ax,ay,az_){const m=new THREE.Mesh(SPH,mat);m.scale.set(rx,ry,rz);m.position.set(x,y,z);m.rotation.set(ax||0,ay||0,az_||0);m.castShadow=true;return m;}
  const G=()=>new THREE.Group();
  function makeBody(){
    J={};const root=G();J.root=root;
    /* pelvis + shorts + glutes */
    root.add(ell(.155,.11,.115,M.skin,0,-.01,0));
    root.add(ell(.168,.125,.128,M.shorts,0,-.03,0));
    root.add(ell(.083,.085,.07,MM.glutes,.068,-.075,-.075),ell(.083,.085,.07,MM.glutes,-.068,-.075,-.075));
    /* spine + torso */
    const sp=G();sp.position.y=.06;root.add(sp);J.spine=sp;
    const tor=lathe([[0,-.02],[.148,0],[.15,.08],[.158,.18],[.182,.30],[.198,.40],[.186,.46],[.13,.5],[.06,.52],[0,.525]],M.skin);tor.scale.z=.64;sp.add(tor);
    sp.add(ell(.098,.074,.05,MM.chest,.07,.37,.094,0,.18,-.18),ell(.098,.074,.05,MM.chest,-.07,.37,.094,0,-.18,.18));
    sp.add(ell(.09,.035,.04,MM.upperchest,.075,.425,.088,0,.2,-.1),ell(.09,.035,.04,MM.upperchest,-.075,.425,.088,0,-.2,.1));
    sp.add(ell(.072,.15,.036,MM.abs,0,.17,.088));
    sp.add(ell(.042,.12,.06,MM.obliques,.122,.16,.035),ell(.042,.12,.06,MM.obliques,-.122,.16,.035));
    sp.add(ell(.07,.16,.045,MM.lats,.13,.29,-.045,0,0,.22),ell(.07,.16,.045,MM.lats,-.13,.29,-.045,0,0,-.22));
    sp.add(ell(.15,.058,.075,MM.uppertraps,0,.476,-.03));
    sp.add(ell(.1,.1,.032,MM.midtraps,0,.355,-.094));
    sp.add(ell(.035,.11,.03,MM.lowerback,.04,.12,-.088),ell(.035,.11,.03,MM.lowerback,-.04,.12,-.088));
    /* neck + head */
    const nk=G();nk.position.y=.5;sp.add(nk);J.neck=nk;
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.052,.058,.11,16),M.skin);neck.position.y=.05;neck.castShadow=true;nk.add(neck);
    nk.add(ell(.098,.122,.108,M.skin,0,.17,.004));
    nk.add(ell(.018,.028,.022,M.skin,0,.165,.106));               /* nose — shows which way he faces */
    nk.add(ell(.02,.03,.012,M.skin,.097,.165,0),ell(.02,.03,.012,M.skin,-.097,.165,0));
    /* arms */
    ['L','R'].forEach(s=>{const k=s==='L'?1:-1;
      const sh=G();sh.position.set(.19*k,.44,0);sh.userData.base=sh.position.clone();sp.add(sh);J['sh'+s]=sh;
      sh.add(ell(.054,.068,.05,MM.fdelt,.008*k,-.025,.032),ell(.05,.074,.052,MM.sdelt,.03*k,-.03,0),ell(.05,.068,.05,MM.rdelt,.008*k,-.025,-.034));
      sh.add(lathe([[0,-.3],[.04,-.29],[.045,-.2],[.05,-.08],[.052,-.02],[0,.02]],M.skin));
      sh.add(ell(.04,.092,.04,MM.biceps,0,-.15,.022),ell(.044,.108,.042,MM.triceps,0,-.13,-.022),ell(.024,.06,.03,MM.brachialis,.03*k,-.21,0));
      const el=G();el.position.y=-.3;sh.add(el);J['el'+s]=el;
      el.add(ell(.042,.042,.042,M.skin,0,0,0));
      el.add(lathe([[0,-.275],[.03,-.265],[.036,-.2],[.048,-.07],[.044,-.01],[0,.02]],MM.forearms));
      const hd=G();hd.position.y=-.27;el.add(hd);J['hd'+s]=hd;
      hd.add(ell(.034,.058,.026,M.skin,0,-.045,0));
      const gp=G();gp.position.y=-.065;hd.add(gp);J['gp'+s]=gp;
    });
    /* legs */
    ['L','R'].forEach(s=>{const k=s==='L'?1:-1;
      const hp=G();hp.position.set(.095*k,-.04,0);root.add(hp);J['hp'+s]=hp;
      hp.add(lathe([[0,-.45],[.055,-.44],[.062,-.36],[.078,-.2],[.088,-.06],[.09,0],[0,.03]],M.skin));
      hp.add(ell(.074,.19,.058,MM.quads,0,-.22,.03),ell(.07,.18,.054,MM.hams,0,-.22,-.03),ell(.044,.13,.05,MM.adductors,-.035*k,-.12,0));
      hp.add(ell(.098,.09,.1,M.shorts,0,-.04,0));
      const kn=G();kn.position.y=-.45;hp.add(kn);J['kn'+s]=kn;
      kn.add(ell(.056,.056,.058,M.skin,0,0,.005));
      kn.add(lathe([[0,-.43],[.036,-.42],[.04,-.32],[.054,-.14],[.057,-.04],[0,.02]],M.skin));
      kn.add(ell(.05,.11,.05,MM.calves,0,-.13,-.03));
      const an=G();an.position.y=-.43;kn.add(an);J['an'+s]=an;
      const shoe=new THREE.Mesh(new THREE.BoxGeometry(.1,.07,.26),M.shoe);shoe.position.set(0,-.035,.055);shoe.castShadow=true;an.add(shoe);
      const sole=new THREE.Mesh(new THREE.BoxGeometry(.104,.018,.264),M.sole);sole.position.set(0,-.07,.055);an.add(sole);
    });
    return root;
  }
  /* ---------- pose application with 2-bone IK ---------- */
  function qBasis(x,y,z){return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));}
  function setWorldQ(o,qW){const pq=new THREE.Quaternion();o.parent.getWorldQuaternion(pq);o.quaternion.copy(pq.invert().multiply(qW));o.updateMatrixWorld(true);}
  function limb(type,s,c){
    const up=J[(type==='arm'?'sh':'hp')+s],lo=J[(type==='arm'?'el':'kn')+s],end=J[(type==='arm'?'hd':'an')+s];
    if(!c){up.quaternion.identity();lo.quaternion.identity();end.quaternion.identity();return;}
    if(c.fk){const f=c.fk;up.rotation.set(f[0]*D,f[1]*D,f[2]*D);lo.rotation.set(f[3]*D,0,0);
      if(type==='arm')end.rotation.set(0,(f[4]||0)*D,0);else end.rotation.set((f[4]||0)*D,0,0);up.updateMatrixWorld(true);return;}
    const L1=type==='arm'?.3:.45,L2=type==='arm'?.335:.43;
    const A=up.getWorldPosition(V());const T=c.ik.clone();const d=T.clone().sub(A);
    let len=d.length();const u=d.normalize();len=Math.min(Math.max(len,Math.abs(L1-L2)+.002),L1+L2-.0004);
    let p=(c.pole||V(0,0,1)).clone().normalize();p.sub(u.clone().multiplyScalar(p.dot(u)));
    if(p.lengthSq()<1e-6)p=V(1,0,0).cross(u);p.normalize();
    const a=Math.acos(Math.min(1,Math.max(-1,(L1*L1+len*len-L2*L2)/(2*L1*len))));
    const ud=u.clone().multiplyScalar(Math.cos(a)).add(p.clone().multiplyScalar(Math.sin(a)));
    const E=A.clone().add(ud.clone().multiplyScalar(L1));const ld=A.clone().add(u.clone().multiplyScalar(len)).sub(E).normalize();
    const zs=type==='arm'?-1:1;
    const bq=dir=>{const y=dir.clone().negate();const z=p.clone().multiplyScalar(zs);z.sub(y.clone().multiplyScalar(z.dot(y)));if(z.lengthSq()<1e-8)z.set(0,0,1);z.normalize();const x=V().crossVectors(y,z).normalize();return qBasis(x,y,z);};
    setWorldQ(up,bq(ud));setWorldQ(lo,bq(ld));
    if(type==='leg'){const f=c.foot||{up:V(0,1,0),fwd:V(0,0,1)};const y=f.up.clone().normalize();const z=f.fwd.clone();z.sub(y.clone().multiplyScalar(z.dot(y))).normalize();setWorldQ(end,qBasis(V().crossVectors(y,z),y,z));}
    else if(c.hand){const y=c.hand.up.clone().normalize();const z=c.hand.fwd.clone();z.sub(y.clone().multiplyScalar(z.dot(y))).normalize();setWorldQ(end,qBasis(V().crossVectors(y,z),y,z));}
    else end.quaternion.identity();
  }
  function applyPose(P){
    J.root.position.copy(P.p);J.root.rotation.set((P.r[0]||0)*D,(P.r[1]||0)*D,(P.r[2]||0)*D);
    J.spine.rotation.set((P.spine||0)*D,0,0);J.neck.rotation.set((P.head||0)*D,0,0);
    ['L','R'].forEach(s=>{const sh=J['sh'+s],b=sh.userData.base,o=P['scap'+s]||[0,0,0];sh.position.set(b.x+o[0],b.y+o[1],b.z+o[2]);});
    J.root.updateMatrixWorld(true);
    limb('leg','L',P.legL);limb('leg','R',P.legR);J.root.updateMatrixWorld(true);
    limb('arm','L',P.armL);limb('arm','R',P.armR);J.root.updateMatrixWorld(true);
  }
  /* useful world points of the current pose */
  const wp=o=>o.getWorldPosition(V());
  function torsoFrame(rootP,rx,spine){ /* returns {base, up, fwd, at(h)} for torso along spine */
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rx*D,0,0));const q2=new THREE.Quaternion().setFromEuler(new THREE.Euler((spine||0)*D,0,0));
    const base=rootP.clone().add(V(0,.06,0).applyQuaternion(q));const qq=q.clone().multiply(q2);
    const up=V(0,1,0).applyQuaternion(qq),fwd=V(0,0,1).applyQuaternion(qq);
    return {base,up,fwd,at:(h,x,f)=>base.clone().add(up.clone().multiplyScalar(h)).add(V(x||0,0,0)).add(fwd.clone().multiplyScalar(f||0))};
  }
  /* ---------- equipment kit ---------- */
  function box(w,h,d,mat,x,y,z,rx,ry,rz){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;m.receiveShadow=true;return m;}
  function cyl(r,h,mat,x,y,z,rx,ry,rz,seg){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||18),mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;return m;}
  function tube(a,b,r,mat){const d=b.clone().sub(a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,12),mat);m.castShadow=true;tubeSet(m,a,b);return m;}
  function tubeSet(m,a,b){const d=b.clone().sub(a);const L=d.length();m.scale.set(1,Math.max(L,.001),1);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());}
  function barbell(len,plates){const g=G();g.add(cyl(.0145,len,M.chrome,0,0,0,0,0,Math.PI/2));
    [-1,1].forEach(s=>{g.add(cyl(.026,.38,M.chrome,s*(len/2-.19),0,0,0,0,Math.PI/2));
      (plates||[.225,.18]).forEach((r,i)=>{g.add(cyl(r,.045,M.plate,s*(.48+i*.05),0,0,0,0,Math.PI/2,32));g.add(cyl(.055,.049,M.rim,s*(.48+i*.05),0,0,0,0,Math.PI/2,20));});});return g;}
  function dumbbell(axis){const g=G();g.add(cyl(.016,.15,M.chrome,0,0,0,0,0,Math.PI/2));[-1,1].forEach(s=>{g.add(cyl(.052,.075,M.plate,s*.11,0,0,0,0,Math.PI/2,6));});if(axis==='z')g.rotation.y=Math.PI/2;if(axis==='y')g.rotation.z=Math.PI/2;return g;}
  function stack(x,z,h){const g=G();g.add(box(.06,h,.06,M.frame,x-.2,h/2,z),box(.06,h,.06,M.frame,x+.2,h/2,z),box(.46,.06,.12,M.frame,x,h,z));
    g.add(cyl(.008,h*.8,M.chrome,x-.07,h*.45,z),cyl(.008,h*.8,M.chrome,x+.07,h*.45,z));for(let i=0;i<9;i++)g.add(box(.3,.035,.14,M.stack,x,.1+i*.042,z));
    g.add(cyl(.05,.03,M.chrome,x,h-.02,z+.07,Math.PI/2));return g;}
  function seat(x,y,z,w,d){return box(w||.44,.08,d||.42,M.pad,x,y,z);}
  function benchFlat(z0,z1,h){const g=G();h=h||.45;g.add(box(.3,.08,z1-z0,M.pad,0,h-.04,(z0+z1)/2));g.add(box(.08,h-.08,.08,M.frame,0,(h-.08)/2,z0+.12),box(.08,h-.08,.08,M.frame,0,(h-.08)/2,z1-.12));g.add(box(.5,.04,.08,M.frame,0,.02,z0+.12),box(.5,.04,.08,M.frame,0,.02,z1-.12));return g;}
  function padAngled(cx,cy,cz,w,len,angleDeg,thick){const m=box(w,thick||.08,len,M.pad,cx,cy,cz,angleDeg*D,0,0);return m;}
  /* ---------- poses: helpers ---------- */
  const foot=(up,fwd)=>({up:up||V(0,1,0),fwd:fwd||V(0,0,1)});
  const legIK=(x,y,z,pole,ft)=>({ik:V(x,y,z),pole:pole||V(0,.2,1),foot:ft||foot()});
  const armIK=(p,pole,hand)=>({ik:p.clone(),pole:pole,hand:hand});
  function standLegs(P,w,z,toe){toe=toe||0;w=w||.12;z=z||0;P.legL=legIK(w,.07,z,V(Math.sin(toe*D)*.6,.1,1),foot(V(0,1,0),V(Math.sin(toe*D),0,Math.cos(toe*D))));P.legR=legIK(-w,.07,z,V(-Math.sin(toe*D)*.6,.1,1),foot(V(0,1,0),V(-Math.sin(toe*D),0,Math.cos(toe*D))));return P;}
  function seatLegs(P,z,w){w=w||.17;P.legL=legIK(w,.07,z,V(.15,.6,1));P.legR=legIK(-w,.07,z,V(-.15,.6,1));return P;}
  const mirrorX=v=>V(-v.x,v.y,v.z);
  /* standard two-key timeline: start → finish → back */
  function tl2(labels,opts){opts=opts||{};const down=opts.lowerFirst;
    return [{m:0,dur:opts.h0||.7,label:labels[0]},{from:0,to:1,dur:opts.d1||(down?2:1.1),label:labels[1]},{m:1,dur:opts.h1||.45,label:labels[2],fin:true},{from:1,to:0,dur:opts.d2||(down?1.1:2),label:labels[3]}];}

  /* =========================================================
     RIGS — one per exercise. pose(m) returns the body pose for
     motion value m (0 = start, 1 = finish); place(m) moves equipment.
     ========================================================= */
  const RIGS={};
  /* ---- bench press ---- */
  RIGS.bench=()=>{const g=G();g.add(benchFlat(-.8,.5));
    [-1,1].forEach(s=>{g.add(box(.06,1.12,.06,M.frame,s*.42,.56,-.66),box(.12,.04,.08,M.frame,s*.42,1.12,-.6));});g.add(box(.9,.05,.06,M.frame,0,.03,-.66));
    const bar=barbell(2.0);g.add(bar);
    const barAt=m=>V(0,lerp(1.17,.75,m),lerp(-.29,-.16,m)-Math.sin(m*Math.PI)*.02);
    return {g,cam:{tgt:V(0,.72,-.12),dist:2.9,el:22,az:58},track:()=>bar.position,
      tl:tl2(['Start · arms locked over shoulders','Lower to lower chest · 2 sec','Touch · no bounce','Press up & slightly back'],{lowerFirst:true}),
      pose(m){const P={p:V(0,.565,.24),r:[-90,0,0],spine:-6,head:0};
        P.legL=legIK(.3,.07,.64,V(.5,1,.2),foot());P.legR=legIK(-.3,.07,.64,V(-.5,1,.2),foot());
        const b=barAt(m);bar.position.copy(b);
        P.armL=armIK(b.clone().add(V(.31,0,0)),V(1,-1.1,.5));P.armR=armIK(b.clone().add(V(-.31,0,0)),V(-1,-1.1,.5));return P;}};};
  /* ---- incline dumbbell press ---- */
  RIGS.inclinedb=()=>{const g=G();g.add(seat(0,.43,.18,.34,.36));g.add(padAngled(0,.75,-.32,.32,1.05,30));g.add(box(.08,.42,.08,M.frame,0,.21,.15),box(.08,.55,.08,M.frame,0,.3,-.55),box(.5,.04,.6,M.frame,0,.02,-.2));
    const dl=dumbbell(),dr=dumbbell();g.add(dl,dr);const tf=torsoFrame(V(0,.6,.07),-60,0);
    const shL=tf.at(.44,.19),top=V(.15,shL.y+.6,shL.z+.06),bot=tf.at(.39,.31,.1);
    return {g,cam:{tgt:V(0,1.0,-.12),dist:3.0,el:12,az:80},track:()=>dl.position,
      tl:tl2(['Start · dumbbells over upper chest','Lower · 2 sec, elbows slightly in','Stretch at the bottom','Press up & in'],{lowerFirst:true}),
      pose(m){const P={p:V(0,.6,.07),r:[-60,0,0],spine:0,head:8};seatLegs(P,.58,.22);
        const L=lv(top,bot,m);dl.position.copy(L);dr.position.copy(mirrorX(L));
        P.armL=armIK(L,V(1,-1.2,.2));P.armR=armIK(mirrorX(L),V(-1,-1.2,.2));return P;}};};
  /* ---- single-arm overhead tricep extension ---- */
  RIGS.satriext=()=>{const g=G();g.add(seat(0,.45,.05,.36,.36));g.add(box(.36,.75,.07,M.pad,0,.86,-.17));g.add(box(.08,.45,.08,M.frame,0,.22,0),box(.08,.95,.08,M.frame,0,.48,-.22),box(.5,.04,.5,M.frame,0,.02,-.05));
    const db=dumbbell('y');g.add(db);
    return {g,cam:{tgt:V(-.05,1.38,0),dist:2.5,el:8,az:-62},track:()=>J.gpR.getWorldPosition(V()),
      tl:tl2(['Start · arm locked overhead','Lower behind head · 2 sec','Deep stretch · elbow up','Extend to lockout'],{lowerFirst:true}),
      pose(m){const P={p:V(0,.57,.02),r:[-4,0,0],spine:0,head:-4};seatLegs(P,.5,.2);
        P.armR={fk:[-172,0,-6,lerp(-6,-142,m)]};P.armL={fk:[-20,0,10,-75]};return P;},
      after(){const e=J.elR.getWorldPosition(V());/* free hand braces the working elbow */
        const P2=V(e.x+.07,e.y-.05,e.z+.08);limb('arm','L',armIK(P2,V(.3,-1,.4)));db.position.copy(J.gpR.getWorldPosition(V()));}};};
  /* ---- machine shoulder press ---- */
  RIGS.ohp=()=>{const g=G();g.add(seat(0,.45,.05,.44,.4));g.add(box(.42,.85,.08,M.pad,0,.95,-.2));g.add(box(.5,.04,.6,M.frame,0,.02,-.05),box(.08,.45,.08,M.frame,0,.22,0));
    [-1,1].forEach(s=>g.add(box(.05,1.9,.05,M.frame,s*.42,.95,.0)));g.add(box(.9,.06,.08,M.frame,0,1.9,0));g.add(stack(0,-.62,1.5));
    const hs=[-1,1].map(s=>{const h=G();h.add(cyl(.022,.2,M.grip,0,0,.06,Math.PI/2));h.add(box(.18,.04,.04,M.frame,s*.1,0,-.03));g.add(h);return h;});
    const lo=V(.27,1.13,.1),hi=V(.22,1.66,.05);
    return {g,cam:{tgt:V(0,1.25,0),dist:2.9,el:10,az:34},track:()=>hs[1].position,
      tl:tl2(['Start · handles at shoulder height','Press up','Top · shoulders down','Lower · 2 sec']),
      pose(m){const P={p:V(0,.575,.03),r:[-5,0,0],spine:0,head:0};seatLegs(P,.5,.2);
        const L=lv(lo,hi,m);hs[1].position.copy(L);hs[0].position.copy(mirrorX(L));
        P.armL=armIK(L,V(1,-.9,.1));P.armR=armIK(mirrorX(L),V(-1,-.9,.1));return P;}};};
  RIGS.ohp_db=()=>{const g=G();g.add(seat(0,.45,.05,.36,.36));g.add(box(.36,.8,.07,M.pad,0,.9,-.17));g.add(box(.08,.45,.08,M.frame,0,.22,0),box(.08,1.0,.08,M.frame,0,.5,-.22),box(.5,.04,.5,M.frame,0,.02,-.05));
    const dl=dumbbell(),dr=dumbbell();g.add(dl,dr);const lo=V(.27,1.15,.07),hi=V(.16,1.71,.04);
    return {g,cam:{tgt:V(0,1.25,0),dist:2.9,el:8,az:24},track:()=>dl.position,
      tl:tl2(['Start · dumbbells at shoulders','Press up & slightly in','Top · arms nearly straight','Lower to ear level · 2 sec']),
      pose(m){const P={p:V(0,.575,.02),r:[-3,0,0],spine:0,head:0};seatLegs(P,.5,.2);const L=lv(lo,hi,m);dl.position.copy(L);dr.position.copy(mirrorX(L));
        P.armL=armIK(L,V(1,-.9,.1));P.armR=armIK(mirrorX(L),V(-1,-.9,.1));return P;}};};
  /* ---- dips ---- */
  RIGS.dip=()=>{const g=G();[-1,1].forEach(s=>{g.add(cyl(.022,.7,M.chrome,s*.27,1.45,.08,Math.PI/2));g.add(box(.06,1.45,.06,M.frame,s*.27,.725,-.25),box(.06,1.45,.06,M.frame,s*.27,.725,.42));});
    g.add(box(.7,.05,.8,M.frame,0,.025,.08));g.add(box(.06,1.9,.06,M.frame,0,.95,-.45));
    const hand=s=>V(.27*s,1.47,.06);
    return {g,cam:{tgt:V(0,1.3,0),dist:3.3,el:6,az:72},track:()=>J.shL.getWorldPosition(V()),
      tl:tl2(['Start · arms straight, shoulders down','Lower · 2 sec, slight forward lean','Bottom · upper arms ~parallel','Press up'],{lowerFirst:true}),
      pose(m){const lean=lerp(10,24,m);const shY=lerp(2.06,1.6,m);const tf=torsoFrame(V(),lean,0);
        const shMid=V(0,shY,lerp(.02,-.03,m));const root=shMid.clone().sub(tf.up.clone().multiplyScalar(.5)).sub(V(0,.06,0).applyAxisAngle(V(1,0,0),lean*D));
        const P={p:root,r:[lean,0,0],spine:0,head:-6};P.legL={fk:[-34,0,4,112,20]};P.legR={fk:[-26,0,-4,104,20]};
        P.armL=armIK(hand(1),V(.15,0,-1));P.armR=armIK(hand(-1),V(-.15,0,-1));return P;}};};
  /* ---- lateral raise ---- */
  RIGS.lateral=()=>{const g=G();const dl=dumbbell('z'),dr=dumbbell('z');g.add(dl,dr);
    return {g,cam:{tgt:V(0,1.2,0),dist:3.2,el:8,az:16},track:()=>dl.position,
      tl:tl2(['Start · arms at sides','Raise · lead with elbows','Top · shoulder height','Lower · 2–3 sec']),
      pose(m){const P=standLegs({p:V(0,.975,0),r:[6,0,0],spine:2,head:-4},.13,0);const a=lerp(8,84,m);
        P.armL={fk:[-10,0,a,-14,0]};P.armR={fk:[-10,0,-a,-14,0]};return P;},
      after(){dl.position.copy(J.gpL.getWorldPosition(V()));dr.position.copy(J.gpR.getWorldPosition(V()));dl.quaternion.copy(J.hdL.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI/2,0)));dr.quaternion.copy(J.hdR.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI/2,0)));}};};
  /* ---- lat pulldown ---- */
  RIGS.pulldown=()=>{const g=G();g.add(seat(0,.45,0,.44,.4));g.add(box(.5,.09,.14,M.pad,0,.74,.24));g.add(box(.06,.72,.06,M.frame,0,.36,.24),box(.08,.45,.08,M.frame,0,.22,0),box(.6,.04,.9,M.frame,0,.02,-.1));
    g.add(box(.08,2.35,.08,M.frame,0,1.17,-.42),box(.08,.08,.6,M.frame,0,2.33,-.15));g.add(cyl(.05,.03,M.chrome,0,2.28,.08,0,0,Math.PI/2));g.add(stack(0,-.62,1.4));
    const bar=G();bar.add(cyl(.016,1.1,M.chrome,0,0,0,0,0,Math.PI/2));[-1,1].forEach(s=>bar.add(cyl(.016,.18,M.chrome,s*.6,-.05,0,0,0,s*.6)));bar.add(cyl(.024,.3,M.grip,.42,0,0,0,0,Math.PI/2),cyl(.024,.3,M.grip,-.42,0,0,0,0,Math.PI/2));g.add(bar);
    const cab=tube(V(0,2.28,.08),V(0,1.6,0),.006,M.cable);g.add(cab);
    return {g,cam:{tgt:V(0,1.35,0),dist:3.2,el:4,az:38},track:()=>bar.position,
      tl:tl2(['Start · full stretch overhead','Pull to upper chest','Squeeze lats · chest up','Return · 2 sec']),
      pose(m){const P={p:V(0,.575,0),r:[-10,0,0],spine:-4,head:lerp(-4,6,m)};seatLegs(P,.42,.2);
        const b=V(0,lerp(1.69,1.17,m),lerp(.05,.17,m));bar.position.copy(b);tubeSet(cab,V(0,2.28,.08),b);
        P.armL=armIK(b.clone().add(V(.4,0,0)),V(.7,-1,-.6));P.armR=armIK(b.clone().add(V(-.4,0,0)),V(-.7,-1,-.6));return P;}};};
  function hangRig(gripW,under){return ()=>{const g=G();[-1,1].forEach(s=>g.add(box(.07,2.55,.07,M.frame,s*.6,1.27,-.1)));g.add(cyl(.018,1.25,M.chrome,0,2.42,.02,0,0,Math.PI/2));g.add(box(1.3,.05,.8,M.frame,0,.025,0));
    return {g,cam:{tgt:V(0,1.82,0),dist:3.7,el:2,az:32},track:()=>J.root.getWorldPosition(V()).add(V(0,.5,0)),
      tl:tl2(['Start · dead hang','Pull · chest toward the bar','Chin over the bar','Lower all the way · 2 sec']),
      pose(m){const shY=lerp(1.8,2.19,m);const lean=lerp(0,-12,m);const tf=torsoFrame(V(),lean,0);
        const root=V(0,shY,lerp(.0,-.05,m)).sub(tf.up.clone().multiplyScalar(.5)).sub(V(0,.06,0));
        const P={p:root,r:[lean,0,0],spine:0,head:lerp(0,-10,m)};P.legL={fk:[-18,0,3,72,25]};P.legR={fk:[-10,0,-3,60,25]};
        const pole=under?[V(.25,-1,.7),V(-.25,-1,.7)]:[V(1,-1,.1),V(-1,-1,.1)];
        P.armL=armIK(V(gripW,2.42,.02),pole[0]);P.armR=armIK(V(-gripW,2.42,.02),pole[1]);return P;}};};}
  RIGS.pullup=hangRig(.37,false);RIGS.chinup=hangRig(.21,true);
  /* ---- seated machine row & Kelso shrug (same machine) ---- */
  function rowMachine(g){g.add(seat(0,.45,-.02,.44,.38));g.add(box(.4,.62,.09,M.pad,0,1.0,.27,-.08));g.add(box(.08,.45,.08,M.frame,0,.22,0),box(.08,.95,.08,M.frame,0,.47,.34),box(.6,.04,1.6,M.frame,0,.02,.35));
    g.add(box(.08,1.5,.08,M.frame,0,.75,1.06));g.add(stack(.55,1.0,1.3));
    [-1,1].forEach(s=>g.add(box(.04,.04,.9,M.chrome,s*.33,1.22,.68)));}
  RIGS.row=()=>{const g=G();rowMachine(g);const hs=[-1,1].map(s=>{const h=G();h.add(cyl(.022,.17,M.grip,0,0,0));h.add(box(.12,.04,.04,M.frame,s*.07,.07,0));g.add(h);return h;});
    return {g,cam:{tgt:V(0,1.02,.3),dist:2.9,el:12,az:86},track:()=>hs[1].position,
      tl:tl2(['Start · arms long, shoulders reach forward','Row to lower ribs','Squeeze shoulder blades','Return · 2 sec']),
      pose(m){const P={p:V(0,.575,-.02),r:[6,0,0],spine:0,head:0,scapL:[0,0,lerp(.035,-.04,m)],scapR:[0,0,lerp(.035,-.04,m)]};seatLegs(P,.52,.2);
        const L=V(.22,lerp(1.13,1.04,m),lerp(.71,.16,m));hs[1].position.copy(L);hs[0].position.copy(mirrorX(L));
        P.armL=armIK(L,V(.35,-.6,-1));P.armR=armIK(mirrorX(L),V(-.35,-.6,-1));return P;}};};
  RIGS.kelso=()=>{const g=G();rowMachine(g);const hs=[-1,1].map(s=>{const h=G();h.add(cyl(.022,.17,M.grip,0,0,0));g.add(h);return h;});
    return {g,cam:{tgt:V(0,1.12,.12),dist:2.6,el:26,az:150},track:()=>J.shL.getWorldPosition(V()),
      tl:tl2(['Start · arms straight, blades apart','Squeeze blades back & together','Hold 1 sec','Release · 2 sec'],{h1:.9}),
      pose(m){const P={p:V(0,.575,-.02),r:[8,0,0],spine:0,head:0,scapL:[lerp(.02,-.03,m),lerp(0,-.012,m),lerp(.04,-.05,m)],scapR:[lerp(-.02,.03,m),lerp(0,-.012,m),lerp(.04,-.05,m)]};seatLegs(P,.52,.2);
        P.armL={ik:V(),pole:V(.3,-.5,-1)};P.armR={ik:V(),pole:V(-.3,-.5,-1)};
        J.root.position.copy(P.p);J.root.rotation.set(8*D,0,0);['L','R'].forEach(s=>{const sh=J['sh'+s],b=sh.userData.base,o=P['scap'+s];sh.position.set(b.x+o[0],b.y+o[1],b.z+o[2]);});J.root.updateMatrixWorld(true);
        const sL=J.shL.getWorldPosition(V()),sR=J.shR.getWorldPosition(V());const fwd=V(.03,-.12,1).normalize();
        P.armL.ik=sL.clone().add(fwd.clone().multiplyScalar(.632));P.armR.ik=sR.clone().add(V(-fwd.x,fwd.y,fwd.z).multiplyScalar(.632));
        hs[1].position.copy(P.armL.ik);hs[0].position.copy(P.armR.ik);return P;}};};
  /* ---- seated dumbbell curl ---- */
  RIGS.seatedcurl=()=>{const g=G();g.add(benchFlat(-.45,.65));const dl=dumbbell(),dr=dumbbell();g.add(dl,dr);
    return {g,cam:{tgt:V(0,.95,0),dist:2.7,el:6,az:62},track:()=>dl.position,
      tl:tl2(['Start · arms straight, palms forward','Curl up · elbows pinned','Squeeze','Lower · 2–3 sec']),
      pose(m){const P={p:V(0,.565,.0),r:[2,0,0],spine:0,head:0};seatLegs(P,.5,.22);
        P.armL={fk:[-4,0,7,lerp(-6,-138,m),0]};P.armR={fk:[-4,0,-7,lerp(-6,-138,m),0]};return P;},
      after(){const q=new THREE.Quaternion();[[dl,'L'],[dr,'R']].forEach(([d,s])=>{d.position.copy(J['gp'+s].getWorldPosition(V()));d.quaternion.copy(J['hd'+s].getWorldQuaternion(q));});}};};
  /* ---- preacher curls (dumbbell + machine) ---- */
  function preacher(isMachine){return ()=>{const g=G();g.add(seat(0,.5,-.05,.4,.34));g.add(box(.08,.5,.08,M.frame,0,.25,-.05),box(.6,.04,.7,M.frame,0,.02,.05));
    const pad=box(.5,.06,.36,M.pad,0,0,0);g.add(pad);g.add(box(.06,.7,.06,M.frame,0,.35,.28));
    let dl,dr,lever,hb;if(isMachine){hb=G();hb.add(cyl(.02,.5,M.grip,0,0,0,0,0,Math.PI/2));g.add(hb);lever=[tube(V(),V(0,1,0),.016,M.frame),tube(V(),V(0,1,0),.016,M.frame)];g.add(lever[0],lever[1]);g.add(stack(.6,.3,1.2));}
    else{dl=dumbbell();dr=dumbbell();g.add(dl,dr);}
    return {g,cam:{tgt:V(0,1.0,.22),dist:2.6,el:10,az:84},track:()=>J.gpL.getWorldPosition(V()),
      tl:tl2(['Start · arm almost straight on the pad','Curl up · elbow stays down','Squeeze','Lower slowly · 3 sec'],{d2:2.4}),
      pose(m){const P={p:V(0,.62,-.06),r:[14,0,0],spine:4,head:-6};seatLegs(P,.42,.2);
        P.armL={fk:[-46,0,-6,lerp(-18,-122,m),0]};P.armR={fk:[-46,0,6,lerp(-18,-122,m),0]};return P;},
      after(){J.root.updateMatrixWorld(true);const s=J.shL.getWorldPosition(V()),e=J.elL.getWorldPosition(V());const dir=e.clone().sub(s).normalize();
        const n=V(0,1,0).sub(dir.clone().multiplyScalar(dir.y)).normalize().negate();
        pad.position.copy(s.clone().lerp(e,.55)).add(n.clone().multiplyScalar(.085));pad.position.x=0;pad.quaternion.setFromUnitVectors(V(0,0,1),V(0,dir.y,dir.z).normalize());
        const q=new THREE.Quaternion();
        if(isMachine){const gl=J.gpL.getWorldPosition(V()),gr=J.gpR.getWorldPosition(V());hb.position.copy(gl.clone().add(gr).multiplyScalar(.5));
          const eL=J.elL.getWorldPosition(V());tubeSet(lever[0],V(.28,eL.y,eL.z),V(.28,gl.y,gl.z));tubeSet(lever[1],V(-.28,eL.y,eL.z),V(-.28,gr.y,gr.z));}
        else[[dl,'L'],[dr,'R']].forEach(([d,s2])=>{d.position.copy(J['gp'+s2].getWorldPosition(V()));d.quaternion.copy(J['hd'+s2].getWorldQuaternion(q));});}};};}
  RIGS.dbpreacher=preacher(false);RIGS.curl=preacher(true);
  /* ---- pec deck: rear delt fly (facing pad) & chest fly (back to pad) ---- */
  function pecDeck(rear){return ()=>{const g=G();g.add(seat(0,.45,0,.4,.38));g.add(box(.36,.75,.08,M.pad,0,.95,rear?.24:-.2));g.add(box(.08,.45,.08,M.frame,0,.22,0),box(.6,.04,.9,M.frame,0,.02,.0));
    g.add(box(.08,1.95,.08,M.frame,0,.97,rear?.36:-.3),box(.5,.06,.06,M.frame,0,1.92,rear?.36:-.3));g.add(stack(0,rear?.75:-.7,1.4));
    const piv=s=>V(.1*s,1.55,rear?.36:-.3);const hs=[1,-1].map(s=>{const h=G();h.add(cyl(.022,.2,M.grip,0,0,0));g.add(h);const a=tube(piv(s),V(0,1,0),.018,M.frame);g.add(a);return {h,a,s};});
    const zL=rear?[14,82]:[76,12];
    return {g,cam:rear?{tgt:V(0,1.15,.1),dist:2.8,el:34,az:160}:{tgt:V(0,1.15,.1),dist:2.9,el:28,az:28},track:()=>J.gpL.getWorldPosition(V()),
      tl:tl2(rear?['Start · arms forward at shoulder height','Sweep back · arms wide','Squeeze rear delts','Return · 2 sec']:['Start · arms open wide','Hug together','Squeeze chest','Open slowly · 2 sec']),
      pose(m){const P={p:V(0,.575,0),r:[rear?6:-4,0,0],spine:0,head:0};seatLegs(P,.45,.2);const z=lerp(zL[0],zL[1],m);
        P.armL={fk:[-86,0,z,rear?-10:-22,0]};P.armR={fk:[-86,0,-z,rear?-10:-22,0]};return P;},
      after(){hs.forEach(o=>{const gp=J[o.s>0?'gpL':'gpR'].getWorldPosition(V());o.h.position.copy(gp);tubeSet(o.a,piv(o.s),gp);});}};};}
  RIGS.reardelt=pecDeck(true);RIGS.fly=pecDeck(false);
  /* ---- hack squat ---- */
  RIGS.hack=()=>{const g=G();const ang=45*D;const d=V(0,Math.sin(ang),-Math.cos(ang));
    g.add(box(.8,.06,1.7,M.frame,0,.03,-.25));[-1,1].forEach(s=>{g.add(tube(V(.36*s,.08,.42),V(.36*s,.08,.42).add(d.clone().multiplyScalar(2.0)),.03,M.chrome));});
    const plat=box(.66,.05,.42,M.frame,0,.14,.43,-18*D);g.add(plat);g.add(box(.66,.02,.42,M.grip,0,.17,.43,-18*D));
    const car=G();car.add(box(.44,.62,.08,M.pad,0,0,0,-ang+Math.PI/2-Math.PI/2));car.add(box(.15,.08,.2,M.pad,.15,.33,.08),box(.15,.08,.2,M.pad,-.15,.33,.08));
    car.add(cyl(.02,.14,M.grip,.27,.3,.06,0,0,Math.PI/2),cyl(.02,.14,M.grip,-.27,.3,.06,0,0,Math.PI/2));g.add(car);
    const ank=s=>V(.15*s,.23,.44),P0=V(0,.5,-.16);
    const hipMid=s_=>{const r=P0.clone().add(d.clone().multiplyScalar(s_));return r.clone().add(V(0,-.04,0).applyAxisAngle(V(1,0,0),-ang));};
    const sFor=dist=>{let a=-.5,b=1.5;for(let i=0;i<40;i++){const mm=(a+b)/2;const hd=hipMid(mm).distanceTo(V(0,.23,.44));if(hd<dist)a=mm;else b=mm;}return (a+b)/2;};
    const sTop=sFor(.84),sBot=sFor(.47);const fUp=V(0,Math.cos(18*D),-Math.sin(18*D)),fF=V(0,Math.sin(18*D),Math.cos(18*D));
    return {g,cam:{tgt:V(0,.82,.05),dist:3.2,el:8,az:84},track:()=>J.root.getWorldPosition(V()),
      tl:tl2(['Start · back flat on the pad, legs nearly straight','Lower · 2 sec','Bottom · thighs at least parallel','Drive up through the whole foot'],{lowerFirst:true}),
      pose(m){const s_=lerp(sTop,sBot,m);const root=P0.clone().add(d.clone().multiplyScalar(s_));
        const P={p:root,r:[-45,0,0],spine:0,head:10};P.legL=legIK(.15,.23,.44,V(.25,.3,1),foot(fUp,fF));P.legR=legIK(-.15,.23,.44,V(-.25,.3,1),foot(fUp,fF));
        const tf=torsoFrame(root,-45,0);car.position.copy(tf.at(.3,0,-.17));car.rotation.set(-ang+Math.PI/2-Math.PI/2+(-45*D)*0,0,0);car.quaternion.setFromEuler(new THREE.Euler(-45*D,0,0));
        P.armL=armIK(tf.at(.6,.27,.06),V(.6,-1,-.4));P.armR=armIK(tf.at(.6,-.27,.06),V(-.6,-1,-.4));return P;}};};
  /* ---- Romanian deadlift ---- */
  RIGS.rdl=()=>{const g=G();const bar=barbell(2.0);g.add(bar);
    return {g,cam:{tgt:V(0,.72,-.05),dist:3.3,el:8,az:48},track:()=>bar.position,
      tl:tl2(['Start · stand tall, soft knees','Hips back · bar slides down thighs','Hamstring stretch · back flat','Drive hips forward · squeeze glutes'],{lowerFirst:true,d1:2.4,d2:1.3}),
      pose(m){const e=ease(m);const P=standLegs({p:V(0,lerp(.975,.86,e),lerp(0,-.25,e)),r:[lerp(3,74,e),0,0],spine:-4,head:lerp(0,-26,e)},.12,0);
        const b=V(0,lerp(.82,.38,m),lerp(.1,.045,m));bar.position.copy(b);
        P.armL=armIK(b.clone().add(V(.25,0,0)),V(.3,0,-1));P.armR=armIK(b.clone().add(V(-.25,0,0)),V(-.3,0,-1));return P;}};};
  /* ---- leg extension & seated leg curl ---- */
  function kneeMachine(curl){return ()=>{const g=G();g.add(seat(0,.47,-.02,.44,.46));g.add(box(.42,.7,.08,M.pad,0,.9,-.27,-.12));g.add(box(.08,.47,.08,M.frame,0,.23,-.02),box(.7,.04,1.1,M.frame,0,.02,.1));
    [-1,1].forEach(s=>{g.add(box(.05,.55,.05,M.frame,s*.32,.27,.36));g.add(cyl(.045,.05,M.chrome,s*.3,.55,.39,0,0,Math.PI/2));g.add(cyl(.018,.16,M.grip,s*.3,.5,-.02,Math.PI/2));});
    if(curl)g.add(box(.44,.08,.18,M.pad,0,.68,.28));g.add(stack(-.62,-.1,1.25));
    const roll=cyl(.05,.44,M.pad,0,0,0,0,0,Math.PI/2),arm=tube(V(),V(0,1,0),.018,M.frame);g.add(roll,arm);
    return {g,cam:{tgt:V(0,.62,.25),dist:2.8,el:8,az:86},track:()=>roll.position,
      tl:tl2(curl?['Start · legs extended, pad behind ankles','Curl heels down & back','Squeeze hamstrings','Return · 2 sec']:['Start · knees at the pivot','Extend','Squeeze quads · 1 sec','Lower · 2 sec']),
      pose(m){const P={p:V(0,.585,-.04),r:[-8,0,0],spine:0,head:0};const k=curl?lerp(8,98,m):lerp(86,4,m);
        P.legL={fk:[-82,0,0,k,curl?-10:-5]};P.legR={fk:[-82,0,0,k,curl?-10:-5]};
        P.armL=armIK(V(.3,.5,-.02),V(.6,-.6,-1));P.armR=armIK(V(-.3,.5,-.02),V(-.6,-.6,-1));return P;},
      after(){const a=J.anL.getWorldPosition(V()),kn=J.knL.getWorldPosition(V());const sh=a.clone().sub(kn).normalize();const perp=V(0,sh.z,-sh.y).multiplyScalar(curl?-1:1);
        roll.position.copy(a.clone().add(sh.clone().multiplyScalar(-.03)).add(perp.multiplyScalar(.075)));roll.position.x=0;tubeSet(arm,V(.3,.55,.39),V(.3,roll.position.y,roll.position.z));}};};}
  RIGS.legext=kneeMachine(false);RIGS.legcurl=kneeMachine(true);
  /* ---- adductor machine ---- */
  RIGS.adductor=()=>{const g=G();g.add(seat(0,.46,-.02,.46,.46));g.add(box(.44,.72,.08,M.pad,0,.9,-.27,-.1));g.add(box(.08,.46,.08,M.frame,0,.23,-.02),box(.8,.04,1.0,M.frame,0,.02,.1));g.add(stack(0,-.75,1.3));
    const pads=[1,-1].map(s=>{const p=box(.06,.24,.2,M.pad,0,0,0);g.add(p);const a=tube(V(0,.4,.3),V(0,1,0),.018,M.frame);g.add(a);return {p,a,s};});
    return {g,cam:{tgt:V(0,.62,.2),dist:2.6,el:38,az:6},track:()=>J.knL.getWorldPosition(V()),
      tl:tl2(['Start · a comfortable stretch','Squeeze knees together','Pause','Open slowly · 2 sec']),
      pose(m){const P={p:V(0,.575,-.04),r:[-6,0,0],spine:0,head:0};const z=lerp(34,4,m);
        P.legL={fk:[-84,0,z,82,-6]};P.legR={fk:[-84,0,-z,82,-6]};P.armL=armIK(V(.31,.5,-.05),V(.6,-.6,-1));P.armR=armIK(V(-.31,.5,-.05),V(-.6,-.6,-1));return P;},
      after(){pads.forEach(o=>{const k=J[o.s>0?'knL':'knR'].getWorldPosition(V());const pp=k.clone().add(V(-.07*o.s,0,0));o.p.position.copy(pp);tubeSet(o.a,V(.0,.42,.32),V(pp.x,.42,pp.z));});}};};
  /* ---- power clean (multi-key) ---- */
  RIGS.clean=()=>{const g=G();const bar=barbell(2.0);g.add(bar);g.add(box(1.8,.03,1.4,M.grip,0,.015,0));
    const K=[
      {p:V(0,.62,-.2),r:44,b:V(0,.225,.05),pole:1,heel:0,spine:-4,head:-14},   /* setup */
      {p:V(0,.78,-.23),r:38,b:V(0,.5,.04),pole:1,heel:0,spine:-4,head:-10},    /* bar at knee */
      {p:V(0,.87,-.12),r:18,b:V(0,.72,.08),pole:1,heel:0,spine:-2,head:-6},    /* power position */
      {p:V(0,1.03,-.02),r:-8,b:V(0,1.0,.08),pole:.6,heel:1,spine:0,head:0,shrug:1}, /* triple extension */
      {p:V(0,.84,-.02),r:6,b:null,pole:0,heel:0,spine:0,head:0,rack:1},        /* catch */
      {p:V(0,.975,0),r:3,b:null,pole:0,heel:0,spine:0,head:0,rack:1},          /* stand */
    ];
    const keyAt=m=>{/* m in [0,5] across keys */const i=Math.min(4,Math.floor(m)),f=m-i;return [K[i],K[i+1],f];};
    return {g,cam:{tgt:V(0,.98,0),dist:3.7,el:12,az:36},track:()=>bar.position,
      tl:[{m:0,dur:.9,label:'Setup · flat back, bar over mid-foot'},{from:0,to:1,dur:.55,label:'First pull · push the floor away'},{from:1,to:2,dur:.25,label:'Bar past the knees'},
          {from:2,to:3,dur:.18,label:'Explode · hips, knees, ankles'},{from:3,to:4,dur:.22,label:'Catch · elbows high'},{m:4,dur:.5,label:'Catch · quarter squat',fin:true},
          {from:4,to:5,dur:.7,label:'Stand up'},{m:5,dur:.6,label:'Finish tall'},{from:5,to:2.4,dur:1.0,label:'Reset · lower under control'},{from:2.4,to:0,dur:1.0,label:'Reset · back to the floor'}],
      mScale:5,
      pose(m){const [a,b,f]=keyAt(m);const e=f;const r=lerp(a.r,b.r,e);const p=lv(a.p,b.p,e);
        const heel=lerp(a.heel,b.heel,e);const shrug=lerp(a.shrug||0,b.shrug||0,e);const rack=lerp(a.rack||0,b.rack||0,e);
        const P={p,r:[r,0,0],spine:lerp(a.spine,b.spine,e),head:lerp(a.head,b.head,e),scapL:[0,.035*shrug,0],scapR:[0,.035*shrug,0]};
        const hy=.07+heel*.06;const fu=V(0,Math.cos(heel*28*D),-Math.sin(heel*28*D)),ff=V(0,Math.sin(heel*28*D),Math.cos(heel*28*D));
        P.legL=legIK(.13,hy,heel*.04,V(.25,.1,1),foot(fu,ff));P.legR=legIK(-.13,hy,heel*.04,V(-.25,.1,1),foot(fu,ff));
        const tf=torsoFrame(p,r,P.spine);const rackPos=tf.at(.47,0,.15);
        const pullPos=a.b&&b.b?lv(a.b,b.b,e):a.b?lv(a.b,rackPos,e):b.b?lv(rackPos,b.b,e):rackPos;
        const bp=rack>0&&(!a.b||!b.b)?(a.b?lv(a.b,rackPos,ease(e)):b.b?lv(rackPos,b.b,e):rackPos):pullPos;bar.position.copy(bp);
        const pl=lv(V(.35,0,-1),V(.35,.25,1),Math.max(0,Math.min(1,rack)));
        P.armL=armIK(bp.clone().add(V(.25,0,0)),V(pl.x,pl.y,pl.z));P.armR=armIK(bp.clone().add(V(-.25,0,0)),V(-pl.x,pl.y,pl.z));return P;}};};
  /* ---- leg press & leg press calf raise ---- */
  function legPress(calf){return ()=>{const g=G();const r=V(0,Math.SQRT1_2,Math.SQRT1_2);
    g.add(box(.9,.06,2.2,M.frame,0,.03,.15));g.add(box(.5,.09,.46,M.pad,0,.42,-.42,-.2));g.add(box(.5,.75,.09,M.pad,0,.72,-.85,-50*D+Math.PI/2*0,0,0));
    const bp=g.children[g.children.length-1];bp.rotation.set(-(90-50)*D,0,0);bp.position.set(0,.72,-.82);
    g.add(box(.08,.42,.08,M.frame,0,.21,-.42));[-1,1].forEach(s=>{g.add(tube(V(.38*s,.25,.05),V(.38*s,.25,.05).add(r.clone().multiplyScalar(1.6)),.03,M.chrome));g.add(cyl(.018,.16,M.grip,.3*s,.48,-.36,Math.PI/2));});
    const plat=G();plat.add(box(.62,.6,.05,M.frame,0,0,0));plat.add(box(.62,.6,.02,M.grip,0,0,-.035));[-1,1].forEach(s=>plat.add(cyl(.12,.05,M.plate,.4*s,0,.05,0,0,Math.PI/2,28),cyl(.04,.054,M.rim,.4*s,0,.05,0,0,Math.PI/2,16)));
    plat.quaternion.setFromUnitVectors(V(0,0,1),r);g.add(plat);
    const root=V(0,.6,-.34),rx=-50;const hipC=root.clone().add(V(0,-.04,0).applyAxisAngle(V(1,0,0),rx*D));
    const P0=V(0,.55,.25);const ankAt=s_=>P0.clone().add(r.clone().multiplyScalar(s_)).add(r.clone().multiplyScalar(-.07));
    const sFor=dd=>{let a=-.6,b=1.6;for(let i=0;i<40;i++){const mm=(a+b)/2;if(ankAt(mm).distanceTo(hipC)<dd)a=mm;else b=mm;}return (a+b)/2;};
    const sTop=sFor(.84),sBot=sFor(.46),sCalf=sFor(.8);const fUp=r.clone().negate(),fF=V(0,Math.SQRT1_2,-Math.SQRT1_2);
    return {g,cam:{tgt:V(0,.85,.2),dist:3.3,el:10,az:86},track:()=>plat.position,
      tl:calf?tl2(['Start · heels low, deep calf stretch','Press onto your toes','Pause at the top','Lower · 2 sec']):tl2(['Start · legs extended, soft knees','Lower · 2 sec, knees toward ~90°','Bottom · low back stays on the pad','Press through the whole foot'],{lowerFirst:true}),
      pose(m){const P={p:root.clone(),r:[rx,0,0],spine:0,head:14};
        if(!calf){const s_=lerp(sTop,sBot,m);const a=ankAt(s_);plat.position.copy(P0.clone().add(r.clone().multiplyScalar(s_)));
          P.legL=legIK(.14,a.y,a.z,V(.25,.7,.6),foot(fUp,fF));P.legR=legIK(-.14,a.y,a.z,V(-.25,.7,.6),foot(fUp,fF));}
        else{const ang=lerp(-18,24,m)*D;const a=ankAt(sCalf);const ax=V(1,0,0);const up=fUp.clone().applyAxisAngle(ax,-ang),fw=fF.clone().applyAxisAngle(ax,-ang);
          P.legL=legIK(.14,a.y,a.z,V(.25,.7,.6),foot(up,fw));P.legR=legIK(-.14,a.y,a.z,V(-.25,.7,.6),foot(up,fw));P._calf={a,up,fw};}
        P.armL=armIK(V(.3,.5,-.36),V(.5,-.6,-1));P.armR=armIK(V(-.3,.5,-.36),V(-.5,-.6,-1));return P;},
      after(P){if(calf){const an=J.anL;const ball=V(0,-.07,.15).applyQuaternion(an.getWorldQuaternion(new THREE.Quaternion())).add(an.getWorldPosition(V()));
          const s_=ball.clone().sub(P0).dot(r);plat.position.copy(P0.clone().add(r.clone().multiplyScalar(s_)));}}};};}
  RIGS.legpress=legPress(false);RIGS.calf2=legPress(true);
  /* ---- chest press machine ---- */
  RIGS.chestpress=()=>{const g=G();g.add(seat(0,.45,-.02,.44,.4));g.add(box(.42,.82,.08,M.pad,0,.94,-.22));g.add(box(.08,.45,.08,M.frame,0,.22,-.02),box(.7,.04,1.2,M.frame,0,.02,.2));g.add(stack(0,-.7,1.4));
    [-1,1].forEach(s=>{g.add(box(.05,1.5,.05,M.frame,s*.4,.75,-.22));g.add(box(.04,.04,.95,M.chrome,s*.36,1.42,.25));});
    const hs=[1,-1].map(s=>{const h=G();h.add(cyl(.022,.18,M.grip,0,0,0));const a=tube(V(),V(0,1,0),.016,M.frame);g.add(h,a);return {h,a,s};});
    return {g,cam:{tgt:V(0,1.05,.2),dist:3.0,el:16,az:52},track:()=>hs[0].h.position,
      tl:tl2(['Start · handles beside mid-chest','Press forward','Near lockout · shoulders back','Return · 2 sec, feel the stretch']),
      pose(m){const P={p:V(0,.575,-.04),r:[-4,0,0],spine:0,head:0};seatLegs(P,.5,.2);const L=V(.24,1.02,lerp(.12,.62,m));
        hs.forEach(o=>{const p=o.s>0?L:mirrorX(L);o.h.position.copy(p);tubeSet(o.a,V(.36*o.s,1.42,p.z),p);});
        P.armL=armIK(L,V(1,-.6,-.3));P.armR=armIK(mirrorX(L),V(-1,-.6,-.3));return P;}};};
  /* ---- triceps press machine ---- */
  RIGS.tripush=()=>{const g=G();g.add(seat(0,.45,-.02,.44,.4));g.add(box(.42,.72,.08,M.pad,0,.9,-.22));g.add(box(.08,.45,.08,M.frame,0,.22,-.02),box(.8,.04,1.0,M.frame,0,.02,.1));g.add(stack(0,-.7,1.4));
    const piv=s=>V(.36*s,.6,-.25);const hs=[1,-1].map(s=>{const h=G();h.add(cyl(.024,.16,M.grip,0,0,0,Math.PI/2));const a=tube(piv(s),V(0,1,0),.02,M.frame);g.add(h,a);return {h,a,s};});
    return {g,cam:{tgt:V(0,.85,0),dist:2.8,el:10,az:66},track:()=>hs[0].h.position,
      tl:tl2(['Start · elbows bent about 90°','Press down','Lockout · squeeze triceps','Rise slowly · 2 sec']),
      pose(m){const P={p:V(0,.575,-.04),r:[-2,0,0],spine:0,head:0};seatLegs(P,.5,.2);const L=V(.28,lerp(.8,.47,m),lerp(.22,.04,m));
        hs.forEach(o=>{const p=o.s>0?L:mirrorX(L);o.h.position.copy(p);tubeSet(o.a,piv(o.s),p);});
        P.armL=armIK(L,V(.25,-.2,-1));P.armR=armIK(mirrorX(L),V(-.25,-.2,-1));return P;}};};
  /* ---- barbell back squat ---- */
  RIGS.squat=()=>{const g=G();[-1,1].forEach(s=>{g.add(box(.07,2.1,.07,M.frame,s*.62,1.05,-.32),box(.07,2.1,.07,M.frame,s*.62,1.05,.32));g.add(box(.06,.05,.7,M.chrome,s*.62,.62,0));});g.add(box(1.4,.05,.9,M.frame,0,.025,0));
    const bar=barbell(2.0);g.add(bar);
    return {g,cam:{tgt:V(0,.88,0),dist:3.4,el:8,az:40},track:()=>bar.position,
      tl:tl2(['Start · brace, bar on upper back','Sit down & back · 2 sec','Depth · hips at or below knees','Drive up through mid-foot'],{lowerFirst:true}),
      pose(m){const e=ease(m);const root=V(0,lerp(.975,.53,e),lerp(.0,-.2,e)),rx=lerp(6,38,e);
        const P=standLegs({p:root,r:[rx,0,0],spine:0,head:lerp(0,-14,e)},.17,0,15);
        const tf=torsoFrame(root,rx,0);const b=tf.at(.47,0,-.11);bar.position.copy(b);
        P.armL=armIK(b.clone().add(V(.4,0,0)),V(.3,-1,-.5));P.armR=armIK(b.clone().add(V(-.4,0,0)),V(-.3,-1,-.5));return P;}};};
  /* ---- push-up ---- */
  RIGS.pushup=()=>{const g=G();g.add(box(.7,.02,1.9,M.grip,0,.01,-.1));
    const A=V(0,.1,-.68);
    return {g,cam:{tgt:V(0,.32,-.12),dist:3.0,el:12,az:84},track:()=>J.shL.getWorldPosition(V()),
      tl:tl2(['Start · straight line head to heels','Lower · 2 sec','Chest a fist from the floor','Press up'],{lowerFirst:true}),
      pose(m){const sh=V(0,lerp(.64,.27,m),.34);const Dv=sh.clone().sub(A).normalize();const root=A.clone().add(Dv.clone().multiplyScalar(.9));
        const rx=Math.atan2(Dv.z,Dv.y)/D;const P={p:root,r:[rx,0,0],spine:0,head:-8};
        const fu=V(0,.15,1).normalize(),ff=V(0,-1,.12).normalize();
        P.legL=legIK(.1,.1,-.68,V(0,-1,.2),foot(fu,ff));P.legR=legIK(-.1,.1,-.68,V(0,-1,.2),foot(fu,ff));
        P.armL=armIK(V(.25,.04,.36),V(.75,.55,-.6),{up:V(0,0,-1),fwd:V(0,-1,0)});P.armR=armIK(V(-.25,.04,.36),V(-.75,.55,-.6),{up:V(0,0,-1),fwd:V(0,-1,0)});return P;}};};
  /* ---- ab crunch machine ---- */
  RIGS.crunch=()=>{const g=G();g.add(seat(0,.45,-.02,.44,.4));g.add(box(.42,.7,.08,M.pad,0,.9,-.24));g.add(box(.08,.45,.08,M.frame,0,.22,-.02),box(.7,.04,1.0,M.frame,0,.02,.12));g.add(stack(.6,-.3,1.3));
    g.add(cyl(.045,.4,M.pad,0,.16,.42,0,0,Math.PI/2));const hs=[1,-1].map(s=>{const h=G();h.add(cyl(.022,.14,M.grip,0,0,0,0,0,Math.PI/2));const a=tube(V(),V(0,1,0),.018,M.frame);g.add(h,a);return {h,a,s};});
    return {g,cam:{tgt:V(0,.95,.05),dist:2.8,el:8,az:84},track:()=>J.neck.getWorldPosition(V()),
      tl:tl2(['Start · sit tall, hold the handles','Crunch · ribs toward hips','Squeeze abs','Return · 2 sec']),
      pose(m){const P={p:V(0,.575,-.04),r:[-2,0,0],spine:lerp(0,42,m),head:lerp(0,16,m)};
        P.legL=legIK(.16,.18,.38,V(.15,.6,1),foot(V(0,1,0),V(0,.3,1)));P.legR=legIK(-.16,.18,.38,V(-.15,.6,1),foot(V(0,1,0),V(0,.3,1)));
        const tf=torsoFrame(P.p,-2,P.spine);[['armL',1],['armR',-1]].forEach(([k,s])=>{P[k]=armIK(tf.at(.5,.13*s,.15),V(.7*s,-.7,-.3));});
        hs.forEach(o=>{const hp=tf.at(.5,.13*o.s,.15);o.h.position.copy(hp);tubeSet(o.a,V(.3*o.s,.62,-.25),hp);});return P;}};};
  /* ---- plank ---- */
  RIGS.plank=()=>{const g=G();g.add(box(.7,.02,1.9,M.grip,0,.01,-.1));const A=V(0,.1,-.78);
    return {g,cam:{tgt:V(0,.3,-.2),dist:3.0,el:10,az:80},track:()=>J.root.getWorldPosition(V()),
      tl:[{m:0,dur:1.4,label:'Hold · straight line head to heels'},{from:0,to:1,dur:1.6,label:'Brace · squeeze glutes & abs'},{m:1,dur:1.2,label:'Breathe steadily',fin:true},{from:1,to:0,dur:1.6,label:'Hold'}],
      pose(m){const sh=V(0,.36+.006*Math.sin(m*Math.PI),.3);const Dv=sh.clone().sub(A).normalize();const root=A.clone().add(Dv.clone().multiplyScalar(.9));
        const rx=Math.atan2(Dv.z,Dv.y)/D;const P={p:root,r:[rx,0,0],spine:0,head:-6};const fu=V(0,.15,1).normalize(),ff=V(0,-1,.12).normalize();
        P.legL=legIK(.1,.1,-.78,V(0,-1,.2),foot(fu,ff));P.legR=legIK(-.1,.1,-.78,V(0,-1,.2),foot(fu,ff));
        P.armL=armIK(V(.12,.04,.62),V(0,-1,-.15),{up:V(0,1,0),fwd:V(0,0,1)});P.armR=armIK(V(-.12,.04,.62),V(0,-1,-.15),{up:V(0,1,0),fwd:V(0,0,1)});return P;}};};
  /* ---- back extension ---- */
  RIGS.backext=()=>{const g=G();const pd=box(.46,.08,.34,M.pad,0,.86,.04,-45*D);g.add(pd);g.add(box(.6,.05,1.3,M.frame,0,.025,-.2));
    g.add(tube(V(0,.05,-.6),V(0,.84,.0),.04,M.frame));g.add(cyl(.045,.36,M.pad,0,.3,-.66,0,0,Math.PI/2),cyl(.045,.36,M.pad,0,.18,-.62,0,0,Math.PI/2));g.add(box(.36,.03,.24,M.frame,0,.06,-.62,-50*D));
    return {g,cam:{tgt:V(0,.8,.05),dist:3.1,el:6,az:84},track:()=>J.neck.getWorldPosition(V()),
      tl:tl2(['Start · body in a straight line','Hinge down · flat back · 2 sec','Stretch at the bottom','Rise · squeeze glutes, stop at straight'],{lowerFirst:true}),
      pose(m){const P={p:V(0,.93,.02),r:[lerp(45,112,ease(m)),0,0],spine:0,head:lerp(-6,-20,m)};
        const fu=V(0,Math.cos(50*D),Math.sin(50*D)),ff=V(0,-Math.sin(50*D),Math.cos(50*D)).negate().multiplyScalar(-1);
        P.legL=legIK(.1,.2,-.56,V(0,-.4,1),foot(V(0,.75,.66),V(0,.66,-.75).negate()));P.legR=legIK(-.1,.2,-.56,V(0,-.4,1),foot(V(0,.75,.66),V(0,.66,-.75).negate()));
        P.armL={fk:[-38,0,-28,-125,0]};P.armR={fk:[-38,0,28,-125,0]};return P;}};};
  /* ---- glute trainer (hip thrust machine) ---- */
  RIGS.glutetrainer=()=>{const g=G();g.add(box(.6,.12,.4,M.pad,0,.46,-.5));g.add(box(.08,.42,.08,M.frame,0,.2,-.5),box(.8,.04,1.5,M.frame,0,.02,-.05));g.add(box(.7,.04,.45,M.grip,0,.05,.3));
    const pad=cyl(.06,.44,M.pad,0,0,0,0,0,Math.PI/2);g.add(pad);const arms=[1,-1].map(s=>{const a=tube(V(),V(0,1,0),.022,M.frame);g.add(a);return {a,s};});
    [-1,1].forEach(s=>g.add(box(.05,.4,.05,M.frame,s*.38,.2,.62)));g.add(stack(-.8,.3,1.2));
    const S0=V(0,.6,-.42);
    return {g,cam:{tgt:V(0,.5,0),dist:2.9,el:10,az:84},track:()=>pad.position,
      tl:tl2(['Start · hips low, upper back on the pad','Drive hips up through your heels','Squeeze glutes · 1 sec','Lower under control · 2 sec'],{h1:.9}),
      pose(m){const rx=lerp(-58,-90,ease(m));const tf=torsoFrame(V(),rx,0);const root=S0.clone().sub(tf.up.clone().multiplyScalar(.44)).sub(V(0,.06,0).applyAxisAngle(V(1,0,0),rx*D));
        const P={p:root,r:[rx,0,0],spine:0,head:lerp(30,48,m)};P.legL=legIK(.16,.09,.3,V(.2,1,.4));P.legR=legIK(-.16,.09,.3,V(-.2,1,.4));
        P.armL=armIK(V(.33,.44,-.36),V(.5,-.5,-.5));P.armR=armIK(V(-.33,.44,-.36),V(-.5,-.5,-.5));
        const hp=root.clone().add(V(0,-.02,0).applyAxisAngle(V(1,0,0),rx*D)).add(V(0,.13,0).applyAxisAngle(V(1,0,0),(rx+90)*D));pad.position.copy(hp);
        arms.forEach(o=>tubeSet(o.a,V(.38*o.s,.4,.62),V(.24*o.s,hp.y,hp.z)));return P;}};};

  /* ---------- scene ---------- */
  function floorTex(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const gr=x.createRadialGradient(128,128,10,128,128,128);
    gr.addColorStop(0,'rgba(60,66,78,0.95)');gr.addColorStop(.55,'rgba(36,40,48,0.7)');gr.addColorStop(1,'rgba(20,22,27,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);}
  function initScene(){
    R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
    scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(36,1,.05,50);mats();
    scene.add(new THREE.HemisphereLight(0xe2e8ff,0x23262c,.75));
    const key=new THREE.DirectionalLight(0xffffff,1.25);key.position.set(2.6,4.6,3.2);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
    Object.assign(key.shadow.camera,{left:-2.2,right:2.2,top:2.6,bottom:-1.2,near:.5,far:12});key.shadow.bias=-.0005;key.shadow.radius=3;scene.add(key);
    const fill=new THREE.DirectionalLight(0x9db6ff,.38);fill.position.set(-3,2.2,2);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffe0c8,.55);rim.position.set(-1,3,-4);scene.add(rim);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(3.2,64),new THREE.MeshBasicMaterial({map:floorTex(),transparent:true,depthWrite:false}));fl.rotation.x=-Math.PI/2;scene.add(fl);
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.ShadowMaterial({opacity:.38}));sh.rotation.x=-Math.PI/2;sh.position.y=.001;sh.receiveShadow=true;scene.add(sh);
    const grid=new THREE.GridHelper(5,20,0x3a3f4a,0x2a2e36);grid.material.transparent=true;grid.material.opacity=.35;grid.position.y=.002;scene.add(grid);
    body=makeBody();scene.add(body);
  }
  function tint(ex){
    Object.keys(MM).forEach(k=>{const m=MM[k];m.color.copy(M.skin.color);m.emissive.setHex(0x000000);m.userData.mode=0;});
    (ex.secondary||[]).forEach(k=>{if(MM[k]){MM[k].color.setHex(0xF0A07A);MM[k].userData.mode=1;}});
    (ex.primary||[]).forEach(k=>{if(MM[k]){MM[k].color.setHex(0xFF3B30);MM[k].userData.mode=2;}});
  }
  function totalDur(){return rig.tl.reduce((a,s)=>a+s.dur,0);}
  function mAt(time){const T=totalDur();let x=((time%T)+T)%T;for(const s of rig.tl){if(x<=s.dur){if(s.m!=null)return {m:s.m,seg:s};const f=ease(Math.min(1,x/s.dur));return {m:lerp(s.from,s.to,f),seg:s};}x-=s.dur;}const s=rig.tl[rig.tl.length-1];return {m:s.m!=null?s.m:s.to,seg:s};}
  function frame(m){const P=rig.pose(m);applyPose(P);if(rig.after)rig.after(P);}
  function buildPath(){
    if(pathObj){scene.remove(pathObj);pathObj.traverse(o=>{if(o.geometry&&o.geometry!==SPH)o.geometry.dispose();});}
    const max=rig.mScale||1;const pts=[];for(let i=0;i<=40;i++){frame(max*i/40);pts.push(rig.track().clone());}
    const g=new THREE.Group();const geo=new THREE.BufferGeometry().setFromPoints(pts);const ln=new THREE.Line(geo,new THREE.LineDashedMaterial({color:0xFF5A26,dashSize:.035,gapSize:.022,transparent:true,opacity:.95,depthTest:false}));ln.computeLineDistances();ln.renderOrder=5;g.add(ln);
    const mk=(p,c)=>{const s=new THREE.Mesh(SPH,new THREE.MeshBasicMaterial({color:c,depthTest:false}));s.scale.setScalar(.022);s.position.copy(p);s.renderOrder=6;g.add(s);};
    mk(pts[0],0x34D399);mk(pts[40],0xFF5A26);if(rig.mScale)mk(pts[Math.round(40*(rig.tl.find(s=>s.fin).m/max))],0xFF5A26);
    pathObj=g;scene.add(g);
  }
  function placeCam(){const a=(az+(sway&&playing?Math.sin(t*.35)*9:0))*D,e=el*D;cam.position.set(tgt.x+dist*Math.sin(a)*Math.cos(e),tgt.y+dist*Math.sin(e),tgt.z+dist*Math.cos(a)*Math.cos(e));cam.lookAt(tgt);}
  function resize(){if(!host||!R)return;const w=host.clientWidth||320,h=host.clientHeight||260;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;if(playing)t+=dt*speed;draw();}
  function draw(){const mm=mAt(t);const m=fixedM!=null?fixedM:mm.m,seg=mm.seg;frame(m);
    const pulse=.35+.35*Math.sin(t*3.2);Object.values(MM).forEach(mt=>{if(mt.userData.mode===2)mt.emissive.setRGB(.35*pulse,.03*pulse,.02*pulse);});
    if(ui.phase&&ui.phase.textContent!==seg.label){ui.phase.textContent=seg.label;ui.phase.classList.toggle('fin',!!seg.fin);}
    if(ui.scrub&&!ui.scrubbing)ui.scrub.value=String(((t%totalDur())+totalDur())%totalDur()/totalDur()*1000|0);
    placeCam();R.render(scene,cam);}
  const VIEWS=[['Default',null],['Side',90],['Front',0],['Back',180]];
  function mount(h,exId){
    try{if(!R)initScene();}catch(e){R=null;h.innerHTML='<div class="fallback">3D isn’t supported on this device — follow the steps and muscle map below.</div>';return false;}
    unmount();const ex=getEx(exId);const make=RIGS[(ex&&ex.rig)||exId];if(!make){h.innerHTML='<div class="fallback">No demo for this exercise.</div>';return false;}
    fixedM=null;host=h;cur=exId;rig=make();machine=rig.g;machine.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(machine);tint(ex);
    tgt=rig.cam.tgt.clone();dist=rig.cam.dist;el=rig.cam.el;az=rig.cam.az;view=0;sway=true;t=0;playing=true;speed=1;last=0;
    buildPath();
    h.innerHTML=`<div class="phase"></div><div class="hint">drag to rotate</div><div class="dctl"><button data-d="play" aria-label="Pause">❚❚</button><button data-d="speed">1×</button><input type="range" min="0" max="999" value="0" aria-label="Scrub"><button data-d="view">View</button><button data-d="path" class="on" aria-label="Movement path">Path</button></div>`;
    h.appendChild(R.domElement);ui={phase:h.querySelector('.phase'),scrub:h.querySelector('input'),scrubbing:false};
    const bt=k=>h.querySelector(`[data-d="${k}"]`);
    bt('play').onclick=()=>{playing=!playing;bt('play').textContent=playing?'❚❚':'▶';};
    bt('speed').onclick=()=>{speed=speed===1?.5:speed===.5?.25:1;bt('speed').textContent=(speed===1?'1':speed===.5?'½':'¼')+'×';};
    bt('view').onclick=()=>{view=(view+1)%VIEWS.length;const v=VIEWS[view];az=v[1]==null?rig.cam.az:v[1];sway=view===0;bt('view').textContent=v[0];};
    bt('path').onclick=()=>{pathObj.visible=!pathObj.visible;bt('path').classList.toggle('on',pathObj.visible);};
    ui.scrub.oninput=()=>{ui.scrubbing=true;playing=false;bt('play').textContent='▶';t=ui.scrub.value/1000*totalDur();draw();};ui.scrub.onchange=()=>{ui.scrubbing=false;};
    const cv=R.domElement;cv.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,az,el};sway=false;try{cv.setPointerCapture(e.pointerId);}catch(_){}};
    cv.onpointermove=e=>{if(!drag)return;az=drag.az-(e.clientX-drag.x)*.45;el=Math.max(-5,Math.min(60,drag.el+(e.clientY-drag.y)*.25));};cv.onpointerup=cv.onpointercancel=()=>{drag=null;};
    if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(h);}resize();draw();last=0;raf=requestAnimationFrame(loop);return true;
  }
  function unmount(){cancelAnimationFrame(raf);raf=0;if(ro){ro.disconnect();ro=null;}
    if(machine){scene.remove(machine);machine.traverse(o=>{if(o.geometry&&o.geometry!==SPH)o.geometry.dispose();});machine=null;}
    if(pathObj){scene.remove(pathObj);pathObj=null;}if(R&&R.domElement.parentNode)R.domElement.parentNode.removeChild(R.domElement);host=null;cur=null;}
  /* test hooks */
  function setM(m){playing=false;fixedM=m;draw();}
  function setView(a,e){if(a!=null)az=a;if(e!=null)el=e;sway=false;}
  return {mount,unmount,setM,setView,rigs:RIGS,get rig(){return rig;},labels:()=>rig.tl.map(s=>s.label)};
})();
