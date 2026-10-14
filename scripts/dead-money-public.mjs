import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const match=read('competition/match.json');
const logFile=process.env.PROCESS_LOG;
const log=logFile && fs.existsSync(logFile)?fs.readFileSync(logFile,'utf8'):'';
const failure=log.match(/(?:Error: )?((?:codex|claude): [^\n]+)/)?.[1];
const failed=process.env.PROCESS_OUTCOME==='failure';
const players=['codex','claude'].map(id=>{
  const o=read(`competition/inbox/${id}.json`);
  const filename=`competition/moves/${id}/day-${String(match.day).padStart(2,'0')}.json`;
  return {id,cash:o.cash,debt:o.debt,health:o.health,district:o.district,
    inventoryUnits:Object.values(o.cargo).reduce((a,b)=>a+b,0),
    submitted:fs.existsSync(filename),processed:match.processed[id]===match.day};
});
const status=match.finished?'finished':failed?'error':players.every(p=>p.submitted)?'processing':'waiting';
const out={schema:'dead-money-public-v1',day:match.day,finished:match.finished,status,
  updatedAt:new Date().toISOString(),players,
  error:failed?(failure || 'Turn processing failed. Ask the AI sessions to check and fix it.'):null,
  events:(match.events || []).slice(-12),
  runUrl:process.env.GITHUB_RUN_ID?`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`:null};
fs.writeFileSync('competition/public.json',JSON.stringify(out,null,2)+'\n');
