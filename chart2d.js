/* SKYLINE ACADEMY — designed SVG star chart, used when WebGL is unavailable.
   Same interface as the 3D Universe, drawn as a flat celestial map. */
import { SUBJECTS, PATHS, COURSES, worldPos } from './data.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  if (parent) parent.append(n);
  return n;
};
const FULL = [-23, -15, 46, 30];

export class Chart2D {
  constructor({ container, reduced = false, onPick = () => {} }) {
    this.reduced = reduced; this.onPick = onPick;
    this.level = -1; this.done = new Set(); this.subjectId = null; this.courseId = null; this.pathId = null;
    this.vb = FULL.slice(); this.goal = FULL.slice();
    const svg = el('svg', { class: 'chart2d', viewBox: FULL.join(' '), 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMidYMid meet' });
    this.svg = svg;
    const defs = el('defs', {}, svg);
    SUBJECTS.forEach((s) => {
      const g = el('radialGradient', { id: `nb-${s.id}` }, defs);
      el('stop', { offset: '0', 'stop-color': s.colour, 'stop-opacity': '.38' }, g);
      el('stop', { offset: '1', 'stop-color': s.colour, 'stop-opacity': '0' }, g);
    });
    // grid of right ascension / declination
    const grid = el('g', { class: 'c2-grid' }, svg);
    for (let x = -20; x <= 20; x += 5) el('line', { x1: x, y1: -15, x2: x, y2: 15 }, grid);
    for (let y = -15; y <= 15; y += 5) el('line', { x1: -23, y1: y, x2: 23, y2: y }, grid);
    const field = el('g', { class: 'c2-field' }, svg);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 160; i++) el('circle', { cx: (FULL[0] + rnd() * FULL[2]).toFixed(2), cy: (FULL[1] + rnd() * FULL[3]).toFixed(2), r: (0.03 + rnd() * 0.09).toFixed(3) }, field);
    this.routeG = el('g', { class: 'c2-route' }, svg);
    this.nodes = {};
    this.groups = {};
    SUBJECTS.forEach((s) => {
      const g = el('g', { class: 'c2-subject', 'data-id': s.id }, svg);
      el('circle', { cx: s.pos[0], cy: -s.pos[1], r: 6.5, fill: `url(#nb-${s.id})` }, g);
      const pts = s.courses.map((c) => [s.pos[0] + c.off[0], -(s.pos[1] + c.off[1])]);
      s.figure.forEach(([a, b]) => el('line', { x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1], stroke: s.colour, class: 'c2-line' }, g));
      const t = el('text', { x: s.pos[0], y: -s.pos[1] - 4.4, class: 'c2-name', fill: s.colour }, g);
      t.textContent = s.name;
      t.addEventListener('click', () => this.onPick({ type: 'subject', id: s.id }));
      s.courses.forEach((c, i) => {
        const [x, y] = pts[i];
        const node = el('g', { class: 'c2-node', transform: `translate(${x} ${y})` }, g);
        el('circle', { r: 0.9, class: 'c2-hit' }, node);
        el('circle', { r: 0.62, class: 'c2-ring' }, node);
        el('circle', { r: 0.3 + c.level * 0.1, fill: s.colour, class: 'c2-star' }, node);
        const lt = el('text', { x: 0.7, y: 0.25, class: 'c2-label' }, node);
        lt.textContent = c.title;
        node.addEventListener('click', () => this.onPick({ type: 'course', id: c.id }));
        this.nodes[c.id] = { node, subject: s.id, level: c.level, x, y };
      });
      this.groups[s.id] = g;
    });
    container.append(svg);
    this.ok = true;
    this._apply();
  }
  _animate() {
    if (this.reduced) { this.vb = this.goal.slice(); this.svg.setAttribute('viewBox', this.vb.join(' ')); return; }
    cancelAnimationFrame(this._raf);
    const from = this.vb.slice(); const to = this.goal.slice(); const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 900); const e = 1 - Math.pow(1 - k, 3);
      this.vb = from.map((v, i) => v + (to[i] - v) * e);
      this.svg.setAttribute('viewBox', this.vb.map((v) => v.toFixed(3)).join(' '));
      if (k < 1) this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  }
  _frame(cx, cy, w) { const h = w * (FULL[3] / FULL[2]); this.goal = [cx - w / 2, cy - h / 2, w, h]; this._animate(); }
  overview() { this.subjectId = null; this.courseId = null; if (this.pathId) this._framePath(); else { this.goal = FULL.slice(); this._animate(); } this._apply(); }
  focusSubject(id) { const s = SUBJECTS.find((x) => x.id === id); this.subjectId = id; this.courseId = null; this._frame(s.pos[0], -s.pos[1], 16); this._apply(); }
  focusCourse(id) { const n = this.nodes[id]; this.courseId = id; this.subjectId = n.subject; const s = SUBJECTS.find((x) => x.id === n.subject); this._frame((s.pos[0] + n.x) / 2, (-s.pos[1] + n.y) / 2, 14); this._apply(); }
  showPath(id) {
    this.pathId = id || null; this.courseId = null;
    this.routeG.innerHTML = '';
    if (id) {
      const p = PATHS.find((x) => x.id === id);
      const pts = p.steps.map((sid) => { const c = COURSES.find((x) => x.id === sid); const w = worldPos(c); return `${w[0]},${-w[1]}`; }).join(' ');
      el('polyline', { points: pts, class: 'c2-route-halo' }, this.routeG);
      const line = el('polyline', { points: pts, class: 'c2-route-line', pathLength: '100' }, this.routeG);
      if (!this.reduced) { line.style.strokeDashoffset = '100'; requestAnimationFrame(() => requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; })); }
      this._framePath();
    }
    this._apply();
  }
  _framePath() {
    const p = PATHS.find((x) => x.id === this.pathId);
    const xs = []; const ys = [];
    p.steps.forEach((sid) => { const n = this.nodes[sid]; xs.push(n.x); ys.push(n.y); });
    const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
    this._frame((minX + maxX) / 2, (minY + maxY) / 2, Math.max(20, (maxX - minX) * 1.4, (maxY - minY) * 1.4 * (FULL[2] / FULL[3])));
  }
  setLevel(l) { this.level = l; this._apply(); }
  setDone(set) { this.done = new Set(set); this._apply(); }
  setPanelWidth() {}
  look(dx, dy) { this.goal = [this.goal[0] + dx * 20, this.goal[1] - dy * 20, this.goal[2], this.goal[3]]; this._animate(); }
  start() {} stop() {} resize() {}
  _apply() {
    const path = this.pathId ? PATHS.find((p) => p.id === this.pathId) : null;
    Object.entries(this.nodes).forEach(([id, n]) => {
      let dim = this.level >= 0 && n.level !== this.level;
      if (path && !path.steps.includes(id)) dim = true;
      if (!path && this.subjectId && n.subject !== this.subjectId) dim = true;
      n.node.classList.toggle('is-dim', dim);
      n.node.classList.toggle('is-sel', id === this.courseId);
      n.node.classList.toggle('is-done', this.done.has(id));
      n.node.classList.toggle('show-label', (this.subjectId === n.subject && !path) || (path && path.steps.includes(id)));
    });
    Object.entries(this.groups).forEach(([id, g]) => g.classList.toggle('is-dim', (!!this.subjectId && this.subjectId !== id) || !!path));
  }
}
