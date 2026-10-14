import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), data=path.join(root,'competition');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>{const target=path.join(root,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(v,null,2)+'\n')};
const agents=['codex','claude'],goods=['Weed','Speed','Pills','Coke','Heroin','Acid'],base=[45,90,135,310,480,170];
const districts=['The Docks','East End','Old Town','The Estate','Market Row','Southside'];
const seed=Number(process.env.MATCH_SEED||1977);
function rng(n){let x=(Math.imul(n+1,1664525)+Math.imul(seed,1013904223))>>>0;return (x%100000)/100000}
function prices(day,d){return base.map((p,i)=>Math.max(5,Math.round(p*(.55+rng(day*1000+d*50+i)*1.25))))}
function initial(){return {version:1,day:1,finished:false,agents:Object.fromEntries(agents.map(id=>[id,{cash:800,debt:2000,hp:100,heat:0,location:0,cargo:Object.fromEntries(goods.map(g=>[g,0])),journal:[],sightings:{}}])),events:[],processed:{}}}
let s=fs.existsSync(path.join(data,'match.json'))?read('competition/match.json'):initial();
const worth=a=>a.cash-a.debt+goods.reduce((n,g,i)=>n+a.cargo[g]*prices(s.day,a.location)[i],0);
const observe=(id)=>{const a=s.agents[id];return {schema:'dead-money-observation-v1',agent:id,day:s.day,daysRemaining:31-s.day,district:districts[a.location],cash:a.cash,debt:a.debt,health:a.hp,heat:a.heat,capacity:40,cargo:a.cargo,prices:Object.fromEntries(goods.map((g,i)=>[g,prices(s.day,a.location)[i]])),knownDistricts:a.sightings,journal:a.journal.slice(-12),allowedActions:['buy','sell','repay','travel','lay_low','hold']}};
function apply(id,move){const a=structuredClone(s.agents[id]),day=s.day,pr=prices(day,a.location),event=[];if(move.schema!=='dead-money-move-v1'||move.agent!==id||move.day!==day||!Array.isArray(move.actions)||move.actions.length>8||typeof move.reason!=='string'||move.reason.length>1000)throw Error('Invalid move envelope');
const allowed=new Set(['buy','sell','repay','travel','lay_low','hold']);let traveled=false;
for(const action of move.actions){if(!action||!allowed.has(action.type))throw Error('Invalid action');const type=action.type;
if(type==='buy'||type==='sell'){const i=goods.indexOf(action.good),q=action.quantity;if(i<0||!Number.isInteger(q)||q<1||q>40)throw Error('Invalid goods or quantity');const amount=pr[i]*q;
if(type==='buy'){if(a.cash<amount||goods.reduce((n,g)=>n+a.cargo[g],0)+q>40)throw Error('Cannot afford or carry purchase');a.cash-=amount;a.cargo[action.good]+=q}
else{if(a.cargo[action.good]<q)throw Error('Insufficient cargo');a.cargo[action.good]-=q;a.cash+=amount}event.push(type+' '+q+' '+action.good+' £'+amount)}
else if(type==='repay'){const amount=action.amount;if(!Number.isInteger(amount)||amount<1||amount>a.cash||amount>a.debt)throw Error('Invalid repayment');a.cash-=amount;a.debt-=amount;event.push('repaid £'+amount)}
else if(type==='travel'){const d=districts.indexOf(action.district);if(traveled||d<0||d===a.location||a.cash<25)throw Error('Invalid travel');a.cash-=25;a.location=d;traveled=true;event.push('travel to '+districts[d])}
else if(type==='lay_low'){if(a.cash<100)throw Error('Cannot afford to lie low');a.cash-=100;a.heat=Math.max(0,a.heat-25);event.push('lay low')}
else event.push('hold')}
a.journal.push({day,reason:move.reason.slice(0,1000),events:event});a.journal=a.journal.slice(-24);

s.agents[id]=a;s.events.push({day,agent:id,actions:event,reason:move.reason.slice(0,1000)});s.processed[id]=day;
}
function publish(){for(const id of agents){const a=s.agents[id],o=observe(id);a.sightings[o.district]={day:s.day,prices:o.prices};write('competition/inbox/'+id+'.json',o)}write('competition/match.json',s);
const lines=['# DEAD MONEY — Match report','','Day: **'+s.day+'/30**','Status: **'+(s.finished?'Finished':'Waiting for agent moves')+'**','','| Agent | Cash | Debt | Net worth | District |','|---|---:|---:|---:|---|',...agents.map(id=>{const a=s.agents[id];return '| '+id+' | £'+a.cash+' | £'+a.debt+' | £'+worth(a)+' | '+districts[a.location]+' |'}) ,'','## Recent decisions',...s.events.slice(-12).map(e=>'- Day '+e.day+' **'+e.agent+'**: '+e.actions.join('; ')+' — '+e.reason),'','Agents submit competition/moves/<agent>/day-XX.json, then run the workflow.'];fs.writeFileSync(path.join(data,'REPORT.md'),lines.join('\n')+'\n')}
if(!s.finished){const pending=agents.filter(id=>s.processed[id]!==s.day);
for(const id of pending){const filename='competition/moves/'+id+'/day-'+String(s.day).padStart(2,'0')+'.json';if(!fs.existsSync(path.join(root,filename)))continue;
const move=read(filename);try{apply(id,move)}catch(e){console.error(id+': '+e.message);process.exitCode=1;break}}
if(agents.every(id=>s.processed[id]===s.day)){for(const id of agents){const a=s.agents[id];a.debt=Math.ceil(a.debt*1.02);a.heat=Math.max(0,a.heat-3)}
if(s.day===30)s.finished=true;else s.day++}}
publish();console.log('Report generated. Day '+s.day+', finished '+s.finished);
