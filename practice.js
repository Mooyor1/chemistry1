/* คลังโจทย์และกระบวนการฝึก 5 ขั้น */
(function () {
  const PAGE = 8;
  let bank = { chapter: "ทั้งหมด", topic: "ทั้งหมด", level: "ทั้งหมด", q: "", page: 0 };
  let session = null;
  let S = null;

  function cselect(value, options) {
    const cur = options.find((o) => o.value === value) || options[0];
    return '<div class="cselect" data-value="' + esc(cur.value) + '"><button type="button" class="cselect-btn">' + esc(cur.label) + '</button><div class="cselect-menu">' +
      options.map((o) => '<button type="button" data-value="' + esc(o.value) + '" class="' + (o.value === cur.value ? "on" : "") + '">' + esc(o.label) + "</button>").join("") +
      "</div></div>";
  }
  function esc(s) { return window.CHEM.esc(s); }

  function chapters() {
    const list = ["ทั้งหมด"];
    window.CHEM.PROBLEMS.forEach((p) => { if (list.indexOf(p.chapter) < 0) list.push(p.chapter); });
    return list;
  }
  function topics() {
    const list = ["ทั้งหมด"];
    window.CHEM.PROBLEMS.forEach((p) => {
      if ((bank.chapter === "ทั้งหมด" || p.chapter === bank.chapter) && list.indexOf(p.topic) < 0) list.push(p.topic);
    });
    return list;
  }
  function filtered() {
    const q = bank.q.trim().toLowerCase();
    return window.CHEM.PROBLEMS.filter((p) => {
      if (bank.chapter !== "ทั้งหมด" && p.chapter !== bank.chapter) return false;
      if (bank.topic !== "ทั้งหมด" && p.topic !== bank.topic) return false;
      if (bank.level !== "ทั้งหมด" && p.level !== bank.level) return false;
      if (!q) return true;
      return (p.title + p.stem + p.topic + p.chapter).toLowerCase().indexOf(q) >= 0;
    });
  }
  function statusOf(id) {
    const data = window.CHEM.Store.load();
    if (data.solved[id]) return { text: "ทำแล้ว", color: "#3ee0a0", n: 1 };
    const n = data.mistakes.filter((m) => m.id === id).length;
    if (n) return { text: "ทำผิด", color: "#f5c15d", n: n };
    return { text: "ยังไม่ทำ", color: "#8b9bb8", n: 0 };
  }

  function bindSelects(root, onChange) {
    root.querySelectorAll(".cselect").forEach((box) => {
      box.querySelector(".cselect-btn").onclick = function (e) {
        e.stopPropagation();
        const open = box.classList.contains("open");
        root.querySelectorAll(".cselect.open").forEach((x) => x.classList.remove("open"));
        if (!open) box.classList.add("open");
      };
      box.querySelectorAll(".cselect-menu button").forEach((btn) => {
        btn.onclick = function (e) {
          e.stopPropagation();
          box.dataset.value = btn.dataset.value;
          box.querySelector(".cselect-btn").textContent = btn.textContent;
          box.classList.remove("open");
          if (onChange) onChange(box);
        };
      });
    });
  }

  function renderBank(root, shell) {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    if (bank.page > pages - 1) bank.page = 0;
    const slice = list.slice(bank.page * PAGE, bank.page * PAGE + PAGE);
    const cards = slice.map((p) => {
      const st = statusOf(p.id);
      const pill = p.level === "ง่าย" ? "easy" : p.level === "ยาก" ? "hard" : "mid";
      return '<article class="pcard"><div class="pcard-top"><span class="chip">' + esc(p.topic) + '</span><span class="pill ' + pill + '">' + esc(p.level) + '</span></div><h3>' + esc(p.title) + '</h3><p>' + esc(p.blurb) + '</p><div class="pcard-bot"><span class="status"><i style="width:8px;height:8px;border-radius:50%;background:' + st.color + ';display:inline-block"></i> ' + st.text + " " + st.n + ' ครั้ง</span><button type="button" class="go" data-id="' + p.id + '">เริ่มทำ →</button></div></article>';
    }).join("");
    const html = '<div class="page-head"><h2>คลังโจทย์</h2><a class="btn btn-dark" href="#home">← หน้าแรก</a></div>' +
      '<div class="filters"><div class="field"><label>หน่วยการเรียน</label>' + cselect(bank.chapter, chapters().map((c) => ({ value: c, label: c }))) + '</div>' +
      '<div class="field"><label>หัวข้อเรื่อง</label>' + cselect(bank.topic, topics().map((c) => ({ value: c, label: c }))) + '</div>' +
      '<div class="field"><label>ระดับความยาก</label>' + cselect(bank.level, ["ทั้งหมด", "ง่าย", "ปานกลาง", "ยาก"].map((c) => ({ value: c, label: c }))) + '</div>' +
      '<div class="field"><label>ค้นหาโจทย์</label><input id="q" type="text" value="' + esc(bank.q) + '" placeholder="เช่น ความเข้มข้น, โมล, เจือจาง"></div></div>' +
      '<div class="tools"><button type="button" class="btn btn-primary" id="random">สุ่มโจทย์จากตัวกรอง</button><span class="chip">สุ่ม</span><span class="chip">' + esc(bank.level) + '</span><a class="btn btn-dark" href="#custom">ฝึกทำโจทย์เอง</a><button type="button" class="btn btn-next" id="ten">Practice 10</button></div>' +
      '<div class="row-between"><span class="found">พบ ' + list.length + ' ข้อ</span><span class="found">แสดง ' + (list.length ? bank.page * PAGE + 1 : 0) + "–" + Math.min(list.length, bank.page * PAGE + PAGE) + " จาก " + list.length + '</span></div>' +
      '<div class="pcards">' + (cards || '<div class="empty">ไม่พบโจทย์ตามตัวกรอง</div>') + '</div>' +
      '<div class="pager"><button type="button" id="prev">←</button><span>หน้า ' + (bank.page + 1) + "/" + pages + '</span><button type="button" id="next">→</button></div>' + insightHTML();
    root.innerHTML = shell("bank", '<section class="panel">' + html + "</section>");
    const panel = root.querySelector(".panel");
    bindSelects(panel, function (box) {
      const label = box.parentElement.querySelector("label").textContent;
      const value = box.dataset.value;
      if (label.indexOf("หน่วย") >= 0) { bank.chapter = value; bank.topic = "ทั้งหมด"; }
      else if (label.indexOf("หัวข้อ") >= 0) bank.topic = value;
      else bank.level = value;
      bank.page = 0;
      renderBank(root, shell);
    });
    const q = panel.querySelector("#q");
    q.oninput = function () { bank.q = q.value; bank.page = 0; renderBank(root, shell); q.focus(); };
    panel.querySelector("#prev").onclick = function () { if (bank.page > 0) { bank.page--; renderBank(root, shell); } };
    panel.querySelector("#next").onclick = function () { if (bank.page < pages - 1) { bank.page++; renderBank(root, shell); } };
    panel.querySelector("#random").onclick = function () {
      const pool = filtered();
      if (!pool.length) return;
      session = null;
      location.hash = "practice/" + pool[Math.floor(Math.random() * pool.length)].id;
    };
    panel.querySelector("#ten").onclick = function () {
      const pool = filtered().slice();
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      session = { ids: pool.slice(0, 10).map((p) => p.id), i: 0 };
      if (session.ids.length) location.hash = "practice/" + session.ids[0];
    };
    panel.querySelectorAll(".go").forEach((btn) => {
      btn.onclick = function () { session = null; location.hash = "practice/" + btn.dataset.id; };
    });
    const wipe = panel.querySelector("#wipe-inline");
    if (wipe) wipe.onclick = function () { window.CHEM.Store.reset(); renderBank(root, shell); };
  }

  function resetS(p) {
    const unit = {};
    p.vars.forEach((v) => { if (v.given) unit[v.id] = v.unit; });
    S = { id: p.id, step: 0, hintsLeft: 2, hint: "", known: {}, target: "", formula: -1, expr: "", sub: {}, unit: unit, error: "", bad: {}, started: Date.now(), done: false };
  }

  function scopeUser(p) {
    const scope = {};
    (p.constants || []).forEach((c) => { scope[c.id] = c.value; });
    p.vars.forEach((v) => {
      if (!v.given) return;
      scope[v.id] = S.sub[v.id] === "" || S.sub[v.id] == null ? NaN : Number(S.sub[v.id]);
    });
    return scope;
  }
  function equivalent(user, p) {
    const sets = [window.CHEM.scopeOf(p)];
    const a1 = {};
    const a2 = {};
    p.vars.forEach((item) => {
      if (!item.given) return;
      a1[item.id] = item.value === 0 ? 2 : item.value * 1.7 + 0.3;
      a2[item.id] = item.value === 0 ? 5 : item.value * 0.45 + 1.1;
    });
    sets.push(window.CHEM.scopeOf(p, a1), window.CHEM.scopeOf(p, a2));
    return sets.every((sc) => window.CHEM.close(window.CHEM.evalExpr(user, sc), window.CHEM.evalExpr(p.expr, sc)));
  }
  function subst(expr, map) {
    let e = expr;
    Object.keys(map).sort((a, b) => b.length - a.length).forEach((k) => {
      const val = map[k];
      const shown = val === "" || val == null ? k : "(" + val + ")";
      e = e.replace(new RegExp("\\b" + k + "\\b", "g"), shown);
    });
    return e;
  }

  function check(p) {
    S.error = "";
    S.bad = {};
    if (S.step === 0) {
      const missing = p.vars.some((v) => v.given && !S.known[v.id]);
      const extra = p.vars.some((v) => !v.given && S.known[v.id]);
      if (!S.target) { S.error = "เลือกตัวแปรที่โจทย์ต้องการหา"; return false; }
      if (S.target !== p.target.id) { S.error = "ตัวแปรที่ต้องการหายังไม่ตรงกับคำถาม"; return false; }
      if (missing) { S.error = "ยังเลือกตัวแปรที่โจทย์กำหนดให้ไม่ครบ"; return false; }
      if (extra) { S.error = "มีตัวแปรที่โจทย์ไม่ได้กำหนดถูกเลือกอยู่"; return false; }
      return true;
    }
    if (S.step === 1) {
      if (S.formula < 0) { S.error = "เลือกสมการก่อนตรวจ"; return false; }
      if (!p.formulas[S.formula].ok) { S.error = "สมการนี้ยังไม่ใช่ความสัมพันธ์ที่ใช้แก้โจทย์นี้"; return false; }
      return true;
    }
    if (S.step === 2) {
      const raw = S.expr.trim();
      if (!raw) { S.error = "พิมพ์สมการที่จัดรูปแล้ว"; return false; }
      if (new RegExp("\\b" + p.target.id + "\\b").test(raw.split("=").pop())) {
        S.error = "ใส่เฉพาะข้างที่คำนวณจากตัวแปรที่โจทย์ให้ ไม่ใส่ตัวแปรคำตอบ";
        return false;
      }
      try {
        if (!equivalent(raw, p)) { S.error = "สมการยังไม่สมมูลกับความสัมพันธ์ที่ถูกต้อง"; return false; }
      } catch (e) {
        S.error = e.message;
        return false;
      }
      return true;
    }
    if (S.step === 3) {
      let ok = true;
      p.vars.forEach((v) => {
        if (!v.given) return;
        const num = Number(S.sub[v.id]);
        if (!window.CHEM.closeVal(num, v.value)) { S.bad[v.id] = true; ok = false; }
        if (S.unit[v.id] !== v.unit) { S.bad[v.id] = true; ok = false; }
      });
      if (!ok) { S.error = "ค่าหรือหน่วยที่แทนยังไม่ตรงกับโจทย์"; return false; }
      try {
        const value = window.CHEM.evalExpr(S.expr || p.expr, scopeUser(p));
        if (!window.CHEM.close(value, p.answer)) { S.error = "ผลจากการแทนค่ายังไม่ตรงคำตอบ"; return false; }
      } catch (e) {
        S.error = e.message;
        return false;
      }
      return true;
    }
    return true;
  }

  function renderPractice(root, shell, id) {
    const p = window.CHEM.PROBLEMS.find((x) => x.id === id);
    if (!p) { location.hash = "bank"; return; }
    if (!S || S.id !== id) resetS(p);
    const steps = window.CHEM.STEPS;
    const fill = S.done ? 100 : ((S.step + 1) / steps.length) * 100;
    let body = "";
    if (S.done) body = success(p);
    else if (S.step === 0) body = stepAnalyze(p);
    else if (S.step === 1) body = stepFormula(p);
    else if (S.step === 2) body = stepArrange(p);
    else body = stepSub(p);
    const hint = S.hint ? '<div class="hintbox">💡 ' + S.hint + "</div>" : "";
    const err = S.error ? '<div class="err">' + esc(S.error) + "</div>" : "";
    const pill = p.level === "ง่าย" ? "easy" : p.level === "ยาก" ? "hard" : "mid";
    const html = '<div class="practice-head"><h2><span class="ico" style="width:36px;height:36px;margin:0">📘</span> ฝึกทำโจทย์เคมี</h2><a href="#bank">← เลือกโจทย์ใหม่</a></div>' +
      '<div class="steps"><div class="step-track"><div class="step-fill" style="width:' + fill + '%"></div></div><div class="step-labels">' +
      steps.map((name, i) => '<span class="' + (i <= S.step || S.done ? "on" : "") + '">' + name + "</span>").join("") + "</div></div>" +
      '<div class="stem-wrap"><div class="context"><span class="pill ' + pill + '">' + esc(p.level) + '</span> <span class="chip">' + esc(p.topic) + "</span></div><p class=\"stem\">" + esc(p.stem) + "</p></div>" +
      hint + err + body +
      (S.done ? "" : '<div class="foot"><button type="button" class="btn btn-ghost" id="back">ย้อนกลับ</button><button type="button" class="btn btn-hint" id="hint"' + (S.hintsLeft ? "" : " disabled") + ">💡 คำใบ้ (" + S.hintsLeft + ')</button><button type="button" class="btn btn-next" id="go">' + (S.step === 3 ? "คำนวณผลลัพธ์ →" : "ตรวจสอบและถัดไป →") + "</button></div>");
    root.innerHTML = shell("bank", '<section class="panel">' + html + "</section>");
    const panel = root.querySelector(".panel");
    if (S.done) {
      const again = panel.querySelector("#again");
      const next = panel.querySelector("#next-prob");
      if (again) again.onclick = function () { resetS(p); renderPractice(root, shell, id); };
      if (next) next.onclick = function () {
        session.i += 1;
        location.hash = "practice/" + session.ids[session.i];
      };
      return;
    }
    bindSelects(panel);
    panel.querySelectorAll(".vcheck input").forEach((input) => {
      input.onchange = function () { S.known[input.value] = input.checked; input.parentElement.classList.toggle("on", input.checked); };
    });
    const target = panel.querySelector("[data-role=target]");
    if (target) {
      target.querySelectorAll(".cselect-menu button").forEach((btn) => {
        btn.addEventListener("click", function () { S.target = btn.dataset.value; });
      });
    }
    panel.querySelectorAll(".formula").forEach((lab) => {
      lab.onclick = function () {
        S.formula = Number(lab.dataset.i);
        panel.querySelectorAll(".formula").forEach((x) => x.classList.toggle("on", x === lab));
        const radio = lab.querySelector("input");
        if (radio) radio.checked = true;
      };
    });
    const expr = panel.querySelector("#expr");
    if (expr) {
      expr.oninput = function () { S.expr = expr.value; paintPreview(panel, p); };
      panel.querySelectorAll(".ops button, .chips button").forEach((btn) => {
        btn.onclick = function () {
          const ins = btn.dataset.ins;
          const s = expr.selectionStart || expr.value.length;
          const e = expr.selectionEnd || expr.value.length;
          expr.value = expr.value.slice(0, s) + ins + expr.value.slice(e);
          S.expr = expr.value;
          expr.focus();
          expr.selectionStart = expr.selectionEnd = s + ins.length;
          paintPreview(panel, p);
        };
      });
    }
    panel.querySelectorAll("[data-sub]").forEach((input) => {
      input.oninput = function () { S.sub[input.dataset.sub] = input.value; paintPreview(panel, p); };
    });
    panel.querySelectorAll("[data-unit]").forEach((box) => {
      box.querySelectorAll(".cselect-menu button").forEach((btn) => {
        btn.addEventListener("click", function () {
          S.unit[box.dataset.unit] = btn.dataset.value;
          const note = box.parentElement.querySelector(".tiny");
          if (note) note.textContent = btn.dataset.value === box.dataset.ok ? "✓ เป็นหน่วยในสมการ (" + box.dataset.ok + ")" : "หน่วยนี้ไม่ตรงกับสมการ";
        });
      });
    });
    panel.querySelector("#back").onclick = function () {
      if (S.step === 0) location.hash = "bank";
      else { S.step -= 1; S.error = ""; renderPractice(root, shell, id); }
    };
    panel.querySelector("#hint").onclick = function () {
      if (!S.hintsLeft) return;
      const idx = 2 - S.hintsLeft;
      S.hint = p.hints[idx] || p.hints[p.hints.length - 1];
      S.hintsLeft -= 1;
      window.CHEM.Store.hint();
      renderPractice(root, shell, id);
    };
    panel.querySelector("#go").onclick = function () {
      if (!check(p)) {
        window.CHEM.Store.fail(p, steps[S.step]);
        renderPractice(root, shell, id);
        return;
      }
      if (S.step < 3) { S.step += 1; S.error = ""; renderPractice(root, shell, id); return; }
      S.done = true;
      window.CHEM.Store.success(p, Math.max(1, Math.round((Date.now() - S.started) / 1000)));
      renderPractice(root, shell, id);
    };
  }

  function paintPreview(panel, p) {
    const box = panel.querySelector("#preview");
    if (!box) return;
    const map = {};
    (p.constants || []).forEach((c) => { map[c.id] = c.value; });
    p.vars.forEach((v) => { if (v.given) map[v.id] = S.sub[v.id] || ""; });
    box.innerHTML = "<b>" + esc(p.target.id) + " = " + esc(subst(S.expr || p.expr, map)) + "</b>";
  }

  function stepAnalyze(p) {
    const boxes = p.vars.map((v) => '<label class="vcheck' + (S.known[v.id] ? " on" : "") + '"><input type="checkbox" value="' + v.id + '"' + (S.known[v.id] ? " checked" : "") + "><span>" + esc(v.label) + "</span></label>").join("");
    return '<div class="section-title">ตัวแปรที่โจทย์ให้</div><div class="vgrid">' + boxes + '</div><div class="field" style="margin-top:14px"><label>ต้องการหา</label><div data-role="target">' +
      cselect(S.target, [{ value: "", label: "— เลือกตัวแปร —" }].concat(p.targetOptions.map((o) => ({ value: o.id, label: o.label })))) + "</div></div>";
  }
  function stepFormula(p) {
    return '<div class="section-title">เลือกสูตร</div>' +
      p.formulas.map((f, i) => '<label class="formula' + (S.formula === i ? " on" : "") + '" data-i="' + i + '"><input type="radio" name="formula"' + (S.formula === i ? " checked" : "") + "><span>" + f.html + "</span></label>").join("");
  }
  function opKeys() {
    return [["−", "-"], ["×", "*"], ["÷", "/"], ["(", "("], [")", ")"], ["√", "sqrt("], ["x²", "^2"], ["|x|", "abs("], ["eˣ", "exp("]];
  }
  function exprBar(targetId, value, placeholder) {
    return '<div class="expr-bar"><div class="eq">' + esc(targetId) + ' =</div><input id="expr" type="text" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '" autocomplete="off"><div class="ops">' +
      opKeys().map((k) => '<button type="button" data-ins="' + k[1] + '">' + k[0] + "</button>").join("") + "</div></div>" +
      "";
  }
  function stepArrange(p) {
    const chips = p.vars.filter((v) => v.given).map((v) => v.id).concat((p.constants || []).map((c) => c.id));
    return '<div class="section-title">จัดรูปเพื่อหา ' + esc(p.target.label) + "</div>" +
      '<div class="chips">' + chips.map((id) => '<button type="button" data-ins="' + id + '">' + id + "</button>").join("") + "</div>" +
      exprBar(p.target.id, S.expr, "เช่น C*V*Mw/1000");
  }
  function stepSub(p) {
    const cards = p.vars.filter((v) => v.given).map((v) => {
      return '<div class="subcard' + (S.bad[v.id] ? " bad" : "") + '"><div class="block-label">' + esc(v.label) + '</div><div class="pair"><input data-sub="' + v.id + '" type="number" step="any" value="' + esc(S.sub[v.id] || "") + '" placeholder="' + v.id + '"><div data-unit="' + v.id + '" data-ok="' + esc(v.unit) + '">' +
        cselect(S.unit[v.id] || v.unit, v.options.map((u) => ({ value: u, label: u }))) + '</div></div><div class="tiny">หน่วยในสมการ: ' + esc(v.unit) + "</div></div>";
    }).join("");
    const consts = (p.constants || []).map((c) => '<div class="subcard"><div class="block-label">' + esc(c.label) + '</div><input disabled value="' + c.value + '"></div>').join("");
    const map = {};
    (p.constants || []).forEach((c) => { map[c.id] = c.value; });
    p.vars.forEach((v) => { if (v.given) map[v.id] = S.sub[v.id] || v.id; });
    return '<div class="section-title">แทนค่า</div><div class="subgrid">' + cards + consts + '</div><div class="preview" id="preview"><b>' + esc(p.target.id) + " = " + esc(subst(S.expr || p.expr, map)) + "</b></div>";
  }
  function success(p) {
    const known = p.vars.filter((v) => v.given).map((v) => v.id + " = " + v.value + " " + v.unit).join(", ");
    const formula = p.formulas.find((f) => f.ok);
    const map = {};
    p.vars.forEach((v) => { if (v.given) map[v.id] = v.value; });
    (p.constants || []).forEach((c) => { map[c.id] = c.value; });
    const ans = window.CHEM.formatNum(p.answer, p.digits) + (p.target.unit ? " " + p.target.unit : "");
    const next = session && session.i < session.ids.length - 1;
    return '<div class="success"><div class="check">✓</div><h2>คำนวณสำเร็จ</h2></div>' +
      '<div class="summary"><div class="summary-top"><span>คำตอบสุดท้าย</span><span class="answer-big">' + ans + "</span></div><ol class=\"slist\">" +
      "<li>วิเคราะห์: กำหนด " + esc(known) + " ต้องการหา " + esc(p.target.label) + "</li>" +
      "<li>สูตร: " + formula.html + "</li>" +
      "<li>จัดรูป: " + esc(p.target.id) + " = " + (p.exprHtml || esc(p.expr)) + "</li>" +
      "<li>แทนค่า: " + esc(p.target.id) + " = " + esc(subst(p.expr, map)) + "</li>" +
      "<li>คำนวณ: " + esc(p.target.id) + " = " + ans + "</li></ol>" +
      (p.note ? '<div class="hintbox" style="margin-top:10px">' + esc(p.note) + "</div>" : "") +
      '</div><div class="foot"><a class="btn btn-dark" href="#bank">← เลือกโจทย์ใหม่</a><button type="button" class="btn btn-next" id="again">ทำข้อนี้อีกครั้ง</button>' +
      (next ? '<button type="button" class="btn btn-primary" id="next-prob">ข้อถัดไป →</button>' : "") + "</div>";
  }

  function renderProgress(root, shell) {
    const st = window.CHEM.stats();
    const pct = st.total ? Math.round(1000 * st.solved / st.total) / 10 : 0;
    const html = '<div class="page-head"><h2>ความก้าวหน้า</h2><button type="button" class="btn btn-dark" id="wipe">ล้างสถิติ</button></div>' +
      '<div class="statgrid"><div class="stat"><span>ทำแล้ว</span><b>' + st.solved + "/" + st.total + '</b></div><div class="stat"><span>Accuracy</span><b>' + st.accuracy + '%</b></div><div class="stat"><span>Hint</span><b>' + st.hints + '</b></div><div class="stat"><span>ทำผิด</span><b>' + st.wrongOpen + '</b></div><div class="stat"><span>เฉลี่ย/ข้อ</span><b>' + st.avg + 's</b></div></div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div><p class="tiny">' + pct + '%</p>' +
      '<div class="advice">คุณผิด <b>' + esc(st.weakStep) + "</b> มากที่สุด (" + st.weakN + " ครั้ง) — ควรฝึกขั้นนี้เพิ่ม</div>" +
      '<div class="advice">หัวข้อที่มีข้อผิดพลาดมากที่สุดคือ <b>' + esc(st.weakTopic) + "</b> (" + st.topicN + " ครั้ง)</div>";
    root.innerHTML = shell("progress", '<section class="panel">' + html + "</section>");
    root.querySelector("#wipe").onclick = function () {
      window.CHEM.Store.reset();
      renderProgress(root, shell);
    };
  }

  function insightHTML() {
    const st = window.CHEM.stats();
    const pct = st.total ? Math.round(1000 * st.solved / st.total) / 10 : 0;
    return '<section class="insight"><div class="insight-head"><h3>จุดที่ควรฝึกเพิ่ม</h3><button type="button" class="go" id="wipe-inline">ล้างสถิติ</button></div>' +
      '<div class="statgrid"><div class="stat"><span>ทำแล้ว</span><b>' + st.solved + "/" + st.total + '</b></div><div class="stat"><span>Accuracy</span><b>' + st.accuracy + '%</b></div><div class="stat"><span>Hint</span><b>' + st.hints + '</b></div><div class="stat"><span>ทำผิด</span><b>' + st.wrongOpen + '</b></div><div class="stat"><span>เฉลี่ย/ข้อ</span><b>' + st.avg + 's</b></div></div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div><p class="tiny" style="text-align:right">' + pct + '%</p>' +
      '<div class="advice">คุณผิด <b>' + esc(st.weakStep) + "</b> มากที่สุด (" + st.weakN + " ครั้ง) — ควรฝึกขั้นนี้เพิ่ม</div>" +
      '<div class="advice">หัวข้อที่มีข้อผิดพลาดมากที่สุดคือ <b>' + esc(st.weakTopic) + "</b> (" + st.topicN + " ครั้ง)</div></section>";
  }

  const custom = { step: 0, stem: "", chapter: "ทั้งหมด", formulaId: "", target: "", values: {}, expr: "", hintsLeft: 2, hint: "", error: "", done: false, answer: null };

  function formulaById(id) { return window.CHEM.FORMULAS.find((f) => f.id === id) || null; }
  function formulaChapters() {
    const list = ["ทั้งหมด"];
    window.CHEM.FORMULAS.forEach((f) => { if (list.indexOf(f.chapter) < 0) list.push(f.chapter); });
    return list;
  }
  function showNum(n) {
    if (!isFinite(n)) return "—";
    const a = Math.abs(n);
    if (a !== 0 && (a >= 1e5 || a < 1e-3)) return window.CHEM.formatNum(n, -1);
    const rounded = Math.round(n * 100000) / 100000;
    return String(rounded);
  }
  function equivalentTo(user, canonical, ids) {
    const sets = [];
    for (let k = 0; k < 4; k++) {
      const sc = {};
      ids.forEach((id, i) => { sc[id] = (k + 2) * (i + 1.15) + 0.4; });
      sets.push(sc);
    }
    return sets.every((sc) => window.CHEM.close(window.CHEM.evalExpr(user, sc), window.CHEM.evalExpr(canonical, sc)));
  }
  function customScope(f) {
    const sc = {};
    f.vars.forEach((v) => {
      if (v.id === custom.target) return;
      sc[v.id] = Number(custom.values[v.id]);
    });
    return sc;
  }
  function checkCustom() {
    custom.error = "";
    const f = formulaById(custom.formulaId);
    if (custom.step === 0) {
      if (custom.stem.trim().length < 8) { custom.error = "พิมพ์หรือวางโจทย์ให้ชัดก่อน อย่างน้อยหนึ่งประโยค"; return false; }
      return true;
    }
    if (custom.step === 1) {
      if (!f) { custom.error = "เลือกสูตรที่จะใช้แก้โจทย์นี้"; return false; }
      if (!custom.target || !f.solve[custom.target]) { custom.error = "เลือกตัวแปรที่ต้องการหา"; return false; }
      const missing = f.vars.some((v) => v.id !== custom.target && !isFinite(Number(custom.values[v.id])));
      if (missing) { custom.error = "กรอกค่าตัวแปรที่โจทย์กำหนดให้ให้ครบ ในหน่วยที่ระบุ"; return false; }
      return true;
    }
    if (custom.step === 2) {
      const raw = custom.expr.trim();
      if (!raw) { custom.error = "จัดรูปสมการก่อน ใส่เฉพาะข้างที่ใช้คำนวณ"; return false; }
      if (new RegExp("\\b" + custom.target + "\\b").test(raw)) { custom.error = "ฝั่งขวาไม่ต้องใส่ตัวแปรคำตอบ ให้ย้ายมันไปฝั่งซ้าย"; return false; }
      try {
        const ids = f.vars.map((v) => v.id);
        if (!equivalentTo(raw, f.solve[custom.target][0], ids)) { custom.error = "สมการที่จัดรูปยังไม่สมมูลกับสูตรที่เลือก ลองย้ายข้างใหม่"; return false; }
        custom.answer = window.CHEM.evalExpr(raw, customScope(f));
      } catch (e) {
        custom.error = e.message;
        return false;
      }
      return true;
    }
    return true;
  }

  function renderCustom(root, shell) {
    const f = formulaById(custom.formulaId);
    const steps = ["กรอกโจทย์", "ตัวแปรและสูตร", "จัดรูปสมการ", "คำนวณ"];
    const fill = custom.done ? 100 : ((custom.step + 1) / steps.length) * 100;
    let body = "";
    if (custom.done) body = customSuccess(f);
    else if (custom.step === 0) body = customStem();
    else if (custom.step === 1) body = customVars(f);
    else body = customArrange(f);
    const hint = custom.hint ? '<div class="hintbox">💡 ' + custom.hint + "</div>" : "";
    const err = custom.error ? '<div class="err">' + esc(custom.error) + "</div>" : "";
    const stem = custom.step === 0 ? "" : '<div class="stem-wrap"><p class="stem">' + esc(custom.stem) + "</p></div>";
    const html = '<div class="practice-head"><h2><span class="ico" style="width:36px;height:36px;margin:0">⚗️</span> ฝึกทำโจทย์</h2><a href="#bank">← คลังโจทย์</a></div>' +
      '<div class="steps"><div class="step-track"><div class="step-fill" style="width:' + fill + '%"></div></div><div class="step-labels">' +
      steps.map((name, i) => '<span class="' + (i <= custom.step || custom.done ? "on" : "") + '">' + name + "</span>").join("") + "</div></div>" +
      stem + hint + err + body +
      (custom.done ? "" : '<div class="foot"><button type="button" class="btn btn-ghost" id="back">ย้อนกลับ</button><button type="button" class="btn btn-hint" id="hint"' + (custom.hintsLeft ? "" : " disabled") + ">💡 คำใบ้ (" + custom.hintsLeft + ')</button><button type="button" class="btn btn-next" id="go">' + (custom.step === 2 ? "คำนวณผลลัพธ์ →" : "ตรวจสอบและถัดไป →") + "</button></div>");
    root.innerHTML = shell("custom", '<section class="panel">' + html + "</section>");
    const panel = root.querySelector(".panel");
    if (custom.done) {
      panel.querySelector("#again").onclick = function () {
        custom.step = 0; custom.done = false; custom.answer = null; custom.expr = ""; custom.error = ""; custom.hint = ""; custom.hintsLeft = 2;
        renderCustom(root, shell);
      };
      panel.querySelector("#keep").onclick = function () {
        custom.step = 1; custom.done = false; custom.answer = null; custom.expr = ""; custom.error = ""; custom.hint = "";
        renderCustom(root, shell);
      };
      return;
    }
    bindSelects(panel, function (box) {
      const label = box.parentElement.querySelector("label").textContent;
      if (label.indexOf("บท") >= 0) custom.chapter = box.dataset.value;
      if (label.indexOf("ต้องการหา") >= 0) custom.target = box.dataset.value;
      renderCustom(root, shell);
    });
    const stemBox = panel.querySelector("#stem");
    if (stemBox) stemBox.oninput = function () { custom.stem = stemBox.value; };
    panel.querySelectorAll("[data-sample]").forEach((btn) => {
      btn.onclick = function () {
        const p = window.CHEM.PROBLEMS.find((x) => x.id === btn.dataset.sample);
        if (p) { custom.stem = p.stem.replace(/<[^>]+>/g, ""); stemBox.value = custom.stem; }
      };
    });
    panel.querySelectorAll(".formula").forEach((lab) => {
      lab.onclick = function () {
        custom.formulaId = lab.dataset.id;
        const next = formulaById(custom.formulaId);
        if (!next.solve[custom.target]) custom.target = Object.keys(next.solve)[0];
        custom.expr = "";
        custom.error = "";
        renderCustom(root, shell);
      };
    });
    panel.querySelectorAll("[data-val]").forEach((input) => {
      input.oninput = function () { custom.values[input.dataset.val] = input.value; paintCustom(panel, f); };
    });
    const expr = panel.querySelector("#expr");
    if (expr) {
      expr.oninput = function () { custom.expr = expr.value; paintCustom(panel, f); };
      panel.querySelectorAll(".ops button, .chips button").forEach((btn) => {
        btn.onclick = function () {
          const ins = btn.dataset.ins;
          const s = expr.selectionStart || expr.value.length;
          const e = expr.selectionEnd || expr.value.length;
          expr.value = expr.value.slice(0, s) + ins + expr.value.slice(e);
          custom.expr = expr.value;
          expr.focus();
          expr.selectionStart = expr.selectionEnd = s + ins.length;
          paintCustom(panel, f);
        };
      });
    }
    panel.querySelector("#back").onclick = function () {
      if (custom.step === 0) location.hash = "bank";
      else { custom.step -= 1; custom.done = false; custom.error = ""; renderCustom(root, shell); }
    };
    panel.querySelector("#hint").onclick = function () {
      if (!custom.hintsLeft) return;
      const idx = 2 - custom.hintsLeft;
      const pack = (f && f.hints) || ["เขียนโจทย์ให้ครบว่าให้อะไรและถามอะไร", "เลือกสูตรที่ตัวแปรตรงกับสิ่งที่โจทย์ให้", "ย้ายตัวที่ต้องการหาไปฝั่งซ้าย แล้วจัดรูปฝั่งขวา"];
      custom.hint = pack[Math.min(idx, pack.length - 1)];
      custom.hintsLeft -= 1;
      window.CHEM.Store.hint();
      renderCustom(root, shell);
    };
    panel.querySelector("#go").onclick = function () {
      if (!checkCustom()) { renderCustom(root, shell); return; }
      if (custom.step < 2) { custom.step += 1; custom.error = ""; custom.hint = ""; renderCustom(root, shell); return; }
      custom.done = true;
      renderCustom(root, shell);
    };
  }

  function paintCustom(panel, f) {
    const box = panel.querySelector("#preview");
    if (!box || !f) return;
    const map = {};
    f.vars.forEach((v) => { if (v.id !== custom.target) map[v.id] = custom.values[v.id] || v.id; });
    box.innerHTML = "<b>" + esc(custom.target) + " = " + esc(subst(custom.expr || "…", map)) + "</b>";
  }
  function customStem() {
    const samples = window.CHEM.PROBLEMS.filter((p) => ["safe-err-1", "mole-n-1", "sol-mass-1"].indexOf(p.id) >= 0 || /เจือจาง|โมล|เลขมวล/.test(p.title)).slice(0, 3);
    const picks = samples.length ? samples : window.CHEM.PROBLEMS.slice(0, 3);
    return '<div class="section-title">โจทย์</div>' +
      '<textarea id="stem" placeholder="เช่น ต้องการเตรียม NaOH 0.20 mol/L ปริมาตร 250 mL มวลโมเลกุล 40.00 g/mol จงหามวล NaOH ที่ต้องชั่ง">' + esc(custom.stem) + "</textarea>" +
      '<div class="chips" style="margin-top:10px">' + picks.map((p) => '<button type="button" data-sample="' + p.id + '">ตัวอย่าง: ' + esc(p.title) + "</button>").join("") + "</div>";
  }
  function customVars(f) {
    const list = window.CHEM.FORMULAS.filter((item) => custom.chapter === "ทั้งหมด" || item.chapter === custom.chapter);
    const cards = list.map((item) => '<label class="formula' + (custom.formulaId === item.id ? " on" : "") + '" data-id="' + item.id + '"><input type="radio" name="formula"' + (custom.formulaId === item.id ? " checked" : "") + "><span><b>" + esc(item.title) + "</b><br>" + item.html + "</span></label>").join("");
    let fields = "";
    if (f) {
      const options = Object.keys(f.solve).map((id) => {
        const found = f.vars.find((v) => v.id === id);
        return { value: id, label: found ? found.label : id };
      });
      if (!custom.target || !f.solve[custom.target]) custom.target = options[0].value;
      fields = '<div class="field" style="margin-top:14px"><label>ตัวแปรที่ต้องการหา</label>' + cselect(custom.target, options) + "</div>" +
        '<div class="subgrid" style="margin-top:12px">' + f.vars.filter((v) => v.id !== custom.target).map((v) => {
          return '<div class="subcard"><div class="block-label">' + esc(v.label) + "</div><input data-val=\"" + v.id + "\" type=\"number\" step=\"any\" value=\"" + esc(custom.values[v.id] || "") + "\" placeholder=\"" + v.id + "\"><div class=\"tiny\">หน่วยในสูตร: " + esc(v.unit || "ตามโจทย์") + "</div></div>";
        }).join("") + "</div>" +
        '<div class="mis" style="margin-top:12px"><h3>ความเข้าใจคลาดเคลื่อนที่พบบ่อย</h3><p>' + esc(f.mistake) + "</p></div>";
    }
    return '<div class="section-title">สูตรและค่าที่กำหนด</div>' +
      '<div class="field"><label>บทของสูตร</label>' + cselect(custom.chapter, formulaChapters().map((c) => ({ value: c, label: c }))) + "</div>" +
      '<div class="formula-list">' + cards + "</div>" + fields;
  }
  function customArrange(f) {
    const chips = f.vars.filter((v) => v.id !== custom.target).map((v) => v.id);
    const map = {};
    f.vars.forEach((v) => { if (v.id !== custom.target) map[v.id] = custom.values[v.id] || v.id; });
    return '<div class="section-title">จัดรูป</div><p class="formula-now">' + f.html + "</p>" +
      '<div class="chips">' + chips.map((id) => '<button type="button" data-ins="' + id + '">' + id + "</button>").join("") + "</div>" +
      exprBar(custom.target, custom.expr, "จัดรูปเองจากสูตรด้านบน") +
      '<div class="preview" id="preview"><b>' + esc(custom.target) + " = " + esc(subst(custom.expr || "…", map)) + "</b></div>";
  }
  function customSuccess(f) {
    const known = f.vars.filter((v) => v.id !== custom.target).map((v) => v.id + " = " + custom.values[v.id] + (v.unit ? " " + v.unit : "")).join(", ");
    const unit = (f.vars.find((v) => v.id === custom.target) || {}).unit || "";
    const ans = showNum(custom.answer) + (unit ? " " + esc(unit) : "");
    const map = {};
    f.vars.forEach((v) => { if (v.id !== custom.target) map[v.id] = custom.values[v.id]; });
    return '<div class="success"><div class="check">✓</div><h2>คำนวณสำเร็จ</h2></div>' +
      '<div class="summary"><div class="summary-top"><span>คำตอบสุดท้าย</span><span class="answer-big">' + ans + "</span></div><ol class=\"slist\">" +
      "<li>โจทย์: " + esc(custom.stem) + "</li>" +
      "<li>กำหนด: " + esc(known) + "</li>" +
      "<li>สูตร: " + f.html + "</li>" +
      "<li>จัดรูป: " + esc(custom.target) + " = " + esc(custom.expr) + "</li>" +
      "<li>แทนค่า: " + esc(custom.target) + " = " + esc(subst(custom.expr, map)) + "</li>" +
      "<li>คำนวณ: " + esc(custom.target) + " = " + ans + "</li></ol></div>" +
      '<div class="foot"><a class="btn btn-dark" href="#bank">← คลังโจทย์</a><button type="button" class="btn btn-next" id="keep">ใช้โจทย์นี้ เปลี่ยนค่า</button><button type="button" class="btn btn-primary" id="again">โจทย์ใหม่</button></div>';
  }

  window.Practice = {
    renderBank: renderBank,
    renderPractice: renderPractice,
    renderProgress: renderProgress,
    renderCustom: renderCustom,
    count: function () { return window.CHEM.PROBLEMS.length; }
  };
})();
