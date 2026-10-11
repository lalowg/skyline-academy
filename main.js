/* SKYLINE ACADEMY — page orchestration */
import { SUBJECTS, PATHS, COURSES, LEVELS, courseById, subjectById, pathsWith } from './data.js';
import { Chart2D } from './chart2d.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = () => innerWidth < 760;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const store = {
  get(k, d) { try { const v = sessionStorage.getItem('skyline:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { sessionStorage.setItem('skyline:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};

const state = {
  view: 'overview', subject: null, course: null, path: null,
  level: -1,
  done: new Set(store.get('done', [])),
};

/* ------------------------------------------------------------------ */
/* Sky: WebGL universe, or the designed SVG chart                       */
/* ------------------------------------------------------------------ */
const sky = $('#sky');
const canvas = $('#sky-canvas');
const dock = $('#dock');
const dockBody = $('#dock-body');
let universe = null;

// cheap capability check; Three.js throws if a context really cannot be created,
// which drops us to the SVG chart without opening a second probe context
const hasWebGL = () => typeof window.WebGLRenderingContext !== 'undefined';
const pickHandler = (hit) => {
  stopTour();
  if (hit.type === 'subject') openSubject(hit.id, true);
  else openCourse(hit.id, true);
};
async function initSky() {
  if (hasWebGL()) {
    try {
      const mod = await import('./universe.js');
      universe = new mod.Universe({ canvas, labels: $('#sky-labels'), reduced, onPick: pickHandler });
      root.classList.add('has-gl');
    } catch (e) { universe = null; }
  }
  if (!universe) {
    root.classList.add('no-gl');
    universe = new Chart2D({ container: $('#sky-fallback'), reduced, onPick: pickHandler });
  }
  syncPanelWidth();
  universe.setDone(state.done);
  universe.setLevel(state.level);
  universe.overview();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => { skyVisible = en[0].isIntersecting; runSky(); }, { threshold: 0.01 }).observe(sky);
  } else runSky();
}
let skyVisible = true;
function runSky() { if (!universe) return; if (skyVisible && !document.hidden) universe.start(); else universe.stop(); }
document.addEventListener('visibilitychange', runSky);
function syncPanelWidth() { if (universe) universe.setPanelWidth(isSmall() ? 0 : dock.getBoundingClientRect().width + 32); }
addEventListener('resize', () => { clearTimeout(syncPanelWidth.t); syncPanelWidth.t = setTimeout(syncPanelWidth, 150); });

/* ------------------------------------------------------------------ */
/* Dock panel                                                           */
/* ------------------------------------------------------------------ */
const crumbs = $('[data-crumbs]');
const levelChips = () => `<div class="dk-filter" role="group" aria-label="Filter courses by level">
  ${['All levels', ...LEVELS].map((l, i) => `<button type="button" class="chip" data-level="${i - 1}" aria-pressed="${state.level === i - 1}">${l}</button>`).join('')}</div>`;
const tick = (id) => (state.done.has(id) ? '<span class="dk-tick" aria-label="completed">✓</span>' : '');

