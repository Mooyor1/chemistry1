/* ห้องปฏิบัติการความปลอดภัยและทักษะการวัด */
(function () {
  const C = () => window.CHEM;
  const L = () => window.LabCore;

  function chem() { return C().CHEMICALS.find((x) => x.id === stateChem) || C().CHEMICALS[0]; }
  let stateChem = "HCl";

  function currentChem(state) {
    return C().CHEMICALS.find((x) => x.id === state.chem) || C().CHEMICALS[0];
  }
  function currentGlass(state) {
    return C().GLASSWARE.find((x) => x.id === state.glass) || C().GLASSWARE[1];
  }

  function ghsIcon(ctx, x, y, s, kind) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#d7263d";
    ctx.lineWidth = 2;
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.strokeRect(-s / 2, -s / 2, s, s);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = "#111";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1.4;
    if (kind === "ไวไฟ" || kind === "ออกซิไดส์") {
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.28);
      ctx.quadraticCurveTo(s * 0.22, -s * 0.05, 0, s * 0.3);
      ctx.quadraticCurveTo(-s * 0.22, -s * 0.05, 0, -s * 0.28);
      ctx.fill();
      if (kind === "ออกซิไดส์") {
        ctx.beginPath();
        ctx.arc(0, s * 0.08, s * 0.16, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (kind === "กัดกร่อน") {
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.2);
      ctx.lineTo(-s * 0.04, s * 0.16);
      ctx.moveTo(s * 0.12, -s * 0.2);
      ctx.lineTo(s * 0.02, s * 0.05);
      ctx.stroke();
    } else if (kind === "สิ่งแวดล้อม") {
      ctx.beginPath();
      ctx.arc(-s * 0.08, s * 0.05, s * 0.1, 0, Math.PI * 2);
      ctx.moveTo(s * 0.12, s * 0.16);
      ctx.lineTo(s * 0.12, -s * 0.16);
      ctx.stroke();
    } else {
      L().text(ctx, "!", 0, 4, { align: "center", font: "bold 16px Segoe UI", color: "#111" });
    }
    ctx.restore();
  }

  function nfpa(ctx, cx, cy, r, data) {
    const T = [cx, cy - r], Rgt = [cx + r, cy], B = [cx, cy + r], Lf = [cx - r, cy], C0 = [cx, cy];
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const parts = [
      { pts: [T, mid(T, Rgt), C0, mid(T, Lf)], color: "#e23b3b", label: String(data.f), lx: cx, ly: cy - r * 0.46 },
      { pts: [Lf, mid(Lf, T), C0, mid(Lf, B)], color: "#2f6bff", label: String(data.h), lx: cx - r * 0.46, ly: cy + 4 },
      { pts: [Rgt, mid(Rgt, T), C0, mid(Rgt, B)], color: "#f2d230", label: String(data.r), lx: cx + r * 0.46, ly: cy + 4 },
      { pts: [B, mid(B, Lf), C0, mid(B, Rgt)], color: "#f7f7f7", label: data.s || "—", lx: cx, ly: cy + r * 0.5 }
    ];
    parts.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(p.pts[0][0], p.pts[0][1]);
      p.pts.slice(1).forEach((q) => ctx.lineTo(q[0], q[1]));
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "#1b1b1b";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      L().text(ctx, p.label, p.lx, p.ly, { align: "center", font: "bold 13px Segoe UI", color: "#111" });
    });
  }

  function drawBottle(ctx, x, y, item, on) {
    L().fillRound(ctx, x, y + 28, 78, 96, 16, item.color);
    ctx.strokeStyle = on ? "#7fd4ff" : "rgba(255,255,255,0.35)";
    ctx.lineWidth = on ? 3 : 1.5;
    L().roundRect(ctx, x, y + 28, 78, 96, 16);
    ctx.stroke();
    L().fillRound(ctx, x + 26, y, 26, 34, 6, "rgba(210,225,255,0.85)");
    L().text(ctx, item.formula, x + 39, y + 78, { align: "center", font: "bold 13px Segoe UI", color: "#102" });
    ghsIcon(ctx, x + 58, y + 40, 18, item.ghs[0]);
  }

  const spec = {
    meta: { title: "ความปลอดภัยและทักษะในปฏิบัติการเคมี", en: "Safety and Skills in Chemistry Laboratory" },
    modes: [
      "สัญลักษณ์ GHS และ NFPA 704",
      "การอ่านเมนิสคัสและเครื่องแก้ว",
      "การเตรียมและเจือจางสารละลาย",
      "อุบัติเหตุและการปฐมพยาบาล"
    ],
    createState() {
      return {
        mode: 0, playing: true, time: 0, hits: [], chem: "HCl", showSDS: true,
        glass: "cylinder", eye: 0, showEye: true, convex: false, volume: 46,
        C1: 2, V2: 250, C2: 0.4, order: "acid", splash: 0, heat: 0.2,
        tool: "shower", feedback: "เลือกอุปกรณ์ แล้วคลิกสถานการณ์บนภาพ",
        done: {}
      };
    },
    controls(state) {
      const Lcore = L();
      const chems = C().CHEMICALS.map((c) => ({ id: c.id, name: c.name }));
      const glasses = C().GLASSWARE.map((g) => ({ id: g.id, name: g.name }));
      let extra = "";
      if (state.mode === 0) {
        extra = Lcore.selectBox("chem", "ชนิดสารเคมี", state.chem, chems) + Lcore.toggle("showSDS", "แสดงแผ่นข้อมูล SDS", state.showSDS);
      } else if (state.mode === 1) {
        extra = Lcore.selectBox("glass", "อุปกรณ์ตวง", state.glass, glasses) +
          Lcore.slider("volume", "ปริมาตรจริง (mL)", 1, currentGlass(state).capacity, currentGlass(state).decimals ? 0.1 : 1, Math.min(state.volume, currentGlass(state).capacity), 1) +
          Lcore.slider("eye", "มุมสายตา (องศา)", -30, 30, 5, state.eye, 0) +
          Lcore.toggle("showEye", "แสดงเส้นระดับสายตาและเมนิสคัสที่ถูก", state.showEye) +
          Lcore.toggle("convex", "ผิวโค้งนูน (เช่น ปรอท)", state.convex);
      } else if (state.mode === 2) {
        extra = Lcore.selectBox("chem", "ชนิดสาร", state.chem, chems) +
          Lcore.slider("C1", "C₁ ความเข้มข้นตั้งต้น (M)", 0.1, 10, 0.1, state.C1, 2) +
          Lcore.slider("V2", "V₂ ปริมาตรสุดท้าย (mL)", 10, 1000, 10, state.V2, 0) +
          Lcore.slider("C2", "C₂ ความเข้มข้นที่ต้องการ (M)", 0.1, 10, 0.1, state.C2, 2) +
          '<div class="block-label">ลำดับการเท</div><div class="seg"><button type="button" id="ord-acid" class="' + (state.order === "acid" ? "on" : "") + '">เทกรดลงในน้ำ</button><button type="button" id="ord-water" class="' + (state.order === "water" ? "on" : "") + '">เทน้ำลงในกรด</button></div>';
      } else {
        const tools = [["shower", "ฝักบัวฉุกเฉิน"], ["eyewash", "อ่างล้างตา"], ["ext", "ถังดับเพลิง"], ["air", "อากาศบริสุทธิ์"], ["oil", "น้ำมัน/ไขมัน"], ["base", "เบสอ่อนสะเทือน"]];
        extra = '<div class="block-label">อุปกรณ์ปฐมพยาบาล</div><div class="seg">' + tools.map((t) => '<button type="button" data-tool="' + t[0] + '" class="' + (state.tool === t[0] ? "on" : "") + '">' + t[1] + '</button>').join("") + "</div>";
      }
      return extra;
    },
    bind(root, state, api) {
      const chemSel = root.querySelector("#chem");
      if (chemSel) chemSel.onchange = () => { state.chem = chemSel.value; };
      const glass = root.querySelector("#glass");
      if (glass) glass.onchange = () => {
        state.glass = glass.value;
        state.volume = Math.min(state.volume, currentGlass(state).capacity);
        api.rerender();
      };
      ["volume", "eye", "C1", "V2", "C2"].forEach((key) => {
        const el = root.querySelector("#" + key);
        const lb = root.querySelector("#lb-" + key);
        if (!el) return;
        const digits = key === "eye" || key === "V2" ? 0 : key === "volume" ? 1 : 2;
        el.oninput = () => {
          state[key] = Number(el.value);
          if (key === "C2" && state.C2 > state.C1) state.C2 = state.C1;
          if (lb) lb.textContent = Number(state[key]).toFixed(digits);
        };
      });
      const sds = root.querySelector("#showSDS");
      if (sds) sds.onchange = () => { state.showSDS = sds.checked; };
      const eye = root.querySelector("#showEye");
      if (eye) eye.onchange = () => { state.showEye = eye.checked; };
      const convex = root.querySelector("#convex");
      if (convex) convex.onchange = () => { state.convex = convex.checked; };
      const acid = root.querySelector("#ord-acid");
      const water = root.querySelector("#ord-water");
      if (acid) acid.onclick = () => { state.order = "acid"; state.splash = 0; acid.classList.add("on"); water.classList.remove("on"); };
      if (water) water.onclick = () => { state.order = "water"; state.splash = 1; state.heat = 1; water.classList.add("on"); acid.classList.remove("on"); };
      root.querySelectorAll("[data-tool]").forEach((btn) => {
        btn.onclick = () => {
          state.tool = btn.dataset.tool;
          root.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b === btn));
        };
      });
    },
    pointer(state, x, y, phase, id) {
      if (phase !== "down" || !id) return;
      if (id.indexOf("chem-") === 0) state.chem = id.slice(5);
      if (id.indexOf("scene-") === 0) {
        const scenes = {
          skin: { ok: "shower", bad: "ล้างด้วยน้ำปริมาณมากอย่างน้อย 15 นาที เป็นอันดับแรก ห้ามทาน้ำมันและห้ามใช้เบสสะเทินบนผิวหนัง" },
          eye: { ok: "eyewash", bad: "พาไปอ่างล้างตา ลืมตาให้น้ำไหลผ่านอย่างน้อย 15 นาที" },
          vapor: { ok: "air", bad: "ย้ายไปที่อากาศบริสุทธิ์ทันที แล้วแจ้งครูผู้สอน" },
          fire: { ok: "ext", bad: "ไฟของเหลวไวไฟในบีกเกอร์ใช้ถังดับเพลิง ไม่ใช่ฝักบัวเป็นวิธีแรก" },
          cloth: { ok: "shower", bad: "ไฟติดเสื้อผ้าให้ใช้ฝักบัวฉุกเฉินราดน้ำปริมาณมาก" }
        };
        const key = id.slice(6);
        const sc = scenes[key];
        if (state.tool === sc.ok) {
          state.done[key] = true;
          state.feedback = "ถูกต้อง — " + sc.bad.replace("ห้าม", "จำไว้ว่าห้าม").replace(/^พาไป|^ย้าย|^ไฟ/, "วิธีที่ถูกคือ");
          if (key === "skin") state.feedback = "ถูกต้อง ล้างน้ำไหลผ่านอย่างน้อย 15 นาที ถอดเสื้อผ้าที่เปรอะเปื้อน";
          if (key === "eye") state.feedback = "ถูกต้อง ใช้อ่างล้างตาอย่างน้อย 15 นาที";
          if (key === "vapor") state.feedback = "ถูกต้อง พาไปบริเวณอากาศบริสุทธิ์";
          if (key === "fire") state.feedback = "ถูกต้อง ใช้ถังดับเพลิงชนิดคาร์บอนไดออกไซด์หรือผงเคมีแห้ง";
          if (key === "cloth") state.feedback = "ถูกต้อง ใช้ฝักบัวฉุกเฉินกับไฟติดตัว";
        } else {
          state.feedback = sc.bad;
        }
      }
    },
    draw(ctx, w, h, state, dt) {
      const Lc = L();
      ctx.clearRect(0, 0, w, h);
      if (state.mode === 0) {
        Lc.text(ctx, "คลิกขวดเพื่ออ่านสัญลักษณ์", 24, 32, { font: "16px Leelawadee UI, Segoe UI", color: "#d5e4ff" });
        C().CHEMICALS.forEach((item, i) => {
          const x = 36 + (i % 3) * 150;
          const y = 58 + Math.floor(i / 3) * 170;
          drawBottle(ctx, x, y, item, item.id === state.chem);
          Lc.hit(state, x, y, 86, 130, "chem-" + item.id);
          Lc.text(ctx, item.name, x + 39, y + 142, { align: "center", font: "12px Leelawadee UI, Segoe UI", color: "#c5d4ef" });
        });
        const item = currentChem(state);
        nfpa(ctx, w - 120, 150, 62, item.nfpa);
        Lc.text(ctx, "NFPA 704", w - 120, 230, { align: "center", font: "13px Segoe UI", color: "#9eb6de" });
        if (state.showSDS) {
          Lc.fillRound(ctx, w - 250, 260, 220, 140, 12, "rgba(8,14,30,0.72)");
          Lc.text(ctx, "SDS: " + item.formula, w - 236, 284, { font: "bold 14px Segoe UI" });
          wrap(ctx, item.sds, w - 236, 306, 196, 14);
        }
      } else if (state.mode === 1) {
        drawMeniscus(ctx, w, h, state);
      } else if (state.mode === 2) {
        drawDilution(ctx, w, h, state, dt);
      } else {
        drawAid(ctx, w, h, state);
      }
    },
    chart(ctx, w, h, state) {
      ctx.clearRect(0, 0, w, h);
      const Lc = L();
      const rect = { x: 36, y: 16, w: w - 56, h: h - 48 };
      if (state.mode === 0) {
        const n = currentChem(state).nfpa;
        Lc.bars(ctx, rect, [n.f, n.h, n.r], ["ไวไฟ", "สุขภาพ", "เสถียร"], ["#e23b3b", "#2f6bff", "#f2d230"]);
      } else if (state.mode === 1) {
        const vals = C().GLASSWARE.map((g) => g.capacity ? 100 * g.tol / g.capacity : 0);
        Lc.bars(ctx, rect, vals, ["บีกเกอร์", "กระบอก", "ปิเปต", "บิวเรต", "ขวด"], ["#f09a45", "#f5c15d", "#3ee0a0", "#c084fc", "#a855f7"]);
      } else if (state.mode === 2) {
        ctx.strokeStyle = "rgba(180,200,255,0.35)";
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.beginPath();
        ctx.strokeStyle = "#7fd4ff";
        ctx.lineWidth = 2;
        for (let i = 0; i <= 40; i++) {
          const V = 20 + i * (900 / 40);
          const Cc = state.C1 * Math.max(1, V1of(state)) / V;
          const x = Lc.mapRange(V, 20, 920, rect.x, rect.x + rect.w);
          const y = Lc.mapRange(Math.min(Cc, state.C1), 0, Math.max(0.2, state.C1), rect.y + rect.h, rect.y);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const x2 = Lc.mapRange(state.V2, 20, 920, rect.x, rect.x + rect.w);
        const y2 = Lc.mapRange(Math.min(state.C2, state.C1), 0, Math.max(0.2, state.C1), rect.y + rect.h, rect.y);
        ctx.fillStyle = "#f5c15d";
        ctx.beginPath();
        ctx.arc(x2, y2, 5, 0, Math.PI * 2);
        ctx.fill();
        Lc.text(ctx, "C กับ V เมื่อโมลคงที่", rect.x, h - 8, { font: "12px Leelawadee UI, Segoe UI", color: "#93a4cc" });
      } else {
        const keys = ["skin", "eye", "vapor", "fire", "cloth"];
        const names = ["ผิว", "ตา", "ไอ", "ไฟ", "ตัว"];
        Lc.bars(ctx, rect, keys.map((k) => state.done[k] ? 1 : 0.08), names, keys.map((k) => state.done[k] ? "#3ee0a0" : "#31415f"));
      }
    },
    readout(state) {
      if (state.mode === 0) {
        const item = currentChem(state);
        return metric(item.formula, "สูตร") + metric(item.nfpa.h + "-" + item.nfpa.f + "-" + item.nfpa.r, "สุขภาพ-ไฟ-เสถียร") + metric(item.ghs.length, "สัญลักษณ์ GHS");
      }
      if (state.mode === 1) {
        const g = currentGlass(state);
        const read = reading(state, g);
        return metric(read.apparent.toFixed(g.decimals), "ค่าที่อ่านได้ mL") + metric(read.pct.toFixed(2), "% ความคลาดเคลื่อน") + metric(String(g.decimals + 1), "ความละเอียดโดยประมาณ");
      }
      if (state.mode === 2) {
        const item = currentChem(state);
        const v1 = V1of(state);
        const mass = state.C2 * state.V2 * item.mw / 1000;
        return metric(v1.toFixed(2), "V₁ mL") + metric(mass.toFixed(2), "มวลถ้าชั่งของแข็ง g") + metric(state.order === "acid" ? "ปลอดภัย" : "อันตราย", "ลำดับการเท");
      }
      const n = Object.keys(state.done).length;
      return metric(n + "/5", "สถานการณ์ที่ถูก") + metric(state.tool, "อุปกรณ์ที่เลือก") + metric("15 นาที", "เวลาล้างขั้นต่ำ");
    },
    equation(state) {
      if (state.mode === 1) return '<span class="k">%Error</span> |ค่าที่อ่าน − ค่าจริง| / ค่าจริง × 100';
      if (state.mode === 2) {
        const v1 = V1of(state);
        return '<span class="k">เจือจาง</span> C₁V₁ = C₂V₂ → V₁ = ' + state.C2.toFixed(2) + " × " + state.V2.toFixed(0) + " / " + state.C1.toFixed(2) + " = " + v1.toFixed(2) + " mL";
      }
      if (state.mode === 3) return '<span class="k">ปฐมพยาบาล</span> สารโดนผิวหนังหรือตา → น้ำปริมาณมากอย่างน้อย 15 นาที';
      return '<span class="k">NFPA</span> สีแดงความไวไฟ · สีน้ำเงินสุขภาพ · สีเหลืองความเสถียร · ช่องขาวข้อมูลพิเศษ';
    },
    analysis(state) {
      if (state.mode === 0) return currentChem(state).ppe + " " + currentChem(state).sds;
      if (state.mode === 1) {
        const g = currentGlass(state);
        return g.note + " มุมสายตา " + state.eye + "° ทำให้เกิดพารัลแลกซ์ อ่านระดับเว้าที่ก้นโค้ง และอ่านระดับนูนที่ยอดโค้ง";
      }
      if (state.mode === 2) {
        return state.order === "acid"
          ? "เทกรดลงในน้ำช้า ๆ และคนตลอด จะควบคุมความร้อนได้ ปรับปริมาตรสุดท้ายด้วยขวดกำหนดปริมาตร"
          : "การเทน้ำลงในกรดเข้มข้นทำให้ความร้อนสะสมเฉพาะจุด สารอาจเดือดกระเด็น";
      }
      return state.feedback;
    },
    misconception(state) {
      if (state.mode === 1 && Math.abs(state.eye) > 0) return "การมองสูงหรือต่ำกว่าระดับของเหลวทำให้อ่านสเกลผิด ต้องให้สายตาขนานกับเมนิสคัส";
      if (state.mode === 1 && !currentGlass(state).precise) return "ใช้บีกเกอร์หรือกระบอกตวงเตรียมสารละลายมาตรฐานไม่ได้ ต้องใช้ปิเปตและขวดกำหนดปริมาตร";
      if (state.mode === 2 && state.order === "water") return "ห้ามเทน้ำลงในกรดเข้มข้น ต้องค่อย ๆ เทกรดลงในน้ำเพื่อไม่ให้ความร้อนดันสารกระเด็น";
      if (state.mode === 3 && (state.tool === "oil" || state.tool === "base")) return "ห้ามทาน้ำมันและห้ามใช้กรดหรือเบสอ่อนล้างเพื่อสะเทินบนผิวหนัง ต้องใช้น้ำสะอาดปริมาณมากก่อน";
      if (state.mode === 0) return "สัญลักษณ์บนฉลากบอกอันตรายเฉพาะด้าน ต้องอ่าน SDS ต่อเพื่อรู้วิธีเก็บ การทิ้ง และปฐมพยาบาล";
      return "ของเสียเคมีไม่เทรวมลงอ่างทั่วไป โดยเฉพาะโลหะหนักและตัวทำละลายอินทรีย์";
    }
  };

  function metric(v, u) { return '<div class="metric"><b>' + v + '</b><span>' + u + '</span></div>'; }
  function V1of(state) {
    if (state.C1 <= 0) return 0;
    return state.C2 * state.V2 / state.C1;
  }
  function reading(state, g) {
    const cap = g.capacity;
    const trueV = Math.max(0, Math.min(cap, state.volume));
    const offset = Math.tan(state.eye * Math.PI / 180) * cap * 0.12;
    const apparentRaw = Math.max(0, Math.min(cap, trueV + offset));
    const p = Math.pow(10, g.decimals);
    const apparent = Math.round(apparentRaw * p) / p;
    const pct = trueV ? Math.abs(apparent - trueV) / trueV * 100 : 0;
    return { trueV: trueV, apparent: apparent, pct: pct, cap: cap };
  }
  function wrap(ctx, str, x, y, max, lh) {
    ctx.font = "12px Leelawadee UI, Segoe UI";
    ctx.fillStyle = "#d5def3";
    let line = "";
    let yy = y;
    String(str).split("").forEach((ch) => {
      if (ctx.measureText(line + ch).width > max) {
        ctx.fillText(line, x, yy);
        line = ch;
        yy += lh;
      } else line += ch;
    });
    if (yy < y + 110) ctx.fillText(line, x, yy);
  }
  function drawMeniscus(ctx, w, h, state) {
    const Lc = L();
    const g = currentGlass(state);
    const read = reading(state, g);
    const cx = w * 0.48;
    const top = 50;
    const bot = h - 40;
    const gw = 120;
    ctx.strokeStyle = "rgba(190,214,255,0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - gw / 2, top, gw, bot - top);
    const frac = read.trueV / read.cap;
    const surface = bot - 20 - frac * (bot - top - 40);
    const depth = state.convex ? -16 : 16;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - gw / 2 + 3, top, gw - 6, bot - top);
    ctx.clip();
    ctx.fillStyle = state.convex ? "rgba(190,190,200,0.55)" : "rgba(90,170,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(cx - gw / 2, bot);
    for (let x = cx - gw / 2; x <= cx + gw / 2; x += 4) {
      const n = (x - cx) / (gw / 2);
      const y = surface - depth * (1 - n * n);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(cx + gw / 2, bot);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = bot - 20 - (i / 10) * (bot - top - 40);
      ctx.beginPath();
      ctx.moveTo(cx + gw / 2, y);
      ctx.lineTo(cx + gw / 2 + (i % 5 === 0 ? 16 : 8), y);
      ctx.stroke();
      if (i % 5 === 0) Lc.text(ctx, String(Math.round(read.cap * i / 10)), cx + gw / 2 + 20, y + 4, { font: "12px Segoe UI", color: "#9eb0d4" });
    }
    if (state.showEye) {
      ctx.strokeStyle = "#3ee0a0";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - 180, surface);
      ctx.lineTo(cx + gw, surface);
      ctx.stroke();
      ctx.setLineDash([]);
      const eyeY = surface - Math.tan(state.eye * Math.PI / 180) * 90;
      ctx.fillStyle = "#f5c15d";
      ctx.beginPath();
      ctx.arc(cx - 170, eyeY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(245,193,93,0.8)";
      ctx.beginPath();
      ctx.moveTo(cx - 160, eyeY);
      ctx.lineTo(cx, surface);
      ctx.stroke();
    }
    Lc.text(ctx, g.name, 28, 40, { font: "16px Leelawadee UI, Segoe UI" });
    Lc.text(ctx, state.convex ? "อ่านยอดเมนิสคัส" : "อ่านก้นเมนิสคัส", 28, 64, { font: "13px Leelawadee UI, Segoe UI", color: "#9eb0d4" });
  }
  function drawDilution(ctx, w, h, state, dt) {
    const Lc = L();
    const item = currentChem(state);
    if (state.order === "water") state.heat = Math.min(1, state.heat + dt * 0.4);
    else state.heat = Math.max(0.15, state.heat - dt * 0.3);
    Lc.drawBeaker(ctx, w * 0.18, h * 0.28, 130, 200, 0.55, "rgba(120,180,255,0.45)");
    Lc.text(ctx, "น้ำ", w * 0.18 + 65, h * 0.28 + 220, { align: "center", color: "#c5d4ef" });
    Lc.drawBeaker(ctx, w * 0.48, h * 0.28, 130, 200, 0.35, item.color);
    Lc.text(ctx, item.formula, w * 0.48 + 65, h * 0.28 + 220, { align: "center", color: "#c5d4ef" });
    const px = state.order === "acid" ? w * 0.48 + 40 : w * 0.18 + 40;
    const py = h * 0.22;
    ctx.strokeStyle = state.order === "acid" ? "#7fd4ff" : "#ff6d8a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(w * 0.4, h * 0.18, state.order === "acid" ? w * 0.24 + 70 : w * 0.54 + 50, h * 0.36);
    ctx.stroke();
    if (state.order === "water" && state.playing) {
      for (let i = 0; i < 8; i++) {
        const a = state.time * 4 + i;
        ctx.fillStyle = "rgba(255,120,140,0.8)";
        ctx.beginPath();
        ctx.arc(w * 0.55 + Math.sin(a) * 30, h * 0.4 - (a % 6) * 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    Lc.fillRound(ctx, w - 180, 40, 150, 16, 8, "#1a2342");
    Lc.fillRound(ctx, w - 180, 40, 150 * state.heat, 16, 8, state.heat > 0.7 ? "#ff6d8a" : "#f5c15d");
    Lc.text(ctx, "ความร้อน", w - 180, 32, { font: "12px Leelawadee UI, Segoe UI", color: "#9eb0d4" });
  }
  function drawAid(ctx, w, h, state) {
    const Lc = L();
    const scenes = [
      ["skin", "กรดโดนผิวหนัง"],
      ["eye", "สารเข้าตา"],
      ["vapor", "สูดดมไอกรด"],
      ["fire", "เอทานอลติดไฟ"],
      ["cloth", "ไฟติดเสื้อผ้า"]
    ];
    Lc.text(ctx, "คลิกสถานการณ์หลังจากเลือกอุปกรณ์", 24, 36, { font: "16px Leelawadee UI, Segoe UI" });
    scenes.forEach((sc, i) => {
      const x = 40 + (i % 3) * 200;
      const y = 70 + Math.floor(i / 3) * 150;
      Lc.fillRound(ctx, x, y, 180, 110, 16, state.done[sc[0]] ? "rgba(40,90,70,0.55)" : "rgba(16,24,48,0.8)");
      ctx.strokeStyle = state.done[sc[0]] ? "#3ee0a0" : "rgba(150,180,255,0.3)";
      ctx.stroke();
      L().roundRect(ctx, x, y, 180, 110, 16);
      ctx.stroke();
      Lc.text(ctx, sc[1], x + 90, y + 58, { align: "center", font: "16px Leelawadee UI, Segoe UI" });
      Lc.hit(state, x, y, 180, 110, "scene-" + sc[0]);
    });
  }

  window.SafetyLab = spec;
  stateChem = "HCl";
})();
