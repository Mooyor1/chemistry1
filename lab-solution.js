/* สารละลาย ความเข้มข้น การเจือจาง สภาพละลายได้ และสมบัติคอลลิเกทีฟ */
(function () {
  const C = () => window.CHEM;
  const L = () => window.LabCore;

  function solvent(state) { return C().SOLVENTS.find((s) => s.id === state.solvent) || C().SOLVENTS[0]; }
  function solute(state) { return C().SOLUTES.find((s) => s.id === state.solute) || C().SOLUTES[0]; }
  function kno3(T) {
    const pts = [[0, 13], [20, 32], [40, 64], [60, 110], [80, 169], [100, 246]];
    if (T <= 0) return 13;
    if (T >= 100) return 246;
    for (let i = 0; i < pts.length - 1; i++) {
      if (T >= pts[i][0] && T <= pts[i + 1][0]) {
        const t = (T - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        return pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
      }
    }
    return 32;
  }
  function solubility(state) {
    if (state.solute === "nacl") return 36 + state.temp * 0.02;
    if (state.solute === "sucrose") return 180 + state.temp * 1.6;
    return kno3(state.temp);
  }
  function calc(state) {
    const sv = solvent(state);
    const so = solute(state);
    const n = state.mass / so.mw;
    const V = state.volume / 1000;
    const M = V > 0 ? n / V : 0;
    const solMass = state.density * state.volume;
    const solventG = solMass - state.mass;
    const molal = solventG > 0 ? n / (solventG / 1000) : null;
    const nsv = solventG > 0 ? (solventG / sv.mw) : 0;
    const X = n + nsv > 0 ? n / (n + nsv) : 0;
    const ww = solMass > 0 ? state.mass / solMass * 100 : 0;
    const dTb = molal == null ? null : so.i * sv.kb * molal;
    const dTf = molal == null ? null : so.i * sv.kf * molal;
    const Tb = dTb == null ? null : sv.tb + dTb;
    const Tf = dTf == null ? null : sv.tf - dTf;
    const Pi = so.i * M * 0.0821 * (state.temp + 273.15);
    const per100 = solventG > 0 ? state.mass / solventG * 100 : 999;
    const sol = solubility(state);
    let sat = "ไม่อิ่มตัว";
    if (per100 > sol + 1) sat = "อิ่มตัวยวดยิ่ง / ตกผลึก";
    else if (per100 >= sol - 1) sat = "อิ่มตัว";
    const mixV = state.volume + state.v2;
    const Mmix = mixV > 0 ? (M * state.volume + state.m2 * state.v2) / mixV : 0;
    return { n: n, M: M, molal: molal, X: X, ww: ww, Tb: Tb, Tf: Tf, dTb: dTb, dTf: dTf, Pi: Pi, sat: sat, sol: sol, per100: per100, Mmix: Mmix, solventG: solventG };
  }

  const spec = {
    meta: { title: "สารละลาย", en: "Solutions" },
    modes: [
      "แปลงหน่วยความเข้มข้น",
      "เตรียม เจือจาง และผสม",
      "กราฟสภาพละลายได้",
      "สมบัติคอลลิเกทีฟ"
    ],
    createState() {
      return {
        mode: 0, playing: true, time: 0, hits: [],
        solvent: "water", solute: "glucose", mass: 18, volume: 250, temp: 25, density: 1.02,
        micro: true, phase: false, m2: 0.5, v2: 50, henry: false, pressure: 1,
        pour: 0,
        bits: Array.from({ length: 28 }, (_, i) => ({ x: Math.random(), y: Math.random(), s: 0.2 + Math.random() }))
      };
    },
    controls(state) {
      const Lc = L();
      let html = Lc.selectBox("solvent", "ตัวทำละลาย", state.solvent, C().SOLVENTS.map((s) => ({ id: s.id, name: s.name }))) +
        Lc.selectBox("solute", "ตัวละลาย", state.solute, C().SOLUTES.map((s) => ({ id: s.id, name: s.name + " (i=" + s.i + ")" })));
      html += Lc.slider("mass", "มวลตัวละลาย (g)", 0, 200, 0.5, state.mass, 1);
      html += Lc.slider("volume", "ปริมาตรสารละลาย (mL)", 10, 1000, 10, state.volume, 0);
      html += Lc.slider("temp", "อุณหภูมิ (°C)", -20, 120, 1, state.temp, 0);
      if (state.mode === 0) html += Lc.slider("density", "ความหนาแน่น (g/mL)", 0.8, 1.8, 0.01, state.density, 2) + Lc.toggle("micro", "แสดงอนุภาคในบีกเกอร์", state.micro);
      if (state.mode === 1) {
        html += '<div class="seg"><button type="button" id="add-solute">เติมตัวละลาย</button><button type="button" id="add-solvent">เติมตัวทำละลาย</button><button type="button" id="evap">ระเหย</button></div>';
        html += Lc.slider("m2", "M ของขวดที่ 2", 0, 5, 0.1, state.m2, 1);
        html += Lc.slider("v2", "V ของขวดที่ 2 (mL)", 0, 500, 10, state.v2, 0);
      }
      if (state.mode === 2) html += Lc.toggle("henry", "โหมดแก๊สตามกฎของเฮนรี", state.henry) + Lc.slider("pressure", "ความดัน (atm)", 1, 5, 0.1, state.pressure, 1);
      if (state.mode === 3) html += Lc.toggle("phase", "เทียบแผนภาพกับตัวทำละลายบริสุทธิ์", state.phase);
      return html;
    },
    bind(root, state) {
      const sv = root.querySelector("#solvent");
      const so = root.querySelector("#solute");
      if (sv) sv.onchange = () => { state.solvent = sv.value; };
      if (so) so.onchange = () => { state.solute = so.value; };
      [["mass", "mass", 1], ["volume", "volume", 0], ["temp", "temp", 0], ["density", "density", 2], ["m2", "m2", 1], ["v2", "v2", 0], ["pressure", "pressure", 1]].forEach((row) => {
        const el = root.querySelector("#" + row[0]);
        const lb = root.querySelector("#lb-" + row[0]);
        if (!el) return;
        el.oninput = () => { state[row[1]] = Number(el.value); if (lb) lb.textContent = state[row[1]].toFixed(row[2]); };
      });
      const micro = root.querySelector("#micro");
      if (micro) micro.onchange = () => { state.micro = micro.checked; };
      const henry = root.querySelector("#henry");
      if (henry) henry.onchange = () => { state.henry = henry.checked; };
      const phase = root.querySelector("#phase");
      if (phase) phase.onchange = () => { state.phase = phase.checked; };
      const addS = root.querySelector("#add-solute");
      const addV = root.querySelector("#add-solvent");
      const evap = root.querySelector("#evap");
      if (addS) addS.onclick = () => { state.mass = Math.min(200, state.mass + 5); state.pour = 0.8; };
      if (addV) addV.onclick = () => { state.volume = Math.min(2000, state.volume + 50); state.pour = 0.8; };
      if (evap) evap.onclick = () => { state.volume = Math.max(10, state.volume - 40); };
    },
    draw(ctx, w, h, state, dt) {
      ctx.clearRect(0, 0, w, h);
      if (state.pour > 0) state.pour -= dt;
      const info = calc(state);
      const level = Math.max(0.15, Math.min(0.85, state.volume / 800));
      const color = soluteColor(state, info.M);
      L().drawBeaker(ctx, w * 0.32, h * 0.18, 180, 250, level, color);
      if (state.micro && state.mode !== 2) {
        const count = Math.max(4, Math.min(26, Math.round(info.n * 12 + 4)));
        for (let i = 0; i < count; i++) {
          const b = state.bits[i % state.bits.length];
          b.x = (b.x + dt * b.s * 0.15) % 1;
          b.y = (b.y + dt * b.s * 0.2) % 1;
          const x = w * 0.32 + 24 + b.x * 130;
          const y = h * 0.18 + 250 - level * 210 + b.y * level * 180;
          ctx.fillStyle = i % solute(state).i === 0 ? "#f5c15d" : "#e8eefc";
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (state.mode === 2 && info.sat !== "ไม่อิ่มตัว") {
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.fillRect(w * 0.32 + 30 + i * 12, h * 0.18 + 210, 6, 8);
        }
      }
      if (state.mode === 3) {
        const top = h * 0.18 + 40;
        ctx.strokeStyle = "#f08a8a";
        ctx.beginPath();
        ctx.moveTo(w * 0.62, top);
        ctx.lineTo(w * 0.62, top + 160);
        ctx.stroke();
        const span = 140;
        const yb = top + span * (1 - Math.min(1, Math.max(0, (info.Tb + 20) / 160)));
        ctx.fillStyle = "#ff6d8a";
        ctx.fillRect(w * 0.62 - 6, yb, 12, 8);
        L().text(ctx, "Tb " + (info.Tb == null ? "—" : info.Tb.toFixed(2)), w * 0.66, yb, { font: "13px Segoe UI" });
      }
      if (state.pour > 0) {
        ctx.strokeStyle = "#7fd4ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.28, h * 0.12);
        ctx.lineTo(w * 0.4, h * 0.24);
        ctx.stroke();
      }
      L().text(ctx, info.sat, w * 0.32 + 90, h * 0.18 + 280, { align: "center", color: "#d5e4ff" });
    },
    chart(ctx, w, h, state) {
      ctx.clearRect(0, 0, w, h);
      const Lc = L();
      const info = calc(state);
      if (state.mode === 0) {
        const vals = [info.M, info.molal == null ? 0 : info.molal, info.ww, info.X * 100];
        Lc.bars(ctx, { x: 16, y: 12, w: w - 28, h: h - 48 }, vals, ["M", "m", "%w/w", "X×100"], ["#7fd4ff", "#8b7cff", "#3ee0a0", "#f5c15d"]);
      } else if (state.mode === 1) {
        ctx.strokeStyle = "#7fd4ff";
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) {
          const V = 20 + i * 30;
          const Cc = info.n / (V / 1000);
          const x = Lc.mapRange(V, 20, 920, 16, w - 12);
          const y = Lc.mapRange(Math.min(Cc, 8), 0, 8, h - 28, 12);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        Lc.text(ctx, "M ลดเมื่อเติมตัวทำละลาย โดยโมลคงที่", 12, h - 8, { font: "12px Leelawadee UI, Segoe UI", color: "#93a4cc" });
      } else if (state.mode === 2 && state.henry) {
        ctx.beginPath();
        ctx.strokeStyle = "#7fd4ff";
        ctx.moveTo(20, h - 30);
        ctx.lineTo(w - 16, 30);
        ctx.stroke();
        const x = Lc.mapRange(state.pressure, 1, 5, 20, w - 16);
        ctx.fillStyle = "#f5c15d";
        ctx.beginPath();
        ctx.arc(x, Lc.mapRange(state.pressure, 1, 5, h - 30, 30), 5, 0, Math.PI * 2);
        ctx.fill();
        Lc.text(ctx, "S ∝ P ตามกฎของเฮนรี", 12, 16, { font: "12px Leelawadee UI, Segoe UI" });
      } else if (state.mode === 2) {
        ctx.beginPath();
        ctx.strokeStyle = "#7fd4ff";
        for (let T = 0; T <= 100; T += 2) {
          const s = state.solute === "nacl" ? 36 : state.solute === "sucrose" ? 180 + T * 1.6 : kno3(T);
          const x = Lc.mapRange(T, 0, 100, 16, w - 12);
          const y = Lc.mapRange(Math.min(s, 300), 0, 300, h - 24, 12);
          if (T === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "#f5c15d";
        ctx.beginPath();
        ctx.arc(Lc.mapRange(state.temp, 0, 100, 16, w - 12), Lc.mapRange(Math.min(info.per100, 300), 0, 300, h - 24, 12), 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const sv = solvent(state);
        ctx.strokeStyle = "rgba(180,200,255,0.8)";
        ctx.strokeRect(16, 16, w - 32, h - 40);
        const y1 = Lc.mapRange(sv.tf, -20, 120, h - 24, 16);
        const y2 = Lc.mapRange(sv.tb, -20, 120, h - 24, 16);
        ctx.fillStyle = "rgba(127,212,255,0.25)";
        ctx.fillRect(20, y2, (w - 40) / 2, y1 - y2);
        if (info.Tf != null && info.Tb != null) {
          const a = Lc.mapRange(info.Tf, -20, 120, h - 24, 16);
          const b = Lc.mapRange(info.Tb, -20, 120, h - 24, 16);
          ctx.fillStyle = "rgba(245,193,93,0.35)";
          ctx.fillRect(w / 2, b, (w - 40) / 2, a - b);
        }
        Lc.text(ctx, "ซ้ายตัวทำละลาย ขวาสารละลาย", 16, h - 6, { font: "12px Leelawadee UI, Segoe UI", color: "#93a4cc" });
      }
    },
    readout(state) {
      const info = calc(state);
      if (state.mode === 3) return metric(info.Tb == null ? "—" : info.Tb.toFixed(2), "จุดเดือด °C") + metric(info.Tf == null ? "—" : info.Tf.toFixed(2), "จุดเยือกแข็ง °C") + metric(info.Pi.toFixed(2), "Π atm");
      if (state.mode === 2) return metric(info.sol.toFixed(1), "g/100 g ตัวทำละลาย") + metric(info.per100.toFixed(1), "ปริมาณปัจจุบัน") + metric(info.sat, "สภาวะ");
      return metric(info.M.toFixed(3), "mol/L") + metric(info.molal == null ? "—" : info.molal.toFixed(3), "mol/kg") + metric(info.ww.toFixed(2), "% w/w");
    },
    equation(state) {
      const info = calc(state);
      if (state.mode === 1) return '<span class="k">ผสม</span> M<sub>mix</sub> = (M₁V₁ + M₂V₂) / V<sub>รวม</sub> = ' + info.Mmix.toFixed(3) + " M · n คงที่ = " + info.n.toFixed(3) + " mol";
      if (state.mode === 3) return '<span class="k">คอลลิเกทีฟ</span> ΔT = i K m และ Π = iMRT จุดเดือดใหม่ = จุดเดือดเดิม + ΔT';
      if (state.mode === 2 && state.henry) return '<span class="k">เฮนรี</span> สภาพละลายได้ของแก๊สแปรผันตรงกับความดันย่อย S = kP';
      return '<span class="k">โมลาริตี</span> M = n / V<sub>L</sub> · โมลาลิตีคิดต่อมวลตัวทำละลาย จึงไม่เท่ากับ M เสมอไป';
    },
    analysis(state) {
      const info = calc(state);
      const so = solute(state);
      const sv = solvent(state);
      if (info.solventG <= 0) return "มวลตัวละลายมากเกินกว่ามวลสารละลายที่คำนวณจากความหนาแน่น ลองเพิ่มปริมาตรหรือลดมวล";
      if (state.mode === 3) return "ตัวละลาย " + so.name + " มี i = " + so.i + " ใน" + sv.name + " Kb = " + sv.kb + " และ Kf = " + sv.kf + " ใช้ประโยชน์เช่นสารกันเยือกแข็งและกระบวนการออสโมซิส";
      if (state.mode === 2) return "จุดสีทองคือสภาวะปัจจุบัน อยู่เหนือเส้นคือละลายได้ไม่หมดหรืออิ่มตัวยวดยิ่ง ต่ำกว่าเส้นคือยังละลายต่อได้";
      return "ความเข้มข้นนี้มีเศษส่วนโมลของตัวละลาย " + info.X.toFixed(4) + " และตัวทำละลายเหลือประมาณ " + info.solventG.toFixed(1) + " g";
    },
    misconception(state) {
      const info = calc(state);
      if (state.mode === 0 && info.molal != null && Math.abs(info.M - info.molal) > 0.05) return "โมลาริตีกับโมลาลิตีไม่เท่ากันเสมอ M ขึ้นกับปริมาตรสารละลายซึ่งเปลี่ยนตามอุณหภูมิ ส่วน m ขึ้นกับมวลตัวทำละลาย";
      if (state.mode === 1) return "การเติมตัวทำละลายไม่ได้ทำให้จำนวนโมลของตัวละลายลดลง โมลคงที่ แต่ความเข้มข้นลดเพราะปริมาตรเพิ่ม";
      if (state.mode === 3) return "ΔTb คือส่วนต่างที่เพิ่มขึ้น ไม่ใช่จุดเดือดใหม่ ต้องบวกกับจุดเดือดของตัวทำละลายบริสุทธิ์";
      return "สารละลายอิ่มตัวไม่ได้แปลว่าละลายไม่ได้เพิ่มเสมอไป ถ้าเพิ่มอุณหภูมิ สภาพละลายได้ของของแข็งส่วนใหญ่จะสูงขึ้น";
    }
  };

  function metric(v, u) { return '<div class="metric"><b>' + v + '</b><span>' + u + '</span></div>'; }
  function soluteColor(state, M) {
    const base = solvent(state).color;
    const t = Math.max(0.15, Math.min(0.95, M / 2));
    if (state.solute === "cacl2" || state.solute === "nacl") return "rgba(180,210,255," + (0.25 + t * 0.4) + ")";
    return base;
  }

  window.SolutionLab = spec;
})();
