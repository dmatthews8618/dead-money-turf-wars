const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawnSync}=require('node:child_process');
const submit=require('./dead-money-submit.cjs');
test('only valid owner move-only PRs merge, pinned to the validated head',async()=>{
 const original=process.cwd(),root=fs.mkdtempSync(path.join(os.tmpdir(),'dm-pr-test-'));
 fs.mkdirSync(path.join(root,'scripts'));fs.mkdirSync(path.join(root,'competition'));
 fs.copyFileSync(path.join(__dirname,'dead-money-turn.mjs'),path.join(root,'scripts/dead-money-turn.mjs'));
 const init=spawnSync(process.execPath,[path.join(root,'scripts/dead-money-turn.mjs')],{cwd:root,encoding:'utf8',env:{...process.env,APPROVE_DAY:''}});
 assert.equal(init.status,0,init.stderr);
 let merged=0,pr={number:7,state:'open',draft:false,base:{ref:'main'},user:{login:'owner'},head:{sha:'verified-head',repo:{name:'repo',owner:{login:'owner'}}}},files=[{filename:'competition/moves/codex/day-01.json',status:'added',changes:12}];
 let actions=[{type:'hold'}];
 const github={
  paginate:async()=>files,
  rest:{
   pulls:{get:async()=>({data:pr}),listFiles(){},merge:async args=>{assert.equal(args.sha,'verified-head');merged++;return {data:{merged:true}}}},
   repos:{getContent:async()=>({data:{type:'file',size:200,encoding:'base64',content:Buffer.from(JSON.stringify({schema:'dead-money-move-v1',agent:'codex',day:1,actions,reason:'Test'})).toString('base64')}})}
  }
 };
 const args={github,context:{repo:{owner:'owner',repo:'repo'},issue:{number:7},payload:{pull_request:{}}},core:{info(){}}};
 try {
  process.chdir(root);
  await submit(args);assert.equal(merged,1);
  actions=[{type:'travel',district:'The Docks'}];
  await assert.rejects(submit(args),/Invalid travel/);assert.equal(merged,1);
  pr.user.login='someone-else';await submit(args);assert.equal(merged,1);
  pr.user.login='owner';files.push({filename:'scripts/dead-money-turn.mjs',status:'modified'});await submit(args);assert.equal(merged,1);
  files=[{filename:'competition/moves/codex/day-02.json',status:'added',changes:12}];await submit(args);assert.equal(merged,1);
 } finally {process.chdir(original);fs.rmSync(root,{recursive:true,force:true});}
});
