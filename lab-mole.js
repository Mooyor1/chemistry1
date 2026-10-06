/* โมล มวลอะตอมเฉลี่ย ร้อยละโดยมวล และสูตรเอมพิริกัล */
(function () {
  const C = () => window.CHEM;
  const L = () => window.LabCore;

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function empirical(parts) {
    const moles = parts.map((p) => ({ s: p.s, n: p.mass / p.ar }));
    const min = Math.min.apply(null, moles.map((m) => m.n).concat([1]));
    let best = { err: 99, k: 1, ints: moles.map(() => 1) };
    for (let k = 1; k <= 8; k++) {
      const scaled = moles.map((m) => m.n / min * k);
      const ints = scaled.map((v) => Math.max(1, Math.round(v)));
      const err = scaled.reduce((sum, v, i) => sum + Math.abs(v - ints[i]), 0);
      if (err < best.err) best = { err: err, k: k, ints: ints, moles: moles };
    }
    const g = best.ints.reduce((a, b) => gcd(a, b), 0) || 1;
    best.ints = best.ints.map((n) => Math.round(n / g));
    best.formula = best.ints.map((n, i) => parts[i].s + (n > 1 ? n : "")).join("");
    return best;
  }

  const spec = {
    meta: { title: "โมลและสูตรเคมี", en: "Moles and Chemical Formulas" },
    modes: [
      "มวลอะตอมเฉลี่ยจากไอโซโทป",
      "วงแปลงหน่วยโมล",
      "ร้อยละโดยมวลของธาตุ",
      "สูตรเอมพิริกัลและสูตรโมเลกุล"
    ],
    createState() {
      return {
        mode: 0, playing: true, time: 0, hits: [],
        m1: 35, p1: 75, m2: 37, p2: 25,
        compound: "H2O", mass: 18, molar: 18.015, gas: "STP",
        micro: true, steps: true,
        cMass: 40, hMass: 6.7, oMass: 53.3, molMass: 180,
        particles: Array.from({ length: 18 }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6 }))
      };
    },
    controls(state) {
      const Lc = L();
      if (state.mode === 0) {
        return Lc.slider("m1", "มวลไอโซโทป 1", 1, 80, 1, state.m1, 0) +
          Lc.slider("p1", "ร้อยละไอโซโทป 1", 0, 100, 1, state.p1, 0) +
          Lc.slider("m2", "มวลไอโซโทป 2", 1, 80, 1, state.m2, 0) +
          '<p class="tiny">ร้อยละไอโซโทป 2 = ' + (100 - state.p1) + "</p>";
      }
      if (state.mode === 1) {
        return Lc.selectBox("compound", "สาร", state.compound, C().COMPOUNDS.map((c) => ({ id: c.formula, name: c.name + " " + c.formula }))) +
          Lc.slider("mass", "มวล (g)", 0.1, 200, 0.1, state.mass, 1) +
          '<div class="seg"><button type="button" id="gas-stp" class="' + (state.gas === "STP" ? "on" : "") + '">STP 22.4 L</button><button type="button" id="gas-rtp" class="' + (state.gas === "RTP" ? "on" : "") + '">RTP 24.5 L</button></div>' +
          Lc.toggle("micro", "แสดงภาพอนุภาค", state.micro);
      }
      if (state.mode === 2) {
        return Lc.selectBox("compound", "สารประกอบ", state.compound, C().COMPOUNDS.map((c) => ({ id: c.formula, name: c.name }))) +
          Lc.toggle("steps", "แสดงขั้นตอนคำนวณ", state.steps);
      }
      return Lc.slider("cMass", "มวล C (g)", 0, 100, 0.1, state.cMass, 1) +
        Lc.slider("hMass", "มวล H (g)", 0, 30, 0.1, state.hMass, 1) +
        Lc.slider("oMass", "มวล O (g)", 0, 100, 0.1, state.oMass, 1) +
        Lc.slider("molMass", "มวลโมเลกุลที่ทดลองได้", 10, 400, 1, state.molMass, 0) +
        Lc.toggle("steps", "แสดงขั้นตอนทอนอัตราส่วน", state.steps);
    },
    bind(root, state) {
      const map = { m1: "m1", p1: "p1", m2: "m2", mass: "mass", cMass: "cMass", hMass: "hMass", oMass: "oMass", molMass: "molMass" };
      Object.keys(map).forEach((id) => {
        const el = root.querySelector("#" + id);
        const lb = root.querySelector("#lb-" + id);
        if (!el) return;
        el.oninput = () => {
          state[map[id]] = Number(el.value);
          if (id === "p1") state.p2 = 100 - state.p1;
          const digits = id === "m1" || id === "m2" || id === "p1" || id === "molMass" ? 0 : 1;
          if (lb) lb.textContent = Number(el.value).toFixed(digits);
        };
      });
      const sel = root.querySelector("#compound");
      if (sel) sel.onchange = () => {
        state.compound = sel.value;
        try { state.molar = C().molarMass(sel.value).mass; } catch (e) { state.molar = 18; }
      };
      const stp = root.querySelector("#gas-stp");
      const rtp = root.querySelector("#gas-rtp");
      if (stp) stp.onclick = () => { state.gas = "STP"; stp.classList.add("on"); rtp.classList.remove("on"); };
      if (rtp) rtp.onclick = () => { state.gas = "RTP"; rtp.classList.add("on"); stp.classList.remove("on"); };
      const micro = root.querySelector("#micro");
      if (micro) micro.onchange = () => { state.micro = micro.checked; };
      const steps = root.querySelector("#steps");
      if (steps) steps.onchange = () => { state.steps = steps.checked; };
    },
    draw(ctx, w, h, state, dt) {
      ctx.clearRect(0, 0, w, h);
      if (state.mode === 0) drawBalance(ctx, w, h, state);
      else if (state.mode === 1) drawWheel(ctx, w, h, state, dt);
      else if (state.mode === 2) drawPie(ctx, w, h, state);
      else drawEmpirical(ctx, w, h, state);
    },
    chart(ctx, w, h, state) {
      ctx.clearRect(0, 0, w, h);
      const Lc = L();
      if (state.mode === 0) {
        Lc.bars(ctx, { x: 28, y: 16, w: w - 48, h: h - 50 }, [state.m1, state.m2, average(state)], ["ไอโซโทป 1", "ไอโซโทป 2", "เฉลี่ย"], ["#7fd4ff", "#8b7cff", "#f5c15d"]);
      } else if (state.mode === 1) {
        const n = moles(state);
        ctx.strokeStyle = "#7fd4ff";
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
          const m = i * 10;
          const x = Lc.mapRange(m, 0, 200, 24, w - 16);
          const y = Lc.mapRange(m / state.molar, 0, 200 / state.molar, h - 28, 16);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = "#f5c15d";
        ctx.beginPath();
        ctx.arc(Lc.mapRange(state.mass, 0, 200, 24, w - 16), Lc.mapRange(n, 0, 200 / state.molar, h - 28, 16), 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (state.mode === 2) {
        const parts = composition(state);
        Lc.bars(ctx, { x: 20, y: 16, w: w - 36, h: h - 50 }, parts.map((p) => p.pct), parts.map((p) => p.s), ["#7fd4ff", "#3ee0a0", "#f5c15d", "#f08a8a", "#8b7cff"]);
      } else {
        const emp = currentEmp(state);
        Lc.bars(ctx, { x: 28, y: 16, w: w - 48, h: h - 50 }, emp.ints, ["C", "H", "O"], ["#9eb0d4", "#7fd4ff", "#f08a8a"]);
      }
    },
    readout(state) {
      if (state.mode === 0) return metric(average(state).toFixed(2), "มวลอะตอมเฉลี่ย") + metric(state.p1 + "%", "ไอโซโทป 1") + metric((100 - state.p1) + "%", "ไอโซโทป 2");
      if (state.mode === 1) {
        const n = moles(state);
        const vm = state.gas === "STP" ? 22.4 : 24.5;
        return metric(n.toFixed(3), "mol") + metric(C().formatNum(n * 6.022e23, -1), "อนุภาค") + metric((n * vm).toFixed(2), "L ที่ " + state.gas);
      }
      if (state.mode === 2) {
        const info = C().molarMass(state.compound);
        return metric(info.mass.toFixed(2), "g/mol") + metric(state.compound, "สูตร") + metric(composition(state).length, "ธาตุองค์ประกอบ");
      }
      const emp = currentEmp(state);
      const n = emp.mass ? Math.round(state.molMass / emp.mass) : 0;
      return metric(emp.formula, "สูตรอย่างง่าย") + metric(String(n || "—"), "ตัวคูณ n") + metric(emp.mass.toFixed(2), "มวลสูตรอย่างง่าย");
    },
    equation(state) {
      if (state.mode === 0) return '<span class="k">มวลเฉลี่ย</span> (m₁×%₁ + m₂×%₂) / 100 = ' + average(state).toFixed(2);
      if (state.mode === 1) return '<span class="k">โมล</span> n = m/M = N/N<sub>A</sub> = V/' + (state.gas === "STP" ? "22.4" : "24.5");
      if (state.mode === 2) return '<span class="k">% โดยมวล</span> %X = a × A<sub>r</sub> / M<sub>r</sub> × 100';
      const emp = currentEmp(state);
      return '<span class="k">สูตรโมเลกุล</span> n = M<sub>mol</sub> / M<sub>emp</sub> → ' + emp.formula + " และตัวคูณจากมวล " + state.molMass.toFixed(0);
    },
    analysis(state) {
      if (state.mode === 0) return "มวลอะตอมในตารางธาตุเป็นค่าเฉลี่ยถ่วงน้ำหนักของไอโซโทปในธรรมชาติ ไม่ใช่มวลของไอโซโทปตัวใดตัวหนึ่งเพียงอย่างเดียว";
      if (state.mode === 1) {
        const n = moles(state);
        return "มวล " + state.mass.toFixed(1) + " g ของ " + state.compound + " คือ " + n.toFixed(3) + " mol มีอนุภาคเท่ากับสารอื่นที่มีโมลเท่ากัน แต่มวลไม่จำเป็นต้องเท่ากัน";
      }
      if (state.mode === 2 && state.steps) {
        return composition(state).map((p) => p.s + " " + p.pct.toFixed(2) + "%").join(" · ");
      }
      if (state.mode === 3 && state.steps) {
        const emp = currentEmp(state);
        return "อัตราส่วนโมลถูกทอนเป็น " + emp.formula + " มวลสูตรอย่างง่าย " + emp.mass.toFixed(2) + " g/mol";
      }
      return "สูตรเอมพิริกัลคืออัตราส่วนจำนวนอะตอมอย่างต่ำ สูตรโมเลกุลอาจเป็นจำนวนเท่าของสูตรนั้น";
    },
    misconception(state) {
      if (state.mode === 1 && state.gas === "RTP") return "22.4 ลิตรต่อโมลใช้ได้เฉพาะแก๊สที่ STP (0 °C, 1 atm) ที่ RTP ให้ใช้ประมาณ 24.5 L/mol";
      if (state.mode === 1) return "1 โมลของสารทุกชนิดมี 6.022×10²³ อนุภาค แต่มวล 1 โมลขึ้นกับมวลโมเลกุล จึงไม่เท่ากัน";
      if (state.mode === 3) return "สูตรเอมพิริกัลกับสูตรโมเลกุลไม่ใช่สิ่งเดียวกันเสมอ เช่น CH₂O กับ C₆H₁₂O₆";
      return "ร้อยละโดยมวลคิดจากมวล ไม่ใช่จากจำนวนอะตอมโดยตรง";
    }
  };

  function metric(v, u) { return '<div class="metric"><b>' + v + '</b><span>' + u + '</span></div>'; }
  function average(state) { return (state.m1 * state.p1 + state.m2 * (100 - state.p1)) / 100; }
  function moles(state) { return state.mass / (state.molar || 1); }
  function composition(state) {
    const info = C().molarMass(state.compound);
    return Object.keys(info.map).map((s) => ({ s: s, pct: info.map[s] * C().AR[s] / info.mass * 100 }));
  }
  function currentEmp(state) {
    const parts = [
      { s: "C", mass: state.cMass, ar: 12.011 },
      { s: "H", mass: state.hMass, ar: 1.008 },
      { s: "O", mass: state.oMass, ar: 15.999 }
    ].filter((p) => p.mass > 0);
    if (!parts.length) return { formula: "—", ints: [0], mass: 0 };
    const emp = empirical(parts);
    emp.mass = parts.reduce((sum, p, i) => sum + p.ar * emp.ints[i], 0);
    return emp;
  }

  function drawBalance(ctx, w, h, state) {
    const Lc = L();
    const cx = w * 0.5;
    const tilt = (state.p1 - 50) / 50 * 0.25;
    ctx.strokeStyle = "#d5e2ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.72);
    ctx.lineTo(cx, h * 0.42);
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, h * 0.42);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.moveTo(-140, 0);
    ctx.lineTo(140, 0);
    ctx.stroke();
    ctx.fillStyle = "#7fd4ff";
    ctx.fillRect(-160, -8, 50, 16);
    ctx.fillStyle = "#8b7cff";
    ctx.fillRect(110, -8, 50, 16);
    ctx.restore();
    Lc.text(ctx, state.m1 + " (" + state.p1 + "%)", cx - 150, h * 0.38, { align: "center" });
    Lc.text(ctx, state.m2 + " (" + (100 - state.p1) + "%)", cx + 150, h * 0.38, { align: "center" });
    Lc.text(ctx, "ค่าเฉลี่ย " + average(state).toFixed(2), cx, h * 0.84, { align: "center", font: "20px Segoe UI" });
  }

  function drawWheel(ctx, w, h, state, dt) {
    const Lc = L();
    const n = moles(state);
    const cx = w * 0.34;
    const cy = h * 0.5;
    ctx.strokeStyle = "rgba(160,190,255,0.5)";
    [[w * 0.62, h * 0.28, "มวล"], [w * 0.74, h * 0.55, "อนุภาค"], [w * 0.58, h * 0.78, "ปริมาตร"]].forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p[0], p[1]);
      ctx.stroke();
      Lc.fillRound(ctx, p[0] - 46, p[1] - 18, 92, 36, 12, "#152044");
      Lc.text(ctx, p[2], p[0], p[1] + 4, { align: "center" });
    });
    ctx.fillStyle = "#24386a";
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.fill();
    Lc.text(ctx, n.toFixed(2) + " mol", cx, cy + 4, { align: "center", font: "16px Segoe UI" });
    if (state.micro) {
      const count = Math.max(4, Math.min(24, Math.round(n * 8)));
      for (let i = 0; i < count; i++) {
        const p = state.particles[i % state.particles.length];
        p.a += dt * (1 + (i % 3));
        const x = 36 + (i % 6) * 18 + Math.sin(p.a) * 4;
        const y = 36 + Math.floor(i / 6) * 18 + Math.cos(p.a) * 4;
        ctx.fillStyle = i % 2 ? "#7fd4ff" : "#f08a8a";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawPie(ctx, w, h, state) {
    const parts = composition(state);
    const colors = ["#7fd4ff", "#3ee0a0", "#f5c15d", "#f08a8a", "#c084fc"];
    const cx = w * 0.42;
    const cy = h * 0.52;
    let ang = -Math.PI / 2;
    parts.forEach((p, i) => {
      const slice = p.pct / 100 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.fillStyle = colors[i % colors.length];
      ctx.arc(cx, cy, 110, ang, ang + slice);
      ctx.closePath();
      ctx.fill();
      ang += slice;
    });
    parts.forEach((p, i) => {
      L().fillRound(ctx, w * 0.72, 50 + i * 36, 14, 14, 4, colors[i % colors.length]);
      L().text(ctx, p.s + " " + p.pct.toFixed(1) + "%", w * 0.72 + 22, 62 + i * 36);
    });
  }

  function drawEmpirical(ctx, w, h, state) {
    const Lc = L();
    const emp = currentEmp(state);
    Lc.text(ctx, "สูตรอย่างง่าย " + emp.formula, w * 0.5, 48, { align: "center", font: "28px Segoe UI" });
    const parts = ["C", "H", "O"];
    emp.ints.forEach((n, i) => {
      for (let k = 0; k < Math.min(n, 12); k++) {
        ctx.fillStyle = ["#dfe7ff", "#7fd4ff", "#f08a8a"][i];
        ctx.beginPath();
        ctx.arc(80 + i * 140 + (k % 4) * 22, 120 + Math.floor(k / 4) * 28, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      Lc.text(ctx, parts[i] + " × " + n, 80 + i * 140, h - 40, { font: "16px Segoe UI" });
    });
  }

  window.MoleLab = spec;
})();
