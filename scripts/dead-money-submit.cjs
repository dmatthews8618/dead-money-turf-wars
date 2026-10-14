// Runs only from trusted main; never executes code from a move pull request.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
module.exports = async ({github, context, core}) => {
  const {owner, repo} = context.repo;
  if (!context.payload?.pull_request) {
    const prs = await github.paginate(github.rest.pulls.list, {owner, repo, state:'open', base:'main', per_page:100});
    for (const pr of prs.filter(pr => pr.user.login === owner)) {
      await module.exports({github, core, context:{...context, issue:{...context.issue, number:pr.number}, payload:{pull_request:pr}}});
    }
    return;
  }
  const {data:pr} = await github.rest.pulls.get({owner, repo, pull_number:context.issue.number});
  if (pr.state !== 'open' || pr.draft || pr.base.ref !== 'main' || pr.user.login !== owner) {
    core.info('Only owner-submitted, ready move PRs targeting main are eligible.'); return;
  }
  const files = await github.paginate(github.rest.pulls.listFiles, {owner, repo, pull_number:pr.number, per_page:100});
  if (files.length !== 1 || !['added','modified'].includes(files[0].status)) {
    core.info('Not a single move submission; leave for normal review.'); return;
  }
  const match = JSON.parse(fs.readFileSync('competition/match.json','utf8'));
  const filename = files[0].filename;
  const hit = /^competition\/moves\/(codex|claude)\/day-(\d{2})\.json$/.exec(filename);
  if (!hit || match.finished || Number(hit[2]) !== match.day || match.processed[hit[1]] === match.day) {
    core.info('Not an unprocessed move for the current day.'); return;
  }
  if (files[0].changes > 200) throw Error('Move file exceeds submission size limit');
  const {data:blob} = await github.rest.repos.getContent({owner:pr.head.repo.owner.login, repo:pr.head.repo.name, path:filename, ref:pr.head.sha});
  if (blob.type !== 'file' || blob.size > 16384 || blob.encoding !== 'base64') throw Error('Invalid move file');
  const move = Buffer.from(blob.content,'base64').toString('utf8');
  JSON.parse(move);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'dm-submit-'));
  try {
    fs.mkdirSync(path.join(temp,path.dirname(filename)),{recursive:true});
    fs.writeFileSync(path.join(temp,'competition/match.json'),JSON.stringify(match));
    fs.writeFileSync(path.join(temp,filename),move);
    const result=spawnSync(process.execPath,[path.resolve('scripts/dead-money-turn.mjs')],{
      cwd:temp,env:{...process.env,APPROVE_DAY:String(match.day)},encoding:'utf8'
    });
    if(result.error) throw result.error;
    if(result.status!==0) throw Error((result.stderr || 'Invalid move').trim());
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
  const result = await github.rest.pulls.merge({owner,repo,pull_number:pr.number,sha:pr.head.sha,merge_method:'squash'});
  if (!result.data.merged) throw Error('Move could not be merged: '+result.data.message);
  core.info(`Merged validated ${hit[1]} move for day ${match.day}.`);
};
