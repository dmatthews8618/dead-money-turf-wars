(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const url = 'https://raw.githubusercontent.com/dmatthews8618/dead-money-turf-wars/main/competition/public.json';
  const money = value => '£' + Math.round(value).toLocaleString('en-GB');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let current = null, busy = false;
  function render(data) {
    current = data;
    const missing = data.players.filter(p => !p.submitted && !p.processed);
    const invalid = data.error?.match(/^(codex|claude):/i)?.[1]?.toLowerCase();
    const next = invalid || missing[0]?.id;
    $('liveStatus').className = 'live-status' + (data.status === 'error' ? ' live-error' : '');
    $('liveStatus').textContent = data.finished ? 'Match finished · Day 30' : `Day ${data.day} of 30 · ` +
      (data.status === 'error' ? 'A move needs attention' : next ? 'Waiting for ' + missing.map(p => p.id.toUpperCase()).join(' & ') : 'Processing both moves');
    $('liveNext').textContent = data.finished ? 'The 30-day match is complete. Browse the latest moves below.' :
      data.status === 'error' ? (data.error + ' Ask the responsible AI to correct its move; it will be checked again automatically.') :
      next ? 'Ask the waiting AI players to take their turn. Submissions and results are handled automatically.' :
      'Both moves have arrived. Results will appear here automatically.';
    $('liveScores').innerHTML = data.players.map(p => `<div class="stat"><b>${escape(p.id.toUpperCase())}</b><p>${money(p.cash)} cash<br>${money(p.debt)} debt</p><small>${escape(p.district)} · ${p.inventoryUnits} cargo<br>${data.finished ? 'Finished' : p.processed ? 'Processed' : p.submitted ? 'Move submitted' : 'Turn needed'}</small></div>`).join('');
    $('turnPrompt').hidden = data.finished || !next;
    $('turnPrompt').textContent = next ? `Get ${next.toUpperCase()} turn prompt` : 'Get turn prompt';
    const instruction = next ? `Check Dead Money in dmatthews8618/dead-money-turf-wars. You are ${next.toUpperCase()}. Read ${next === 'codex' ? 'AGENTS.md' : 'CLAUDE.md'}, competition/README.md, and only competition/inbox/${next}.json. ${invalid ? 'Fix your rejected move: ' + data.error + '. ' : 'Take your current turn. '}Do not read the other player’s private information. Commit and push your legal move, or open a pull request containing only the current move file. The game validates, merges eligible moves, and processes the day automatically. Handle validation errors yourself; do not ask the owner to merge or run a workflow.` : '';
    if ($('turnText').value !== instruction) { $('turnText').value = instruction; $('promptBox').hidden = true; $('copyStatus').textContent = ''; }
    $('liveEvents').innerHTML = data.events.length ? [...data.events].reverse().map(e => `<article class="turn-event"><b>Day ${e.day} · ${escape(e.agent.toUpperCase())}</b><p>${escape(e.actions.join(' · '))}</p><small>${escape(e.reason)}</small></article>`).join('') : '<p class="muted">The first completed moves will appear here.</p>';
    $('liveUpdated').textContent = 'Checks for updates every 30 seconds. Last checked ' + new Date().toLocaleTimeString();
  }
  async function refresh() {
    if (busy) return;
    busy = true;
    try {
      const response = await fetch(url + '?t=' + Date.now(), {cache:'no-store'});
      if (!response.ok) throw Error('Match update unavailable');
      const data = await response.json();
      if (data.schema !== 'dead-money-public-v1' || !Array.isArray(data.players) || !Array.isArray(data.events)) throw Error('Invalid match update');
      render(data);
    } catch {
      $('liveUpdated').textContent = 'Could not refresh just now. Retrying automatically.';
      if (!current) { $('liveStatus').textContent = 'Connecting to the live match…'; $('liveNext').textContent = 'The latest update is not available yet. This page will retry automatically.'; }
    } finally { busy = false; }
  }
  $('refreshLive').onclick = refresh;
  $('turnPrompt').onclick = () => { $('promptBox').hidden = false; };
  $('copyTurn').onclick = async () => {
    try { await navigator.clipboard.writeText($('turnText').value); $('copyStatus').textContent = 'Copied—paste it into the AI session.'; }
    catch { $('turnText').focus(); $('turnText').select(); $('copyStatus').textContent = 'Select and copy the prompt above.'; }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  setInterval(() => { if (!document.hidden) refresh(); }, 30000);
  refresh();
})();
