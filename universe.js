/* SKYLINE ACADEMY — the knowledge universe (Three.js r169).
   Six subject constellations float in a twinkling field. The camera flies
   between them; a chosen pathway is drawn as a glowing route through its
   courses with a comet travelling along it. */
import * as THREE from 'three';
import { SUBJECTS, PATHS, COURSES, worldPos, subjectById } from './data.js';

const OVERVIEW = { target: new THREE.Vector3(0, 0, -6), dist: 42, yaw: 0, pitch: 0.12 };

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.18, 'rgba(255,255,255,.85)');
  r.addColorStop(0.42, 'rgba(255,255,255,.22)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function ringTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 7;
  g.beginPath(); g.arc(64, 64, 50, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.globalAlpha = 0.5;
  g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function nebulaTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  for (let i = 0; i < 14; i++) {
    const x = 128 + (Math.random() - 0.5) * 90; const y = 128 + (Math.random() - 0.5) * 90;
    const rr = 40 + Math.random() * 70;
    const r = g.createRadialGradient(x, y, 0, x, y, rr);
    r.addColorStop(0, 'rgba(255,255,255,.22)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const STAR_VERT = `
attribute float aSize; attribute float aPhase; attribute vec3 aColor;
uniform float uTime; uniform float uPR;
varying vec3 vColor; varying float vTw;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vTw = 0.6 + 0.4 * sin(uTime * 1.2 + aPhase);
  vColor = aColor;
  gl_PointSize = aSize * uPR * (140.0 / -mv.z);
}`;
const STAR_FRAG = `
varying vec3 vColor; varying float vTw;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, d), 1.7) * vTw;
  gl_FragColor = vec4(vColor * a, a);
}`;

export class Universe {
  constructor({ canvas, labels, reduced = false, onPick = () => {}, onHover = () => {} }) {
    this.canvas = canvas;
    this.labelLayer = labels;
    this.reduced = reduced;
    this.onPick = onPick;
    this.onHover = onHover;
    this.small = innerWidth < 760;
    this.panelW = 0;
    this.mode = 'overview';
    this.subjectId = null; this.courseId = null; this.pathId = null;
    this.level = -1; this.done = new Set(); this.hoverId = null;
    this.cur = { target: OVERVIEW.target.clone(), dist: OVERVIEW.dist + 18, yaw: -0.5, pitch: 0.3 };
    this.goal = { target: OVERVIEW.target.clone(), dist: OVERVIEW.dist, yaw: OVERVIEW.yaw, pitch: OVERVIEW.pitch };
    if (reduced) this._snap();
    this.time = 0; this.running = false; this.dirty = true; this.routeT = 1;
    this.ok = false;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.small, powerPreference: 'high-performance', alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.small ? 1.5 : 2));
    renderer.setClearColor(0x0A1230, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0A1230, 0.011);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
    this.tex = { glow: glowTexture(), ring: ringTexture(), neb: nebulaTexture() };
    this._buildField();
    this._buildClusters();
    this._buildLabels();
    this._buildRoute();
    this._bindPointer();
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.stop(); }, false);
    this.resize();
    if ('ResizeObserver' in window) { this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(canvas.parentElement); }
    this.ok = true;
  }

  /* ---------------------------------------------------------------- build */
  _buildField() {
    const n = this.small ? 1300 : 2800;
    const pos = new Float32Array(n * 3); const size = new Float32Array(n); const phase = new Float32Array(n); const col = new Float32Array(n * 3);
    const glow = new THREE.Color('#7CC4FF'); const white = new THREE.Color('#F4F7FF'); const coral = new THREE.Color('#FF7A59');
    for (let i = 0; i < n; i++) {
      const r = 50 + Math.random() * 110; const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.7; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 20;
      size[i] = 0.6 + Math.pow(Math.random(), 3) * 3.2; phase[i] = Math.random() * 6.28;
      const c = Math.random() < 0.06 ? coral : white.clone().lerp(glow, Math.random() * 0.7);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    this.starMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPR: { value: this.renderer.getPixelRatio() } },
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.field = new THREE.Points(g, this.starMat);
    this.scene.add(this.field);
  }

  _sprite(tex, colour, opacity, scale) {
    const m = new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(colour), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const s = new THREE.Sprite(m); s.scale.setScalar(scale);
    s.userData = { o: opacity, to: opacity, s: scale, ts: scale };
    return s;
  }

  _buildClusters() {
    this.clusters = {};
    this.stars = {};
    SUBJECTS.forEach((s) => {
      const group = new THREE.Group();
      group.position.set(...s.pos);
      const neb = this._sprite(this.tex.neb, s.colour, 0.32, this.small ? 13 : 15);
      neb.material.rotation = Math.random() * Math.PI;
      group.add(neb);
      const pts = [];
      s.courses.forEach((c) => {
        const base = 0.95 + c.level * 0.3;
        const star = this._sprite(this.tex.glow, s.colour, 0.95, base);
        star.position.set(...c.off);
        star.userData.base = base;
        const core = this._sprite(this.tex.glow, '#FFFFFF', 0.9, base * 0.38);
        core.position.copy(star.position);
        const ring = this._sprite(this.tex.ring, '#FF7A59', 0, base * 1.25);
        ring.position.copy(star.position);
        const sel = this._sprite(this.tex.ring, '#F4F7FF', 0, base * 1.9);
        sel.position.copy(star.position);
        group.add(star, core, ring, sel);
        this.stars[c.id] = { star, core, ring, sel, subject: s.id, level: c.level, world: new THREE.Vector3(...worldPos({ ...c, subject: s.id })) };
        pts.push(new THREE.Vector3(...c.off));
      });
      const seg = [];
      s.figure.forEach(([a, b]) => { seg.push(pts[a], pts[b]); });
      const lg = new THREE.BufferGeometry().setFromPoints(seg);
      const lm = new THREE.LineBasicMaterial({ color: new THREE.Color(s.colour), transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
      const lines = new THREE.LineSegments(lg, lm);
      lines.userData = { o: 0.4, to: 0.4 };
      group.add(lines);
      this.scene.add(group);
      this.clusters[s.id] = { group, neb, lines };
    });
  }

  _buildLabels() {
    this.labels = [];
    const layer = this.labelLayer;
    if (!layer) return;
    layer.innerHTML = '';
    SUBJECTS.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'lbl lbl-subj';
      el.setAttribute('aria-hidden', 'true');
      el.style.setProperty('--c', s.colour);
      el.innerHTML = `<b>${s.name}</b><span>${s.coord}</span>`;
      el.addEventListener('click', () => this.onPick({ type: 'subject', id: s.id }));
      layer.append(el);
      this.labels.push({ el, kind: 'subject', id: s.id, world: new THREE.Vector3(s.pos[0], s.pos[1] + 4.6, s.pos[2]) });
    });
    COURSES.forEach((c) => {
      const el = document.createElement('div');
      el.className = 'lbl lbl-course';
      el.setAttribute('aria-hidden', 'true');
      el.textContent = c.title;
      layer.append(el);
      this.labels.push({ el, kind: 'course', id: c.id, subject: c.subject, world: this.stars[c.id].world });
    });
  }

  _buildRoute() {
    this.route = null;
    this.comet = this._sprite(this.tex.glow, '#FFFFFF', 0, 1.6);
    this.comet.material.fog = false;
    this.scene.add(this.comet);
  }

  _setRoute(path) {
    if (this.route) {
      this.scene.remove(this.route.core, this.route.halo);
      this.route.core.geometry.dispose(); this.route.halo.geometry.dispose();
      this.route = null;
    }
    if (!path) { this.comet.userData.to = 0; return; }
    const pts = path.steps.map((id) => this.stars[id].world.clone());
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const seg = this.small ? 160 : 260;
    const core = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, 0.07, 6, false), new THREE.MeshBasicMaterial({ color: 0xFF7A59, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, 0.26, 6, false), new THREE.MeshBasicMaterial({ color: 0xFF7A59, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    this.scene.add(halo, core);
    this.route = { core, halo, curve, count: core.geometry.index.count, hcount: halo.geometry.index.count };
    this.routeT = this.reduced ? 1 : 0;
    this.comet.userData.to = 1;
  }

  /* ---------------------------------------------------------------- input */
  _bindPointer() {
    const c = this.canvas;
    let down = null;
    c.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, yaw: this.goal.yaw, pitch: this.goal.pitch, moved: 0, id: e.pointerId };
      this.lastInput = performance.now();
    });
    c.addEventListener('pointermove', (e) => {
      if (down && down.id === e.pointerId) {
        const dx = e.clientX - down.x; const dy = e.clientY - down.y;
        down.moved = Math.max(down.moved, Math.hypot(dx, dy));
        if (down.moved > 4) {
          if (e.pointerType === 'mouse' || Math.abs(dx) > Math.abs(dy)) {
            this.goal.yaw = THREE.MathUtils.clamp(down.yaw - dx * 0.004, -1.1, 1.1);
            this.goal.pitch = THREE.MathUtils.clamp(down.pitch + dy * 0.003, -0.5, 0.8);
            if (this.reduced) this._snap();
            this.dirty = true;
          }
          this.lastInput = performance.now();
        }
      } else if (e.pointerType === 'mouse') {
        const hit = this._pick(e.clientX, e.clientY);
        const id = hit ? hit.id : null;
        if (id !== this.hoverId) {
          this.hoverId = id; this.dirty = true;
          c.style.cursor = hit ? 'pointer' : 'grab';
          this.onHover(hit);
        }
      }
    });
    const up = (e) => {
      if (down && down.moved <= 6) {
        const hit = this._pick(e.clientX, e.clientY);
        if (hit) this.onPick(hit);
      }
      down = null;
    };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', () => { down = null; });
    c.addEventListener('pointerleave', () => { if (this.hoverId) { this.hoverId = null; this.dirty = true; this.onHover(null); } });
  }

  _pick(cx, cy) {
    const r = this.canvas.getBoundingClientRect();
    const x = cx - r.left; const y = cy - r.top;
    const v = new THREE.Vector3();
    let best = null; let bd = 26;
    Object.entries(this.stars).forEach(([id, st]) => {
      if (st.star.material.opacity < 0.3) return;
      v.copy(st.world).project(this.camera);
      if (v.z > 1) return;
      const sx = (v.x * 0.5 + 0.5) * r.width; const sy = (-v.y * 0.5 + 0.5) * r.height;
      const d = Math.hypot(sx - x, sy - y);
      if (d < bd) { bd = d; best = { type: 'course', id }; }
    });
    return best;
  }

  /* ---------------------------------------------------------------- state */
  _snap() { this.cur.target.copy(this.goal.target); this.cur.dist = this.goal.dist; this.cur.yaw = this.goal.yaw; this.cur.pitch = this.goal.pitch; }
  _fly(target, dist, yaw, pitch) {
    this.goal.target.copy(target); this.goal.dist = dist;
    if (yaw !== undefined) this.goal.yaw = yaw;
    if (pitch !== undefined) this.goal.pitch = pitch;
    if (this.reduced) this._snap();
    this.dirty = true;
  }
  overview() {
    this.mode = 'overview'; this.subjectId = null; this.courseId = null;
    if (this.pathId) { this._framePath(); return; }
    this._fly(OVERVIEW.target, this.small ? OVERVIEW.dist + 14 : OVERVIEW.dist, 0, OVERVIEW.pitch);
  }
  focusSubject(id) {
    const s = subjectById(id); if (!s) return;
    this.mode = 'subject'; this.subjectId = id; this.courseId = null;
    this._fly(new THREE.Vector3(...s.pos), this.small ? 15 : 11.5, THREE.MathUtils.clamp(s.pos[0] * 0.015, -0.3, 0.3), 0.06);
  }
  focusCourse(id) {
    const st = this.stars[id]; if (!st) return;
    this.mode = 'course'; this.courseId = id; this.subjectId = st.subject;
    const s = subjectById(st.subject);
    const t = new THREE.Vector3(...s.pos).lerp(st.world, 0.55);
    this._fly(t, this.small ? 11 : 8, undefined, 0.04);
  }
  showPath(id) {
    this.pathId = id || null;
    this._setRoute(PATHS.find((p) => p.id === id));
    if (id) { this.mode = 'path'; this.courseId = null; this._framePath(); } else this.dirty = true;
  }
  _framePath() {
    const p = PATHS.find((x) => x.id === this.pathId);
    const box = new THREE.Box3();
    p.steps.forEach((sid) => box.expandByPoint(this.stars[sid].world));
    const c = box.getCenter(new THREE.Vector3());
    const r = box.getSize(new THREE.Vector3()).length() * 0.5;
    this._fly(c, Math.max(18, r * (this.small ? 3.2 : 2.3)), 0, 0.1);
  }
  setLevel(l) { this.level = l; this.dirty = true; }
  setDone(set) { this.done = new Set(set); this.dirty = true; }
  setPanelWidth(px) { this.panelW = px; this.resize(); }
  look(dx, dy) {
    this.goal.yaw = THREE.MathUtils.clamp(this.goal.yaw + dx, -1.1, 1.1);
    this.goal.pitch = THREE.MathUtils.clamp(this.goal.pitch + dy, -0.5, 0.8);
    if (this.reduced) this._snap();
    this.dirty = true;
  }

  _targets() {
    const path = this.pathId ? PATHS.find((p) => p.id === this.pathId) : null;
    Object.entries(this.stars).forEach(([id, st]) => {
      let o = 0.95; let sc = st.star.userData.base;
      if (this.level >= 0 && st.level !== this.level) o = 0.12;
      if (path) { if (path.steps.includes(id)) { o = 1; sc *= 1.35; } else o = Math.min(o, 0.16); }
      else if (this.subjectId && st.subject !== this.subjectId) o = Math.min(o, 0.35);
      if (id === this.courseId) sc *= 1.5;
      if (id === this.hoverId) sc *= 1.25;
      st.star.userData.to = o; st.star.userData.ts = sc;
      st.core.userData.to = o * 0.95; st.core.userData.ts = sc * 0.38;
      st.ring.userData.to = this.done.has(id) ? Math.max(0.35, o) : 0; st.ring.userData.ts = sc * 1.3;
      st.sel.userData.to = id === this.courseId ? 0.9 : 0; st.sel.userData.ts = sc * 2;
    });
    SUBJECTS.forEach((s) => {
      const cl = this.clusters[s.id];
      const focus = !this.subjectId || this.subjectId === s.id;
      cl.neb.userData.to = path ? 0.12 : focus ? 0.34 : 0.12;
      cl.lines.userData.to = path ? 0.08 : focus ? (this.subjectId ? 0.7 : 0.4) : 0.12;
    });
  }

  /* ---------------------------------------------------------------- loop */
  resize() {
    const p = this.canvas.parentElement;
    const w = p.clientWidth; const h = p.clientHeight;
    if (!w || !h) return;
    this.small = innerWidth < 760;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    if (this.panelW && !this.small) this.camera.setViewOffset(w, h, this.panelW / 2, 0, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this.w = w; this.h = h;
    this.dirty = true;
    if (!this.running) this.render(0);
  }
  start() {
    if (!this.ok || this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.render(dt);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }
  stop() { this.running = false; cancelAnimationFrame(this._raf); }

  render(dt) {
    if (!this.reduced) this.time += dt;
    const k = this.reduced ? 1 : 1 - Math.exp(-dt * 2.4);
    const c = this.cur; const g = this.goal;
    c.target.lerp(g.target, k); c.dist += (g.dist - c.dist) * k; c.yaw += (g.yaw - c.yaw) * k; c.pitch += (g.pitch - c.pitch) * k;
    const idle = !this.lastInput || performance.now() - this.lastInput > 3500;
    const drift = !this.reduced && this.mode === 'overview' && !this.pathId && idle ? Math.sin(this.time * 0.06) * 0.22 : 0;
    this.driftV = (this.driftV || 0) + (drift - (this.driftV || 0)) * Math.min(1, dt * 0.8);
    const yaw = c.yaw + this.driftV;
    const cp = Math.cos(c.pitch);
    this.camera.position.set(
      c.target.x + c.dist * cp * Math.sin(yaw),
      c.target.y + c.dist * Math.sin(c.pitch),
      c.target.z + c.dist * cp * Math.cos(yaw),
    );
    this.camera.lookAt(c.target);
    this.starMat.uniforms.uTime.value = this.time;

    this._targets();
    const ks = this.reduced ? 1 : 1 - Math.exp(-dt * 6);
    const ease = (obj) => {
      const u = obj.userData;
      obj.material.opacity += (u.to - obj.material.opacity) * ks;
      if (u.ts !== undefined) { const s = obj.scale.x + (u.ts - obj.scale.x) * ks; obj.scale.setScalar(s); }
    };
    Object.values(this.stars).forEach((st) => { ease(st.star); ease(st.core); ease(st.ring); ease(st.sel); });
    Object.values(this.clusters).forEach((cl) => { ease(cl.neb); ease(cl.lines); });
    if (!this.reduced) Object.values(this.clusters).forEach((cl, i) => { cl.neb.material.rotation += dt * 0.01 * (i % 2 ? 1 : -1); });

    if (this.route) {
      this.routeT = Math.min(1, this.routeT + dt / 1.8);
      const e = 1 - Math.pow(1 - this.routeT, 3);
      this.route.core.geometry.setDrawRange(0, Math.floor((this.route.count * e) / 3) * 3);
      this.route.halo.geometry.setDrawRange(0, Math.floor((this.route.hcount * e) / 3) * 3);
      const t = this.reduced ? 1 : (this.time * 0.12) % 1;
      const head = this.routeT < 1 ? e : t;
      this.comet.position.copy(this.route.curve.getPointAt(Math.min(0.999, head)));
    }
    ease(this.comet);

    this.renderer.render(this.scene, this.camera);
    this._labels();
  }

  _labels() {
    if (!this.labels) return;
    const v = new THREE.Vector3();
    const path = this.pathId ? PATHS.find((p) => p.id === this.pathId) : null;
    this.labels.forEach((l) => {
      let show; let dim = false;
      if (l.kind === 'subject') {
        show = true;
        dim = (this.subjectId && this.subjectId !== l.id) || !!path;
      } else {
        show = (this.subjectId === l.subject && (this.mode === 'subject' || this.mode === 'course'))
          || (path && path.steps.includes(l.id)) || this.hoverId === l.id;
        if (this.level >= 0 && this.stars[l.id].level !== this.level && this.hoverId !== l.id) show = false;
      }
      v.copy(l.world).project(this.camera);
      if (v.z > 1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2) show = false;
      l.el.classList.toggle('is-on', show);
      l.el.classList.toggle('is-dim', dim);
      if (l.kind === 'course') {
        l.el.classList.toggle('is-sel', l.id === this.courseId);
        l.el.classList.toggle('is-done', this.done.has(l.id));
      }
      if (show) {
        const x = (v.x * 0.5 + 0.5) * this.w; const y = (-v.y * 0.5 + 0.5) * this.h;
        l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    });
  }
}
