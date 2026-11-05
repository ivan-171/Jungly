const fs=require('fs'),path=require('path');
const {Game,CFG}=require('../src/engine.js');
const styles=['farm','defense','gank','counter','objectives','mixed','random'];
const n=Number(process.argv[2]||504),results=[];
for(let i=0;i<n;i++){
 const seed=(171+Math.floor(i/7)*7919)>>>0,g=new Game(seed),style=styles[i%7];g.heroes[0].bot=style;g.start();
 let territorySum=0,samples=0,minTerritory=3,maxTerritory=3,seen=0,at60=null,fullControlAt=null;
 while(g.mode==='play'){g.step();if(at60===null&&g.t>=60)at60=g.owned(0).length;if(fullControlAt===null&&[0,6].includes(g.owned(0).length))fullControlAt=g.t;if(Math.round(g.t*30)%150===0){let k=g.owned(0).length;territorySum+=k;samples++;minTerritory=Math.min(minTerritory,k);maxTerritory=Math.max(maxTerritory,k);if(g.visible(0,g.heroes[1]))seen++;}}
 const h=g.heroes[0],r=g.heroes[1];
 if(!Number.isFinite(h.hp)||g.t<194.99||h.hp<0)throw new Error('Invalid game '+seed);
 results.push({seed,style,win:g.result.win,draw:g.result.draw,duration:g.t,deaths:h.stats.deaths,rivalDeaths:r.stats.deaths,level:h.level,rivalLevel:r.level,camps:h.stats.camps,rivalCamps:r.stats.camps,damage:Math.round(h.stats.damage),ganks:h.stats.ganks,objectives:h.stats.objectives,travel:+h.stats.travel.toFixed(2),territory:g.owned(0).length,avgTerritory:+(territorySum/samples).toFixed(2),minTerritory,maxTerritory,at60,fullControlAt,captures:g.captures,firstCapture:g.firstCapture,enemySeenSamples:seen,advantage:g.result.tie[0]-g.result.tie[1]});
 if((i+1)%72===0)console.log('Simulated',i+1);
}
function aggregate(rows){const avg=k=>+(rows.reduce((a,r)=>a+(r[k]||0),0)/rows.length).toFixed(2);return{games:rows.length,wins:rows.filter(r=>r.win).length,draws:rows.filter(r=>r.draw).length,winRate:+(100*rows.filter(r=>r.win).length/rows.length).toFixed(2),duration:avg('duration'),deaths:avg('deaths'),rivalDeaths:avg('rivalDeaths'),level:avg('level'),rivalLevel:avg('rivalLevel'),camps:avg('camps'),rivalCamps:avg('rivalCamps'),damage:avg('damage'),ganks:avg('ganks'),objectives:avg('objectives'),territory:avg('territory'),travel:avg('travel'),captures:avg('captures'),gamesWithCapture:rows.filter(r=>r.captures>0).length,firstCapture:+(rows.filter(r=>r.firstCapture!==null).reduce((s,r)=>s+r.firstCapture,0)/Math.max(1,rows.filter(r=>r.firstCapture!==null).length)).toFixed(2),advantage:avg('advantage')}}
const report={config:CFG,summary:aggregate(results),strategies:Object.fromEntries(styles.map(s=>[s,aggregate(results.filter(r=>r.style===s))])),results};
fs.writeFileSync(path.join(__dirname,'simulation-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:undefined},null,2));