function render(focus = false) {
  const hero = $('#universe');
  hero.classList.toggle('is-exploring', state.view !== 'overview');
  $$('.rail [data-subject]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.subject === state.subject)));
  let html = '';
  if (state.view === 'overview') {
    crumbs.innerHTML = 'Universe';
    html = `<p class="dk-eyebrow">The universe</p>
      <h2 class="dk-title">Six constellations</h2>
      <p class="dk-text">Choose a constellation to fly to it, or light a pathway to see the route it takes through the sky.</p>
      ${levelChips()}
      <h3 class="dk-h">Constellations</h3>
      <ul class="dk-list">${SUBJECTS.map((s) => {
        const n = s.courses.filter((c) => state.level < 0 || c.level === state.level).length;
        return `<li><button type="button" class="dk-item" data-open-subject="${s.id}" style="--c:${s.colour}"><i aria-hidden="true"></i><span><b>${s.name}</b><small>${n} ${state.level < 0 ? '' : LEVELS[state.level].toLowerCase() + ' '}course${n === 1 ? '' : 's'} · ${s.coord}</small></span><span class="dk-arrow" aria-hidden="true">→</span></button></li>`;
      }).join('')}</ul>
      <h3 class="dk-h">Pathways</h3>
      <ul class="dk-list">${PATHS.map((p) => `<li><button type="button" class="dk-item dk-path" data-open-path="${p.id}"><i aria-hidden="true"></i><span><b>${p.name}</b><small>${p.steps.length} courses · ${p.months}</small></span><span class="dk-arrow" aria-hidden="true">✦</span></button></li>`).join('')}</ul>`;
  } else if (state.view === 'subject') {
    const s = subjectById(state.subject);
    crumbs.innerHTML = `<button type="button" class="crumb" data-go="overview">Universe</button><span aria-hidden="true">/</span>${s.name}`;
    html = `<button type="button" class="dk-back" data-go="overview">← All constellations</button>
      <p class="dk-eyebrow" style="--c:${s.colour}">Constellation · ${s.coord}</p>
      <h2 class="dk-title">${s.name}</h2>
      <p class="dk-text">${s.blurb}</p>
      ${levelChips()}
      <ol class="dk-courses">${s.courses.map((c) => {
        const hidden = state.level >= 0 && c.level !== state.level;
        return `<li${hidden ? ' class="is-filtered"' : ''}><button type="button" class="dk-course" data-open-course="${c.id}" style="--c:${s.colour}"><span class="lv lv-${c.level}">${LEVELS[c.level]}</span><b>${c.title}</b><small>${c.weeks} weeks · ${c.hrs} h a week</small>${tick(c.id)}</button></li>`;
      }).join('')}</ol>
      ${state.level >= 0 && !s.courses.some((c) => c.level === state.level) ? `<p class="dk-text dk-empty">No ${LEVELS[state.level].toLowerCase()} courses in ${s.name} yet.</p>` : ''}`;
  } else if (state.view === 'course') {
    const c = courseById(state.course); const s = subjectById(c.subject);
    const paths = pathsWith(c.id);
    const sib = s.courses; const idx = sib.findIndex((x) => x.id === c.id); const next = sib[(idx + 1) % sib.length];
    const done = state.done.has(c.id);
    crumbs.innerHTML = `<button type="button" class="crumb" data-go="overview">Universe</button><span aria-hidden="true">/</span><button type="button" class="crumb" data-open-subject="${s.id}">${s.name}</button><span aria-hidden="true">/</span>Course`;
    html = `<button type="button" class="dk-back" data-open-subject="${s.id}">← ${s.name}</button>
      <p class="dk-eyebrow" style="--c:${s.colour}">${s.name} · ${LEVELS[c.level]}</p>
      <h2 class="dk-title">${c.title}</h2>
      <p class="dk-meta"><span>${c.weeks} weeks</span><span>${c.hrs} h a week</span><span>Online · live seminar</span></p>
      <p class="dk-text">${c.blurb}</p>
      <h3 class="dk-h">Modules</h3>
      <ol class="dk-mods">${c.mods.map((m, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${m}</li>`).join('')}</ol>
      ${paths.length ? `<h3 class="dk-h">On these pathways</h3><ul class="dk-chips">${paths.map((p) => `<li><button type="button" class="chip chip-path" data-open-path="${p.id}">✦ ${p.name}</button></li>`).join('')}</ul>` : ''}
      <div class="dk-actions">
        <button type="button" class="btn ${done ? 'btn-done' : 'btn-coral'}" data-toggle-done="${c.id}" aria-pressed="${done}">${done ? '✓ Completed' : 'Mark as completed'}</button>
        <button type="button" class="btn btn-ghost" data-open-course="${next.id}">Next star →</button>
      </div>
      <p class="dk-fine">Progress is a demo and lives only in this tab.</p>`;
  } else if (state.view === 'path') {
    const p = PATHS.find((x) => x.id === state.path);
    const n = p.steps.filter((id) => state.done.has(id)).length;
    const pct = n / p.steps.length;
    const C = 2 * Math.PI * 26;
    crumbs.innerHTML = `<button type="button" class="crumb" data-go="overview">Universe</button><span aria-hidden="true">/</span>Pathway`;
    html = `<button type="button" class="dk-back" data-clear-path>← Clear route</button>
      <p class="dk-eyebrow dk-eyebrow-coral">Pathway · ${p.months}</p>
      <h2 class="dk-title">${p.name}</h2>
      <p class="dk-text">${p.blurb}</p>
      <div class="dk-progress">
        <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="pr-bg"/><circle cx="32" cy="32" r="26" class="pr-fg" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg>
        <p><b>${n} of ${p.steps.length}</b> complete<br><small>Sample progress for this tab</small></p>
      </div>
      <ol class="dk-route">${p.steps.map((id, i) => {
        const c = courseById(id); const s = subjectById(c.subject); const d = state.done.has(id);
        return `<li style="--c:${s.colour}" class="${d ? 'is-done' : ''}"><span class="rt-n" aria-hidden="true">${i + 1}</span><button type="button" class="rt-open" data-open-course="${id}"><b>${c.title}</b><small>${s.name} · ${c.weeks} weeks</small></button><button type="button" class="rt-check" data-toggle-done="${id}" aria-pressed="${d}" aria-label="${d ? 'Completed' : 'Mark complete'}: ${esc(c.title)}">${d ? '✓' : ''}</button></li>`;
      }).join('')}</ol>`;
  }
  dockBody.innerHTML = html;
  dockBody.scrollTop = 0;
  if (focus) dockBody.focus({ preventScroll: true });
}

function openSubject(id, focus) {
  state.view = 'subject'; state.subject = id; state.course = null;
  if (state.path) { state.path = null; universe && universe.showPath(null); }
  universe && universe.focusSubject(id);
  render(focus);
}
function openCourse(id, focus) {
  state.view = 'course'; state.course = id; state.subject = courseById(id).subject;
  if (state.path && !PATHS.find((p) => p.id === state.path).steps.includes(id)) { state.path = null; universe && universe.showPath(null); }
  universe && universe.focusCourse(id);
  render(focus);
}
function openPath(id, focus) {
  state.view = 'path'; state.path = id; state.subject = null; state.course = null;
  universe && universe.showPath(id);
  render(focus);
}
function goOverview(focus) {
  state.view = 'overview'; state.subject = null; state.course = null;
  if (state.path) { state.path = null; universe && universe.showPath(null); }
  universe && universe.overview();
  render(focus);
}
function toggleDone(id) {
  if (state.done.has(id)) state.done.delete(id); else state.done.add(id);
  store.set('done', [...state.done]);
  universe && universe.setDone(state.done);
  renderLog();
}

dock.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  stopTour();
  if (b.dataset.level !== undefined) {
    state.level = +b.dataset.level;
    universe && universe.setLevel(state.level);
    render(); const again = $(`[data-level="${state.level}"]`, dock); if (again) again.focus();
    return;
  }
  if (b.dataset.go === 'overview') { goOverview(true); return; }
  if (b.dataset.openSubject) { openSubject(b.dataset.openSubject, true); return; }
  if (b.dataset.openCourse) { openCourse(b.dataset.openCourse, true); return; }
  if (b.dataset.openPath) { openPath(b.dataset.openPath, true); return; }
  if (b.hasAttribute('data-clear-path')) { goOverview(true); return; }
  if (b.dataset.toggleDone) {
    const id = b.dataset.toggleDone;
    toggleDone(id);
    render();
    const again = $(`[data-toggle-done="${id}"]`, dock); if (again) again.focus();
  }
});

$$('.rail [data-subject]').forEach((b) => b.addEventListener('click', () => {
  stopTour();
  if (state.subject === b.dataset.subject && state.view === 'subject') goOverview(false);
  else openSubject(b.dataset.subject, false);
}));
$('[data-home]').addEventListener('click', () => { stopTour(); goOverview(false); });

/* keyboard: arrows cycle constellations while focus is inside the hero */
$('#universe').addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea')) return;
  const ids = SUBJECTS.map((s) => s.id);
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    if (e.target.closest('.dk-filter')) return;
    e.preventDefault();
    stopTour();
    const i = state.subject ? ids.indexOf(state.subject) : -1;
    const n = e.key === 'ArrowRight' ? (i + 1) % ids.length : (i - 1 + ids.length) % ids.length;
    openSubject(ids[n], false);
    const rb = $(`.rail [data-subject="${ids[n]}"]`); if (rb && e.target.closest('.rail')) rb.focus();
  } else if (e.key === 'Escape') {
    stopTour();
    if (state.view === 'course') openSubject(state.subject, true);
    else if (state.view !== 'overview') goOverview(true);
  }
});

/* guided flight */
const tourBtn = $('[data-tour]');
let tourTimer = 0; let touring = false;
function stopTour() {
  if (!touring) return;
  touring = false; clearTimeout(tourTimer);
  tourBtn.setAttribute('aria-pressed', 'false');
  $('[data-tour-label]').textContent = 'Take the guided flight';
  $('.btn-ico', tourBtn).textContent = '▶';
}
tourBtn.addEventListener('click', () => {
  if (touring) { stopTour(); return; }
  touring = true;
  tourBtn.setAttribute('aria-pressed', 'true');
  $('[data-tour-label]').textContent = 'Stop the flight';
  $('.btn-ico', tourBtn).textContent = '■';
  const seq = [...SUBJECTS.map((s) => ['s', s.id]), ['p', 'data-storyteller']];
  let i = 0;
  const step = () => {
    if (!touring) return;
    const [k, id] = seq[i];
    if (k === 's') { state.path = null; universe && universe.showPath(null); openSubject(id, false); } else openPath(id, false);
    i++;
    if (i < seq.length) tourTimer = setTimeout(step, reduced ? 4200 : 3400);
    else tourTimer = setTimeout(stopTour, 3000);
  };
  step();
});

/* ------------------------------------------------------------------ */
/* Subjects index                                                       */
/* ------------------------------------------------------------------ */
const NS = 'http://www.w3.org/2000/svg';
$$('[data-glyph]').forEach((svg) => {
  const s = subjectById(svg.dataset.glyph);
  const pts = s.courses.map((c) => [c.off[0], -c.off[1]]);
  const d = s.figure.map(([a, b]) => `M${pts[a][0]} ${pts[a][1]}L${pts[b][0]} ${pts[b][1]}`).join('');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d); path.setAttribute('class', 'gl-line'); path.setAttribute('pathLength', '100');
  svg.append(path);
  s.courses.forEach((c, i) => {
    const ci = document.createElementNS(NS, 'circle');
    ci.setAttribute('cx', pts[i][0]); ci.setAttribute('cy', pts[i][1]); ci.setAttribute('r', (0.28 + c.level * 0.1).toFixed(2));
    ci.setAttribute('class', 'gl-star');
    svg.append(ci);
  });
});
const toSky = () => $('#universe').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
$$('[data-fly]').forEach((b) => b.addEventListener('click', () => { stopTour(); toSky(); openSubject(b.dataset.fly, false); setTimeout(() => dockBody.focus({ preventScroll: true }), reduced ? 0 : 650); }));

/* ------------------------------------------------------------------ */
/* Pathways — metro diagram                                             */
/* ------------------------------------------------------------------ */
const metro = $('#metro');
let currentPw = PATHS[0].id;
function wrap(text, max) {
  const words = text.split(' '); const lines = ['']; words.forEach((w) => { const l = lines[lines.length - 1]; if ((l + ' ' + w).trim().length > max && l) lines.push(w); else lines[lines.length - 1] = (l + ' ' + w).trim(); }); return lines;
}
function drawMetro() {
  const p = PATHS.find((x) => x.id === currentPw);
  const vertical = metro.clientWidth < 640;
  const n = p.steps.length;
  let svg;
  if (!vertical) {
    const W = 1000; const H = 250; const pad = 70; const gap = (W - pad * 2) / (n - 1);
    const pts = p.steps.map((id, i) => [pad + i * gap, 125 + (i % 2 ? -26 : 26) * (i === 0 || i === n - 1 ? 0 : 1)]);
    const d = pts.map((q, i) => (i ? `C${pts[i - 1][0] + gap / 2} ${pts[i - 1][1]} ${q[0] - gap / 2} ${q[1]} ${q[0]} ${q[1]}` : `M${q[0]} ${q[1]}`)).join('');
    svg = `<svg viewBox="0 0 ${W} ${H}" class="metro-svg" role="img" aria-label="${esc(p.name)} route: ${p.steps.map((id) => esc(courseById(id).title)).join(', then ')}">
      <path d="${d}" class="m-halo"/><path d="${d}" class="m-line" pathLength="100"/>
      ${pts.map((q, i) => {
        const c = courseById(p.steps[i]); const s = subjectById(c.subject); const up = i % 2 === 1;
        const lines = wrap(c.title, 18);
        const ty = up ? q[1] - 34 - (lines.length - 1) * 18 : q[1] + 44;
        return `<g class="m-stop" style="--c:${s.colour};--d:${i * 0.18 + 0.3}s">
          <circle cx="${q[0]}" cy="${q[1]}" r="15" class="m-ring"/><circle cx="${q[0]}" cy="${q[1]}" r="6" class="m-dot"/>
          <text x="${q[0]}" y="${ty}" class="m-t">${lines.map((l, k) => `<tspan x="${q[0]}" dy="${k ? 18 : 0}">${esc(l)}</tspan>`).join('')}</text>
          <text x="${q[0]}" y="${up ? ty - 22 : ty + lines.length * 18 + 2}" class="m-s">${String(i + 1).padStart(2, '0')} · ${s.name.toUpperCase()}</text></g>`;
      }).join('')}</svg>`;
  } else {
    const W = 340; const gap = 92; const H = gap * (n - 1) + 80; const x = 34;
    svg = `<svg viewBox="0 0 ${W} ${H}" class="metro-svg" role="img" aria-label="${esc(p.name)} route: ${p.steps.map((id) => esc(courseById(id).title)).join(', then ')}">
      <path d="M${x} 40V${H - 40}" class="m-halo"/><path d="M${x} 40V${H - 40}" class="m-line" pathLength="100"/>
      ${p.steps.map((id, i) => {
        const c = courseById(id); const s = subjectById(c.subject); const y = 40 + i * gap;
        return `<g class="m-stop" style="--c:${s.colour};--d:${i * 0.15 + 0.2}s"><circle cx="${x}" cy="${y}" r="14" class="m-ring"/><circle cx="${x}" cy="${y}" r="5.5" class="m-dot"/>
          <text x="${x + 30}" y="${y - 4}" class="m-s m-left">${String(i + 1).padStart(2, '0')} · ${s.name.toUpperCase()}</text>
          <text x="${x + 30}" y="${y + 18}" class="m-t m-left">${esc(c.title)}</text></g>`;
      }).join('')}</svg>`;
  }
  metro.innerHTML = svg;
  const subs = [...new Set(p.steps.map((id) => subjectById(courseById(id).subject).name))];
  const set = (k, v) => { $(`[data-pw="${k}"]`).textContent = v; };
  set('name', p.name); set('blurb', p.blurb); set('who', p.who); set('months', p.months); set('count', String(p.steps.length)); set('subjects', subs.join(', '));
  if (!reduced) { metro.classList.remove('draw'); void metro.offsetWidth; metro.classList.add('draw'); } else metro.classList.add('drawn');
}
const tabs = $$('.pw-tabs [role="tab"]');
function selectTab(t, focus) {
  tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
  $('#pw-panel').setAttribute('aria-labelledby', t.id);
  currentPw = t.dataset.path;
  drawMetro();
  if (focus) t.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); selectTab(tabs[n], true); }
  });
});
drawMetro();
let metroW = metro.clientWidth;
addEventListener('resize', () => { if (Math.abs(metro.clientWidth - metroW) > 40) { metroW = metro.clientWidth; drawMetro(); } });
$('[data-light]').addEventListener('click', () => { stopTour(); toSky(); openPath(currentPw, false); setTimeout(() => dockBody.focus({ preventScroll: true }), reduced ? 0 : 650); });

/* ------------------------------------------------------------------ */
/* Method — scroll-scrubbed orbit                                       */
/* ------------------------------------------------------------------ */
const track = $('.method-track');
const trail = $('#trail'); const trailBg = $('#trail-bg'); const craft = $('#craft');
const phases = $$('.phase');
const bar = $('.method-bar i');
(function buildSpiral() {
  let d = ''; const turns = 2.2; const steps = 220;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; const a = -Math.PI / 2 + t * turns * Math.PI * 2; const r = 40 + t * 225;
    d += `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  }
  trail.setAttribute('d', d); trailBg.setAttribute('d', d);
}());
const trailLen = trail.getTotalLength ? trail.getTotalLength() : 0;
trail.style.strokeDasharray = `${trailLen} ${trailLen}`;
function placeCraft(p) {
  if (!trail.getPointAtLength) return;
  const L = trailLen * p;
  const a = trail.getPointAtLength(Math.max(0, L)); const b = trail.getPointAtLength(Math.min(trailLen, L + 1));
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90;
  craft.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
  trail.style.strokeDashoffset = String(trailLen - L);
  const idx = Math.min(3, Math.floor(p * 4 + 0.0001));
  phases.forEach((ph, i) => ph.classList.toggle('is-on', i === idx));
  $$('.orbits .ring').forEach((r, i) => r.classList.toggle('is-lit', i <= idx));
  $$('.orbits .moon').forEach((m, i) => m.classList.toggle('is-lit', i <= idx));
  if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`;
}
const staticMethod = () => isSmall();
function onScroll() {
  if (staticMethod()) { track.classList.add('static'); placeCraft(1); return; }
  track.classList.remove('static');
  const r = track.getBoundingClientRect();
  const total = r.height - innerHeight;
  const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  placeCraft(p);
}
addEventListener('scroll', () => { if (!onScroll.q) { onScroll.q = true; requestAnimationFrame(() => { onScroll.q = false; onScroll(); }); } }, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ------------------------------------------------------------------ */
/* Flight log                                                           */
/* ------------------------------------------------------------------ */
function renderLog() {
  const done = [...state.done].map(courseById).filter(Boolean);
  $('[data-log="done"]').textContent = String(done.length);
  $('[data-log="hours"]').textContent = String(done.reduce((a, c) => a + c.weeks * c.hrs, 0));
  const started = PATHS.filter((p) => p.steps.some((id) => state.done.has(id)));
  $('[data-log="paths"]').textContent = String(started.length);
  $('[data-log="pathlist"]').innerHTML = PATHS.map((p) => {
    const n = p.steps.filter((id) => state.done.has(id)).length;
    return `<li><span class="lp-name">${p.name}</span><span class="lp-bar" aria-hidden="true"><i style="transform:scaleX(${(n / p.steps.length).toFixed(3)})"></i></span><span class="lp-n">${n}/${p.steps.length}</span></li>`;
  }).join('');
  $('[data-log="list"]').innerHTML = done.map((c) => {
    const s = subjectById(c.subject);
    return `<li style="--c:${s.colour}"><i aria-hidden="true"></i><span><b>${c.title}</b><small>${s.name} · ${LEVELS[c.level]} · ${c.weeks * c.hrs} h</small></span></li>`;
  }).join('');
  $('[data-log="empty"]').hidden = done.length > 0;
}
$('[data-reset]').addEventListener('click', () => {
  state.done.clear(); store.set('done', []); universe && universe.setDone(state.done); renderLog(); render();
});
$('[data-demo]').addEventListener('click', () => {
  ['stats', 'python', 'data', 'web', 'think', 'english', 'visual'].forEach((id) => state.done.add(id));
  store.set('done', [...state.done]); universe && universe.setDone(state.done); renderLog(); render();
});
renderLog();

/* ------------------------------------------------------------------ */
/* Prospectus form                                                      */
/* ------------------------------------------------------------------ */
const form = $('#apply-form');
function fieldError(id, msg) {
  const input = $(`#${id}`); const err = $(`#${id}-err`);
  if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  err.textContent = msg || ''; err.hidden = !msg;
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const email = String(fd.get('email') || '').trim();
  const subject = fd.get('subject'); const term = fd.get('term');
  const bad = [];
  if (name.length < 2) { fieldError('ap-name', 'Please enter your full name.'); bad.push('#ap-name'); } else fieldError('ap-name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { fieldError('ap-email', 'Please enter a valid email, like name@example.com.'); bad.push('#ap-email'); } else fieldError('ap-email');
  if (!subject) { fieldError('ap-subject', 'Choose the constellation you would like to start with.'); bad.push('#ap-subject'); } else fieldError('ap-subject');
  const tErr = $('#ap-term-err');
  if (!term) { tErr.textContent = 'Choose a start month.'; tErr.hidden = false; bad.push('input[name="term"]'); } else { tErr.hidden = true; }
  const done = $('#ap-done');
  if (bad.length) { done.hidden = true; $(bad[0]).focus(); return; }
  const path = fd.get('path');
  done.innerHTML = '';
  const st = document.createElement('strong'); st.textContent = 'Prospectus request drafted — nothing was sent.';
  const p = document.createElement('p');
  p.textContent = `Thanks, ${name}. This is a portfolio demo, so no email will arrive and no data left your browser. A real academy would send ${email} a ${subject} prospectus${path ? ` with the ${path} pathway` : ''}, starting in ${term}, paced for ${fd.get('pace')} a week.`;
  done.append(st, p); done.hidden = false; done.focus();
});
$$('#apply-form input, #apply-form select').forEach((el) => el.addEventListener('input', () => {
  if (el.getAttribute('aria-invalid') === 'true') fieldError(el.id);
  if (el.name === 'term') $('#ap-term-err').hidden = true;
}));

/* ------------------------------------------------------------------ */
/* Header + nav                                                         */
/* ------------------------------------------------------------------ */
const menuBtn = $('.menu-btn'); const nav = $('#nav');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  $('.menu-label').textContent = open ? 'Close' : 'Menu';
  if (open) $('a', nav).focus();
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
$$('a', nav).forEach((a) => a.addEventListener('click', () => { if (nav.classList.contains('is-open')) setMenu(false); }));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });
if ('IntersectionObserver' in window) {
  const links = $$('a', nav);
  const nio = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((a) => { if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach((s) => nio.observe(s));
  const rio = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); } }), { threshold: 0.2 });
  $$('.sec-head, .ix-row, .log-grid > *, .ap-form').forEach((el) => { if (!reduced) { el.classList.add('rv'); rio.observe(el); } });
}

render();
initSky();
