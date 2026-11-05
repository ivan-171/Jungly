/* Frontera Viva 0.6 · deterministic simulation. Original refactor of 0.5. */
(function(root){'use strict';
const CFG={width:1000,height:800,duration:195,dt:1/30,heroSpeed:168,heroRate:.68,vision:205,troopSpeed:63,wave:26,villageHP:190,towerRadius:83,healRadius:75,healPerSecond:30,respawn:6,captureSeconds:4};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),other=t=>1-t;
const VILLAGES=[['Robledal',130,140,0],['Alba',130,400,0],['Vado',130,660,0],['Peñarroja',870,140,1],['Umbría',870,400,1],['Cenizal',870,660,1]];
const CAMPS=[['Colmillos',290,90,1,'wolf'],['Jabalí joven',275,305,1,'boar'],['Lobos del vado',280,570,1,'wolf'],['Colmillos rojos',710,90,1,'wolf'],['Jabalí de ceniza',725,305,1,'boar'],['Lobos umbríos',720,570,1,'wolf'],['Escarabajo',390,730,1,'beetle'],['Escarabajo rojo',610,730,1,'beetle'],['Guardián del roble',385,210,2,'golem'],['Guardián de ceniza',615,210,2,'golem'],['Colmillo antiguo',390,480,2,'boar'],['Bestia de Umbría',610,480,2,'boar'],['Gigante de sal',500,85,3,'golem'],['Gigante sepultado',500,625,3,'golem'],['Ascua del alba',500,345,4,'ember'],['Ojo del valle',500,465,4,'eye']];
function heroStats(l){return{max:182+24*(l-1),atk:30+5*(l-1),armor:8+2*(l-1)}}
function xpNeed(l){return 42+34*(l-1)}
function campStats(t){return[{},{hp:145,atk:12,rate:1.5,xp:32,respawn:32},{hp:270,atk:22,rate:1.45,xp:58,respawn:41},{hp:455,atk:36,rate:1.4,xp:90,respawn:50},{hp:385,atk:29,rate:1.5,xp:80,respawn:52}][t]}
class Game{
constructor(seed=171){this.seed=seed>>>0;this.rng=this.seed||1;this.uid=0;this.t=0;this.mode='intro';this.result=null;this.effects=[];this.logs=[];this.troops=[];this.buffs=[{ember:0,eye:0},{ember:0,eye:0}];this.score=[0,0];this.firstCapture=null;this.joy=null;this.captures=0;
this.heroes=[this.makeHero(0),this.makeHero(1)];this.villages=VILLAGES.map(([name,x,y,team],id)=>({id,kind:'village',name,x,y,team,hp:CFG.villageHP,max:CFG.villageHP,cd:0,nextWave:8+(id%3)*2+this.random()*3,under:-100,capture:0,shield:0,sent:0,age:0,home:team}));
this.camps=CAMPS.map(([name,x,y,tier,art],id)=>{const b=campStats(tier);return{id:'c'+id,kind:'camp',name,x,y,tier,art,...b,max:b.hp,cd:.8,respawnAt:tier===4?42:0,hp:tier===4?0:b.hp,target:null,leash:0,lastTeam:null,known:[null,null]}});
this.log('Toca un campamento pequeño. La guerra ya tiene sus propias rutas.');}
random(){this.rng=(Math.imul(this.rng,1664525)+1013904223)>>>0;return this.rng/4294967296}
makeHero(team){return{rng:(this.seed^(team?303:171))>>>0,id:'h'+team,kind:'hero',team,x:team?785:215,y:400,...heroStats(1),hp:182,speed:CFG.heroSpeed,level:1,xp:0,cd:0,respawn:0,target:null,dest:null,aiIn:0,aiMode:'farm',commit:0,memory:null,stats:{camps:0,troops:0,kills:0,deaths:0,damage:0,ganks:0,travel:0,objectives:0,xp:0},visitedBattle:-100,seenUntil:-1,heal:false,moving:false}}
start(){if(this.mode==='intro'||this.mode==='paused')this.mode='play'}
pause(){if(this.mode==='play'){this.mode='paused';this.joy=null}}
log(msg){this.logs.unshift({t:this.t,msg});if(this.logs.length>24)this.logs.pop()}
effect(type,x,y,text='',team=0){this.effects.push({type,x,y,text,team,life:type==='hit'?.22:1.15});if(this.effects.length>90)this.effects.shift()}
owned(team){return this.villages.filter(v=>v.team===team)}
refuge(h){return this.owned(h.team).reduce((best,v)=>!best||distance(v,h)<distance(best,h)?v:best,null)}
visible(team,p){return this.buffs[team].eye>this.t||this.heroes[team].hp>0&&distance(this.heroes[team],p)<CFG.vision||this.villages.some(v=>v.team===team&&distance(v,p)<125)||this.troops.some(u=>u.team===team&&u.hp>0&&distance(u,p)<100)}
intel(team,c){return c.known[team]}
observe(){for(let team=0;team<2;team++){const h=this.heroes[team],foe=this.heroes[other(team)];if(foe.hp>0&&this.visible(team,foe)){h.memory={x:foe.x,y:foe.y,hp:foe.hp,max:foe.max,level:foe.level,t:this.t};foe.seenUntil=this.t+2}if(h.memory&&this.t-h.memory.t>9)h.memory=null;for(const c of this.camps)if(this.visible(team,c))c.known[team]={hp:c.hp,respawnAt:c.respawnAt,t:this.t};}}
command(x,y,target=null,team=0){const h=this.heroes[team];if(this.mode!=='play'||h.hp<=0)return;h.target=target&&target.hp>0?target:null;h.dest=h.target?null:{x:clamp(x,18,982),y:clamp(y,18,782)};if(team===0)this.joy=null;}
move(h,p,dt,safe=false){if(!p)return;let goal=p;
if(safe){for(const v of this.villages){if(v.team===h.team||distance(v,p)<100)continue;const dx=p.x-h.x,dy=p.y-h.y,d2=dx*dx+dy*dy||1,q=clamp(((v.x-h.x)*dx+(v.y-h.y)*dy)/d2,0,1);if(q>.02&&q<.98&&Math.hypot(h.x+q*dx-v.x,h.y+q*dy-v.y)<102){const len=Math.sqrt(d2),side=((v.x-h.x)*dy-(v.y-h.y)*dx)>=0?-1:1;goal={x:clamp(v.x+side*-dy/len*122,20,980),y:clamp(v.y+side*dx/len*122,20,780)};break}}}
const d=distance(h,goal);if(d<2)return;const step=Math.min(d,h.speed*dt);h.x=clamp(h.x+(goal.x-h.x)/d*step,15,985);h.y=clamp(h.y+(goal.y-h.y)/d*step,18,782);h.moving=true;if(h.kind==='hero')h.stats.travel+=step/h.speed;}
project(h,c){const dmg=c.atk*100/(100+h.armor),hits=Math.max(0,Math.ceil(c.hp/h.atk)-1),ttk=hits*CFG.heroRate;return{ttk,damage:Math.ceil(ttk/c.rate)*dmg,risk:Math.ceil(ttk/c.rate)*dmg/Math.max(1,h.hp)}}
gain(h,xp){h.xp+=xp;h.stats.xp+=xp;while(h.xp>=xpNeed(h.level)&&h.level<12){h.xp-=xpNeed(h.level);h.level++;const s=heroStats(h.level);h.hp+=s.max-h.max;Object.assign(h,s);this.effect('level',h.x,h.y,'NIVEL '+h.level,h.team);if(h.team===0)this.log('Nivel '+h.level+' · más vida, daño y defensa.')}}
hurt(target,raw,from){if(target.hp<=0||(target.kind==='hero'&&target.respawn>0))return;const damage=raw*100/(100+(target.armor||0));target.hp=Math.max(0,target.hp-damage);this.effect('hit',target.x,target.y,'−'+Math.ceil(damage),from.team??1);if(target.kind==='hero')target.stats.damage+=damage;
if(target.hp>0)return;
if(target.kind==='camp'){target.target=null;target.respawnAt=this.t+target.respawn;target.lastTeam=from.team;if(from.kind==='hero'){from.stats.camps++;this.gain(from,target.xp);if(target.tier===4){from.stats.objectives++;this.buffs[from.team][target.art]=this.t+29;this.log((from.team?'Vesper':'Tú')+' obtiene '+target.name+': '+(target.art==='ember'?'tropas +18% de daño':'visión del valle')+' durante 29 s.')}else if(from.team===0)this.log(target.name+' · +'+target.xp+' PX');this.effect('reward',target.x,target.y,'+'+target.xp+' PX',from.team)}
}else if(target.kind==='hero'){target.respawn=CFG.respawn+Math.min(3,Math.floor(this.t/75));target.target=null;target.dest=null;target.stats.deaths++;target.aiIn=0;this.score[other(target.team)]+=2;if(from.kind==='hero'&&from.team!==target.team){from.stats.kills++;this.gain(from,40)}this.log(target.team===0?'Has caído. Reapareces en '+Math.ceil(target.respawn)+' s.':'Vesper ha caído'+(from===this.heroes[0]?' ante tu espada.':' ante la guerra.'));this.effect('death',target.x,target.y,'',target.team);
}else if(target.kind==='troop'&&from.kind==='hero'){from.stats.troops++;this.gain(from,12);this.effect('reward',target.x,target.y,'+12 PX',from.team);if(this.t-from.visitedBattle>5){from.stats.ganks++;from.visitedBattle=this.t;}}
}
attack(h,target){if(!target||target.kind==='village'||target.hp<=0||h.cd>0)return;if(target.kind==='camp'){target.target=h;target.leash=0}this.effect('slash',target.x,target.y,'',h.team);this.hurt(target,h.atk,h);h.cd=h.kind==='hero'?CFG.heroRate:1.25;}
nearFoe(a,r){let best=null,bd=r;const h=this.heroes[other(a.team)];if(h.hp>0&&distance(a,h)<bd){best=h;bd=distance(a,h)}for(const u of this.troops)if(u.team!==a.team&&u.hp>0){const d=distance(a,u);if(d<bd){best=u;bd=d}}return best}
aiRandom(h){h.rng=(Math.imul(h.rng,1664525)+1013904223)>>>0;return h.rng/4294967296}
ai(h,style='mixed'){if(h.hp<=0)return;h.aiIn=.8+this.aiRandom(h)*.6;const refuge=this.refuge(h);const foe=this.heroes[other(h.team)];const seen=foe.hp>0&&this.visible(h.team,foe);
if(refuge&&(h.hp<h.max*.31||h.aiMode==='heal'&&h.hp<h.max*.94)){h.aiMode='heal';h.target=null;h.dest=refuge;return}
if(seen&&distance(h,foe)<140&&h.hp/(foe.atk||30)<foe.hp/h.atk*.72){h.aiMode='flee';h.target=null;h.dest=refuge||{x:h.team?975:25,y:400};return}
if(this.t<h.commit&&h.target?.hp>0&&!(h.target.kind==='hero'&&!this.visible(h.team,h.target)))return;
const options=[];for(const c of this.camps){const info=c.known[h.team];if(!info)continue;const hp=info.hp>0?info.hp:(this.t>=info.respawnAt?c.max:0);if(!hp)continue;const est={...c,hp},p=this.project(h,est);if(p.risk>.82)continue;const tower=this.villages.some(v=>v.team!==h.team&&distance(c,v)<98);if(tower)continue;const inv=(h.team===0?c.x>540:c.x<460);let s=c.xp/(4+distance(h,c)/h.speed+p.ttk+p.risk*14);if(style==='farm')s*=1.4;if(style==='counter'&&inv)s*=1.7;if(style==='objectives'&&c.tier===4)s*=2.5;if(c.tier===4)s*=1.24;if(h.memory&&distance(h.memory,c)<170&&this.t-h.memory.t<5)s*=.82;
options.push({s:s*(.88+this.aiRandom(h)*.24),target:c,mode:'farm'});}
for(const u of this.troops){if(u.hp<=0||u.team===h.team||!this.visible(h.team,u))continue;const friends=this.troops.filter(a=>a.team===h.team&&a.hp>0&&distance(a,u)<130).length;const threatened=this.villages.some(v=>v.team===h.team&&distance(v,u)<180);const tower=this.villages.some(v=>v.team!==h.team&&distance(v,u)<85);let s=(2.4+friends*1.2+(threatened?4.5:0))/(1+distance(h,u)/230);if(threatened&&this.owned(h.team).length<3)s*=1.4;if(tower)s*=.28;if(style==='mixed')s*=1.3;if(style==='gank')s*=1.5;if(style==='defense'&&threatened)s*=2;options.push({s,target:u,mode:threatened?'defend':'gank'});}
if(seen&&h.hp/foe.atk>foe.hp/h.atk*1.12&&!this.villages.some(v=>v.team!==h.team&&distance(foe,v)<105))options.push({s:4.8/(1+distance(h,foe)/180),target:foe,mode:'duel'});
if(refuge&&h.hp<h.max*.66)options.push({s:2.7/(1+distance(h,refuge)/300),dest:refuge,mode:'heal'});
if(style==='random'&&options.length){const b=options[Math.floor(this.aiRandom(h)*options.length)];h.target=b.target||null;h.dest=b.dest||null;h.aiMode=b.mode;h.commit=this.t+2.8;return}
options.sort((a,b)=>b.s-a.s);const b=options[0];if(b){h.target=b.target||null;h.dest=b.dest||null;h.aiMode=b.mode;h.commit=this.t+2.5+this.aiRandom(h)*1.4}else{h.target=null;h.dest=refuge;h.aiMode='patrol'}
}
updateHero(h,dt){h.moving=false;h.cd=Math.max(0,h.cd-dt);h.heal=false;
if(h.respawn>0){h.respawn=Math.max(0,h.respawn-dt);if(h.respawn===0){const v=this.refuge(h);h.x=v?v.x+(h.team?-38:38):(h.team?975:25);h.y=v?v.y:400;h.hp=h.max*.8;h.aiIn=0;this.effect('level',h.x,h.y,'REGRESO',h.team)}return}
if(h.team===1||h.bot){h.aiIn-=dt;if(h.aiIn<=0)this.ai(h,h.bot||'mixed')}
if(h.target&&h.target.hp<=0&&this.visible(h.team,h.target)){h.target=null;h.aiIn=0}
// Losing sight ends pursuit at the last known point; no tracking through fog.
if(h.target?.kind==='hero'&&!this.visible(h.team,h.target)){const mem=h.memory;h.dest=mem?{x:mem.x,y:mem.y}:null;h.target=null;h.aiIn=0;}
if(h.team===0&&this.joy){h.target=null;h.dest=null;this.move(h,{x:h.x+this.joy.x*120,y:h.y+this.joy.y*120},dt)}
else if(h.target){if(distance(h,h.target)>42)this.move(h,h.target,dt,h.team===1||!!h.bot);else this.attack(h,h.target)}
else if(h.dest){if(distance(h,h.dest)>4)this.move(h,h.dest,dt,h.team===1||!!h.bot);else h.dest=null}
// Automatic combat never overrides a retreat command and never pulls a neutral.
if(!h.target&&!h.dest&&!this.joy){const foe=this.nearFoe(h,45);if(foe)this.attack(h,foe)}
const v=this.villages.find(v=>v.team===h.team&&distance(h,v)<CFG.healRadius);if(v&&h.hp<h.max){h.hp=Math.min(h.max,h.hp+CFG.healPerSecond*dt);h.heal=true}
}
updateCamps(dt){for(const c of this.camps){if(c.hp<=0){if(this.t>=c.respawnAt){c.max=Math.round(campStats(c.tier).hp*(1+Math.min(.45,this.t*.0025)));c.hp=c.max;c.cd=.8;c.target=null;c.leash=0;this.effect('spawn',c.x,c.y,'',0)}continue}c.cd=Math.max(0,c.cd-dt);
if(c.target){const h=c.target;if(h.hp>0&&distance(c,h)<65){c.leash=0;if(c.cd===0){this.hurt(h,c.atk,c);c.cd=c.rate}}else{c.leash+=dt;if(c.leash>1.8){c.target=null;c.leash=0}}}else if(c.hp<c.max)c.hp=Math.min(c.max,c.hp+25*dt);}}
spawn(v,count=2,dest=null){const enemies=this.villages.filter(w=>w.team!==v.team);if(!enemies.length)return;const parallel=this.villages.find(w=>w.team!==v.team&&Math.abs(w.y-v.y)<30);const target=dest||parallel||enemies.reduce((a,b)=>distance(a,v)<distance(b,v)?a:b);for(let i=0;i<count;i++){if(this.troops.filter(u=>u.team===v.team&&u.hp>0).length>=24)return;this.troops.push({id:'u'+(++this.uid),kind:'troop',team:v.team,x:v.x+(v.team?-28:28),y:v.y-10+i*20,hp:92,max:92,atk:12,speed:CFG.troopSpeed,cd:this.random()*.5,goal:target.id,origin:v.id,moving:false});v.sent++}}
transfer(v,team){if(v.team===team)return;v.team=team;v.hp=v.max*.65;v.capture=0;v.shield=this.t+9;v.nextWave=this.t+12;v.under=this.t;v.age=0;this.captures++;this.firstCapture??=this.t;this.score[team]+=3;this.effect('capture',v.x,v.y,v.name,team);this.log(v.name+(team===0?' es nuestra. Ahora cura y envía tropas aliadas.':' ha caído. El enemigo tiene una nueva posición.'));}
updateVillages(dt){for(const v of this.villages){v.age+=dt;v.cd=Math.max(0,v.cd-dt);const enemy=this.troops.filter(u=>u.hp>0&&u.team!==v.team&&distance(u,v)<85),friends=this.troops.filter(u=>u.hp>0&&u.team===v.team&&distance(u,v)<90);if(enemy.length&&v.hp<=0){v.under=this.t;v.capture+=dt*(friends.length?.3:1);if(v.capture>=CFG.captureSeconds)this.transfer(v,other(v.team))}else if(!enemy.length){v.capture=Math.max(0,v.capture-dt*1.5);if(v.hp<=0&&v.capture===0)v.hp=35;}
if(this.t-v.under>7)v.hp=Math.min(v.max,v.hp+2.4*dt);
if(v.hp>0&&v.cd===0){const h=this.heroes[other(v.team)],target=enemy.sort((a,b)=>distance(a,v)-distance(b,v))[0]||(h.hp>0&&distance(h,v)<CFG.towerRadius?h:null);if(target){this.hurt(target,target.kind==='hero'?25:(this.owned(v.team).length===1?12:8),{kind:'tower',team:v.team,x:v.x,y:v.y});v.cd=1.2;this.effect('bolt',target.x,target.y,'',v.team);}}
const interval=CFG.wave*(.5+this.owned(v.team).length/6)*(v.team!==v.home?1.18:1)*(this.buffs[v.team].eye>this.t?.88:1);
// Outlying villages maintain supply over longer routes; last stands resist siege, never grant units from nowhere.
if(this.t>=v.nextWave&&v.hp>0){if(this.troops.filter(u=>u.origin===v.id&&u.team===v.team).length<4)this.spawn(v,v.team!==v.home&&v.age<45?1:(this.owned(v.team).length===1?3:(this.random()<.17?3:2)));v.nextWave=this.t+interval+this.random()*2;}
}}
updateTroops(dt){for(const u of this.troops){if(u.hp<=0)continue;u.moving=false;u.cd=Math.max(0,u.cd-dt);let foe=this.nearFoe(u,43);let v=this.villages[u.goal];if(v.team===u.team){const next=this.villages.filter(a=>a.team!==u.team).sort((a,b)=>distance(a,u)-distance(b,u))[0];if(next){u.goal=next.id;v=next}}
if(foe){if(u.cd===0){this.hurt(foe,u.atk*(this.buffs[u.team].ember>this.t?1.18:1),u);u.cd=1.3;this.effect('slash',foe.x,foe.y,'',u.team)}}else if(v&&v.team!==u.team){if(distance(u,v)>62)this.move(u,v,dt);else if(u.cd===0&&this.t>v.shield){const owned=this.owned(v.team).length,armor=owned<=1?.22:owned===2?.7:1;v.hp=Math.max(0,v.hp-u.atk*.9*armor*(this.buffs[u.team].ember>this.t?1.18:1));v.under=this.t;u.cd=1.3;this.effect('bolt',v.x,v.y,'',u.team)}}}
this.troops=this.troops.filter(u=>u.hp>0);}
finish(){this.t=CFG.duration;const n=this.owned(0).length;const a=this.heroes[0],b=this.heroes[1];const tie=[a.stats.xp+a.stats.kills*35,b.stats.xp+b.stats.kills*35];const win=n>3||n===3&&tie[0]>tie[1];const draw=n===3&&tie[0]===tie[1];this.result={win:win&&!draw,draw,territory:n,tie,reason:n!==3?'El control territorial decide la guerra.':draw?'Mismo territorio y misma influencia: tablas.':'3–3: decide la influencia (PX obtenidos + 35 por duelo ganado).'};this.mode='ended';this.log(this.result.reason);}
step(dt=CFG.dt){if(this.mode!=='play')return;dt=Math.min(dt,CFG.dt);this.t=Math.min(CFG.duration,this.t+dt);this.observe();this.updateHero(this.heroes[0],dt);this.updateHero(this.heroes[1],dt);this.updateCamps(dt);this.updateTroops(dt);this.updateVillages(dt);for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);if(this.t>=CFG.duration-1e-6)this.finish();}
advance(seconds){for(let i=0;i<Math.ceil(seconds/CFG.dt)&&this.mode==='play';i++)this.step()}
}
const api={Game,CFG,distance,clamp,heroStats,xpNeed,campStats};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Frontier=api;
})(typeof window!=='undefined'?window:globalThis);
