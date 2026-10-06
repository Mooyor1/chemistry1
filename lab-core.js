/* โครงห้องแล็บและตัวช่วยวาดแคนวาส */
(function () {
  const COL = {
    text: "#e8eefc",
    muted: "#93a4cc",
    cyan: "#e9d5ff",
    blue: "#c084fc",
    purple: "#a855f7",
    green: "#3ee0a0",
    amber: "#f5c15d",
    rose: "#ff6d8a",
    line: "rgba(180,200,255,0.35)"
  };

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
  function fillRound(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  }
  function text(ctx, str, x, y, opt) {
    const o = opt || {};
    ctx.fillStyle = o.color || COL.text;
    ctx.font = (o.font || "14px Segoe UI, Leelawadee UI, sans-serif");
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "alphabetic";
    ctx.fillText(str, x, y);
  }
  function hit(state, x, y, w, h, id) {
    state.hits.push({ x: x, y: y, w: w, h: h, id: id });
  }
  function hitTest(state, x, y) {
    const list = state.hits || [];
    for (let i = list.length - 1; i >= 0; i--) {
      const h = list[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h.id;
    }
    return null;
  }
  function clearHits(state) { state.hits = []; }

  function drawBeaker(ctx, x, y, w, h, level, liquid) {
    const top = y + 16;
    const bot = y + h;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + 8, top);
    ctx.lineTo(x + 6, bot - 8);
    ctx.quadraticCurveTo(x + w / 2, bot + 10, x + w - 6, bot - 8);
    ctx.lineTo(x + w - 8, top);
    ctx.closePath();
    ctx.clip();
    const lh = Math.max(0, Math.min(1, level)) * (h - 28);
    ctx.fillStyle = liquid;
    ctx.fillRect(x, bot - lh, w, lh + 8);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + 10, bot - lh, 8, lh);
    ctx.restore();
    ctx.strokeStyle = "rgba(190,214,255,0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x - 2, bot - 6);
    ctx.quadraticCurveTo(x + w / 2, bot + 14, x + w + 2, bot - 6);
    ctx.lineTo(x + w, top);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top, w / 2, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawAxes(ctx, rect) {
    ctx.strokeStyle = COL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }
  function mapRange(v, a, b, c, d) {
    if (b === a) return c;
    return c + (v - a) / (b - a) * (d - c);
  }
  function bars(ctx, rect, values, labels, colors) {
    const n = values.length || 1;
    const gap = 10;
    const bw = (rect.w - gap * (n + 1)) / n;
    const max = Math.max.apply(null, values.concat([1]));
    values.forEach((v, i) => {
      const bh = rect.h * (v / max);
      const x = rect.x + gap + i * (bw + gap);
      const y = rect.y + rect.h - bh;
      ctx.fillStyle = (colors && colors[i]) || COL.blue;
      fillRound(ctx, x, y, bw, bh, 6, ctx.fillStyle);
      text(ctx, labels[i] || "", x + bw / 2, rect.y + rect.h + 16, { align: "center", font: "12px Segoe UI, Leelawadee UI", color: COL.muted });
      text(ctx, String(Math.round(v * 100) / 100), x + bw / 2, y - 6, { align: "center", font: "12px Segoe UI", color: COL.text });
    });
  }

  function slider(id, label, min, max, step, value, digits) {
    return '<div class="slider-row"><div class="top"><span>' + label + '</span><b id="lb-' + id + '">' + Number(value).toFixed(digits == null ? 2 : digits) + '</b></div><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></div>';
  }
  function toggle(id, label, on) {
    return '<label class="switch"><input id="' + id + '" type="checkbox" ' + (on ? "checked" : "") + '> ' + label + '</label>';
  }
  function selectBox(id, label, value, options) {
    const opts = options.map((o) => '<option value="' + o.id + '"' + (o.id === value ? " selected" : "") + '>' + o.name + '</option>').join("");
    return '<div class="field"><label>' + label + '</label><select id="' + id + '">' + opts + '</select></div>';
  }

  function mountLab(root, spec) {
    const state = spec.createState();
    let alive = true;
    let last = 0;
    const meta = spec.meta;
    root.innerHTML =
      '<section class="panel"><div class="lab-head row-between"><h2>' + meta.title + '</h2><a class="btn btn-dark" href="#lab">← กลับ</a></div>' +
      '<div class="lab-grid"><aside class="lab-col" id="lab-controls"></aside><section class="lab-col"><div class="canvas-wrap"><canvas class="sim" id="lab-canvas"></canvas></div><div id="lab-readout"></div><div id="lab-eq"></div></section><aside class="lab-col"><canvas class="chart" id="lab-chart"></canvas><div id="lab-analysis"></div><div id="lab-mis"></div></aside></div></section>';

    const controls = root.querySelector("#lab-controls");
    const canvas = root.querySelector("#lab-canvas");
    const chart = root.querySelector("#lab-chart");
    const readout = root.querySelector("#lab-readout");
    const eq = root.querySelector("#lab-eq");
    const analysis = root.querySelector("#lab-analysis");
    const mis = root.querySelector("#lab-mis");

    function setHTML(el, html) {
      if (el._last !== html) { el.innerHTML = html; el._last = html; }
    }
    function renderControls() {
      const modes = spec.modes.map((m, i) => '<button type="button" class="mode-btn' + (state.mode === i ? " on" : "") + '" data-mode="' + i + '"><b>โหมด ' + (i + 1) + '</b><span>' + m + '</span></button>').join("");
      controls.innerHTML = modes + '<div class="playrow"><button type="button" id="lab-play">' + (state.playing ? "หยุด" : "เล่น") + '</button><button type="button" id="lab-reset">เริ่มใหม่</button></div>' + spec.controls(state);
      controls.querySelectorAll("[data-mode]").forEach((btn) => {
        btn.onclick = function () { state.mode = Number(btn.dataset.mode); if (spec.onMode) spec.onMode(state); renderControls(); };
      });
      controls.querySelector("#lab-play").onclick = function () { state.playing = !state.playing; renderControls(); };
      controls.querySelector("#lab-reset").onclick = function () {
        const mode = state.mode;
        const fresh = spec.createState();
        Object.keys(state).forEach((k) => { delete state[k]; });
        Object.assign(state, fresh);
        state.mode = mode;
        renderControls();
      };
      if (spec.bind) spec.bind(controls, state, { rerender: renderControls });
    }
    function fit(c, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = c.getBoundingClientRect();
      const w = Math.max(10, rect.width);
      const height = h || Math.max(10, rect.height);
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(height * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(height * dpr);
      }
      const ctx = c.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx: ctx, w: w, h: height };
    }
    function frame(ts) {
      if (!alive) return;
      const dt = state.playing ? Math.min(0.033, last ? (ts - last) / 1000 : 0.016) : 0;
      last = ts;
      state.time = (state.time || 0) + dt;
      const main = fit(canvas);
      const side = fit(chart, 190);
      clearHits(state);
      spec.draw(main.ctx, main.w, main.h, state, dt);
      spec.chart(side.ctx, side.w, side.h, state);
      setHTML(readout, '<div class="metrics">' + spec.readout(state) + '</div>');
      setHTML(eq, '<div class="eqbar">' + spec.equation(state) + '</div>');
      setHTML(analysis, '<div class="analysis"><h3>ค่าวิเคราะห์</h3><p>' + spec.analysis(state) + '</p></div>');
      setHTML(mis, '<div class="mis"><h3>ความเข้าใจคลาดเคลื่อนที่พบบ่อย</h3><p>' + spec.misconception(state) + '</p></div>');
      requestAnimationFrame(frame);
    }
    function pointer(ev, phase) {
      const r = canvas.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      if (spec.pointer) spec.pointer(state, x, y, phase, hitTest(state, x, y));
    }
    canvas.addEventListener("pointerdown", (e) => { canvas.setPointerCapture(e.pointerId); pointer(e, "down"); });
    canvas.addEventListener("pointermove", (e) => pointer(e, "move"));
    canvas.addEventListener("pointerup", (e) => pointer(e, "up"));
    renderControls();
    requestAnimationFrame(frame);
    return function () { alive = false; };
  }

  window.LabCore = { COL, roundRect, fillRound, text, hit, hitTest, drawBeaker, drawAxes, mapRange, bars, slider, toggle, selectBox, mountLab };
})();
