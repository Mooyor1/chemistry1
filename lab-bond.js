/* พันธะเคมี รูปร่างโมเลกุล สภาพขั้ว และแรงระหว่างโมเลกุล */
(function () {
  const C = () => window.CHEM;
  const L = () => window.LabCore;
  const PRESETS = [
    { id: "H2O", name: "H₂O น้ำ", kind: "covalent", bp: 2, lp: 2, angle: 104.5, enA: 3.44, enB: 2.20, imf: "พันธะไฮโดรเจน", boil: 100 },
    { id: "CO2", name: "CO₂", kind: "covalent", bp: 2, lp: 0, angle: 180, enA: 2.55, enB: 3.44, imf: "แรงลอนดอน", boil: -78 },
    { id: "NH3", name: "NH₃", kind: "covalent", bp: 3, lp: 1, angle: 107, enA: 3.04, enB: 2.20, imf: "พันธะไฮโดรเจน", boil: -33 },
    { id: "CH4", name: "CH₄", kind: "covalent", bp: 4, lp: 0, angle: 109.5, enA: 2.55, enB: 2.20, imf: "แรงลอนดอน", boil: -161 },
    { id: "BF3", name: "BF₃", kind: "covalent", bp: 3, lp: 0, angle: 120, enA: 2.04, enB: 3.98, imf: "แรงลอนดอน", boil: -100 },
    { id: "SF6", name: "SF₆", kind: "covalent", bp: 6, lp: 0, angle: 90, enA: 2.58, enB: 3.98, imf: "แรงลอนดอน", boil: -64 },
    { id: "NaCl", name: "NaCl", kind: "ionic", bp: 0, lp: 0, angle: 0, enA: 0.93, enB: 3.16, imf: "แรงไอออนิก-ไดโพลเมื่อละลาย", boil: 1465 },
    { id: "Cu", name: "Cu โลหะ", kind: "metallic", bp: 0, lp: 0, angle: 0, enA: 1.90, enB: 1.90, imf: "ทะเลอิเล็กตรอน", boil: 2562 }
  ];

  function preset(state) { return PRESETS.find((p) => p.id === state.preset) || PRESETS[0]; }
  function norm(v) {
    const m = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / m, v[1] / m, v[2] / m];
  }
  function positions(bp, lp) {
    const n = Math.max(1, Math.min(6, bp + lp));
    let pos = [];
    if (n === 1) pos = [[1, 0, 0]];
    else if (n === 2) pos = [[1, 0, 0], [-1, 0, 0]];
    else if (n === 3) {
      for (let i = 0; i < 3; i++) pos.push([Math.cos(i * 2 * Math.PI / 3), Math.sin(i * 2 * Math.PI / 3), 0]);
    } else if (n === 4) pos = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(norm);
    else if (n === 5) {
      pos = [[0, 1, 0], [0, -1, 0]];
      for (let i = 0; i < 3; i++) pos.push([Math.cos(i * 2 * Math.PI / 3), 0, Math.sin(i * 2 * Math.PI / 3)]);
    } else pos = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    const lpAt = [];
    if (n === 5) for (let i = 0; i < lp; i++) lpAt.push(2 + i);
    else if (n === 6 && lp >= 1) { lpAt.push(4); if (lp > 1) lpAt.push(5); }
    else for (let i = 0; i < lp; i++) lpAt.push(i);
    return { pos: pos.slice(0, n), lpAt: lpAt };
  }
  function shapeName(bp, lp) {
    const key = bp + "-" + lp;
    const map = {
      "1-0": "อะตอมคู่", "2-0": "เส้นตรง AX₂", "3-0": "สามเหลี่ยมแบนราบ AX₃", "2-1": "มุมงอ AX₂E",
      "4-0": "ทรงสี่หน้า AX₄", "3-1": "พีระมิดฐานสามเหลี่ยม AX₃E", "2-2": "มุมงอ AX₂E₂", "1-3": "เส้นตรง",
      "5-0": "พีระมิดคู่ AX₅", "4-1": "กระดานหก AX₄E", "3-2": "ตัวที AX₃E₂", "2-3": "เส้นตรง AX₂E₃",
      "6-0": "ทรงแปดหน้า AX₆", "5-1": "พีระมิดฐานสี่เหลี่ยม AX₅E", "4-2": "สี่เหลี่ยมแบนราบ AX₄E₂"
    };
    return map[key] || "AX" + bp + "E" + lp;
  }
  function rotate(p, ax, ay) {
    const x1 = p[0] * Math.cos(ay) + p[2] * Math.sin(ay);
    const z1 = -p[0] * Math.sin(ay) + p[2] * Math.cos(ay);
    const y2 = p[1] * Math.cos(ax) - z1 * Math.sin(ax);
    const z2 = p[1] * Math.sin(ax) + z1 * Math.cos(ax);
    return [x1, y2, z2];
  }
  function dEN(state) { return Math.abs(state.enA - state.enB); }
  function ionicPct(v) { return (1 - Math.exp(-0.25 * v * v)) * 100; }
  function bondClass(v) {
    if (v < 0.5) return "โคเวเลนต์ไม่มีขั้ว";
    if (v <= 1.7) return "โคเวเลนต์มีขั้ว";
    return "ไอออนิก";
  }

  const spec = {
    meta: { title: "พันธะเคมี", en: "Chemical Bonding" },
    modes: [
      "พันธะไอออนิก โคเวเลนต์ และโลหะ",
      "รูปร่างโมเลกุลตาม VSEPR",
      "สภาพขั้วและไดโพลโมเมนต์",
      "แรงระหว่างโมเลกุลและการเปลี่ยนสถานะ"
    ],
    createState() {
      const p = PRESETS[0];
      return {
        mode: 0, playing: true, time: 0, hits: [], preset: p.id, kind: p.kind,
        bp: p.bp, lp: p.lp, enA: p.enA, enB: p.enB, angle: p.angle,
        T: 298, ax: 0.4, ay: 0.6, drag: null, dipole: true, cloud: false, imf: true,
        mols: Array.from({ length: 8 }, (_, i) => ({ x: 80 + (i % 4) * 90, y: 80 + Math.floor(i / 4) * 120, vx: Math.random() * 20 - 10, vy: Math.random() * 20 - 10 }))
      };
    },
    controls(state) {
      const Lc = L();
      let html = Lc.selectBox("preset", "ตัวอย่าง", state.preset, PRESETS.map((p) => ({ id: p.id, name: p.name })));
      if (state.mode === 0) {
        html += '<div class="seg"><button type="button" data-kind="ionic" class="' + (state.kind === "ionic" ? "on" : "") + '">ไอออนิก</button><button type="button" data-kind="covalent" class="' + (state.kind === "covalent" ? "on" : "") + '">โคเวเลนต์</button><button type="button" data-kind="metallic" class="' + (state.kind === "metallic" ? "on" : "") + '">โลหะ</button></div>';
      }
      if (state.mode === 2 || state.mode === 0) {
        html += Lc.slider("enA", "EN ของอะตอม A", 0.7, 4, 0.01, state.enA, 2);
        html += Lc.slider("enB", "EN ของอะตอม B", 0.7, 4, 0.01, state.enB, 2);
      }
      if (state.mode === 1 || state.mode === 2) {
        html += Lc.slider("bp", "จำนวนคู่พันธะ", 1, 6, 1, state.bp, 0);
        html += Lc.slider("lp", "จำนวนคู่โดดเดี่ยว", 0, 3, 1, state.lp, 0);
        html += Lc.toggle("dipole", "แสดงเวกเตอร์สภาพขั้ว", state.dipole);
        html += Lc.toggle("cloud", "แสดงกลุ่มหมอกอิเล็กตรอน", state.cloud);
      }
      if (state.mode === 3) {
        html += Lc.slider("temp", "อุณหภูมิ (K)", 0, 1000, 10, state.T, 0);
        html += Lc.toggle("imf", "แสดงแรงระหว่างโมเลกุล", state.imf);
      }
      if (state.mode === 1) html += '<p class="tiny">ลากบนภาพเพื่อหมุนโมเลกุล</p>';
      return html;
    },
    bind(root, state, api) {
      const sel = root.querySelector("#preset");
      if (sel) sel.onchange = () => { applyPreset(state, sel.value); api.rerender(); };
      root.querySelectorAll("[data-kind]").forEach((b) => {
        b.onclick = () => {
          state.kind = b.dataset.kind;
          root.querySelectorAll("[data-kind]").forEach((x) => x.classList.toggle("on", x === b));
        };
      });
      [["enA", "enA", 2], ["enB", "enB", 2], ["bp", "bp", 0], ["lp", "lp", 0], ["temp", "T", 0]].forEach((row) => {
        const el = root.querySelector("#" + row[0]);
        const lb = root.querySelector("#lb-" + row[0]);
        if (!el) return;
        el.oninput = () => {
          state[row[1]] = Number(el.value);
          if (state.bp + state.lp > 6) state.lp = Math.max(0, 6 - state.bp);
          if (lb) lb.textContent = Number(state[row[1]]).toFixed(row[2]);
        };
      });
      const dipole = root.querySelector("#dipole");
      if (dipole) dipole.onchange = () => { state.dipole = dipole.checked; };
      const cloud = root.querySelector("#cloud");
      if (cloud) cloud.onchange = () => { state.cloud = cloud.checked; };
      const imf = root.querySelector("#imf");
      if (imf) imf.onchange = () => { state.imf = imf.checked; };
    },
    pointer(state, x, y, phase) {
      if (state.mode !== 1 && state.mode !== 2) return;
      if (phase === "down") state.drag = { x: x, y: y, ax: state.ax, ay: state.ay };
      if (phase === "move" && state.drag) {
        state.ay = state.drag.ay + (x - state.drag.x) * 0.01;
        state.ax = state.drag.ax + (y - state.drag.y) * 0.01;
      }
      if (phase === "up") state.drag = null;
    },
    draw(ctx, w, h, state, dt) {
      ctx.clearRect(0, 0, w, h);
      if (!state.drag && state.playing && (state.mode === 1 || state.mode === 2)) state.ay += dt * 0.35;
      if (state.mode === 0) drawKind(ctx, w, h, state, dt);
      else if (state.mode === 3) drawImf(ctx, w, h, state, dt);
      else drawMolecule(ctx, w, h, state);
    },
    chart(ctx, w, h, state) {
      ctx.clearRect(0, 0, w, h);
      const Lc = L();
      if (state.mode === 0 || state.mode === 1) {
        ctx.beginPath();
        ctx.strokeStyle = "#7fd4ff";
        for (let i = 0; i <= 50; i++) {
          const r = 0.4 + i * 0.06;
          const yv = Math.pow(1 - Math.exp(-2 * (r - 1.1)), 2) - 1;
          const x = Lc.mapRange(r, 0.4, 3.4, 20, w - 16);
          const y = Lc.mapRange(yv, -1.1, 0.8, h - 28, 16);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        Lc.text(ctx, "พลังงานศักย์กับระยะระหว่างนิวเคลียส", 16, h - 8, { font: "12px Leelawadee UI, Segoe UI", color: "#93a4cc" });
      } else if (state.mode === 2) {
        const v = dEN(state);
        Lc.bars(ctx, { x: 30, y: 16, w: w - 50, h: h - 50 }, [v, ionicPct(v)], ["ΔEN", "% ไอออนิก"], ["#7fd4ff", "#f5c15d"]);
      } else {
        Lc.bars(ctx, { x: 24, y: 16, w: w - 40, h: h - 50 }, [100, -33, -61, -161].map((b) => b + 180), ["H₂O", "NH₃", "H₂S", "CH₄"], ["#7fd4ff", "#8b7cff", "#f5c15d", "#9eb0d4"]);
      }
    },
    readout(state) {
      const v = dEN(state);
      const geo = positions(state.bp, state.lp);
      const dip = dipoleMag(geo);
      if (state.mode === 3) return metric(state.T.toFixed(0), "K") + metric((state.T - 273).toFixed(0), "°C") + metric(preset(state).imf, "แรงหลักของตัวอย่าง");
      return metric(v.toFixed(2), "ΔEN") + metric(shapeName(state.bp, state.lp), "รูปร่าง") + metric(state.mode === 0 ? bondClass(v) : (dip < 0.2 ? "ไม่มีขั้ว" : "มีขั้ว"), "สภาพขั้ว");
    },
    equation(state) {
      const v = dEN(state);
      if (state.mode === 2 || state.mode === 0) return '<span class="k">% ionic</span> (1 − e^(−0.25 ΔEN²)) × 100 = ' + ionicPct(v).toFixed(1) + "% · ตอนนี้เป็น" + bondClass(v);
      if (state.mode === 1) return '<span class="k">VSEPR</span> ' + shapeName(state.bp, state.lp) + " มุมโดยประมาณ " + angleOf(state) + "°";
      return '<span class="k">แรงระหว่างโมเลกุล</span> จุดเดือดสูงผิดปกติของน้ำมาจากพันธะไฮโดรเจน ไม่ใช่การสลายพันธะ O–H';
    },
    analysis(state) {
      const p = preset(state);
      if (state.kind === "ionic" || p.id === "NaCl" && state.mode === 0) return "ของแข็งไอออนิกนำไฟฟ้าไม่ได้เพราะไอออนอยู่กับที่ จะนำไฟฟ้าเมื่อหลอมเหลวหรือละลายน้ำ";
      if (state.kind === "metallic") return "ไอออนบวกจมในทะเลอิเล็กตรอนที่เคลื่อนที่ได้ จึงนำไฟฟ้า นำความร้อน และตีเป็นแผ่นได้";
      if (state.mode === 3) return "ที่อุณหภูมิ " + state.T.toFixed(0) + " K โมเลกุลตัวอย่างยึดกันด้วย" + p.imf + " จุดเดือดโดยประมาณ " + p.boil + " °C";
      return "รูปร่าง " + shapeName(state.bp, state.lp) + " แรงผลักของคู่โดดเดี่ยวมากกว่าคู่พันธะ จึงดันมุมพันธะให้แคบลงในโมเลกุลจริง";
    },
    misconception(state) {
      const p = preset(state);
      if (state.mode === 3) return "การเดือดของน้ำสลายพันธะไฮโดรเจนระหว่างโมเลกุล ไม่ได้สลายพันธะโคเวเลนต์ O–H ภายในโมเลกุล";
      if (p.id === "CO2" || p.id === "BF3" || p.id === "CH4" || dipoleMag(positions(state.bp, state.lp)) < 0.2) return "พันธะมีขั้วไม่ได้ทำให้โมเลกุลมีขั้วเสมอ ถ้ารูปร่างสมมาตรเวกเตอร์จะหักล้างกัน เช่น CO₂ BF₃ และ CCl₄";
      if (state.kind === "ionic") return "สารประกอบไอออนิกไม่นำไฟฟ้าในสถานะของแข็ง นำไฟฟ้าได้เมื่อไอออนเคลื่อนที่ในของเหลวหรือสารละลาย";
      return "ΔEN น้อยกว่า 0.5 มักเป็นโคเวเลนต์ไม่มีขั้ว 0.5 ถึง 1.7 เป็นโคเวเลนต์มีขั้ว และมากกว่า 1.7 มักเป็นไอออนิก";
    }
  };

  function metric(v, u) { return '<div class="metric"><b>' + v + '</b><span>' + u + '</span></div>'; }
  function applyPreset(state, id) {
    const p = PRESETS.find((x) => x.id === id) || PRESETS[0];
    state.preset = p.id;
    state.kind = p.kind;
    state.bp = p.bp;
    state.lp = p.lp;
    state.enA = p.enA;
    state.enB = p.enB;
    state.angle = p.angle;
  }
  function angleOf(state) {
    const p = preset(state);
    if (p.bp === state.bp && p.lp === state.lp && p.angle) return p.angle;
    return bondAngle(positions(state.bp, state.lp));
  }
  function bondAngle(geo) {
    const bonds = geo.pos.filter((_, i) => geo.lpAt.indexOf(i) < 0);
    if (bonds.length < 2) return 180;
    const a = bonds[0];
    const b = bonds[1];
    const cos = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    return Math.round(Math.acos(cos) * 180 / Math.PI * 10) / 10;
  }
  function dipoleMag(geo) {
    const bonds = geo.pos.filter((_, i) => geo.lpAt.indexOf(i) < 0);
    const s = bonds.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
    return Math.hypot(s[0], s[1], s[2]);
  }

  function drawKind(ctx, w, h, state, dt) {
    const Lc = L();
    const cx = w * 0.5;
    const cy = h * 0.5;
    if (state.kind === "ionic") {
      const shift = 26 + Math.sin(state.time * 2) * 4;
      ctx.fillStyle = "#f5c15d";
      ctx.beginPath();
      ctx.arc(cx - 50, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7fd4ff";
      ctx.beginPath();
      ctx.arc(cx + 54, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      const e = cx - 10 + Math.sin(state.time * 2) * shift * 0.2;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(e, cy - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      Lc.text(ctx, "Na⁺", cx - 50, cy + 48, { align: "center" });
      Lc.text(ctx, "Cl⁻", cx + 54, cy + 48, { align: "center" });
    } else if (state.kind === "metallic") {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = "#d7b56a";
          ctx.beginPath();
          ctx.arc(cx - 120 + c * 70, cy - 60 + r * 60, 16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (let i = 0; i < 18; i++) {
        const a = state.time * 1.4 + i;
        ctx.fillStyle = "#7fd4ff";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * (40 + (i % 5) * 22), cy + Math.sin(a * 1.3) * 50, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      Lc.text(ctx, "ทะเลอิเล็กตรอน", cx, h - 36, { align: "center" });
    } else {
      ctx.strokeStyle = "#9eb6de";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy);
      ctx.lineTo(cx + 70, cy);
      ctx.stroke();
      ctx.fillStyle = "#f08a8a";
      ctx.beginPath();
      ctx.arc(cx - 70, cy, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8eb6ff";
      ctx.beginPath();
      ctx.arc(cx + 70, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      const share = cx + Math.sin(state.time * 3) * 16;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(share, cy - 10, 4, 0, Math.PI * 2);
      ctx.arc(share, cy + 10, 4, 0, Math.PI * 2);
      ctx.fill();
      Lc.text(ctx, "ใช้อิเล็กตรอนร่วมกัน", cx, cy + 60, { align: "center" });
    }
  }

  function drawMolecule(ctx, w, h, state) {
    const Lc = L();
    const geo = positions(state.bp, state.lp);
    const cx = w * 0.5;
    const cy = h * 0.52;
    const atoms = geo.pos.map((p, i) => {
      const r = rotate(p, state.ax, state.ay);
      return { r: r, lp: geo.lpAt.indexOf(i) >= 0, i: i };
    }).sort((a, b) => a.r[2] - b.r[2]);
    ctx.fillStyle = state.cloud ? "rgba(127,180,255,0.18)" : "#f08a8a";
    ctx.beginPath();
    ctx.arc(cx, cy, state.cloud ? 34 : 22, 0, Math.PI * 2);
    ctx.fill();
    const bondVec = [0, 0];
    atoms.forEach((a) => {
      const s = 78;
      const x = cx + a.r[0] * s;
      const y = cy - a.r[1] * s;
      if (!a.lp) {
        ctx.strokeStyle = "rgba(200,214,255,0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        bondVec[0] += a.r[0];
        bondVec[1] += a.r[1];
      }
      ctx.fillStyle = a.lp ? "rgba(170,140,255,0.35)" : "#8eb6ff";
      ctx.beginPath();
      ctx.arc(x, y, a.lp ? 20 : 14, 0, Math.PI * 2);
      ctx.fill();
    });
    if (state.dipole && Math.hypot(bondVec[0], bondVec[1]) > 0.25) {
      const mag = Math.hypot(bondVec[0], bondVec[1]);
      ctx.strokeStyle = "#f5c15d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + bondVec[0] / mag * 70, cy - bondVec[1] / mag * 70);
      ctx.stroke();
    }
    Lc.text(ctx, shapeName(state.bp, state.lp), cx, 36, { align: "center", font: "16px Leelawadee UI, Segoe UI" });
  }

  function drawImf(ctx, w, h, state, dt) {
    const Lc = L();
    const speed = 8 + state.T / 18;
    const linked = state.imf && state.T < 420 && preset(state).imf.indexOf("ไฮโดรเจน") >= 0;
    state.mols.forEach((m) => {
      if (state.playing) {
        m.x += m.vx * dt * speed / 20;
        m.y += m.vy * dt * speed / 20;
        if (m.x < 30 || m.x > w - 30) m.vx *= -1;
        if (m.y < 30 || m.y > h - 30) m.vy *= -1;
      }
    });
    if (linked) {
      ctx.strokeStyle = "rgba(127,212,255,0.7)";
      ctx.setLineDash([4, 4]);
      state.mols.forEach((a, i) => {
        state.mols.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });
      ctx.setLineDash([]);
    }
    state.mols.forEach((m) => {
      ctx.fillStyle = "#f08a8a";
      ctx.beginPath();
      ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d7e7ff";
      ctx.beginPath();
      ctx.arc(m.x + 14, m.y - 6, 6, 0, Math.PI * 2);
      ctx.arc(m.x - 12, m.y + 8, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    Lc.text(ctx, linked ? "เส้นประ = พันธะไฮโดรเจน" : "อุณหภูมิสูงขึ้น แรงระหว่างโมเลกุลถูกเอาชนะ", 20, 28, { font: "14px Leelawadee UI, Segoe UI" });
  }

  window.BondLab = spec;
})();
