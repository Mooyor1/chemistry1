/* แบบจำลองอะตอม การจัดเรียงอิเล็กตรอน สเปกตรัม และตารางธาตุ */
(function () {
  const C = () => window.CHEM;
  const L = () => window.LabCore;
  const MODELS = [
    { id: "dalton", name: "ดอลตัน" },
    { id: "thomson", name: "ทอมสัน" },
    { id: "rutherford", name: "รัทเทอร์ฟอร์ด" },
    { id: "bohr", name: "โบร์" },
    { id: "cloud", name: "กลุ่มหมอก" }
  ];

  function elOf(z) { return C().ELEMENTS[Math.max(0, Math.min(35, z - 1))]; }

  const spec = {
    meta: { title: "อะตอมและสมบัติของธาตุ", en: "Atomic Structure and Periodic Properties" },
    modes: [
      "แบบจำลองอะตอมและการทดลองอนุภาค",
      "การจัดเรียงอิเล็กตรอนและออร์บิทัล",
      "สเปกตรัมการปลดปล่อย",
      "ตารางธาตุและแนวโน้มสมบัติ"
    ],
    createState() {
      return {
        mode: 0, playing: true, time: 0, hits: [], z: 11, neutrons: 12, charge: 0,
        model: "bohr", cloud: true, anomaly: true, ni: 3, nf: 2, prop: "ie",
        alphas: [], bins: [0, 0, 0, 0]
      };
    },
    onMode(state) { state.alphas = []; },
    controls(state) {
      const Lc = L();
      const opts = C().ELEMENTS.map((e) => ({ id: String(e.z), name: e.z + " " + e.s + " " + e.name }));
      let extra = Lc.selectBox("el", "ธาตุ", String(state.z), opts);
      if (state.mode === 0) {
        extra += '<div class="block-label">แบบจำลอง</div><div class="seg">' + MODELS.map((m) => '<button type="button" data-model="' + m.id + '" class="' + (state.model === m.id ? "on" : "") + '">' + m.name + "</button>").join("") + "</div>";
        extra += Lc.slider("neu", "จำนวนนิวตรอน", 0, 48, 1, state.neutrons, 0);
        extra += Lc.slider("chg", "ประจุไอออน", -3, 3, 1, state.charge, 0);
      } else if (state.mode === 1) {
        extra += Lc.slider("neu", "จำนวนนิวตรอน", 0, 48, 1, state.neutrons, 0);
        extra += Lc.slider("chg", "ประจุไอออน", -3, 3, 1, state.charge, 0);
        extra += Lc.toggle("cloud", "แสดงความหนาแน่นกลุ่มหมอก", state.cloud);
      } else if (state.mode === 2) {
        extra += Lc.slider("ni", "ระดับต้น nᵢ", 1, 6, 1, state.ni, 0);
        extra += Lc.slider("nf", "ระดับปลาย n_f", 1, 6, 1, state.nf, 0);
      } else {
        const props = [["radius", "ขนาดอะตอม"], ["ie", "IE₁"], ["en", "EN"], ["ea", "EA"], ["ir", "รัศมีไอออน"]];
        extra += '<div class="seg">' + props.map((p) => '<button type="button" data-prop="' + p[0] + '" class="' + (state.prop === p[0] ? "on" : "") + '">' + p[1] + "</button>").join("") + "</div>";
        extra += Lc.toggle("anomaly", "เน้นข้อยกเว้นแนวโน้ม IE", state.anomaly);
      }
      return extra;
    },
    bind(root, state) {
      const sel = root.querySelector("#el");
      if (sel) sel.onchange = () => { state.z = Number(sel.value); };
      ["neu", "chg", "ni", "nf"].forEach((id) => {
        const el = root.querySelector("#" + id);
        const lb = root.querySelector("#lb-" + id);
        if (!el) return;
        const key = id === "neu" ? "neutrons" : id === "chg" ? "charge" : id;
        el.oninput = () => { state[key] = Number(el.value); if (lb) lb.textContent = String(state[key]); };
      });
      root.querySelectorAll("[data-model]").forEach((b) => { b.onclick = () => { state.model = b.dataset.model; state.alphas = []; root.querySelectorAll("[data-model]").forEach((x) => x.classList.toggle("on", x === b)); }; });
      root.querySelectorAll("[data-prop]").forEach((b) => { b.onclick = () => { state.prop = b.dataset.prop; root.querySelectorAll("[data-prop]").forEach((x) => x.classList.toggle("on", x === b)); }; });
      const cloud = root.querySelector("#cloud");
      if (cloud) cloud.onchange = () => { state.cloud = cloud.checked; };
      const an = root.querySelector("#anomaly");
      if (an) an.onchange = () => { state.anomaly = an.checked; };
    },
    pointer(state, x, y, phase, id) {
      if (phase === "down" && id && id.indexOf("el-") === 0) state.z = Number(id.slice(3));
    },
    draw(ctx, w, h, state, dt) {
      ctx.clearRect(0, 0, w, h);
      if (state.mode === 0) drawModel(ctx, w, h, state, dt);
      else if (state.mode === 1) drawConfig(ctx, w, h, state, dt);
      else if (state.mode === 2) drawSpectrum(ctx, w, h, state, dt);
      else drawTable(ctx, w, h, state);
    },
    chart(ctx, w, h, state) {
      ctx.clearRect(0, 0, w, h);
      const Lc = L();
      if (state.mode === 0) {
        const max = Math.max.apply(null, state.bins.concat([1]));
        Lc.bars(ctx, { x: 28, y: 16, w: w - 48, h: h - 52 }, state.bins.map((n) => n), ["0-10°", "10-30°", "30-90°", ">90°"], ["#e9d5ff", "#c084fc", "#a855f7", "#f5c15d"]);
        Lc.text(ctx, "มุมเบี่ยงเบนอนุภาคแอลฟา สูงสุด " + max, 16, h - 8, { font: "12px Leelawadee UI, Segoe UI", color: "#93a4cc" });
      } else if (state.mode === 1) drawLadder(ctx, w, h);
      else if (state.mode === 2) drawStrip(ctx, w, h, state);
      else drawTrend(ctx, w, h, state);
    },
    readout(state) {
      const e = elOf(state.z);
      const A = state.z + state.neutrons;
      const cfg = C().electronFill(state.z, state.charge);
      if (state.mode === 2) {
        const wave = waveOf(state);
        return metric(e.s, "ธาตุ") + metric(wave.equal ? "—" : wave.nm.toFixed(1), "λ nm") + metric(wave.equal ? "—" : wave.eV.toFixed(3), "ΔE eV");
      }
      if (state.mode === 3) {
        const val = propVal(e, state.prop);
        return metric(e.z, "เลขอะตอม") + metric(C().groupLabel(e.g) + " คาบ " + e.p, "ตำแหน่ง") + metric(val == null ? "—" : String(val), propUnit(state.prop));
      }
      return metric(e.z, "Z") + metric(A + (state.charge ? (state.charge > 0 ? " +" + state.charge : " " + state.charge) : ""), "A และประจุ") + metric(cfg.text, "การจัดเรียง");
    },
    equation(state) {
      if (state.mode === 0) return '<span class="k">สัญลักษณ์นิวเคลียร์</span> A = Z + n เลขมวลไม่ใช่มวลหน่วยกรัม';
      if (state.mode === 1) return '<span class="k">หลักการ</span> เอาฟบาว · ฮุนด์ · เพาลี สูงสุด 2 อิเล็กตรอนต่อออร์บิทัลและสปินตรงข้าม';
      if (state.mode === 2) return '<span class="k">ริดเบิร์ก</span> 1/λ = R<sub>H</sub> (1/n<sub>f</sub>² − 1/n<sub>i</sub>²) และ Eₙ = −13.6/n² eV';
      return '<span class="k">แนวโน้ม</span> ในคาบเดียวกัน IE และ EN มักเพิ่มตาม Z แต่มีข้อยกเว้นจากการจัดอิเล็กตรอน';
    },
    analysis(state) {
      const e = elOf(state.z);
      const cfg = C().electronFill(state.z, state.charge);
      if (state.mode === 3) return e.name + " เป็น" + e.kind + " หมู่ " + C().groupLabel(e.g) + " คาบ " + e.p + " การใช้: " + e.use;
      if (state.mode === 2) {
        const w = waveOf(state);
        if (w.equal) return "ระดับต้นและระดับปลายต้องไม่เท่ากัน จึงจะมีการดูดหรือคายพลังงาน";
        return (state.ni > state.nf ? "เป็นการคายพลังงาน (emission)" : "เป็นการดูดกลืน (absorption)") + " " + (w.nm >= 380 && w.nm <= 780 ? "อยู่ในช่วงแสงที่ตามองเห็น" : "อยู่นอกช่วงแสงที่ตามองเห็น");
      }
      let extra = "";
      if (state.z === 24 || state.z === 29) extra = " ข้อยกเว้น: Cr และ Cu จัดอิเล็กตรอนแบบกึ่งเต็มหรือเต็มใน d เพื่อเสถียรขึ้น";
      return e.name + " มีโปรตอน " + state.z + " นิวตรอน " + state.neutrons + " อิเล็กตรอน " + cfg.electrons + " การจัดเรียง " + cfg.text + extra;
    },
    misconception(state) {
      if (state.mode === 0 && state.model === "cloud") return "อิเล็กตรอนไม่ได้โคจรเป็นวงกลมคงที่เหมือนดาวเคราะห์ ในแบบจำลองกลุ่มหมอกคือความน่าจะเป็นที่จะพบอิเล็กตรอน";
      if (state.mode === 0) return "เลขมวล A คือจำนวนโปรตอนบวกนิวตรอน ไม่ใช่มวลจริงของอะตอมเป็นกรัม";
      if (state.mode === 3 && state.prop === "ie" && state.anomaly) return "IE₁ ไม่ได้เพิ่มขึ้นตามเลขอะตอมตลอดคาบ หมู่ 2A สูงกว่า 3A และหมู่ 5A สูงกว่า 6A เพราะการจัดอิเล็กตรอนแบบเต็มหรือครึ่งเต็มเสถียรกว่า";
      if (state.mode === 2) return "สีของเส้นสเปกตรัมขึ้นกับความต่างพลังงาน ไม่ใช่สีของธาตุในสภาพของแข็ง";
      return "ออร์บิทัลคือบริเวณความน่าจะเป็น ไม่ใช่รางที่อิเล็กตรอนวิ่งเป็นวงรีคงที่";
    }
  };

  function metric(v, u) { return '<div class="metric"><b>' + v + '</b><span>' + u + '</span></div>'; }
  function waveOf(state) {
    if (state.ni === state.nf) return { equal: true, nm: 0, eV: 0 };
    const ni = Math.max(state.ni, state.nf);
    const nf = Math.min(state.ni, state.nf);
    return { equal: false, nm: C().rydbergNm(nf, ni), eV: 13.6 * (1 / (nf * nf) - 1 / (ni * ni)) };
  }
  function propVal(e, prop) {
    const map = { radius: e.radius, ie: e.ie, en: e.en < 0 ? null : e.en, ea: e.ea, ir: e.ir < 0 ? null : e.ir };
    return map[prop];
  }
  function propUnit(prop) {
    return { radius: "pm", ie: "kJ/mol", en: "พอลิง", ea: "kJ/mol", ir: "pm" }[prop] || "";
  }

  function drawModel(ctx, w, h, state, dt) {
    const Lc = L();
    const cx = state.model === "rutherford" ? w * 0.32 : w * 0.5;
    const cy = h * 0.52;
    if (state.model === "dalton") {
      ctx.fillStyle = "#8eb6ff";
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();
      Lc.text(ctx, "ทรงกลมตัน", cx, cy + 100, { align: "center" });
    } else if (state.model === "thomson") {
      ctx.fillStyle = "rgba(120,160,255,0.35)";
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 7; i++) {
        const a = state.time + i;
        ctx.fillStyle = "#7fd4ff";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 40, cy + Math.sin(a * 1.3) * 36, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (state.model === "bohr" || state.model === "cloud") {
      const e = elOf(state.z);
      ctx.fillStyle = "#f5c15d";
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      const shells = Math.min(4, e.p);
      for (let n = 1; n <= shells; n++) {
        ctx.strokeStyle = "rgba(160,190,255,0.45)";
        ctx.beginPath();
        ctx.arc(cx, cy, 28 * n, 0, Math.PI * 2);
        ctx.stroke();
      }
      const cfg = C().electronFill(state.z, state.charge);
      const perN = {};
      C().ORBITALS.forEach((o) => {
        const count = cfg.fill[o.id] || 0;
        if (count) perN[o.n] = (perN[o.n] || 0) + count;
      });
      const maxN = Math.max(shells, ...Object.keys(perN).map(Number));
      for (let n = shells + 1; n <= maxN; n++) {
        ctx.strokeStyle = "rgba(160,190,255,0.45)";
        ctx.beginPath();
        ctx.arc(cx, cy, 28 * n, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (state.model === "cloud") {
        for (let i = 0; i < 80; i++) {
          const ang = i * 2.4 + state.time;
          const rad = 20 + (i % 5) * 16 + Math.sin(state.time + i) * 6;
          ctx.fillStyle = "rgba(127,212,255," + (0.15 + (i % 4) * 0.1) + ")";
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.72, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        Object.keys(perN).forEach((nStr) => {
          const n = Number(nStr);
          const count = perN[n];
          const rad = 28 * n;
          for (let i = 0; i < count; i++) {
            const ang = state.time * (1.5 / n) + (i * Math.PI * 2) / count;
            ctx.fillStyle = "#7fd4ff";
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, n >= 3 ? 3.6 : 4.6, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    }
    if (state.model === "rutherford") drawRutherford(ctx, w, h, state, dt);
    const A = state.z + state.neutrons;
    Lc.text(ctx, "A = " + A + "   Z = " + state.z, 24, h - 24, { font: "16px Segoe UI" });
  }

  function drawRutherford(ctx, w, h, state, dt) {
    const Lc = L();
    const foil = w * 0.62;
    ctx.strokeStyle = "rgba(245,193,93,0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(foil, 40);
    ctx.lineTo(foil, h - 30);
    ctx.stroke();
    ctx.fillStyle = "#f5c15d";
    ctx.beginPath();
    ctx.arc(foil, h * 0.5, 6, 0, Math.PI * 2);
    ctx.fill();
    Lc.text(ctx, "แผ่นทองคำ", foil, 28, { align: "center", font: "13px Leelawadee UI, Segoe UI", color: "#f5c15d" });
    if (state.alphas.length < 14 && Math.random() < dt * 5) {
      const far = Math.random() < 0.78;
      const b = (Math.random() - 0.5) * (far ? 180 : 28);
      state.alphas.push({ x: 16, y: h * 0.5 + b * 0.7, b: b, vx: 80, vy: 0, used: false });
    }
    state.alphas.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (!p.used && p.x >= foil) {
        p.used = true;
        const mag = Math.min(Math.PI * 0.92, 70 / Math.max(8, Math.abs(p.b)));
        const ang = mag * Math.sign(p.b || 1);
        p.vx = 90 * Math.cos(ang);
        p.vy = 90 * Math.sin(ang);
        const deg = Math.abs(ang) * 180 / Math.PI;
        state.bins[deg < 10 ? 0 : deg < 30 ? 1 : deg < 90 ? 2 : 3] += 1;
      }
      ctx.fillStyle = "#ffe08a";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    state.alphas = state.alphas.filter((p) => p.x > -30 && p.x < w + 30 && p.y > -30 && p.y < h + 40);
  }

  function drawConfig(ctx, w, h, state, dt) {
    const Lc = L();
    const cfg = C().electronFill(state.z, state.charge);
    const cx = 78;
    const cy = h - 78;
    if (state.cloud) {
      for (let i = 0; i < 70; i++) {
        const a = i + state.time * 0.2;
        const rad = ((i * 13) % 42) + 8;
        ctx.fillStyle = "rgba(127,212,255,0.35)";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rad, cy + Math.sin(a * 1.7) * rad * 0.85, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = "#f5c15d";
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    let x = 16;
    let row = 0;
    C().ORBITALS.forEach((o) => {
      const count = cfg.fill[o.id] || 0;
      if (!count && o.n > elOf(state.z).p + 1) return;
      const boxes = o.cap / 2;
      const need = boxes * 28 + 22;
      if (x + need > w - 8) { x = 16; row++; }
      const y0 = 28 + row * 64;
      Lc.text(ctx, o.id, x, y0 - 6, { font: "13px Segoe UI", color: "#9eb6de" });
      const spins = hund(count, boxes);
      for (let i = 0; i < boxes; i++) {
        const bx = x + i * 28;
        ctx.strokeStyle = "#9eb6de";
        ctx.strokeRect(bx, y0, 22, 36);
        (spins[i] || []).forEach((sp) => {
          ctx.strokeStyle = sp === "up" ? "#7fd4ff" : "#ff8ad4";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          const yy = y0 + 18 + (sp === "up" ? -6 : 6);
          ctx.moveTo(bx + 11, yy + (sp === "up" ? 8 : -8));
          ctx.lineTo(bx + 11, yy);
          ctx.stroke();
        });
      }
      x += need;
    });
    Lc.text(ctx, cfg.text, 24, h - 28, { font: "16px Segoe UI" });
  }

  function hund(count, boxes) {
    const spins = Array.from({ length: boxes }, () => []);
    let left = count;
    for (let i = 0; i < boxes && left > 0; i++) { spins[i].push("up"); left--; }
    for (let i = 0; i < boxes && left > 0; i++) { spins[i].push("down"); left--; }
    return spins;
  }

  function drawSpectrum(ctx, w, h, state, dt) {
    const Lc = L();
    const cx = w * 0.38;
    const cy = h * 0.55;
    ctx.fillStyle = "#f5c15d";
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    for (let n = 1; n <= 6; n++) {
      ctx.strokeStyle = n === state.nf || n === state.ni ? "#7fd4ff" : "rgba(160,190,255,0.35)";
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + n * 22, 0, Math.PI * 2);
      ctx.stroke();
      Lc.text(ctx, "n=" + n, cx + 22 + n * 22, cy - 6, { font: "12px Segoe UI", color: "#9eb6de" });
    }
    const wave = waveOf(state);
    const rad = 18 + Math.max(state.ni, state.nf) * 22;
    const ang = state.time * 1.2;
    ctx.fillStyle = wave.equal ? "#fff" : C().wavelengthToRGB(wave.nm);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 6, 0, Math.PI * 2);
    ctx.fill();
    if (!wave.equal) {
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 40, 50);
      ctx.lineTo(w - 40, 50 + Math.sin(state.time * 6) * 10);
      ctx.stroke();
      Lc.text(ctx, wave.nm.toFixed(1) + " nm", w - 120, 40, { color: "#d5e4ff" });
    }
  }

  function drawTable(ctx, w, h, state) {
    const Lc = L();
    const vals = C().ELEMENTS.map((e) => propVal(e, state.prop)).filter((v) => v != null);
    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    const cw = Math.min(34, (w - 20) / 18);
    const ch = Math.min(70, (h - 36) / 4.4);
    C().ELEMENTS.forEach((e) => {
      const col = e.g - 1;
      const row = e.p - 1;
      const x = 8 + col * cw;
      const y = 16 + row * (ch + 6);
      const val = propVal(e, state.prop);
      let color = "#1a2748";
      if (val != null && max > min) {
        const t = (val - min) / (max - min);
        const r = Math.round(50 + 190 * t);
        const g = Math.round(90 + 50 * (1 - Math.abs(t - 0.45)));
        const b = Math.round(220 - 160 * t);
        color = "rgb(" + r + "," + g + "," + b + ")";
      }
      Lc.fillRound(ctx, x, y, cw - 3, ch, 6, color);
      if (e.z === state.z) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        Lc.roundRect(ctx, x, y, cw - 3, ch, 6);
        ctx.stroke();
      }
      if (state.anomaly && state.prop === "ie" && C().IE_ANOMALIES.indexOf(e.z) >= 0) {
        ctx.strokeStyle = "#f5c15d";
        ctx.strokeRect(x - 1, y - 1, cw - 1, ch + 2);
      }
      Lc.text(ctx, e.s, x + (cw - 3) / 2, y + ch * 0.48, { align: "center", font: "bold 12px Segoe UI" });
      if (val != null) Lc.text(ctx, String(val), x + (cw - 3) / 2, y + ch * 0.78, { align: "center", font: "9px Segoe UI", color: "#e8eefc" });
      Lc.hit(state, x, y, cw - 3, ch, "el-" + e.z);
    });
  }

  function drawLadder(ctx, w, h) {
    const Lc = L();
    const order = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p"];
    order.forEach((id, i) => {
      const y = 20 + i * ((h - 36) / order.length);
      ctx.strokeStyle = "#7fd4ff";
      ctx.beginPath();
      ctx.moveTo(70, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
      Lc.text(ctx, id, 16, y + 4, { font: "12px Segoe UI", color: "#d5e4ff" });
    });
  }
  function drawStrip(ctx, w, h, state) {
    const Lc = L();
    const x0 = 16;
    const y = 40;
    const width = w - 32;
    for (let i = 0; i < width; i++) {
      const nm = 380 + (i / width) * 400;
      ctx.fillStyle = C().wavelengthToRGB(nm);
      ctx.fillRect(x0 + i, y, 1, 36);
    }
    [3, 4, 5, 6].forEach((ni) => {
      const nm = C().rydbergNm(2, ni);
      if (nm >= 380 && nm <= 780) {
        const x = x0 + (nm - 380) / 400 * width;
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y - 8, 2, 52);
      }
    });
    const wave = waveOf(state);
    if (!wave.equal && wave.nm >= 380 && wave.nm <= 780) {
      const x = x0 + (wave.nm - 380) / 400 * width;
      ctx.fillStyle = "#f5c15d";
      ctx.fillRect(x - 1, y - 14, 3, 64);
    }
    Lc.text(ctx, "400–700 nm เส้นขาวคือชุดบาลเมอร์", 16, h - 16, { font: "12px Leelawadee UI, Segoe UI", color: "#93a4cc" });
  }
  function drawTrend(ctx, w, h, state) {
    const Lc = L();
    const vals = C().ELEMENTS.map((e) => propVal(e, state.prop));
    const nums = vals.filter((v) => v != null);
    const min = Math.min.apply(null, nums);
    const max = Math.max.apply(null, nums);
    ctx.strokeStyle = "rgba(180,200,255,0.3)";
    ctx.strokeRect(28, 12, w - 44, h - 40);
    ctx.beginPath();
    ctx.strokeStyle = "#7fd4ff";
    let started = false;
    C().ELEMENTS.forEach((e, i) => {
      if (vals[i] == null) { started = false; return; }
      const x = Lc.mapRange(e.z, 1, 36, 28, w - 16);
      const y = Lc.mapRange(vals[i], min, max, h - 28, 16);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke();
    const e = elOf(state.z);
    const v = propVal(e, state.prop);
    if (v != null) {
      ctx.fillStyle = "#f5c15d";
      ctx.beginPath();
      ctx.arc(Lc.mapRange(e.z, 1, 36, 28, w - 16), Lc.mapRange(v, min, max, h - 28, 16), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  window.AtomLab = spec;
})();
